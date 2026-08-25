import base64
import json
from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.db import get_realestate_db, get_utility_db
from app.llm import analyze_image
from app.config import get_settings
from fastapi import APIRouter

router = APIRouter(prefix="/api/grocery", tags=["Grocery"])

# --- Simple item normalization helper ---
def normalize_item_name(name: str) -> str:
    if not name:
        return ""
    import re
    normalized = name.strip().lower()
    normalized = re.sub(r'[^\w\s-]', '', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    normalized = normalized.strip()
    return normalized

# --- Item matching for comparison ---
def find_matched_items(extracted_items: list, store_suburb: str, db: Session, min_observations: int = 3):
    matched = []
    for item in extracted_items:
        item_name = normalize_item_name(item.get("name"))
        if len(item_name) < 3:
            continue
            
        query = """
            SELECT normalized_item, percentile_cont(0.5) WITHIN GROUP (ORDER BY price) as median_price,
                   count(*) as observation_count
            FROM price_observations
            WHERE normalized_item = :item
            AND store_suburb = :suburb
            GROUP BY normalized_item
            HAVING count(*) >= :min_obs
        """
        
        cursor = db.execute(query, {
            "item": item_name,
            "suburb": store_suburb,
            "min_obs": min_observations
        })
        result = cursor.fetchone()
        
        if result:
            matched.append({
                "original": item,
                "normalized": result.normalized_item,
                "median_price": float(result.median_price),
                "observation_count": int(result.observation_count)
            })
            
    return matched

# --- Opt-in contribution ---
@router.post("/contribute")
def contribute(data: dict, db: Session = Depends(get_utility_db)):
    store_name = data.get("store_name")
    store_suburb = data.get("store_suburb")
    observed_date = data.get("observed_date")
    items = data.get("items", [])
    
    if not store_name or not items:
        raise HTTPException(status_code=422, detail="Missing required fields: store_name, items")
        
    session_hash = base64.urlsafe_b64encode(bytes(f"{store_name}{store_suburb}{observed_date}", "utf-8")).decode()[:8]
    
    try:
        for item in items:
            normalized = normalize_item_name(item.get("name"))
            if len(normalized) < 3 or not item.get("price") or item.get("price") <= 0:
                continue
                
            db.execute("""
                INSERT INTO price_observations (
                    normalized_item, raw_item, price, store_name, store_suburb,
                    observed_date, session_hash
                )
                VALUES (:normalized, :raw, :price, :store, :suburb, :date, :session)
            """, {
                "normalized": normalized,
                "raw": item.get("name"),
                "price": float(item.get("price")),
                "store": store_name,
                "suburb": store_suburb,
                "date": observed_date,
                "session": session_hash
            })
            
        db.commit()
        
        return {
            "success": True,
            "message": f"Contributed {len(items)} items successfully",
            "session_hash": session_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to contribute: {str(e)}")

# --- Query coverage ---
@router.get("/coverage")
def get_coverage(store_suburb: str, db: Session = Depends(get_utility_db)):
    query = """
        SELECT normalized_item, count(*) as observation_count,
               min(price) as min_price, max(price) as max_price,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY price) as median_price,
               min(observed_date) as first_date, max(observed_date) as last_date
        FROM price_observations
        WHERE store_suburb = :suburb
        GROUP BY normalized_item
        HAVING count(*) >= 1
        ORDER BY observation_count DESC, normalized_item
    """
    
    try:
        cursor = db.execute(query, {"suburb": store_suburb})
        results = []
        for row in cursor:
            results.append({
                "item": row.normalized_item,
                "count": row.observation_count,
                "min_price": float(row.min_price),
                "max_price": float(row.max_price),
                "median_price": float(row.median_price),
                "first_date": row.first_date.isoformat(),
                "last_date": row.last_date.isoformat()
            })
            
        return {
            "suburb": store_suburb,
            "total_items": len(results),
            "total_observations": sum(r["count"] for r in results),
            "items": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch coverage: {str(e)}")
