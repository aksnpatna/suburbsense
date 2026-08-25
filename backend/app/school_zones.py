import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_realestate_db

router = APIRouter(prefix="/api", tags=["Schools"])


@router.get("/school_zone")
def get_school_zone(
    name: str = Query(..., description="School name (partial match OK)"),
    state: str = Query("VIC", description="State abbreviation"),
    db: Session = Depends(get_realestate_db)
):
    """Get the catchment zone GeoJSON for a specific school."""
    if not name or len(name.strip()) < 3:
        raise HTTPException(status_code=400, detail="School name must be at least 3 characters")
    
    search = f"%{name.lower().strip()}%"
    
    try:
        result = db.execute(text("""
            SELECT school_name, school_type,
                   ST_AsGeoJSON(geom) as zone_geojson,
                   ST_Area(geom::geography) / 1000000.0 as area_sqkm
            FROM school_zones
            WHERE LOWER(school_name) LIKE :search AND state = :state
            ORDER BY ST_Area(geom) DESC
            LIMIT 1
        """), {"search": search, "state": state.upper()}).fetchone()
        
        if result and result[2]:
            return {
                "success": True,
                "school_name": result[0],
                "school_type": result[1],
                "zone_geojson": json.loads(result[2]),
                "area_sqkm": round(result[3], 2) if result[3] else None
            }
    except Exception as e:
        pass
    
    return {"success": False, "message": "School zone not found"}


@router.get("/schools/search")
def search_schools(
    q: str = Query(..., description="Search query"),
    state: str = Query("VIC", description="State abbreviation"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_realestate_db)
):
    """Search for schools by name."""
    search = f"%{q.lower().strip()}%"
    
    try:
        results = db.execute(text("""
            SELECT DISTINCT school_name, school_type, state
            FROM school_zones
            WHERE LOWER(school_name) LIKE :search AND state = :state
            ORDER BY school_name
            LIMIT :limit
        """), {"search": search, "state": state.upper(), "limit": limit}).fetchall()
        
        return {
            "success": True,
            "schools": [{"name": r[0], "type": r[1], "state": r[2]} for r in results]
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
