from fastapi import APIRouter, Query
from app.nbn_lookup import lookup_nbn_by_address, TECH_TYPE_LABELS, TECH_SPEED_ESTIMATES

router = APIRouter(prefix="/api", tags=["NBN", "FHBG"])

FHBG_PRICE_CAPS = {
    "NSW": {"capital": 1500000, "other": 800000},
    "VIC": {"capital": 950000, "other": 650000},
    "QLD": {"capital": 1000000, "other": 700000},
    "WA": {"capital": 850000, "other": 600000},
    "SA": {"capital": 900000, "other": 500000},
    "TAS": {"capital": 700000, "other": 550000},
    "ACT": {"capital": 1000000, "other": 1000000},
    "NT": {"capital": 750000, "other": 600000},
}

FHBG_REGIONAL_CENTRES = {
    "NSW": ["Sydney", "Illawarra", "Newcastle", "Lake Macquarie", "Wollongong", "Central Coast"],
    "VIC": ["Melbourne", "Geelong"],
    "QLD": ["Brisbane", "Gold Coast", "Sunshine Coast"],
    "WA": ["Perth"],
    "SA": ["Adelaide"],
    "TAS": ["Hobart"],
    "ACT": ["Canberra"],
    "NT": ["Darwin"],
}


@router.get("/nbn/lookup")
def nbn_lookup(q: str = Query(..., description="Address or partial address")):
    result = lookup_nbn_by_address(q.strip())
    if not result:
        return {"success": False, "message": "No NBN result found for that address. Try a more complete address."}

    tech = result.get("tech_type", "Unknown")
    return {
        "success": True,
        "result": {
            **result,
            "tech_label": TECH_TYPE_LABELS.get(tech, tech),
            "speed_estimate": TECH_SPEED_ESTIMATES.get(tech, "Varies"),
        },
        "data_source": "nbn™ official API (nbnco.com.au)",
        "disclaimer": "Data sourced from nbn™ address lookup. Confirm service availability and speed with your preferred provider.",
    }


@router.get("/fhbg/check")
def fhbg_eligibility(
    state: str = Query(..., description="State abbreviation"),
    property_price: float = Query(..., description="Property purchase price"),
    is_regional_centre: bool = Query(True, description="Property in capital/regional centre"),
    is_single_parent: bool = Query(False, description="Single parent with dependent"),
):
    s = state.upper()
    caps = FHBG_PRICE_CAPS.get(s)
    if not caps:
        return {"success": False, "message": "Invalid state."}

    cap = caps["capital"] if is_regional_centre else caps["other"]
    eligible = property_price <= cap
    min_deposit_pct = 2 if is_single_parent else 5
    min_deposit = property_price * min_deposit_pct / 100
    fhbg_type = "Family Home Guarantee (2% deposit, no LMI)" if is_single_parent else "First Home Guarantee (5% deposit, no LMI)"

    return {
        "success": True,
        "eligible": eligible,
        "scheme": fhbg_type,
        "state": s,
        "property_price": property_price,
        "price_cap": cap,
        "min_deposit": round(min_deposit, 2),
        "min_deposit_pct": min_deposit_pct,
        "lmi_waived": eligible,
        "data_source": "Housing Australia — firsthomebuyers.gov.au",
        "disclaimer": "Eligibility confirmed against published price caps effective Oct 2025. Final approval subject to lender assessment. Always verify at firsthomebuyers.gov.au.",
        "next_steps": [
            "Confirm price cap at firsthomebuyers.gov.au",
            "Choose from 30+ participating lenders",
            "Apply for pre-approval through the scheme",
        ],
    }
