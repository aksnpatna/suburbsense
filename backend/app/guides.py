import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_realestate_db
from app.constants import generate_slug

router = APIRouter(prefix="/api/guides", tags=["Guides"])

@router.get("/{state}/{category}")
def get_guide(state: str, category: str, db: Session = Depends(get_realestate_db)):
    state = state.upper()
    category = category.lower()
    
    valid_categories = ["families", "commuters", "safest"]
    if category not in valid_categories:
        raise HTTPException(status_code=404, detail="Category not found")
        
    order_by_clause = ""
    
    if category == "families":
        # Best for Families: School quality, safety, parks
        order_by_clause = """
        (COALESCE(school_quality, 0) * 3 + 
         COALESCE(safety_score, 0) * 2 + 
         LEAST(COALESCE(parks_count, 0) * 0.5, 10)) DESC
        """
    elif category == "commuters":
        # Best for Commuters: High transit accessibility, close to CBD
        order_by_clause = """
        (COALESCE(transit_accessibility, 0) * 2 - 
         COALESCE(cbd_distance_mins, 999)) DESC
        """
    elif category == "safest":
        # Safest: High safety score, low crime rate
        order_by_clause = """
        COALESCE(safety_score, 0) DESC, COALESCE(crime_rate, 99999) ASC
        """
        
    query = text(f"""
        SELECT id, name, state, postcode, coordinates, population_2021,
               school_quality, safety_score, transit_accessibility, 
               parks_count, cbd_distance_mins, crime_rate, avg_icsea
        FROM suburbs_ui_v3
        WHERE state = :state
        AND coordinates IS NOT NULL
        AND (dq_score >= 90 OR dq_score IS NULL)
        AND population_2021 > 500
        ORDER BY {order_by_clause}
        LIMIT 20
    """)
    
    try:
        cursor = db.execute(query, {"state": state})
        results = []
        for row in cursor:
            # Handle coordinates parsing
            if isinstance(row.coordinates, str):
                coords = json.loads(row.coordinates)
            elif isinstance(row.coordinates, list):
                coords = row.coordinates
            else:
                continue
                
            results.append({
                "id": row.id,
                "name": row.name,
                "state": row.state,
                "postcode": row.postcode,
                "slug": generate_slug(row.name, row.state, row.postcode),
                "coordinates": {"lat": coords[0], "lng": coords[1]},
                "population": row.population_2021,
                "school_quality": row.school_quality,
                "avg_icsea": row.avg_icsea,
                "safety_score": row.safety_score,
                "transit_accessibility": row.transit_accessibility,
                "parks_count": row.parks_count,
                "cbd_distance_mins": row.cbd_distance_mins,
                "crime_rate": row.crime_rate
            })
            
        # Category Titles and Descriptions for Frontend Display
        meta = {}
        if category == "families":
            meta = {
                "title": f"Best Suburbs for Families in {state}",
                "description": f"Discover the top {state} suburbs for families, ranked by school quality, safety scores, and access to parks and open spaces."
            }
        elif category == "commuters":
            meta = {
                "title": f"Best Suburbs for Commuters in {state}",
                "description": f"The top {state} suburbs for an easy commute, ranked by transit accessibility and proximity to the CBD."
            }
        elif category == "safest":
            meta = {
                "title": f"Safest Suburbs in {state}",
                "description": f"The safest suburbs in {state}, ranked by lowest crime rates and highest community safety scores."
            }
            
        return {
            "meta": meta,
            "suburbs": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
