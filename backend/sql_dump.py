import sys
import json
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://realestate_user:realestate_pass@localhost:15432/realestate")
with engine.connect() as conn:
    print("=== SCHEMA ===")
    res = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'suburbs_ui_v3';
    """))
    for row in res:
        print(f"{row[0]}: {row[1]}")
        
    print("=== SAMPLE DEMOGRAPHICS_DETAIL ===")
    res = conn.execute(text("SELECT demographics_detail FROM suburbs_ui_v3 WHERE demographics_detail IS NOT NULL LIMIT 1;"))
    row = res.fetchone()
    if row:
        print(json.dumps(row[0], indent=2))
