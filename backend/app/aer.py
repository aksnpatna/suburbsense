import os
import time
import requests
from sqlalchemy.orm import Session
from sqlalchemy import text

AER_BASE_URL = os.environ.get("AER_BASE_URL", "https://cdr.energymadeeasy.gov.au")

NECF_BRANDS = [
    "agl",
    "origin-energy",
    "energyaustralia",
    "alinta-energy",
    "1st-energy",
    "powershop",
    "engie",
    "globird-energy",
    "ovo-energy",
    "red-energy",
    "momentum-energy",
    "sumo-power",
]


def fetch_aer_plans_list(brand: str, page: int = 1, page_size: int = 25) -> dict:
    url = f"{AER_BASE_URL}/{brand}/cds-au/v1/energy/plans"
    params = {"page": page, "page-size": page_size}
    headers = {"x-v": "1", "x-min-v": "1"}
    resp = requests.get(url, params=params, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def fetch_aer_plan_detail(brand: str, plan_id: str) -> dict:
    url = f"{AER_BASE_URL}/{brand}/cds-au/v1/energy/plans/{plan_id}"
    headers = {"x-v": "3", "x-min-v": "3"}
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def extract_rate_from_plan(plan_detail: dict) -> dict | None:
    """Extract daily supply charge and usage rate from AER plan detail."""
    data = plan_detail.get("data", {})
    if not data:
        return None

    contract = data.get("electricityContract", {})
    if not contract:
        return None

    tariff_periods = contract.get("tariffPeriod", [])
    if not tariff_periods:
        return None

    tp = tariff_periods[0]

    # Daily supply charge is in dollars
    daily_charge_dollars = tp.get("dailySupplyCharge")
    if daily_charge_dollars is None:
        return None

    daily_charge_cents = round(float(daily_charge_dollars) * 100, 2)

    # Usage rate: check timeOfUseRates first, then singleRate
    # AER CDR uses 'unitPrice' field (in dollars) for rates
    usage_rate_cents = None

    tou_rates = tp.get("timeOfUseRates", [])
    for block in tou_rates:
        rates = block.get("rates", [])
        for rate in rates:
            unit_price = rate.get("unitPrice")
            if unit_price is not None and float(unit_price) > 0:
                usage_rate_cents = round(float(unit_price) * 100, 2)
                break
        if usage_rate_cents is not None:
            break

    # Fallback to singleRate
    if usage_rate_cents is None or usage_rate_cents == 0:
        single_rate = tp.get("singleRate", {})
        if single_rate:
            rates = single_rate.get("rates", [])
            for rate in rates:
                unit_price = rate.get("unitPrice")
                if unit_price is not None and float(unit_price) > 0:
                    usage_rate_cents = round(float(unit_price) * 100, 2)
                    break

    # Final fallback: controlledLoad singleRate
    if usage_rate_cents is None or usage_rate_cents == 0:
        for cl in contract.get("controlledLoad", []):
            cl_sr = cl.get("singleRate", {})
            if cl_sr:
                for rate in cl_sr.get("rates", []):
                    unit_price = rate.get("unitPrice")
                    if unit_price is not None and float(unit_price) > 0:
                        usage_rate_cents = round(float(unit_price) * 100, 2)
                        break
            if usage_rate_cents and usage_rate_cents > 0:
                break

    if usage_rate_cents is None:
        usage_rate_cents = 0

    # Determine state from geography
    geography = data.get("geography", {})
    distributors = geography.get("distributors", [])
    state = _distributor_to_state(distributors)

    return {
        "daily_charge_cents": daily_charge_cents,
        "usage_rate_cents": usage_rate_cents,
        "state": state,
        "plan_name": data.get("displayName", ""),
        "brand_name": data.get("brandName", ""),
        "fuel_type": data.get("fuelType", ""),
    }


def _distributor_to_state(distributors: list) -> str:
    """Map distributor names to state codes."""
    dist_map = {
        "citipower": "VIC",
        "powercor": "VIC",
        "jemena": "VIC",
        "ausnet": "VIC",
        "united": "VIC",
        "essential": "NSW",
        "endeavour": "NSW",
        "ausgrid": "NSW",
        "ergon": "QLD",
        "energex": "QLD",
        "sa power networks": "SA",
        "western power": "WA",
        "horizon power": "WA",
        "tasnetworks": "TAS",
        "evenergy": "ACT",
        "jacana": "NT",
    }
    for d in distributors:
        d_lower = d.lower()
        for key, state in dist_map.items():
            if key in d_lower:
                return state
    return "NATIONAL"


def sync_aer_rates(db: Session, max_brands: int = 5) -> dict:
    """Sync energy plan data from AER CDR API into cached_energy_rates."""
    results = {"synced": 0, "errors": 0, "brands": 0}

    for brand in NECF_BRANDS[:max_brands]:
        try:
            data = fetch_aer_plans_list(brand, page=1, page_size=100)
            plans = data.get("data", {}).get("plans", [])
            results["brands"] += 1

            for plan in plans[:30]:
                plan_id = plan.get("planId")
                fuel = plan.get("fuelType", "ELECTRICITY")

                if fuel != "ELECTRICITY" or not plan_id:
                    continue

                try:
                    detail = fetch_aer_plan_detail(brand, plan_id)
                    time.sleep(0.05)
                except Exception:
                    continue

                rate = extract_rate_from_plan(detail)
                if not rate:
                    continue

                db.execute(text("""
                    INSERT INTO cached_energy_rates (
                        provider_name, plan_name, state,
                        daily_supply_charge_cents, usage_rate_cents,
                        estimated_annual_cost, last_verified_at
                    ) VALUES (
                        :provider_name, :plan_name, :state,
                        :daily_supply_charge_cents, :usage_rate_cents,
                        :estimated_annual_cost, NOW()
                    )
                    ON CONFLICT (provider_name, plan_name, state)
                    DO UPDATE SET
                        daily_supply_charge_cents = EXCLUDED.daily_supply_charge_cents,
                        usage_rate_cents = EXCLUDED.usage_rate_cents,
                        estimated_annual_cost = EXCLUDED.estimated_annual_cost,
                        last_verified_at = EXCLUDED.last_verified_at;
                """), {
                    "provider_name": rate["brand_name"],
                    "plan_name": rate["plan_name"],
                    "state": rate["state"],
                    "daily_supply_charge_cents": rate["daily_charge_cents"],
                    "usage_rate_cents": rate["usage_rate_cents"],
                    "estimated_annual_cost": None,
                })
                results["synced"] += 1

            db.commit()

        except Exception as e:
            results["errors"] += 1
            continue

    return results
