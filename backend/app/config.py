import os
from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))


class Settings(BaseSettings):
    # Local vision LLM (Ollama) — OpenAI-compatible endpoint
    local_llm_url: str = "http://localhost:11434/v1"
    local_llm_model: str = "llava"

    # realestate PostGIS DB — READ ONLY (suburbs_ui_v3 allowlist + planet_osm_*)
    realestate_db_url: str = "postgresql://realestate_user:realestate_pass@localhost:15432/realestate"

    # utility_hub own DB (price_observations, leads, scan_events)
    utility_db_url: str = "postgresql://realestate_user:realestate_pass@localhost:15432/utility_hub"

    # CIMET white-label base URL — empty until partner approval, CTAs then use email capture
    cimet_base_url: str = ""

    # Optional: public site origin used in prerendered page metadata
    site_origin: str = "https://example.com"
    site_name: str = "SuburbSense"

    # AER reference prices (set from AER published values at deploy time; keep None until verified)
    aer_reference_daily_charge_cents: float | None = None
    aer_reference_usage_charge_cents: float | None = None

    # Tavily API for news aggregation
    tavily_api_key: str = ""

    # Local Whisper for voice-to-text (feedback widget)
    whisper_url: str = "http://localhost:11434/v1/audio/transcriptions"
    whisper_model: str = "whisper-small"

    # Attribution constants for the site (required by data sources)
    attributions: list = [
        {"name": "OpenStreetMap contributors", "url": "https://www.openstreetmap.org/copyright"},
        {"name": "Australian Bureau of Statistics", "url": "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/allocation-files/SAL_2021_AUST.xlsx"},
        {"name": "ACARA", "url": "https://www.acara.edu.au"},
        {"name": "Geoscape (G-NAF)", "url": "https://www.ga.gov.au/data-and-publications/geocoded-address-file-g-naf"},
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
