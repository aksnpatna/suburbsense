import sys
import sqlalchemy
from sqlalchemy import text
from app.config import get_settings

def run_audit():
    settings = get_settings()
    engine = sqlalchemy.create_engine(settings.realestate_db_url)
    
    with engine.connect() as conn:
        print("--- SUBURB DATA EXHAUSTIVE AUDIT ---")
        
        # 1. Total Suburbs
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3")).scalar()
        total_suburbs = res if res else 0
        print(f"Total Suburbs: {total_suburbs}")
        if total_suburbs == 0:
            print("ERROR: No suburbs found.")
            return

        # 2. Missing Coordinates (Crucial for Map)
        res = conn.execute(text("""
            SELECT COUNT(*) FROM suburbs_ui_v3 
            WHERE coordinates IS NULL OR coordinates->>'lat' IS NULL OR coordinates->>'lng' IS NULL
        """)).scalar()
        print(f"Suburbs missing coordinates: {res} ({res/total_suburbs*100:.1f}%)")

        # 3. WA Suburbs with missing or mismatched coordinates
        # Check Perth coordinates anomaly specifically (WA suburbs with lat > -30 might be wrong)
        res = conn.execute(text("""
            SELECT COUNT(*) FROM suburbs_ui_v3 
            WHERE state = 'WA' AND CAST(coordinates->>'lat' AS FLOAT) > -20
        """)).scalar()
        print(f"WA Suburbs with suspicious coordinates (lat > -20): {res}")

        # 4. Missing School Data
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE school_count IS NULL OR school_count = 0")).scalar()
        print(f"Suburbs missing school data (count=0 or NULL): {res} ({res/total_suburbs*100:.1f}%)")

        # 5. Missing Transit Data
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE transit_accessibility IS NULL")).scalar()
        print(f"Suburbs missing transit data: {res} ({res/total_suburbs*100:.1f}%)")

        # 6. Missing Demographics (Population)
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE population_2021 IS NULL")).scalar()
        print(f"Suburbs missing 2021 Population data: {res} ({res/total_suburbs*100:.1f}%)")

        # 7. Unrealistic Liveability Composite Components
        # Usually safety, transit, parks, schools
        # Let's check for NULLs in safety
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE safety_score IS NULL")).scalar()
        print(f"Suburbs missing safety score: {res} ({res/total_suburbs*100:.1f}%)")

        # 8. Unrealistic median age (e.g., 0 or >100)
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE median_age <= 0 OR median_age > 100")).scalar()
        print(f"Suburbs with invalid median_age: {res}")

        # 9. Duplicate Slugs / Names per state
        res = conn.execute(text("""
            SELECT name, state, COUNT(*) as cnt 
            FROM suburbs_ui_v3 
            GROUP BY name, state 
            HAVING COUNT(*) > 1
        """)).fetchall()
        print(f"Duplicate suburb name+state combinations: {len(res)}")
        if len(res) > 0:
            print("Sample duplicates:", res[:5])

if __name__ == "__main__":
    try:
        run_audit()
    except Exception as e:
        print(f"Audit failed: {e}")
