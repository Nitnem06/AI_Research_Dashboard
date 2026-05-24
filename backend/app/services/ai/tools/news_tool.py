"""
News Tool — fetches recent financial news via NewsAPI.
Falls back to a curated mock dataset if API key is absent or rate-limited.
Includes rule-based sentiment classification (positive/negative/neutral).
Source: NewsAPI.org (free tier — 100 req/day)
"""
import httpx
import logging
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Sentiment keywords ────────────────────────────────────────────────────────

POSITIVE_WORDS = {
    "surge", "soar", "beat", "record", "growth", "profit", "rally", "gain",
    "outperform", "upgrade", "bullish", "strong", "exceed", "breakthrough",
    "expand", "partnership", "launch", "approve", "win", "revenue", "boom",
}
NEGATIVE_WORDS = {
    "fall", "drop", "miss", "loss", "decline", "downgrade", "bearish", "weak",
    "concern", "risk", "lawsuit", "investigation", "layoff", "cut", "recall",
    "warning", "crash", "slump", "tumble", "disappointing", "below",
}


def classify_sentiment(text: str) -> str:
    words = set(text.lower().split())
    pos = len(words & POSITIVE_WORDS)
    neg = len(words & NEGATIVE_WORDS)
    if pos > neg:
        return "positive"
    elif neg > pos:
        return "negative"
    return "neutral"


# ── Mock fallback data ────────────────────────────────────────────────────────

MOCK_NEWS = {
    "NVDA": [
        {
            "title": "NVIDIA Reports Record Data Center Revenue in Q3",
            "summary": "NVIDIA's data center segment hit a new all-time high driven by surging demand for AI training chips, with H100 GPU supply still constrained.",
            "url": "https://example.com/nvda-q3",
            "published_at": (datetime.utcnow() - timedelta(days=5)).isoformat(),
            "source": "Financial Times (mock)",
            "sentiment": "positive",
        },
        {
            "title": "NVIDIA Faces Export Control Headwinds in China Market",
            "summary": "New US export restrictions on high-end AI chips could impact NVIDIA's ability to serve its Chinese customer base, which accounts for roughly 20% of revenue.",
            "url": "https://example.com/nvda-china",
            "published_at": (datetime.utcnow() - timedelta(days=12)).isoformat(),
            "source": "Reuters (mock)",
            "sentiment": "negative",
        },
        {
            "title": "Goldman Sachs Raises NVIDIA Price Target to $1,200",
            "summary": "Goldman analysts cite accelerating enterprise AI adoption and NVIDIA's dominant position in inference workloads as key growth drivers for 2025.",
            "url": "https://example.com/nvda-gs",
            "published_at": (datetime.utcnow() - timedelta(days=20)).isoformat(),
            "source": "Bloomberg (mock)",
            "sentiment": "positive",
        },
    ],
    "AAPL": [
        {
            "title": "Apple Intelligence Features Drive iPhone 16 Upgrade Cycle",
            "summary": "Analysts expect Apple's on-device AI suite to drive the strongest iPhone upgrade cycle since the 5G supercycle, boosting ASPs by 8%.",
            "url": "https://example.com/aapl-ai",
            "published_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
            "source": "CNBC (mock)",
            "sentiment": "positive",
        },
        {
            "title": "Apple Faces EU Antitrust Fine Over App Store Policies",
            "summary": "European regulators are preparing a €500M fine against Apple related to App Store payment restrictions, adding regulatory pressure to the company.",
            "url": "https://example.com/aapl-eu",
            "published_at": (datetime.utcnow() - timedelta(days=18)).isoformat(),
            "source": "Wall Street Journal (mock)",
            "sentiment": "negative",
        },
    ],
    "TSLA": [
        {
            "title": "Tesla Delivers 514K Vehicles in Q4, Beats Estimates",
            "summary": "Tesla's delivery numbers exceeded Wall Street consensus by 3%, aided by aggressive price cuts and strong demand in European markets.",
            "url": "https://example.com/tsla-delivery",
            "published_at": (datetime.utcnow() - timedelta(days=7)).isoformat(),
            "source": "Reuters (mock)",
            "sentiment": "positive",
        },
        {
            "title": "Tesla Autopilot Under DOJ Criminal Investigation",
            "summary": "US Department of Justice has reportedly opened a criminal investigation into Tesla's Autopilot and Full Self-Driving marketing claims following fatal accidents.",
            "url": "https://example.com/tsla-doj",
            "published_at": (datetime.utcnow() - timedelta(days=25)).isoformat(),
            "source": "Bloomberg (mock)",
            "sentiment": "negative",
        },
    ],
    "AMD": [
        {
            "title": "AMD MI300X Gaining Enterprise Traction as NVIDIA Alternative",
            "summary": "Several large cloud providers have expanded MI300X deployments, with AMD claiming the chip offers up to 40% better price-performance for inference workloads.",
            "url": "https://example.com/amd-mi300",
            "published_at": (datetime.utcnow() - timedelta(days=9)).isoformat(),
            "source": "The Verge (mock)",
            "sentiment": "positive",
        },
    ],
    "MSFT": [
        {
            "title": "Microsoft Azure AI Revenue Grows 33% YoY",
            "summary": "Microsoft's AI-driven cloud services continue to expand rapidly, with Copilot integration across Office 365 adding meaningful incremental revenue.",
            "url": "https://example.com/msft-azure",
            "published_at": (datetime.utcnow() - timedelta(days=4)).isoformat(),
            "source": "Financial Times (mock)",
            "sentiment": "positive",
        },
    ],
}

DEFAULT_NEWS = [
    {
        "title": "Markets Rally as Fed Signals Rate Pause",
        "summary": "Equity markets advanced broadly on signals that the Federal Reserve may hold rates steady, benefiting growth stocks in the tech sector.",
        "url": "https://example.com/fed-pause",
        "published_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        "source": "Bloomberg (mock)",
        "sentiment": "positive",
    }
]


async def search_financial_news(company: str, days: int = 30) -> dict:
    """
    Fetch news articles for a company. Attempts NewsAPI first; falls back to mock.
    Returns articles with sentiment classification.
    """
    articles = []

    if settings.NEWS_API_KEY:
        try:
            from_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://newsapi.org/v2/everything",
                    params={
                        "q": f"{company} stock finance earnings",
                        "from": from_date,
                        "sortBy": "relevancy",
                        "language": "en",
                        "pageSize": 5,
                        "apiKey": settings.NEWS_API_KEY,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for a in data.get("articles", []):
                        text = f"{a.get('title', '')} {a.get('description', '')}"
                        articles.append({
                            "title": a.get("title"),
                            "summary": a.get("description"),
                            "url": a.get("url"),
                            "published_at": a.get("publishedAt"),
                            "source": a.get("source", {}).get("name", "NewsAPI"),
                            "sentiment": classify_sentiment(text),
                        })
        except Exception as e:
            logger.warning(f"NewsAPI failed for {company}: {e}. Using mock.")

    if not articles:
        # Fall back to curated mock data
        ticker_upper = company.upper().strip()
        articles = MOCK_NEWS.get(ticker_upper, DEFAULT_NEWS)

    # Sentiment summary
    sentiments = [a["sentiment"] for a in articles]
    pos = sentiments.count("positive")
    neg = sentiments.count("negative")
    overall = "positive" if pos > neg else ("negative" if neg > pos else "neutral")

    return {
        "company": company,
        "articles": articles[:6],  # max 6 articles
        "sentiment_summary": {
            "overall": overall,
            "positive_count": pos,
            "negative_count": neg,
            "neutral_count": sentiments.count("neutral"),
        },
        "source": "NewsAPI / Mock",
        "days_searched": days,
    }