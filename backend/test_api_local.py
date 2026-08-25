from app.suburbs import get_suburb_profile
from app.db import RealSessionLocal

db = RealSessionLocal()
try:
    data = get_suburb_profile("point-cook-vic-3030", db)
    print("Dwelling:", data.get("demographics", {}).get("dwelling_structure"))
    print("Travel:", data.get("demographics", {}).get("travel_to_work"))
except Exception as e:
    print(e)
finally:
    db.close()
