from sqlalchemy import create_engine, text

engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
with engine.connect() as conn:
    res = conn.execute(text("SELECT name, amenity FROM planet_osm_point WHERE name ILIKE '%priceline pharmacy%';"))
    for row in res:
        print(row)
