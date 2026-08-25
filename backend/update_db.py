import sys
import os
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db import utility_engine

with utility_engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE page_views RENAME COLUMN ip_hash TO ip_address;"))
    except Exception as e:
        print("Rename skipped (maybe already renamed):", e)
        
    try:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS feedback (
            id BIGSERIAL PRIMARY KEY,
            rating INTEGER,
            message TEXT,
            path TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at);
        """))
    except Exception as e:
        print("Feedback table error:", e)
        
    conn.commit()
    print("DB updated successfully")
