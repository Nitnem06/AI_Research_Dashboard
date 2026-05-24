import asyncio
import logging
from typing import Any, Dict

from app.services.ai.agent import run_research_agent
from app.services.ai.tools.market_data import get_market_data
from app.services.ai.tools.news_tool import search_financial_news

logger = logging.getLogger(__name__)


class OrchestrationService:
    async def run_research(self, query: str) -> Dict[str, Any]:
        try:
            # Run AI research agent
            report_data = await run_research_agent(query)

            # Extract tickers
            tickers = [
                c.get("ticker", "")
                for c in report_data.get("companies", [])
                if c.get("ticker")
            ]

            # Fetch market data concurrently
            market_data_tasks = [
                get_market_data(ticker)
                for ticker in tickers
            ]
            market_data = await asyncio.gather(*market_data_tasks)

            # Fetch news concurrently
            news_data_tasks = [
                search_financial_news(ticker)
                for ticker in tickers
            ]
            news_data = await asyncio.gather(*news_data_tasks)

            # AI orchestration synthesis
            summary = {
                "query": query,
                "companies_analyzed": len(tickers),
            }

            return {
                "report_data": report_data,
                "market_data": market_data,
                "news_data": news_data,
                "summary": summary,
            }

        except Exception:
            logger.exception("Research orchestration failed")
            raise