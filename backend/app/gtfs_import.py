#!/usr/bin/env python3
"""
GTFS Import Script
Downloads and imports GTFS data into PostGIS for transit frequency analysis.
"""

import os
import sys
import zipfile
import csv
import tempfile
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from app.config import get_settings
import sqlalchemy

GTFS_DIR = Path(__file__).parent / "gtfs"

def get_engine():
    return sqlalchemy.create_engine(get_settings().realestate_db_url)

def create_gtfs_tables(engine):
    """Create GTFS tables in the database."""
    with engine.connect() as c:
        c.execute(sqlalchemy.text("""
            CREATE TABLE IF NOT EXISTS gtfs_agency (
                agency_id TEXT PRIMARY KEY,
                agency_name TEXT,
                agency_url TEXT,
                agency_timezone TEXT
            );
        """))
        
        c.execute(sqlalchemy.text("""
            CREATE TABLE IF NOT EXISTS gtfs_routes (
                route_id TEXT PRIMARY KEY,
                agency_id TEXT,
                route_short_name TEXT,
                route_long_name TEXT,
                route_type TEXT
            );
        """))
        
        c.execute(sqlalchemy.text("""
            CREATE TABLE IF NOT EXISTS gtfs_stops (
                stop_id TEXT PRIMARY KEY,
                stop_name TEXT,
                stop_lat DOUBLE PRECISION,
                stop_lon DOUBLE PRECISION,
                location_type INTEGER DEFAULT 0,
                geom GEOMETRY(Point, 4326)
            );
        """))
        
        c.execute(sqlalchemy.text("""
            CREATE TABLE IF NOT EXISTS gtfs_trips (
                trip_id TEXT PRIMARY KEY,
                route_id TEXT,
                service_id TEXT,
                trip_headsign TEXT
            );
        """))
        
        c.execute(sqlalchemy.text("""
            CREATE TABLE IF NOT EXISTS gtfs_stop_times (
                id SERIAL PRIMARY KEY,
                trip_id TEXT,
                stop_id TEXT,
                stop_sequence INTEGER,
                arrival_time TEXT,
                departure_time TEXT
            );
        """))
        
        c.execute(sqlalchemy.text("""
            CREATE TABLE IF NOT EXISTS gtfs_calendar (
                service_id TEXT PRIMARY KEY,
                monday INTEGER,
                tuesday INTEGER,
                wednesday INTEGER,
                thursday INTEGER,
                friday INTEGER,
                saturday INTEGER,
                sunday INTEGER
            );
        """))
        
        # Create indexes
        c.execute(sqlalchemy.text("CREATE INDEX IF NOT EXISTS idx_gtfs_stops_geom ON gtfs_stops USING GIST(geom);"))
        c.execute(sqlalchemy.text("CREATE INDEX IF NOT EXISTS idx_gtfs_stop_times_trip ON gtfs_stop_times(trip_id);"))
        c.execute(sqlalchemy.text("CREATE INDEX IF NOT EXISTS idx_gtfs_stop_times_stop ON gtfs_stop_times(stop_id);"))
        c.execute(sqlalchemy.text("CREATE INDEX IF NOT EXISTS idx_gtfs_trips_route ON gtfs_trips(route_id);"))
        c.execute(sqlalchemy.text("CREATE INDEX IF NOT EXISTS idx_gtfs_trips_service ON gtfs_trips(service_id);"))
        
        c.commit()
        print("GTFS tables created")

def import_gtfs_zip(zip_path, engine, state_code, mode_filter=None):
    """Import a GTFS zip file into the database."""
    print(f"Importing {zip_path}...")
    
    with zipfile.ZipFile(zip_path, 'r') as z:
        files = z.namelist()
        print(f"  Contains: {', '.join(files[:8])}...")
        
        with engine.connect() as conn:
            # Import agency
            if 'agency.txt' in files:
                with z.open('agency.txt') as f:
                    reader = csv.DictReader(f.read().decode('utf-8').splitlines())
                    for row in reader:
                        try:
                            conn.execute(sqlalchemy.text("""
                                INSERT INTO gtfs_agency (agency_id, agency_name, agency_url, agency_timezone)
                                VALUES (:id, :name, :url, :tz)
                                ON CONFLICT (agency_id) DO NOTHING
                            """), {
                                "id": row.get('agency_id', '1'),
                                "name": row.get('agency_name', ''),
                                "url": row.get('agency_url', ''),
                                "tz": row.get('agency_timezone', '')
                            })
                        except Exception as e:
                            pass
                print(f"  Imported agencies")
            
            # Import routes
            if 'routes.txt' in files:
                with z.open('routes.txt') as f:
                    reader = csv.DictReader(f.read().decode('utf-8').splitlines())
                    for row in reader:
                        try:
                            route_type = row.get('route_type', '')
                            if mode_filter and route_type not in mode_filter:
                                continue
                            conn.execute(sqlalchemy.text("""
                                INSERT INTO gtfs_routes (route_id, agency_id, route_short_name, route_long_name, route_type)
                                VALUES (:id, :agency, :short, :long, :type)
                                ON CONFLICT (route_id) DO NOTHING
                            """), {
                                "id": row['route_id'],
                                "agency": row.get('agency_id', ''),
                                "short": row.get('route_short_name', ''),
                                "long": row.get('route_long_name', ''),
                                "type": route_type
                            })
                        except Exception as e:
                            pass
                print(f"  Imported routes")
            
            # Import stops
            if 'stops.txt' in files:
                with z.open('stops.txt') as f:
                    reader = csv.DictReader(f.read().decode('utf-8').splitlines())
                    for row in reader:
                        try:
                            lat = float(row.get('stop_lat', 0))
                            lon = float(row.get('stop_lon', 0))
                            if lat == 0 and lon == 0:
                                continue
                            conn.execute(sqlalchemy.text("""
                                INSERT INTO gtfs_stops (stop_id, stop_name, stop_lat, stop_lon, location_type, geom)
                                VALUES (:id, :name, :lat, :lon, :loc_type, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))
                                ON CONFLICT (stop_id) DO NOTHING
                            """), {
                                "id": row['stop_id'],
                                "name": row.get('stop_name', ''),
                                "lat": lat,
                                "lon": lon,
                                "loc_type": int(row.get('location_type', 0))
                            })
                        except Exception as e:
                            pass
                print(f"  Imported stops")
            
            # Import trips (batched)
            if 'trips.txt' in files:
                batch = []
                with z.open('trips.txt') as f:
                    reader = csv.DictReader(f.read().decode('utf-8').splitlines())
                    for i, row in enumerate(reader):
                        batch.append(row)
                        if len(batch) >= 10000:
                            _insert_trips_batch(conn, batch, mode_filter)
                            batch = []
                            print(f"    Imported {i+1} trips...")
                if batch:
                    _insert_trips_batch(conn, batch, mode_filter)
                print(f"  Imported all trips")
            
            # Import stop_times (batched)
            if 'stop_times.txt' in files:
                batch = []
                with z.open('stop_times.txt') as f:
                    reader = csv.DictReader(f.read().decode('utf-8').splitlines())
                    for i, row in enumerate(reader):
                        batch.append(row)
                        if len(batch) >= 50000:
                            _insert_stop_times_batch(conn, batch)
                            batch = []
                            print(f"    Imported {i+1} stop times...")
                if batch:
                    _insert_stop_times_batch(conn, batch)
                print(f"  Imported all stop times")
            
            # Import calendar
            if 'calendar.txt' in files:
                with z.open('calendar.txt') as f:
                    reader = csv.DictReader(f.read().decode('utf-8').splitlines())
                    for row in reader:
                        try:
                            conn.execute(sqlalchemy.text("""
                                INSERT INTO gtfs_calendar (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
                                VALUES (:id, :mon, :tue, :wed, :thu, :fri, :sat, :sun)
                                ON CONFLICT (service_id) DO NOTHING
                            """), {
                                "id": row['service_id'],
                                "mon": int(row.get('monday', 0)),
                                "tue": int(row.get('tuesday', 0)),
                                "wed": int(row.get('wednesday', 0)),
                                "thu": int(row.get('thursday', 0)),
                                "fri": int(row.get('friday', 0)),
                                "sat": int(row.get('saturday', 0)),
                                "sun": int(row.get('sunday', 0))
                            })
                        except Exception as e:
                            pass
                print(f"  Imported calendar")
            
            conn.commit()

def _insert_trips_batch(conn, batch, mode_filter=None):
    for row in batch:
        try:
            conn.execute(sqlalchemy.text("""
                INSERT INTO gtfs_trips (trip_id, route_id, service_id, trip_headsign)
                VALUES (:trip, :route, :service, :headsign)
                ON CONFLICT (trip_id) DO NOTHING
            """), {
                "trip": row['trip_id'],
                "route": row['route_id'],
                "service": row['service_id'],
                "headsign": row.get('trip_headsign', '')
            })
        except:
            pass

def _insert_stop_times_batch(conn, batch):
    for row in batch:
        try:
            conn.execute(sqlalchemy.text("""
                INSERT INTO gtfs_stop_times (trip_id, stop_id, stop_sequence, arrival_time, departure_time)
                VALUES (:trip, :stop, :seq, :arr, :dep)
            """), {
                "trip": row['trip_id'],
                "stop": row['stop_id'],
                "seq": int(row.get('stop_sequence', 0)),
                "arr": row.get('arrival_time', ''),
                "dep": row.get('departure_time', '')
            })
        except:
            pass

def main():
    engine = get_engine()
    create_gtfs_tables(engine)
    
    # Import VIC data (nested zips)
    vic_dir = GTFS_DIR / "vic_extracted"
    if vic_dir.exists():
        for mode_dir in sorted(vic_dir.iterdir()):
            zip_path = mode_dir / "google_transit.zip"
            if zip_path.exists():
                mode_name = mode_dir.name
                mode_filter = None
                if mode_name == "1":
                    mode_filter = ['2']  # train
                elif mode_name == "2":
                    mode_filter = ['0']  # tram
                elif mode_name in ["3", "4", "5", "6", "10"]:
                    mode_filter = ['3']  # bus
                
                import_gtfs_zip(zip_path, engine, "VIC", mode_filter=None)  # import all
    
    # Import QLD data
    qld_zip = GTFS_DIR / "qld.zip"
    if qld_zip.exists():
        import_gtfs_zip(qld_zip, engine, "QLD")
    
    print("\nImport complete!")

if __name__ == "__main__":
    main()
