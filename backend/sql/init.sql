-- utility_hub own-data schema (database: utility_hub, same Postgres instance as realestate)
-- Crowdsourced grocery price observations (opt-in contributions only)
CREATE TABLE IF NOT EXISTS price_observations (
    id BIGSERIAL PRIMARY KEY,
    normalized_item TEXT NOT NULL,
    raw_item TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    store_name TEXT NOT NULL,
    store_suburb TEXT,
    observed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    session_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_price_obs_lookup ON price_observations (store_suburb, normalized_item);
CREATE INDEX IF NOT EXISTS idx_price_obs_store ON price_observations (store_name, normalized_item);
CREATE INDEX IF NOT EXISTS idx_price_obs_date ON price_observations (observed_date);

-- Email leads captured from comparison CTAs (until CIMET partner links are live)
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    vertical TEXT NOT NULL CHECK (vertical IN ('energy', 'internet', 'health')),
    suburb_slug TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);

-- Anonymous scan counters (engagement analytics - no images or personal data stored)
CREATE TABLE IF NOT EXISTS scan_events (
    id BIGSERIAL PRIMARY KEY,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('energy', 'grocery')),
    outcome TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scan_events_created ON scan_events (created_at);

-- Cached energy rates from weekly internal scraper
CREATE TABLE IF NOT EXISTS cached_energy_rates (
    id BIGSERIAL PRIMARY KEY,
    provider_name TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    state TEXT NOT NULL,
    daily_supply_charge_cents NUMERIC(10, 2) NOT NULL,
    usage_rate_cents NUMERIC(10, 2) NOT NULL,
    estimated_annual_cost NUMERIC(10, 2),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_name, plan_name, state)
);
CREATE INDEX IF NOT EXISTS idx_cached_rates_state ON cached_energy_rates (state);

-- Cached internet rates
CREATE TABLE IF NOT EXISTS cached_internet_rates (
    id BIGSERIAL PRIMARY KEY,
    provider_name TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    speed_tier TEXT NOT NULL, -- e.g., 'nbn50', 'nbn100'
    monthly_cost_cents NUMERIC(10, 2) NOT NULL,
    data_limit_gb INT, -- NULL for unlimited
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_name, plan_name)
);

-- Analytics page views
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    path TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    referer TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_pv_ip ON page_views (ip_address);

-- Anonymous Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    rating INTEGER,
    message TEXT,
    path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at);
