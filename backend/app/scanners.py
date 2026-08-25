import base64
import json
from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_utility_db
from app.llm import analyze_image
from app.grocery import find_matched_items, normalize_item_name
from app.constants import CHOICE_BENCHMARK
from app.config import get_settings
from app.aer import sync_aer_rates
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Scanners"])

# --- Energy Bill Scanner v2 (extraction-only, ACL-safe) ---
@router.post("/quash-bill")
async def quash_bill(file: UploadFile = File(...), db: Session = Depends(get_utility_db)):
    try:
        file_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        prompt = """
        You are an expert energy bill analyzer. Analyze this energy bill and extract the following information as a JSON object:
        - daily_charge_cents (float): The daily supply charge in cents.
        - usage_charge_cents (float): The usage charge rate in cents per kWh.
        - usage_kwh (float): The total energy usage in kWh for the billing period.
        - billing_days (int): The number of days in the billing period.
        
        Respond ONLY with the valid JSON object, no markdown, no other text.
        """
        
        extracted = analyze_image(file_bytes, mime_type, prompt)
        
        # Log scan event
        db.execute("""
            INSERT INTO scan_events (scan_type, outcome)
            VALUES (:scan_type, 'completed')
        """, {"scan_type": "energy"})
        db.commit()
        
        settings = get_settings()
        reference_available = settings.aer_reference_daily_charge_cents is not None \
                            and settings.aer_reference_usage_charge_cents is not None
                            
        result = {
            "success": True,
            "extracted": extracted,
            "reference_price_available": reference_available,
            "disclaimer": "This tool extracts your rates but does not make savings claims. Compare against the regulator's reference price for context."
        }
        
        if reference_available:
            result["aer_reference"] = {
                "daily_charge_cents": settings.aer_reference_daily_charge_cents,
                "usage_charge_cents": settings.aer_reference_usage_charge_cents,
                "source": "Australian Energy Regulator (AER) Default Market Offer (DMO)",
                "disclaimer": "Reference prices are published values and may not match your specific plan's eligibility."
            }
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse energy bill: {str(e)}")

# --- Grocery Scanner v2 ---
@router.post("/quash-grocery")
async def quash_grocery(file: UploadFile = File(...), db: Session = Depends(get_utility_db)):
    try:
        file_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        prompt = """
        You are an expert grocery receipt analyzer. Analyze this grocery receipt and extract:
        - store_name: The name of the store (not the address)
        - store_suburb: The suburb of the store
        - date: The transaction date in YYYY-MM-DD format
        - items: A list of purchased items with name and price
        
        Respond ONLY with the valid JSON object, no markdown, no other text. Example:
        {
            "store_name": "Coles",
            "store_suburb": "Point Cook",
            "date": "2026-08-20",
            "items": [{"name": "Milk 2L", "price": 3.50}, {"name": "Eggs", "price": 5.00}]
        }
        """
        
        extracted = analyze_image(file_bytes, mime_type, prompt)
        
        # Find matched items with median prices
        items = extracted.get("items", [])
        store_suburb = extracted.get("store_suburb", "")
        
        matches = find_matched_items(items, store_suburb, db)
        
        # Calculate totals
        original_total = sum(float(item.get("price", 0)) for item in items)
        
        # Log scan event
        db.execute("""
            INSERT INTO scan_events (scan_type, outcome)
            VALUES (:scan_type, 'completed')
        """, {"scan_type": "grocery"})
        db.commit()
        
        return {
            "success": True,
            "extracted": extracted,
            "matches": matches,
            "original_total": round(original_total, 2),
            "matched_total": round(sum(float(m["median_price"]) for m in matches), 2),
            "observation_count": sum(m["observation_count"] for m in matches),
            "choice_benchmark": CHOICE_BENCHMARK,
            "disclaimer": "Only items with 3+ community-contributed observations are compared. Prices are medians from local receipts.",
            "beta_label": "This tool is in beta. We are still building the community price database."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse grocery receipt: {str(e)}")

# --- Cached Rates API ---
@router.get("/rates/best")
def get_best_rate(state: str = "VIC", db: Session = Depends(get_utility_db)):
    try:
        query = text("""
            SELECT provider_name, plan_name, daily_supply_charge_cents, usage_rate_cents, estimated_annual_cost, last_verified_at
            FROM cached_energy_rates
            WHERE state = :state
            ORDER BY usage_rate_cents ASC
            LIMIT 1
        """)
        cursor = db.execute(query, {"state": state})
        row = cursor.fetchone()
        
        if row:
            return {
                "success": True,
                "best_rate": {
                    "provider": row.provider_name,
                    "plan": row.plan_name,
                    "daily_supply_charge_cents": float(row.daily_supply_charge_cents),
                    "usage_rate_cents": float(row.usage_rate_cents),
                    "estimated_annual_cost": float(row.estimated_annual_cost) if row.estimated_annual_cost else None,
                    "last_verified": row.last_verified_at.isoformat() if row.last_verified_at else None,
                }
            }
        else:
            return {"success": False, "message": "No cached rates found for this state."}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rates/internet/best")
def get_best_internet_rate(db: Session = Depends(get_utility_db)):
    try:
        query = text("""
            SELECT provider_name, plan_name, speed_tier, monthly_cost_cents, data_limit_gb
            FROM cached_internet_rates
            ORDER BY monthly_cost_cents ASC
            LIMIT 1
        """)
        cursor = db.execute(query)
        row = cursor.fetchone()
        
        if row:
            return {
                "success": True,
                "best_rate": {
                    "provider": row.provider_name,
                    "plan": row.plan_name,
                    "speed_tier": row.speed_tier,
                    "monthly_cost_cents": float(row.monthly_cost_cents),
                    "data_limit_gb": row.data_limit_gb
                }
            }
        else:
            return {"success": False, "message": "No cached internet rates found."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- AER Data Sync (admin/manual trigger) ---
@router.post("/aer/sync")
def aer_sync(max_brands: int = 8, db: Session = Depends(get_utility_db)):
    try:
        results = sync_aer_rates(db, max_brands=max_brands)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AER sync failed: {str(e)}")


# --- Page View Analytics (anonymous, no consent needed) ---
@router.post("/page-view")
def track_page_view(page: str = Form(...), db: Session = Depends(get_utility_db)):
    try:
        db.execute(text("""
            INSERT INTO scan_events (scan_type, outcome)
            VALUES ('page_view', :page)
        """), {"page": page})
        db.commit()
        return {"success": True}
    except Exception:
        return {"success": False}


@router.get("/page-views")
def get_page_views(db: Session = Depends(get_utility_db)):
    try:
        result = db.execute(text("""
            SELECT outcome as page, COUNT(*) as views
            FROM scan_events
            WHERE scan_type = 'page_view'
            AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY outcome
            ORDER BY views DESC
            LIMIT 50
        """))
        return {"success": True, "data": [{"page": r.page, "views": r.views} for r in result]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Energy Plan Comparison (AER-sourced) ---
@router.get("/energy/compare")
def compare_energy_plans(
    state: str = "VIC",
    usage_kwh: float = 5000,
    db: Session = Depends(get_utility_db)
):
    try:
        query = text("""
            SELECT provider_name, plan_name, daily_supply_charge_cents, usage_rate_cents, last_verified_at
            FROM cached_energy_rates
            WHERE (state = :state OR state = 'NATIONAL')
            ORDER BY usage_rate_cents ASC
            LIMIT 20
        """)
        cursor = db.execute(query, {"state": state.upper()})

        plans = []
        latest_verified = None
        for row in cursor:
            daily = float(row.daily_supply_charge_cents) if row.daily_supply_charge_cents else 0
            usage = float(row.usage_rate_cents) if row.usage_rate_cents else 0
            annual_cost = daily * 365 + usage * usage_kwh

            if row.last_verified_at and (latest_verified is None or row.last_verified_at > latest_verified):
                latest_verified = row.last_verified_at

            plans.append({
                "provider": row.provider_name,
                "plan": row.plan_name,
                "daily_supply_charge_cents": daily,
                "usage_rate_cents": usage,
                "estimated_annual_cost": round(annual_cost, 2),
                "last_verified": row.last_verified_at.isoformat() if row.last_verified_at else None,
            })

        return {
            "success": True,
            "state": state.upper(),
            "usage_kwh": usage_kwh,
            "plans": plans,
            "rates_as_at": latest_verified.isoformat() if latest_verified else None,
            "data_source": "AER Energy Product Reference Data (Consumer Data Right)",
            "disclaimer": "Data sourced from AER CDR API. Plans shown are from NECF states only (VIC, NSW, QLD, SA, ACT, TAS). WA and NT not included in AER framework.",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
