from pydantic import BaseModel
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_realestate_db

router = APIRouter(prefix="/api", tags=["Property Data"])

LAND_TAX = {
    "NSW": {
        "thresholds": [0, 1075000, 1641000, 3282000, 5470000, 10940000, 10940000],
        "rates": [0, 0.016, 0.020, 0.024, 0.028, 0.030, 0.035],
        "fixed": [0, 100, 9156, 41976, 94488, 247648, 247648],
        "name": "NSW Land Tax",
        "source": "Revenue NSW",
    },
    "VIC": {
        "thresholds": [0, 50000, 100000, 300000, 600000, 1000000, 1800000, 3000000],
        "rates":      [0, 0.002, 0.002,  0.002,  0.005,  0.010,   0.015,   0.022],
        "fixed":      [0, 0,     100,    575,    2075,   7075,    11075,   29075],
        "name": "VIC Land Tax 2024-25",
        "source": "SRO Victoria — sro.vic.gov.au",
    },
    "QLD": {
        "thresholds": [0, 600000, 999999, 2999999, 4999999, 4999999],
        "rates": [0, 0.010, 0.0165, 0.0225, 0.0275, 0.035],
        "fixed": [0, 0, 750, 5750, 21750, 35750],
        "name": "QLD Land Tax",
        "source": "Queensland Revenue Office",
    },
    "WA": {
        "thresholds": [0, 300000, 500000, 1000000, 2200000, 5500000, 11000000, 11000000],
        "rates": [0, 0.001, 0.003, 0.007, 0.010, 0.020, 0.0267, 0.034],
        "fixed": [0, 0, 600, 1600, 9100, 41100, 91100, 111100],
        "name": "WA Land Tax",
        "source": "WA State Revenue",
    },
    "SA": {
        "thresholds": [0, 755000, 1110000, 1710000, 2380000, 2380000],
        "rates": [0, 0.005, 0.0125, 0.0225, 0.0325, 0.041],
        "fixed": [0, 0, 4125, 20625, 43375, 64625],
        "name": "SA Land Tax",
        "source": "RevenueSA",
    },
    "TAS": {
        "thresholds": [0, 125000, 400000, 700000, 1200000, 2000000, 2000000],
        "rates": [0, 0.0075, 0.010, 0.015, 0.020, 0.025, 0.030],
        "fixed": [0, 0, 875, 2875, 5875, 13375, 23375],
        "name": "TAS Land Tax",
        "source": "State Revenue Office TAS",
    },
    "ACT": {
        "thresholds": [0, 150000, 275000, 500000, 750000, 750000],
        "rates": [0, 0.54, 0.64, 0.94, 1.14, 1.19],
        "fixed": [0, 0, 810, 2430, 2700, 2700],
        "name": "ACT Rates (not land tax)",
        "source": "ACT Revenue Office",
    },
    "NT": {
        "thresholds": [0],
        "rates": [0],
        "fixed": [0],
        "name": "No land tax",
        "source": "NT Government",
    },
}

PP_EXEMPTION = "Principal Place of Residence (PPR) is exempt from land tax in all states"


@router.get("/land-tax/calculate")
def calculate_land_tax(
    state: str = Query(...),
    land_value: float = Query(..., description="Total land value of all investment properties"),
    is_ppr: bool = Query(False, description="Is this your principal place of residence?"),
    is_foreign_owner: bool = Query(False, description="Foreign property owner"),
):
    s = state.upper()
    config = LAND_TAX.get(s)
    if not config:
        return {"success": False, "message": "Invalid state"}

    if is_ppr:
        return {
            "success": True,
            "annual_land_tax": 0,
            "exemption": True,
            "reason": PP_EXEMPTION,
            "data_source": config["source"],
            "ppr_exempt": PP_EXEMPTION,
            "last_verified": "2025-07-01",
        }

    tiers = config["thresholds"]
    rates = config["rates"]
    fixed = config["fixed"]

    annual_tax = 0
    for i in range(len(tiers) - 1, -1, -1):
        if land_value > tiers[i]:
            annual_tax = fixed[i] + (land_value - tiers[i]) * rates[i]
            break

    surcharge = 0
    if is_foreign_owner:
        surcharge_rates = {"NSW": 0.04, "VIC": 0.04, "QLD": 0.04, "WA": 0.04, "SA": 0.03, "TAS": 0.00}
        surcharge = land_value * surcharge_rates.get(s, 0)

    return {
        "success": True,
        "state": s,
        "land_value": land_value,
        "annual_land_tax": round(annual_tax, 2),
        "foreign_surcharge": round(surcharge, 2),
        "total_annual": round(annual_tax + surcharge, 2),
        "monthly_land_tax": round((annual_tax + surcharge) / 12, 2),
        "scheme": config["name"],
        "data_source": config["source"],
        "ppr_exempt": PP_EXEMPTION,
        "last_verified": "2025-07-01",
        "disclaimer": f"Rates from {config['source']}. Actual assessment may vary. Land tax is calculated on combined value of all investment land in the state. Always verify with your state revenue office.",
    }


@router.get("/council-rates/estimate")
def estimate_council_rates(
    state: str = Query(...),
    property_value: float = Query(..., description="Capital Improved Value (VIC) or Land Value (NSW/QLD)"),
    suburb: str = Query("", description="Suburb name"),
):
    s = state.upper()
    estimates = {
        "VIC": {
            "rate_in_dollar": 0.0025,
            "waste_charge": 450,
            "valuation_basis": "Capital Improved Value (CIV)",
            "source": "Local Government Victoria",
        },
        "NSW": {
            "rate_in_dollar": 0.0020,
            "waste_charge": 550,
            "valuation_basis": "Unimproved Land Value (UV)",
            "source": "NSW Office of Local Government",
        },
        "QLD": {
            "rate_in_dollar": 0.0025,
            "waste_charge": 400,
            "valuation_basis": "Unimproved Land Value (UV)",
            "source": "QLD Department of Local Government",
        },
        "WA": {
            "rate_in_dollar": 0.0050,
            "waste_charge": 420,
            "valuation_basis": "Gross Rental Value (GRV)",
            "source": "WA Local Government",
        },
        "SA": {
            "rate_in_dollar": 0.0035,
            "waste_charge": 380,
            "valuation_basis": "Capital Value",
            "source": "SA Local Government",
        },
        "TAS": {
            "rate_in_dollar": 0.0040,
            "waste_charge": 420,
            "valuation_basis": "Assessed Annual Value (AAV)",
            "source": "TAS Local Government",
        },
        "ACT": {
            "rate_in_dollar": 0.0045,
            "waste_charge": 400,
            "valuation_basis": "Average Unimproved Value (AUV)",
            "source": "ACT Revenue Office",
        },
        "NT": {
            "rate_in_dollar": 0.0055,
            "waste_charge": 500,
            "valuation_basis": "Unimproved Capital Value (UCV)",
            "source": "NT Government",
        },
    }

    cfg = estimates.get(s)
    if not cfg:
        return {"success": False, "message": "Invalid state"}

    base_rates = property_value * cfg["rate_in_dollar"]
    total = base_rates + cfg["waste_charge"]

    return {
        "success": True,
        "state": s,
        "property_value": property_value,
        "estimated_council_rates": round(total, 2),
        "base_rates": round(base_rates, 2),
        "estimated_waste_charge": cfg["waste_charge"],
        "monthly_council_rates": round(total / 12, 2),
        "valuation_basis": cfg["valuation_basis"],
        "data_source": cfg["source"],
        "last_verified": "2025-07-01",
        "disclaimer": "Estimate only. Actual rates vary significantly by council, property type, and individual council budget. Contact your local council for your exact rates notice.",
    }
