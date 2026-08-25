import sys
import os
import csv
import json
import sqlalchemy
from sqlalchemy import text
from app.config import get_settings

def run_audit():
    settings = get_settings()
    engine = sqlalchemy.create_engine(settings.realestate_db_url)
    
    report_file = "dq_report.csv"
    
    with engine.connect() as conn:
        print("--- SUBURB DATA EXHAUSTIVE AUDIT ---")
        
        total_suburbs = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3")).scalar()
        print(f"Total Suburbs: {total_suburbs}")

        missing_geom = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE geom IS NULL OR coordinates IS NULL")).scalar()
        print(f"Missing coordinates/geom: {missing_geom} ({missing_geom/total_suburbs*100:.1f}%)")
        
        missing_schools = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE school_count IS NULL OR school_count = 0")).scalar()
        print(f"Missing school data (count=0 or NULL): {missing_schools} ({missing_schools/total_suburbs*100:.1f}%)")
        
        missing_transit = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE transit_accessibility IS NULL")).scalar()
        print(f"Missing transit data: {missing_transit} ({missing_transit/total_suburbs*100:.1f}%)")

        missing_pop = conn.execute(text("SELECT COUNT(*) FROM suburbs_ui_v3 WHERE population_2021 IS NULL OR population_2021 = 0")).scalar()
        print(f"Missing 2021 Population: {missing_pop} ({missing_pop/total_suburbs*100:.1f}%)")

        duplicates = conn.execute(text("""
            SELECT name, state, COUNT(*) as cnt 
            FROM suburbs_ui_v3 
            GROUP BY name, state 
            HAVING COUNT(*) > 1
        """)).fetchall()
        print(f"Duplicate suburb name+state combinations: {len(duplicates)}")
        
        print(f"Generating detailed report: {report_file}")
        bad_suburbs = conn.execute(text("""
            SELECT id, name, state, postcode, 
                   CASE 
                       WHEN geom IS NULL THEN 'Missing Geom'
                       WHEN school_count IS NULL OR school_count = 0 THEN 'Missing Schools'
                       WHEN population_2021 IS NULL OR population_2021 = 0 THEN 'Missing Population'
                       ELSE 'Unknown'
                   END as primary_issue
            FROM suburbs_ui_v3
            WHERE geom IS NULL 
               OR school_count IS NULL OR school_count = 0
               OR population_2021 IS NULL OR population_2021 = 0
            LIMIT 1000
        """)).fetchall()
        
        with open(report_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['ID', 'Name', 'State', 'Postcode', 'Primary Issue'])
            for row in bad_suburbs:
                writer.writerow(row)
        
        print("Audit complete.")

if __name__ == "__main__":
    try:
        run_audit()
    except Exception as e:
        print(f"Audit failed: {e}")
