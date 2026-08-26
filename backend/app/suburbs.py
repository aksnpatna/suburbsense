import base64
import json
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_realestate_db, get_utility_db
from app.llm import analyze_image
from app.constants import (
    SUBURBS_UI_ALLOWLIST,
    DEMOGRAPHICS_DETAIL_ALLOWLIST,
    OSM_CATEGORIES,
    SUPERMARKET_BRANDS,
    generate_slug,
    CHOICE_BENCHMARK,
)
from app.config import get_settings
from fastapi import APIRouter
import psycopg

router = APIRouter(prefix="/api/suburbs", tags=["Suburbs"])

# --- Suburb search (autocomplete fallback) ---
from app.constants import MAJOR_REGIONS
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

@router.get("/search")
def search_suburbs(q: str = "", state: str = None, region: str = None, db: Session = Depends(get_realestate_db), limit: int = 10):
    if not q and not state and not region:
        return {"results": []}
    
    q = q.strip().lower()
    
    # Check for region matches if searching by text
    region_results = []
    if q and len(q) >= 2:
        for slug, r_data in MAJOR_REGIONS.items():
            if q in r_data["name"].lower():
                region_results.append({
                    "id": f"region-{slug}",
                    "is_region": True,
                    "name": r_data["name"],
                    "state": r_data["state"],
                    "slug": slug,
                })

    from sqlalchemy import text
    
    # Build query dynamically
    where_clauses = ["(dq_score >= 90 OR dq_score IS NULL)", "coordinates IS NOT NULL"]
    params = {"limit": limit}
    
    if q:
        where_clauses.append("(LOWER(name) LIKE :search OR LOWER(postcode) LIKE :search)")
        params["search"] = f"%{q}%"
    
    if state:
        where_clauses.append("UPPER(state) = :state")
        params["state"] = state.upper()

    # If region is provided, we'll fetch more and filter in memory since coordinates parsing is tricky in raw SQL here
    if region and region in MAJOR_REGIONS:
        params["state"] = MAJOR_REGIONS[region]["state"].upper()
        if "UPPER(state) = :state" not in where_clauses:
            where_clauses.append("UPPER(state) = :state")
        # Fetch up to 1000 suburbs in the state to filter by distance
        params["limit"] = 1000

    query = text(f"""
        SELECT id, name, state, postcode, coordinates
        FROM suburbs_ui_v3
        WHERE {' AND '.join(where_clauses)}
        ORDER BY population_2021 DESC
        LIMIT :limit
    """)
    
    try:
        cursor = db.execute(query, params)
        results = []
        for row in cursor:
            if isinstance(row.coordinates, str):
                coords = json.loads(row.coordinates)
            elif isinstance(row.coordinates, list):
                coords = row.coordinates
            else:
                continue
                
            lat, lon = coords[0], coords[1]
            
            # If region filter is active, check distance
            if region and region in MAJOR_REGIONS:
                r_data = MAJOR_REGIONS[region]
                dist = haversine(r_data["lat"], r_data["lon"], lat, lon)
                if dist > r_data["radius_km"]:
                    continue

            results.append({
                "id": row.id,
                "name": row.name,
                "state": row.state,
                "postcode": row.postcode,
                "slug": generate_slug(row.name, row.state, row.postcode),
                "coordinates": {"lat": lat, "lng": lon}
            })
            
            # Stop if we hit the limit for region filtering
            if region and len(results) >= limit:
                break
                
        # Combine region matches and suburb matches
        final_results = region_results + results
        return {"results": final_results[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- OSM amenity query helper ---
def query_osm_amenities(lat: float, lng: float, category: str, radius_m: int, db: Session):
    cfg = OSM_CATEGORIES.get(category)
    if not cfg:
        return []
    
    if category == "transit":
        # Transit: multiple key/value pairs
        sql = """
            WITH transit_union AS (
                SELECT 
                    CASE WHEN name != '' THEN name ELSE (
                        CASE 
                            WHEN highway='bus_stop' THEN 'Bus Stop'
                            WHEN railway='tram_stop' THEN 'Tram Stop'
                            WHEN public_transport='station' THEN 'Transit Station'
                            ELSE 'Unknown Stop'
                        END
                    ) END AS name,
                    ST_Y(ST_Transform(way, 4326)) AS lat,
                    ST_X(ST_Transform(way, 4326)) AS lng,
                    ST_Distance(
                        way,
                        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
                    ) * 0.0007907 AS distance_km
                FROM planet_osm_point
                WHERE (
                    (highway = 'bus_stop') OR
                    (railway = 'tram_stop') OR
                    (public_transport IN ('station', 'stop_position')) OR
                    (amenity IN ('bus_station', 'ferry_terminal'))
                )
                AND way && ST_Expand(ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857), :radius_m / 0.7907)
                
                UNION
                
                SELECT 
                    CASE WHEN name != '' THEN name ELSE 'Transit Station' END AS name,
                    ST_Y(ST_Transform(ST_Centroid(way), 4326)) AS lat,
                    ST_X(ST_Transform(ST_Centroid(way), 4326)) AS lng,
                    ST_Distance(
                        way,
                        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
                    ) * 0.0007907 AS distance_km
                FROM planet_osm_polygon
                WHERE (
                    (highway = 'bus_stop') OR
                    (railway = 'tram_stop') OR
                    (public_transport IN ('station', 'stop_position')) OR
                    (amenity IN ('bus_station', 'ferry_terminal'))
                )
                AND way && ST_Expand(ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857), :radius_m / 0.7907)
            )
            SELECT * FROM transit_union ORDER BY distance_km ASC LIMIT 20;
        """
        params = {"lat": lat, "lng": lng, "radius_m": radius_m}
    elif cfg["key"] is not None:
        in_clause = ", ".join(f"'{v}'" for v in cfg['values'])
        sql = f"""
            WITH point_query AS (
                SELECT 
                    name,
                    ST_Y(ST_Transform(way, 4326)) AS lat,
                    ST_X(ST_Transform(way, 4326)) AS lng,
                    ST_Distance(way, ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)) * 0.0007907 AS distance_km
                FROM planet_osm_point
                WHERE {cfg["key"]} IN ({in_clause})
                AND way && ST_Expand(ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857), :radius_m / 0.7907)
            ),
            polygon_query AS (
                SELECT 
                    name,
                    ST_Y(ST_Transform(ST_Centroid(way), 4326)) AS lat,
                    ST_X(ST_Transform(ST_Centroid(way), 4326)) AS lng,
                    ST_Distance(way, ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)) * 0.0007907 AS distance_km
                FROM planet_osm_polygon
                WHERE {cfg["key"]} IN ({in_clause})
                AND way && ST_Expand(ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857), :radius_m / 0.7907)
            ),
            combined AS (
                SELECT * FROM point_query
                UNION
                SELECT * FROM polygon_query
            )
            SELECT * FROM combined ORDER BY distance_km ASC LIMIT 20;
        """
        params = {"lng": lng, "lat": lat, "radius_m": radius_m}
    else:
        return []
    try:
        cursor = db.execute(text(sql), params)
        results = []
        for row in cursor:
            results.append({
                "name": row.name.strip() if row.name else "Unnamed",
                "lat": row.lat,
                "lng": row.lng,
                "distance_km": round(row.distance_km, 2)
            })
        return results
    except Exception as e:
        print(f"OSM query failed for {category}: {e}")
        return []

# --- Suburb profile ---
@router.get("/{slug}")
def get_suburb_profile(slug: str, db: Session = Depends(get_realestate_db)):
    # Parse slug: name-state-postcode → extract name, state, postcode
    parts = slug.split("-")
    if len(parts) < 3:
        raise HTTPException(status_code=404, detail="Invalid suburb slug format")
    postcode = parts[-1]
    state = parts[-2].upper()
    name = " ".join(parts[:-2]).replace("-", " ").title()
    
    # Fetch from DB with allowlist and launch-ready check
    query = text("""
        SELECT id, state, name, postcode, population_2021, population_2016, population_cagr, population_density,
               owner_occupier_rate, median_age, predominant_age_group, predominant_occupation,
               average_household_size, area_sqkm, typical_mortgage_band,
               school_count, avg_icsea, top_school_name, school_quality,
               parks_count, parks_coverage_pct, transit_accessibility, cbd_distance_mins, metro_cbd, safety_score, crime_rate,
               coordinates, demographics_detail, schools,
               ST_AsGeoJSON(ST_Transform(boundary_geom, 4326)) AS boundary_geojson
        FROM suburbs_ui_v3
        WHERE state = :state
        AND LOWER(name) = LOWER(:name)
        AND postcode = :postcode
        AND dq_score >= 90
        AND coordinates IS NOT NULL
    """)
    
    params = {"state": state, "name": name, "postcode": postcode}
    
    try:
        cursor = db.execute(query, params)
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Suburb not found or not available in launch data")
            
        # Handle coordinates parsing - row.coordinates could be a list or JSON string
        if isinstance(row.coordinates, str):
            coords = json.loads(row.coordinates)
        elif isinstance(row.coordinates, list):
            coords = row.coordinates
        else:
            raise HTTPException(status_code=404, detail="Suburb not found or not available in launch data")
            
        lat, lng = coords[0], coords[1]
        
        # Parse demographics_detail JSON (extract only allowlisted keys, exclude sqm_data etc.)
        if isinstance(row.demographics_detail, dict):
            demographics_detail = row.demographics_detail
        else:
            demographics_detail = json.loads(row.demographics_detail or "{}")
        demographics = {
            "age_distribution": demographics_detail.get("age_distribution", {}),
            "income_distribution": demographics_detail.get("income_distribution", {}),
            "household_distribution": demographics_detail.get("household_distribution", {}),
            "predominant_household": demographics_detail.get("predominant_household", "")
        }
        
        schools = []
        if row.schools:
            try:
                if isinstance(row.schools, list):
                    schools = row.schools
                else:
                    schools = json.loads(row.schools)
            except:
                schools = []
                
        boundary = None
        if row.boundary_geojson:
            try:
                boundary = json.loads(row.boundary_geojson)
            except:
                pass
                
        # Query OSM amenities for this location
        amenities = {}
        for cat, cfg in OSM_CATEGORIES.items():
            amenities[cat] = query_osm_amenities(lat, lng, cat, cfg["radius"], db)
        
        # Query transit stops for the map (separate from score calculation)
        transit_stops = []
        try:
            transit_map_query = text("""
                SELECT 
                    CASE WHEN p.name != '' THEN p.name ELSE (
                        CASE 
                            WHEN p.highway='bus_stop' THEN 'Bus Stop'
                            WHEN p.railway='tram_stop' THEN 'Tram Stop'
                            WHEN p.public_transport='station' THEN 'Train Station'
                            ELSE 'Transit Stop'
                        END
                    ) END AS name,
                    ST_Y(ST_Transform(p.way, 4326)) AS lat,
                    ST_X(ST_Transform(p.way, 4326)) AS lng,
                    CASE 
                        WHEN p.highway='bus_stop' THEN 'bus_stop'
                        WHEN p.railway='tram_stop' THEN 'tram_stop'
                        WHEN p.amenity='station' OR p.public_transport='station' THEN 'train_station'
                        ELSE 'bus_stop'
                    END AS stop_category,
                    ST_Distance(
                        ST_Transform(p.way, 4326)::geography,
                        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 4326)::geography
                    ) / 1000.0 AS distance_km
                FROM planet_osm_point p
                WHERE (
                    (p.highway = 'bus_stop') OR
                    (p.railway IN ('tram_stop', 'station')) OR
                    (p.public_transport IN ('station', 'stop_position')) OR
                    (p.amenity IN ('bus_station', 'ferry_terminal'))
                )
                AND ST_DWithin(
                    ST_Transform(p.way, 4326)::geography,
                    ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 4326)::geography,
                    2000
                )
                ORDER BY distance_km ASC
                LIMIT 100
            """)
            transit_cursor = db.execute(transit_map_query, {"lng": lng, "lat": lat})
            for trow in transit_cursor:
                transit_stops.append({
                    "name": trow.name,
                    "lat": trow.lat,
                    "lng": trow.lng,
                    "category": trow.stop_category,
                    "distance_km": round(trow.distance_km, 2)
                })
        except Exception as e:
            pass
        
        # Calculate score chips from counts
        # Transit: use weighted scoring from our dedicated transit map query
        bus_count = len([s for s in transit_stops if s.get("category") == "bus_stop"])
        tram_count = len([s for s in transit_stops if s.get("category") == "tram_stop"])
        train_count = len([s for s in transit_stops if s.get("category") == "train_station"])
        ferry_count = len([s for s in transit_stops if s.get("category") == "ferry"])
        
        weighted_transit = (bus_count * 1) + (tram_count * 3) + (train_count * 8) + (ferry_count * 5)
        transit_score = min(100, int(weighted_transit / 50 * 100))
        
        # Service diversity: count distinct transit routes (OSM route data)
        service_diversity = 0
        try:
            diversity_query = text("""
                SELECT 
                    COUNT(DISTINCT CASE WHEN l.route = 'bus' THEN l.ref END) as bus_routes,
                    COUNT(DISTINCT CASE WHEN l.route = 'tram' THEN l.ref END) as tram_routes
                FROM planet_osm_line l, suburbs_ui_v3 s
                WHERE s.name ILIKE :name AND s.state = :state AND s.postcode = :postcode
                AND l.route IN ('bus', 'tram')
                AND l.way && ST_Expand(ST_Transform(s.boundary_geom, 3857), 5000 / 0.7907)
                AND ST_DWithin(
                    l.way,
                    ST_Transform(s.boundary_geom, 3857),
                    5000 / 0.7907
                )
            """)
            div_result = db.execute(diversity_query, {"name": name, "state": state, "postcode": postcode}).fetchone()
            if div_result:
                bus_routes = div_result[0] or 0
                tram_routes = div_result[1] or 0
                # Train routes from our stop data
                train_routes = len(set(t.get("name", "").split(" Station")[0] for t in amenities.get("train_station", [])))
                service_diversity = bus_routes + tram_routes + train_routes
        except Exception as e:
            pass
        
        # Service diversity score: cap at 30 routes = 100
        diversity_score = min(100, int(service_diversity / 30 * 100))
        
        # Combined transit score: 70% stop density + 30% service diversity
        combined_transit = int((transit_score * 0.7) + (diversity_score * 0.3))
        
        # Road accessibility: motorway proximity + major road access
        road_score = 0
        nearest_mw = None
        try:
            road_query = text("""
                SELECT 
                    COUNT(DISTINCT CASE WHEN l.highway IN ('motorway', 'motorway_link') THEN l.osm_id END) as motorway_count,
                    COUNT(DISTINCT CASE WHEN l.highway IN ('trunk', 'trunk_link') THEN l.osm_id END) as trunk_count,
                    COUNT(DISTINCT CASE WHEN l.highway = 'primary' THEN l.osm_id END) as primary_count,
                    MIN(CASE WHEN l.highway IN ('motorway', 'trunk') THEN 
                        ST_Distance(l.way, ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)) * 0.0007907
                    ELSE NULL END) AS nearest_motorway_km
                FROM planet_osm_line l
                WHERE l.highway IN ('motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary')
                AND l.way && ST_Expand(ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857), 5000 / 0.7907)
                AND ST_DWithin(
                    l.way,
                    ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
                    5000 / 0.7907
                )
            """)
            road_result = db.execute(road_query, {"lng": lng, "lat": lat}).fetchone()
            
            if road_result:
                motorways = road_result[0] or 0
                trunks = road_result[1] or 0
                primary_roads = road_result[2] or 0
                nearest_mw = road_result[3]
                
                # Road score based on proximity and access (not segment count)
                # Proximity is the primary factor
                if nearest_mw is not None:
                    if nearest_mw < 1: road_score = 100
                    elif nearest_mw < 2: road_score = 85
                    elif nearest_mw < 3: road_score = 70
                    elif nearest_mw < 5: road_score = 55
                    elif nearest_mw < 8: road_score = 40
                    else: road_score = 25
                else:
                    road_score = 20  # No motorway/trunk within 8km
                
                # Bonus for multiple major roads
                major_roads = motorways + trunks
                if major_roads >= 3: road_score = min(100, road_score + 10)
                elif major_roads >= 2: road_score = min(100, road_score + 5)
                
                # Primary road access bonus
                if primary_roads >= 5: road_score = min(100, road_score + 5)
        except Exception as e:
            road_score = 0
        
        # Combined accessibility: transit 60% + road 40%
        combined_accessibility = int((transit_score * 0.6) + (road_score * 0.4))
        
        # Calculate public school ranking for score
        public_school_percentiles = []
        private_keywords = ["catholic", "grammar", "islamic", "lutheran", "christian", "anglican", "st ", "baptist", "montessori", "steiner", "adventist", "independent"]
        
        for s in schools:
            name_lower = s.get("name", "").lower()
            is_public = not any(kw in name_lower for kw in private_keywords)
            if is_public and s.get("icseaPercentile"):
                public_school_percentiles.append(s["icseaPercentile"])
                
        if public_school_percentiles:
            # Score is the average percentile of public schools
            school_score = int(sum(public_school_percentiles) / len(public_school_percentiles))
        elif row.school_quality:
            # Fallback to general school quality (out of 10)
            school_score = int(row.school_quality * 10)
        else:
            # Fallback if no data
            school_score = min(100, int(len(amenities.get("school", [])) / 5 * 100))

        scores = {
            "schools": round(school_score),
            "transit": round(combined_transit),
            "transit_stops": round(transit_score),
            "transit_diversity": round(diversity_score),
            "parks": round(min(100, row.parks_count)),
            "shopping": round(min(100, len(amenities["supermarket"]) / 15 * 100)),
            "health": round(min(100, len(amenities["health"]) / 5 * 100)),
            "roads": round(road_score),
            "accessibility": round(combined_accessibility),
         }
        
        # Branded supermarket counts
        supermarket_brands = {}
        for amenity in amenities.get("supermarket", []):
            amenity_name = amenity.get("name", "").lower()
            matched = False
            for pattern, label in SUPERMARKET_BRANDS:
                if pattern in amenity_name:
                    supermarket_brands[label] = supermarket_brands.get(label, 0) + 1
                    matched = True
            if not matched:
                supermarket_brands["Other"] = supermarket_brands.get("Other", 0) + 1
                
        nearest_train = sorted(amenities.get("train_station", []), key=lambda x: x["distance_km"])[:1]
        nearest_supermarket = sorted(amenities.get("supermarket", []), key=lambda x: x["distance_km"])[:1]
        nearest_hospital = sorted(amenities.get("hospital", []), key=lambda x: x["distance_km"])[:1]

        # Query school catchment zones from PostGIS
        # Use proximity-based search (within 5km) + zone GeoJSON for map display
        school_catchments = []
        try:
            catchment_query = text("""
                SELECT DISTINCT ON (sz.school_name)
                    sz.school_name,
                    CASE 
                        WHEN UPPER(sz.school_type) IN ('PRIMARY', 'PRIM', 'CENTRAL_PRIMARY', 'INFANTS') THEN 'Primary'
                        WHEN UPPER(sz.school_type) IN ('SECONDARY', 'SEC', 'HIGH_COED', 'CENTRAL_HIGH', 'HIGH_GIRLS', 'HIGH_BOYS', 'PRSEC') THEN 'Secondary'
                        WHEN UPPER(sz.school_type) = 'UNKNOWN TYPE' THEN
                            CASE 
                                WHEN LOWER(sz.school_name) LIKE '%college%' OR LOWER(sz.school_name) LIKE '%high%' OR LOWER(sz.school_name) LIKE '%secondary%' OR LOWER(sz.school_name) LIKE '%senior%' THEN 'Secondary'
                                WHEN LOWER(sz.school_name) LIKE '%primary%' OR LOWER(sz.school_name) LIKE '%junior%' THEN 'Primary'
                                ELSE 'Primary'
                            END
                        ELSE 'Primary'
                    END as display_type,
                    ST_AsGeoJSON(sz.geom) as zone_geojson,
                    ST_Distance(
                        ST_Centroid(sz.geom)::geography,
                        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                    ) / 1000.0 as distance_km
                FROM school_zones sz, suburbs_ui_v3 s
                WHERE s.name ILIKE :name AND s.state = :state AND s.postcode = :postcode
                AND sz.geom && ST_Expand(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 0.05)
                AND ST_DWithin(
                    sz.geom::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    5000
                )
                ORDER BY sz.school_name, 
                    CASE WHEN UPPER(sz.school_type) IN ('PRIMARY', 'PRIM', 'CENTRAL_PRIMARY') THEN 0 ELSE 1 END
            """)
            catchment_cursor = db.execute(catchment_query, {"name": name, "state": state, "postcode": postcode, "lng": lng, "lat": lat})
            for crow in catchment_cursor:
                school_catchments.append({
                    "name": crow.school_name,
                    "type": crow.display_type,
                    "zone_geojson": json.loads(crow.zone_geojson) if crow.zone_geojson else None,
                    "distance_km": round(crow.distance_km, 2) if crow.distance_km else None
                })
        except Exception as e:
            pass
        
        # Also add school catchments that intersect the boundary (for completeness)
        try:
            boundary_query = text("""
                SELECT DISTINCT ON (sz.school_name)
                    sz.school_name,
                    CASE 
                        WHEN UPPER(sz.school_type) IN ('PRIMARY', 'PRIM', 'CENTRAL_PRIMARY', 'INFANTS') THEN 'Primary'
                        WHEN UPPER(sz.school_type) IN ('SECONDARY', 'SEC', 'HIGH_COED', 'CENTRAL_HIGH', 'HIGH_GIRLS', 'HIGH_BOYS', 'PRSEC') THEN 'Secondary'
                        ELSE 'Primary'
                    END as display_type,
                    ST_AsGeoJSON(sz.geom) as zone_geojson,
                    0 as distance_km
                FROM school_zones sz, suburbs_ui_v3 s
                WHERE s.name ILIKE :name AND s.state = :state AND s.postcode = :postcode
                AND sz.geom && s.boundary_geom
                AND ST_Intersects(sz.geom, ST_Transform(s.boundary_geom, 4326))
                AND sz.school_name NOT IN (
                    SELECT school_name FROM school_zones sz2, suburbs_ui_v3 s2
                    WHERE s2.name ILIKE :name AND s2.state = :state AND s2.postcode = :postcode
                    AND sz2.geom && ST_Expand(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 0.05)
                    AND ST_DWithin(sz2.geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, 5000)
                )
            """)
            boundary_cursor = db.execute(boundary_query, {"name": name, "state": state, "postcode": postcode, "lng": lng, "lat": lat})
            for crow in boundary_cursor:
                school_catchments.append({
                    "name": crow.school_name,
                    "type": crow.display_type,
                    "zone_geojson": json.loads(crow.zone_geojson) if crow.zone_geojson else None,
                    "distance_km": 0
                })
        except Exception as e:
            pass
        # Calculate Community Profile Narrative
        vibe = "Mixed"
        predominant_household = demographics_detail.get("predominant_household", "")
        if "Children" in predominant_household:
            vibe = "Family Oriented"
        elif "Childless" in predominant_household:
            vibe = "Professionals & Couples"
        elif "Single" in predominant_household or "Lone" in predominant_household:
            vibe = "Independent Living"

        roots = "Establishing"
        owner_rate = row.owner_occupier_rate or 0
        if owner_rate >= 70:
            roots = "Highly Settled"
        elif owner_rate >= 50:
            roots = "Stable Community"
        elif owner_rate < 40:
            roots = "Renter Heavy"
            
        life_stage = "Mixed Ages"
        median_age = row.median_age or 35
        if median_age < 30:
            life_stage = "Young & Vibrant"
        elif 30 <= median_age <= 45:
            life_stage = "Established Adults"
        elif median_age > 45:
            life_stage = "Mature & Retiree Friendly"
            
        affluence = "Middle Income"
        income = demographics_detail.get("predominant_income_band", "")
        if "182K+" in income or "130-182K" in income:
            affluence = "Highly Affluent"
        elif "78-130K" in income:
            affluence = "Comfortable"
        elif "0-15.6K" in income or "15.6-33.8K" in income:
            affluence = "Accessible"

        community_profile = {
            "vibe": vibe,
            "roots": roots,
            "life_stage": life_stage,
            "affluence": affluence,
            "description": f"A {life_stage.lower()} community that is {vibe.lower()}, with a {roots.lower()} feel."
        }

        return {
            "id": row.id,
            "slug": generate_slug(row.name, row.state, row.postcode),
            "name": row.name,
            "state": row.state,
            "postcode": row.postcode,
            "coordinates": {"lat": lat, "lng": lng},
            "community_profile": community_profile,
            "demographics": {
                "population_2021": row.population_2021,
                "population_2016": row.population_2016,
                "population_cagr": row.population_cagr,
                "population_density": row.population_density,
                "owner_occupier_rate": row.owner_occupier_rate,
                "median_age": row.median_age,
                "predominant_age_group": row.predominant_age_group,
                "predominant_occupation": row.predominant_occupation,
                "average_household_size": row.average_household_size,
                "area_sqkm": row.area_sqkm,
                "typical_mortgage_band": row.typical_mortgage_band,
                "income_distribution": demographics_detail.get("income_distribution", {}),
                "predominant_income_band": demographics_detail.get("predominant_income_band", ""),
                "investor_rate": demographics_detail.get("investor_rate"),
                "age_distribution": demographics_detail.get("age_distribution", {}),
                "household_distribution": demographics_detail.get("household_distribution", {}),
                "predominant_household": demographics_detail.get("predominant_household", ""),
                "dwelling_structure": demographics_detail.get("dwelling_structure", {}),
                "travel_to_work": demographics_detail.get("travel_to_work", {}),
                **demographics
            },
            "education": {
                "school_count": row.school_count or len(school_catchments),
                "avg_icsea": row.avg_icsea,
                "top_school_name": row.top_school_name or (school_catchments[0]["name"] if school_catchments else None),
                "school_quality": row.school_quality,
                "schools": schools
            },
            "environment": {
                "parks_count": row.parks_count,
                "parks_coverage_pct": row.parks_coverage_pct,
                "safety_score": row.safety_score,
                "crime_rate": row.crime_rate
            },
            "transport": {
                "transit_accessibility": transit_score,
                "combined_accessibility": combined_accessibility,
                "cbd_distance_mins": row.cbd_distance_mins,
                "metro_cbd": row.metro_cbd,
                "nearest_train": nearest_train,
                "transit_count": len(amenities["transit"]),
                "bus_stops": bus_count,
                "tram_stops": tram_count,
                "train_stations": train_count,
                "ferry_terminals": ferry_count,
                "service_diversity": service_diversity,
                "bus_routes": bus_routes,
                "tram_routes": tram_routes,
                "road_score": road_score,
                "nearest_motorway_km": round(nearest_mw, 1) if nearest_mw else None
            },
            "amenities": {
                "supermarket_brands": supermarket_brands,
                "nearest_supermarket": nearest_supermarket,
                "nearest_hospital": nearest_hospital,
                "total_counts": {
                    "supermarket": len(amenities["supermarket"]),
                    "school": len(amenities["school"]),
                    "health": len(amenities["health"]),
                    "cafe": len(amenities["cafe"]),
                    "park": len(amenities["park"]),
                    "transit": len(amenities["transit"]),
                    "train_station": len(amenities["train_station"]),
                    "religion": len(amenities.get("religion", [])),
                },
                "per_category": amenities
            },
            "scores": scores,
            "attributions": [{"name": a["name"], "url": a["url"]} for a in get_settings().attributions],
            "choice_benchmark": CHOICE_BENCHMARK,
            "boundary": boundary,
            "school_catchments": school_catchments,
            "transit_stops": transit_stops
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch suburb profile: {str(e)}")


def _get_suburb_preview(db: Session, slug: str) -> dict | None:
    """Fetch minimal suburb data for comparison pages."""
    query = text("""
        SELECT id, name, state, postcode, coordinates, population_2021,
               owner_occupier_rate, median_age, avg_icsea, school_count,
               transit_accessibility, safety_score, crime_rate, parks_count,
               parks_coverage_pct, cbd_distance_mins, geom
        FROM suburbs_ui_v3
        WHERE LOWER(name || '-' || state || '-' || postcode) = LOWER(:slug)
          AND is_live = true
        LIMIT 1
    """)
    row = db.execute(query, {"slug": slug}).fetchone()
    if not row:
        return None
    return {
        "slug": slug,
        "name": row.name,
        "state": row.state,
        "postcode": row.postcode,
        "population": row.population_2021,
        "owner_occupier_rate": row.owner_occupier_rate,
        "median_age": row.median_age,
        "avg_icsea": row.avg_icsea,
        "school_count": row.school_count,
        "transit_score": row.transit_accessibility,
        "safety_score": row.safety_score,
        "crime_rate": row.crime_rate,
        "parks_count": row.parks_count,
        "parks_coverage": row.parks_coverage_pct,
        "cbd_distance": row.cbd_distance_mins,
    }


@router.get("/compare")
def compare_suburbs(a: str = Query(...), b: str = Query(...), db: Session = Depends(get_realestate_db)):
    """Compare two suburbs by slug. Used by programmatic comparison pages."""
    sub_a = _get_suburb_preview(db, a)
    sub_b = _get_suburb_preview(db, b)
    if not sub_a or not sub_b:
        raise HTTPException(status_code=404, detail="One or both suburbs not found")

    comparison = {
        "suburb_a": sub_a,
        "suburb_b": sub_b,
        "differences": {
            "population": (sub_a["population"] or 0) - (sub_b["population"] or 0),
            "transit_score": (sub_a["transit_score"] or 0) - (sub_b["transit_score"] or 0),
            "safety_score": (sub_a["safety_score"] or 0) - (sub_b["safety_score"] or 0),
            "school_count": (sub_a["school_count"] or 0) - (sub_b["school_count"] or 0),
            "parks_coverage": (sub_a["parks_coverage"] or 0) - (sub_b["parks_coverage"] or 0),
            "cbd_distance": (sub_a["cbd_distance"] or 0) - (sub_b["cbd_distance"] or 0),
        }
    }
    return comparison
