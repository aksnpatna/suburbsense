from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_utility_db

router = APIRouter(prefix="/api", tags=["Analytics"])

class TrackEvent(BaseModel):
    path: str
    referrer: str | None = None

class FeedbackEvent(BaseModel):
    rating: int | None = None
    message: str | None = None
    path: str | None = None

@router.post("/analytics/track")
def track_page_view(event: TrackEvent, request: Request, db: Session = Depends(get_utility_db)):
    ip = request.headers.get("x-forwarded-for") or request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    db.execute(text("""
        INSERT INTO page_views (path, ip_address, user_agent, referer, country)
        VALUES (:path, :ip_address, :user_agent, :referer, 'AU')
    """), {
        "path": event.path,
        "ip_address": ip,
        "user_agent": user_agent,
        "referer": event.referrer
    })
    db.commit()
    
    return {"status": "tracked"}

@router.post("/feedback")
def submit_feedback(event: FeedbackEvent, db: Session = Depends(get_utility_db)):
    db.execute(text("""
        INSERT INTO feedback (rating, message, path)
        VALUES (:rating, :message, :path)
    """), {
        "rating": event.rating,
        "message": event.message,
        "path": event.path
    })
    db.commit()
    return {"status": "success"}

@router.get("/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_utility_db)):
    # Get top 10 pages today
    top_pages = db.execute(text("""
        SELECT path, COUNT(*) as views, COUNT(DISTINCT ip_address) as unique_visitors
        FROM page_views
        WHERE created_at > now() - interval '24 hours'
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
    """)).fetchall()

    # Get daily traffic for last 7 days
    daily_traffic = db.execute(text("""
        SELECT date_trunc('day', created_at) as day, COUNT(*) as views
        FROM page_views
        WHERE created_at > now() - interval '7 days'
        GROUP BY day
        ORDER BY day ASC
    """)).fetchall()

    # Get unique visitors summary
    visitors = db.execute(text("""
        SELECT 
            COUNT(DISTINCT CASE WHEN created_at > now() - interval '24 hours' THEN ip_address END) as today,
            COUNT(DISTINCT CASE WHEN created_at > now() - interval '7 days' THEN ip_address END) as week,
            COUNT(DISTINCT CASE WHEN created_at > now() - interval '30 days' THEN ip_address END) as month
        FROM page_views
        WHERE created_at > now() - interval '30 days'
    """)).fetchone()

    return {
        "top_pages": [{"path": r.path, "views": r.views, "unique": r.unique_visitors} for r in top_pages],
        "daily_traffic": [{"date": str(r.day.date()), "views": r.views} for r in daily_traffic],
        "visitors": {
            "today": visitors.today if visitors else 0,
            "week": visitors.week if visitors else 0,
            "month": visitors.month if visitors else 0
        }
    }
