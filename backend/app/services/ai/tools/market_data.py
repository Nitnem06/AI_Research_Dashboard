"""
Market Data Tool — wraps yfinance to provide real-time stock prices,
key financial metrics, and historical price series.
Source: Yahoo Finance (free, no API key required)
"""
import yfinance as yf
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def get_market_data(ticker: str, period: str = "1mo") -> dict:
    """
    Fetch stock data for a ticker.
    Returns price, key metrics, and OHLC history.
    """
    try:
        stock = yf.Ticker(ticker.upper())
        info = stock.info

        # Historical OHLC
        hist = stock.history(period=period)
        history_points = []
        if not hist.empty:
            # Downsample to max 60 points for clean charting
            step = max(1, len(hist) // 60)
            sampled = hist.iloc[::step]
            history_points = [
                {
                    "date": idx.strftime("%Y-%m-%d"),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]),
                }
                for idx, row in sampled.iterrows()
            ]

        def safe_get(key, default=None):
            val = info.get(key, default)
            return val if val not in (None, "Infinity", float("inf")) else default

        return {
            "ticker": ticker.upper(),
            "company_name": safe_get("longName", ticker),
            "sector": safe_get("sector"),
            "industry": safe_get("industry"),
            "current_price": safe_get("currentPrice") or safe_get("regularMarketPrice"),
            "previous_close": safe_get("previousClose"),
            "day_change_pct": round(
                ((safe_get("currentPrice", 0) - safe_get("previousClose", 1)) / safe_get("previousClose", 1)) * 100, 2
            ) if safe_get("previousClose") else None,
            "market_cap": safe_get("marketCap"),
            "pe_ratio": safe_get("trailingPE"),
            "forward_pe": safe_get("forwardPE"),
            "eps": safe_get("trailingEps"),
            "revenue": safe_get("totalRevenue"),
            "gross_margins": safe_get("grossMargins"),
            "profit_margins": safe_get("profitMargins"),
            "52w_high": safe_get("fiftyTwoWeekHigh"),
            "52w_low": safe_get("fiftyTwoWeekLow"),
            "avg_volume": safe_get("averageVolume"),
            "beta": safe_get("beta"),
            "dividend_yield": safe_get("dividendYield"),
            "history": history_points,
            "history_period": period,
            "source": "Yahoo Finance",
            "fetched_at": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Market data fetch failed for {ticker}: {e}")
        return {
            "ticker": ticker.upper(),
            "error": f"Could not fetch market data: {str(e)}",
            "source": "Yahoo Finance",
        }