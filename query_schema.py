import sys, os
from sqlalchemy import text
sys.path.append(os.path.abspath('backend'))
from app.db import realestate_engine

with realestate_engine.connect() as conn:
    res = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'suburbs_ui_v3';"))
    for row in res:
        print(f"{row[0]}: {row[1]}")
