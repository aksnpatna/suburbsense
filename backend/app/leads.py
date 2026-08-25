import re
from pydantic import BaseModel
from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.db import get_utility_db
from app.config import get_settings
from fastapi import APIRouter

router = APIRouter(prefix="/api/leads", tags=["Leads"])

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


class LeadCreate(BaseModel):
    email: str
    vertical: str
    suburb_slug: str | None = None

@router.post("/")
def create_lead(email: str = Form(...), vertical: str = Form(...), suburb_slug: str = Form(None), db: Session = Depends(get_utility_db)):
    if vertical not in ['energy', 'internet', 'health']:
        raise HTTPException(status_code=422, detail="Invalid vertical. Must be one of: energy, internet, health")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=422, detail="Invalid email format")
        
    try:
        db.execute("""
            INSERT INTO leads (email, vertical, suburb_slug)
            VALUES (:email, :vertical, :suburb_slug)
            ON CONFLICT (email, vertical, suburb_slug) DO NOTHING
        """, {"email": email.strip().lower(), "vertical": vertical.strip().lower(), "suburb_slug": suburb_slug.strip() if suburb_slug else None})
        db.commit()
        return {"success": True, "message": "Lead saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save lead: {str(e)}")
