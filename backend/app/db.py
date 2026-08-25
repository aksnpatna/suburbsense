from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings

# Engines for the two DB connections:
# - realestate_db: READ ONLY, used for fetching suburbs_ui_v3 (allowlist) and planet_osm_* tables
# - utility_db: OWN DATA, used for price_observations, leads, scan_events
settings = get_settings()
realestate_engine = create_engine(settings.realestate_db_url, pool_pre_ping=True)
utility_engine = create_engine(settings.utility_db_url, pool_pre_ping=True)

RealSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=realestate_engine)
UtilitySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=utility_engine)

RealBase = declarative_base()
UtilityBase = declarative_base()


def get_realestate_db():
    db = RealSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_utility_db():
    db = UtilitySessionLocal()
    try:
        yield db
    finally:
        db.close()
