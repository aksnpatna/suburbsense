from functools import lru_cache
from nbnpy.nbn import NBN

_nbn_client = NBN()


TECH_TYPE_LABELS = {
    "FTTP": "Fibre to the Premises (FTTP)",
    "FTTN": "Fibre to the Node (FTTN)",
    "FTTB": "Fibre to the Building (FTTB)",
    "FTTC": "Fibre to the Curb (FTTC)",
    "HFC": "Hybrid Fibre Coaxial (HFC)",
    "Fixed Wireless": "Fixed Wireless",
    "Satellite": "Sky Muster Satellite",
    "Unknown": "Unknown",
}

TECH_SPEED_ESTIMATES = {
    "FTTP": "Up to 1 Gbps",
    "FTTN": "25–100 Mbps",
    "FTTB": "50–100 Mbps",
    "FTTC": "Up to 100 Mbps",
    "HFC": "Up to 1 Gbps",
    "Fixed Wireless": "Up to 75 Mbps",
    "Satellite": "Up to 25 Mbps",
    "Unknown": "Varies",
}


@lru_cache(maxsize=500)
def lookup_nbn_by_address(address: str) -> dict | None:
    """Look up NBN connection details for an Australian address using nbnpy."""
    import concurrent.futures

    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(_nbn_client.get_location_ids_from_address, address)
            loc_result = future.result(timeout=15)
    except Exception:
        return None

    suggestions = loc_result.get("suggestions", [])
    if not suggestions:
        return None

    loc_id = suggestions[0]["id"]
    loc_info = None
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(_nbn_client.location_information, loc_id)
            loc_info = future.result(timeout=15)
    except Exception:
        pass

    if not loc_info:
        loc_info = {}

    address_detail = loc_info.get("addressDetail", {})
    serving_area = loc_info.get("servingArea", {})

    tech_type = (
        address_detail.get("techType")
        or serving_area.get("techType")
        or "Unknown"
    )

    return {
        "formatted_address": address_detail.get("formattedAddress", suggestions[0].get("formattedAddress", "")),
        "tech_type": tech_type,
        "service_type": address_detail.get("serviceType", serving_area.get("serviceType", "")),
        "service_status": address_detail.get("serviceStatus", serving_area.get("serviceStatus", "")),
        "description": serving_area.get("description", ""),
        "latitude": address_detail.get("latitude"),
        "longitude": address_detail.get("longitude"),
        "frustrated": address_detail.get("frustrated", False),
    }
