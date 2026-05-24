import asyncio
from typing import Any, Dict, List

from app.services.ai.agent import run_research_agent
from app.services.ai.tools.market_data import get_market_data
from app.services.ai.tools.news_tool import search_financial_news

class OrchestrationService:
    async def run_research(self, query: str) -> Dict[str, Any]:
        try:
            # Run the agentic research
            report_data = await run_research_agent(query)

            # Extract tickers for quick filtering
            tickers = [c.get("ticker", "") for c in report_data.get("companies", ) if c.get("ticker")]

            # Fetch market data for each ticker
            market_data_tasks = [get_market_data(ticker) for ticker in tickers]
            market_data = await asyncio.gather(*market_data_tasks)

            # Fetch news data for each ticker
            news_data_tasks = [search_financial_news(ticker) for ticker in tickers]
            news_data = await asyncio.gather(*news_data_tasks)

            # Synthesize structured results
            results = {
                "report_data": report_data,
                "market_data": market_data,
                "news_data": news_data,
            }

            return results

        except Exception as e:
            return {"error": str(e)}
