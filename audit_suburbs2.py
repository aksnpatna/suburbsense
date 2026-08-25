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
        total_suburbs = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3")).scalar()
        print(f"Total Suburbs: {total_suburbs}")

        # 2. Missing Coordinates
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE coordinates IS NULL")).scalar()
        print(f"Suburbs missing coordinates: {res} ({res/total_suburbs*100:.1f}%)")

        # 3. WA Suburbs with swapped coordinates (lat > 0 or lng < 0, checking for swapped [lat, lng] usually WA is ~ -31, 115)
        # In array format, it's [lat, lng]. So coordinates->>0 is lat. WA lat should be negative.
        # Check if coordinates->>0 is positive (meaning they put lng in lat position, or it's > -10)
        res = conn.execute(text("""
            SELECT COUNT(*) FROM suburbs_ui_v3 
            WHERE state = 'WA' AND coordinates IS NOT NULL AND CAST(coordinates->>0 AS FLOAT) > -10
        """)).scalar()
        print(f"WA Suburbs with suspicious coordinates (lat > -10): {res}")

        # 4. Missing School Data
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE school_count IS NULL OR school_count = 0")).scalar()
        print(f"Suburbs missing school data (count=0 or NULL): {res} ({res/total_suburbs*100:.1f}%)")

        # 5. Missing Transit Data
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE transit_accessibility IS NULL")).scalar()
        print(f"Suburbs missing transit data: {res} ({res/total_suburbs*100:.1f}%)")

        # 6. Missing Demographics (Population)
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE population_2021 IS NULL OR population_2021 = 0")).scalar()
        print(f"Suburbs missing 2021 Population data: {res} ({res/total_suburbs*100:.1f}%)")

        # 7. Unrealistic Liveability Composite Components
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE safety_score IS NULL")).scalar()
        print(f"Suburbs missing safety score: {res} ({res/total_suburbs*100:.1f}%)")

        # 8. Unrealistic median age
        res = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE median_age <= 0 OR median_age > 100")).scalar()
        print(f"Suburbs with invalid median_age: {res}")

if __name__ == "__main__":
    try:
        run_audit()
    except Exception as e:
        print(f"Audit failed: {e}")
