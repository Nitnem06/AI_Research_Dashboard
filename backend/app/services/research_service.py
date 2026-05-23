class ResearchService:
    async def get_company_research(self, ticker: str):
        # Mock financial data retrieval
        financial_data = self.mock_financial_data(ticker)
        news_data = self.mock_news_data(ticker)
        return {
            "financial_data": financial_data,
            "news_data": news_data,
        }

    async def summarize_research(self, data: dict):
        # Mock AI summarization
        return {
            "summary": f"Summary for {data.get('ticker')}: Mock summary data."
        }

    def mock_financial_data(self, ticker: str):
        return {
            "ticker": ticker,
            "price": 100.0,
            "market_cap": "1B",
            "pe_ratio": 20.0,
        }

    def mock_news_data(self, ticker: str):
        return [
            {"title": f"{ticker} news headline 1", "summary": "Summary of news 1."},
            {"title": f"{ticker} news headline 2", "summary": "Summary of news 2."},
        ]
