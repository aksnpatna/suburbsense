import os
import logging
from datetime import datetime, timezone
from tavily import TavilyClient
from sqlalchemy import text, create_engine
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()
REALSTATE_DB_URL = os.getenv("REALSTATE_DB_URL", "postgresql://realestate_user:realestate_pass@localhost:15432/realestate")

TOPICS = {
    "interest_rates": {
        "title": "RBA & Interest Rates",
        "query": "Australia RBA interest rate decision cash rate 2026 property market impact"
    },
    "supply_demand": {
        "title": "Housing Supply & Demand",
        "query": "Australia housing supply demand vacancy rates building approvals 2026"
    },
    "infrastructure": {
        "title": "Major Infrastructure",
        "query": "Australia major infrastructure projects transport rail road 2026 property"
    },
    "clearance_rates": {
        "title": "Auction Clearance Rates",
        "query": "Australia auction clearance rates Sydney Melbourne housing market 2026"
    },
    "government_policies": {
        "title": "Govt Grants & Policies",
        "query": "Australia first home buyer grant housing policy FHBG 2026"
    }
}

POSITIVE_KEYWORDS = ["rise", "growth", "gain", "boost", "surge", "strong", "up", "increase", "recovery", "optimistic", "bullish", "high demand", "shortage", "record", "positive"]
NEGATIVE_KEYWORDS = ["fall", "decline", "drop", "slump", "weak", "down", "decrease", "risk", "concern", "bearish", "oversupply", "crash", "negative", "recession", "inflation"]


def analyze_sentiment(summary: str) -> tuple[str, float]:
    text_lower = summary.lower()
    pos_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_lower)
    neg_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text_lower)

    total = pos_count + neg_count
    if total == 0:
        return "Neutral", 5.0

    score = (pos_count / total) * 10
    score = max(1.0, min(10.0, score))

    if pos_count > neg_count:
        label = "Positive"
    elif neg_count > pos_count:
        label = "Negative"
    else:
        label = "Neutral"

    return label, round(score, 1)


def fetch_topic_news(client: TavilyClient, topic_key: str, topic_config: dict) -> dict | None:
    try:
        response = client.search(
            query=topic_config["query"],
            max_results=5,
            include_answer=True,
            search_depth="basic"
        )

        articles = response.get("results", [])
        answer = response.get("answer", "")

        if not articles and not answer:
            logger.warning(f"No results for topic: {topic_key}")
            return None

        combined_text = answer + " " + " ".join([a.get("content", "") for a in articles[:3]])
        combined_text = combined_text.strip()

        if not combined_text:
            return None

        if len(combined_text) > 500:
            summary = combined_text[:500] + "..."
        else:
            summary = combined_text

        label, score = analyze_sentiment(combined_text)

        return {
            "topic": topic_key,
            "sentiment_label": label,
            "sentiment_score": score,
            "summary": summary,
            "articles_analyzed": len(articles),
            "last_updated": datetime.now(timezone.utc)
        }
    except Exception as e:
        logger.error(f"Error fetching news for {topic_key}: {e}")
        return None


def ensure_table_exists(engine):
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS global_market_news (
                topic TEXT PRIMARY KEY,
                sentiment_label TEXT,
                sentiment_score NUMERIC(3,1),
                summary TEXT,
                articles_analyzed INTEGER,
                last_updated TIMESTAMPTZ
            )
        """))
        conn.commit()


def store_results(engine, results: list[dict]):
    with engine.connect() as conn:
        for r in results:
            conn.execute(text("""
                INSERT INTO global_market_news (topic, sentiment_label, sentiment_score, summary, articles_analyzed, last_updated)
                VALUES (:topic, :sentiment_label, :sentiment_score, :summary, :articles_analyzed, :last_updated)
                ON CONFLICT (topic) DO UPDATE SET
                    sentiment_label = EXCLUDED.sentiment_label,
                    sentiment_score = EXCLUDED.sentiment_score,
                    summary = EXCLUDED.summary,
                    articles_analyzed = EXCLUDED.articles_analyzed,
                    last_updated = EXCLUDED.last_updated
            """), r)
        conn.commit()


def main():
    if not TAVILY_API_KEY:
        logger.error("TAVILY_API_KEY not set in .env")
        return

    engine = create_engine(REALSTATE_DB_URL, pool_pre_ping=True)
    ensure_table_exists(engine)

    client = TavilyClient(api_key=TAVILY_API_KEY)
    results = []

    for topic_key, topic_config in TOPICS.items():
        logger.info(f"Fetching news for: {topic_config['title']}")
        result = fetch_topic_news(client, topic_key, topic_config)
        if result:
            results.append(result)
            logger.info(f"  -> {result['sentiment_label']} ({result['sentiment_score']}/10) from {result['articles_analyzed']} sources")

    if results:
        store_results(engine, results)
        logger.info(f"Stored {len(results)} topic updates")
    else:
        logger.warning("No results fetched")


if __name__ == "__main__":
    main()
