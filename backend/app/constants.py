# Field allowlist for suburbs_ui_v3 to exclude OnTheHouse-derived property market data
SUBURBS_UI_ALLOWLIST = {
    "id",
    "state",
    "name",
    "postcode",
    "population_2021",
    "population_2016",
    "population_cagr",
    "population_density",
    "owner_occupier_rate",
    "median_age",
    "predominant_age_group",
    "predominant_occupation",
    "average_household_size",
    "area_sqkm",
    "typical_mortgage_band",
    "school_count",
    "avg_icsea",
    "top_school_name",
    "school_quality",
    "parks_count",
    "parks_coverage_pct",
    "transit_accessibility",
    "cbd_distance_mins",
    "metro_cbd",
    "safety_score",
    "coordinates",
    "demographics_detail",
    "schools",
}

# Fields to extract from demographics_detail JSON (safe, derived from ABS Census only)
DEMOGRAPHICS_DETAIL_ALLOWLIST = {
    "age_distribution",
    "income_distribution",
    "household_distribution",
    "predominant_household",
}

# Banned column patterns (used in grep check after static generation)
BANNED_PATTERNS = {
    "house_median_",
    "unit_median_",
    "gross_rental_yield",
    "days_on_market",
    "auction_clearance_rate",
    "stock_on_market",
    "price_to_income_ratio",
    "price_to_rent_ratio",
    "total_properties",
    "vacancy_rate",
    "supply_demand_ratio",
    "estimated_mortgage_repayment",
    "sqm_data",
    "highlight",
}

# Attribution constants for the site (required by data sources)
ATTRIBUTIONS = [
    {"name": "OpenStreetMap contributors", "url": "https://www.openstreetmap.org/copyright"},
    {"name": "Australian Bureau of Statistics", "url": "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/allocation-files/SAL_2021_AUST.xlsx"},
    {"name": "ACARA", "url": "https://www.acara.edu.au"},
    {"name": "Geoscape (G-NAF)", "url": "https://www.ga.gov.au/data-and-publications/geocoded-address-file-g-naf"},
]

# CHOICE basket benchmark information (published March 2026 survey)
CHOICE_BENCHMARK = {
    "name": "CHOICE March 2026 Supermarket Price Survey",
    "url": "https://www.choice.com.au/shopping/everyday-shopping/supermarkets/articles/cheapest-groceries-australia",
    "date": "2026-03",
    "description": "ALDI was cheapest for a 16-item staple basket ($68.60 on average), followed by Woolworths ($76.82), then Coles ($78.50).",
}

# OSM amenity categories and display names
OSM_CATEGORIES = {
    "supermarket": {"key": "shop", "values": ("supermarket",), "label": "Supermarkets", "radius": 3000},
    "school": {"key": "amenity", "values": ("school", "college", "university", "kindergarten", "childcare"), "label": "Schools/Childcare", "radius": 2500},
    "health": {"key": "amenity", "values": ("hospital", "clinic", "pharmacy", "doctors", "dentist"), "label": "Healthcare", "radius": 3000},
    "hospital": {"key": "amenity", "values": ("hospital",), "label": "Hospitals", "radius": 15000},
    "cafe": {"key": "amenity", "values": ("cafe", "restaurant", "fast_food", "pub", "bar", "food_court"), "label": "Dining/Drinks", "radius": 2000},
    "park": {"key": "leisure", "values": ("park", "nature_reserve", "recreation_ground", "playground", "garden"), "label": "Parks", "radius": 2500},
    "transit": {"key": None, "values": None, "label": "Transit Stops", "radius": 1500},  # special handling in queries
    "train_station": {"key": "railway", "values": ("station",), "label": "Train Stations", "radius": 3000},
    "religion": {"key": "amenity", "values": ("place_of_worship",), "label": "Places of Worship", "radius": 2500},
}

# Supermarket brand detection patterns (case-insensitive substring matches)
SUPERMARKET_BRANDS = [
    ("aldi", "ALDI"),
    ("coles", "Coles"),
    ("woolworths", "Woolworths"),
    ("iga", "IGA"),
    ("foodworks", "Foodworks"),
    ("harris farm", "Harris Farm Markets"),
    ("costco", "Costco"),
    ("spudshed", "Spudshed"),
    ("drake", "Drakes Supermarkets"),
    ("foodland", "Foodland"),
]
# Hardcoded major regions for navigation and spatial search (lat, lon, radius_km)
MAJOR_REGIONS = {
    "greater-sydney": {"name": "Greater Sydney", "state": "NSW", "lat": -33.8688, "lon": 151.2093, "radius_km": 50},
    "greater-melbourne": {"name": "Greater Melbourne", "state": "VIC", "lat": -37.8136, "lon": 144.9631, "radius_km": 50},
    "greater-brisbane": {"name": "Greater Brisbane", "state": "QLD", "lat": -27.4698, "lon": 153.0251, "radius_km": 50},
    "gold-coast": {"name": "Gold Coast", "state": "QLD", "lat": -28.0167, "lon": 153.4000, "radius_km": 40},
    "sunshine-coast": {"name": "Sunshine Coast", "state": "QLD", "lat": -26.6500, "lon": 153.0667, "radius_km": 50},
    "greater-adelaide": {"name": "Greater Adelaide", "state": "SA", "lat": -34.9285, "lon": 138.6007, "radius_km": 40},
    "greater-perth": {"name": "Greater Perth", "state": "WA", "lat": -31.9505, "lon": 115.8605, "radius_km": 60},
    "greater-darwin": {"name": "Greater Darwin", "state": "NT", "lat": -12.4634, "lon": 130.8456, "radius_km": 30},
    "greater-hobart": {"name": "Greater Hobart", "state": "TAS", "lat": -42.8821, "lon": 147.3272, "radius_km": 30},
    "canberra": {"name": "Canberra & ACT", "state": "ACT", "lat": -35.2809, "lon": 149.1300, "radius_km": 40},
}

# Slug generation helper for suburb URLs (name-state-postcode)
def generate_slug(name: str, state: str, postcode: str) -> str:
    name_part = name.strip().lower().replace(" ", "-").replace("'", "").replace(",", "").replace(".", "").replace("(", "").replace(")", "").replace("&", "and")
    state_part = state.strip().lower()
    postcode_part = postcode.strip()
    return f"{name_part}-{state_part}-{postcode_part}"
