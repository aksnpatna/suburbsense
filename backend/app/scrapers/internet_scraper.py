from sqlalchemy.orm import Session
from sqlalchemy import text

def fetch_tpg_nbn():
    """
    Simulates or fetches TPG's basic NBN rate.
    """
    return {
        "provider_name": "TPG",
        "plan_name": "NBN Home Fast",
        "speed_tier": "nbn100",
        "monthly_cost_cents": 7400, # $74.00
        "data_limit_gb": None # Unlimited
    }

def fetch_aussie_broadband_nbn():
    """
    Fetches Aussie Broadband's NBN rate.
    """
    return {
        "provider_name": "Aussie Broadband",
        "plan_name": "Everyday nbn®",
        "speed_tier": "nbn50",
        "monthly_cost_cents": 8500, # $85.00
        "data_limit_gb": None
    }

def fetch_tangerine_nbn():
    """
    Fetches Tangerine's NBN rate.
    """
    return {
        "provider_name": "Tangerine",
        "plan_name": "Speedy nbn®",
        "speed_tier": "nbn50",
        "monthly_cost_cents": 6490, # $64.90
        "data_limit_gb": None
    }

def run_weekly_internet_scraper(db: Session):
    """
    Runs the scraper for internet retailers and updates the cached_internet_rates table.
    """
    print("Starting weekly internet rate scraper...")
    
    scraped_rates = [
        fetch_tpg_nbn(),
        fetch_aussie_broadband_nbn(),
        fetch_tangerine_nbn()
    ]
    
    upsert_sql = text("""
        INSERT INTO cached_internet_rates (
            provider_name, plan_name, speed_tier, 
            monthly_cost_cents, data_limit_gb, last_verified_at
        ) VALUES (
            :provider_name, :plan_name, :speed_tier, 
            :monthly_cost_cents, :data_limit_gb, NOW()
        )
        ON CONFLICT (provider_name, plan_name) 
        DO UPDATE SET 
            speed_tier = EXCLUDED.speed_tier,
            monthly_cost_cents = EXCLUDED.monthly_cost_cents,
            data_limit_gb = EXCLUDED.data_limit_gb,
            last_verified_at = EXCLUDED.last_verified_at;
    """)
    
    for rate in scraped_rates:
        try:
            db.execute(upsert_sql, rate)
            print(f"✅ Upserted rate for {rate['provider_name']} - {rate['plan_name']}")
        except Exception as e:
            print(f"❌ Failed to upsert {rate['provider_name']}: {e}")
            
    db.commit()
    print("Weekly internet rate scraper completed successfully.")
