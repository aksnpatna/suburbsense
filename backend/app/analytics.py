from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_utility_db, get_realestate_db

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
    ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host
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

@router.get("/news/global")
def get_global_news(db: Session = Depends(get_realestate_db)):
    results = db.execute(text("""
        SELECT topic, sentiment_label, sentiment_score, summary, articles_analyzed, last_updated 
        FROM global_market_news 
        ORDER BY topic ASC
    """)).fetchall()
    
    return [
        {
            "topic": r.topic,
            "sentiment_label": r.sentiment_label,
            "sentiment_score": r.sentiment_score,
            "summary": r.summary,
            "articles_analyzed": r.articles_analyzed,
            "last_updated": r.last_updated
        } for r in results
    ]


@router.post("/news/refresh")
def refresh_news():
    """Trigger a news fetch via Tavily. Run this on a schedule (e.g. daily cron)."""
    import subprocess
    import sys
    try:
        result = subprocess.run(
            [sys.executable, "-m", "app.news_fetcher"],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            return {"status": "success", "output": result.stdout}
        return {"status": "error", "detail": result.stderr}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
