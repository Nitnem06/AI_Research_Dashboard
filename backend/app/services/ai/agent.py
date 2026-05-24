"""
Research Agent — the intelligence engine.

Uses Claude's tool_use API in an agentic loop:
  1. Claude analyzes the query and decides WHICH tools are needed
  2. Tools execute (in parallel where possible) and return structured data
  3. Claude synthesizes all tool outputs into a structured JSON research report

The agent is intentionally non-deterministic in tool selection — 
a news-only query should NOT trigger the stock API.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Any

import anthropic

from app.core.config import settings
from app.services.ai.tools.market_data import get_market_data
from app.services.ai.tools.news_tool import search_financial_news
from app.services.ai.vector_store.retriever import search_knowledge_base

logger = logging.getLogger(__name__)

# ── Tool definitions for Claude ───────────────────────────────────────────────

TOOLS: list[dict] = [
    {
        "name": "get_market_data",
        "description": (
            "Fetch real-time stock price, financial metrics (P/E, EPS, revenue, margins, market cap), "
            "and historical price data for a stock ticker. Use when the query involves stock performance, "
            "valuations, earnings comparisons, or financial metrics. "
            "Example triggers: 'stock performance', 'P/E ratio', 'revenue', 'earnings'."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "Stock ticker symbol (e.g. NVDA, AAPL, TSLA, AMD)",
                },
                "period": {
                    "type": "string",
                    "enum": ["1mo", "3mo", "6mo", "1y"],
                    "description": "Historical price period. Default: 1mo",
                },
            },
            "required": ["ticker"],
        },
    },
    {
        "name": "search_financial_news",
        "description": (
            "Retrieve recent financial news articles for a company with sentiment classification. "
            "Use when the query mentions news, sentiment, recent events, analyst opinions, or market reactions. "
            "Returns up to 6 articles classified as positive/negative/neutral with an overall sentiment summary."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "company": {
                    "type": "string",
                    "description": "Company name or ticker symbol (e.g. 'NVIDIA' or 'NVDA')",
                },
                "days": {
                    "type": "integer",
                    "description": "Number of past days to search (7, 14, 30, or 90). Default: 30",
                },
            },
            "required": ["company"],
        },
    },
    {
        "name": "search_knowledge_base",
        "description": (
            "Semantic search over the internal knowledge base containing SEC filings, earnings call transcripts, "
            "and analyst research reports for NVIDIA, Apple, Tesla, AMD, and Microsoft. "
            "Use when the query asks about earnings details, revenue breakdown, guidance, risk factors, "
            "competitive positioning, or any company-specific fundamentals not available from market data APIs."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Semantic search query (e.g. 'NVIDIA data center revenue growth')",
                },
                "company": {
                    "type": "string",
                    "description": "Optional: company name or ticker to filter results",
                },
            },
            "required": ["query"],
        },
    },
]

TOOL_MAP = {
    "get_market_data": get_market_data,
    "search_financial_news": search_financial_news,
    "search_knowledge_base": search_knowledge_base,
}

# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert AI financial research analyst. Your task is to analyze investment research queries and produce comprehensive, source-attributed research reports.

WORKFLOW:
1. Analyze the query to identify companies, tickers, and what data is needed
2. Call the appropriate tools — only call tools relevant to the query:
   - get_market_data → for stock prices, financial metrics, historical charts
   - search_financial_news → for news, sentiment, recent events
   - search_knowledge_base → for earnings transcripts, SEC filings, fundamentals
3. You may call multiple tools and multiple companies. You may call a tool multiple times for different tickers.
4. After gathering all data, synthesize it into a final structured JSON response.

OUTPUT FORMAT — respond ONLY with valid JSON matching this exact schema (no markdown, no extra text):
{
  "title": "Descriptive research report title",
  "executive_summary": "2-3 sentence overview of key findings",
  "companies": [
    {
      "ticker": "NVDA",
      "company_name": "NVIDIA Corporation",
      "market_data": { ... from get_market_data, or null if not fetched },
      "news": { ... from search_financial_news, or null if not fetched },
      "filings": { ... from search_knowledge_base, or null if not fetched }
    }
  ],
  "analysis": {
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "risk_factors": ["risk 1", "risk 2"],
    "opportunities": ["opportunity 1"],
    "competitive_landscape": "Paragraph on competitive dynamics if applicable",
    "overall_sentiment": "positive | negative | neutral | mixed"
  },
  "tools_used": ["list of tool names called"],
  "sources": ["Yahoo Finance", "NewsAPI", "Internal Knowledge Base"],
  "generated_at": "ISO timestamp"
}

IMPORTANT RULES:
- Never fabricate data — only include data returned by tools
- Attribute every insight to a specific data source
- If a tool returns an error, note it but continue with available data
- Extract tickers intelligently: "NVIDIA" → "NVDA", "Apple" → "AAPL", "Tesla" → "TSLA", "AMD" → "AMD", "Microsoft" → "MSFT"
- For comparison queries, call tools for EACH company mentioned
- Be selective: a news-only query should NOT trigger get_market_data unnecessarily"""


# ── Agentic loop ──────────────────────────────────────────────────────────────

async def run_research_agent(query: str) -> dict[str, Any]:
    """
    Runs the full agentic research loop.
    Returns a structured research report dict.
    """
    if not settings.ANTHROPIC_API_KEY:
        return _error_response(query, "ANTHROPIC_API_KEY not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    messages = [{"role": "user", "content": query}]

    try:
        max_iterations = 6  # safety limit on tool-call rounds
        iteration = 0

        while iteration < max_iterations:
            iteration += 1
            logger.info(f"Agent iteration {iteration} — sending to Claude")

            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )

            logger.info(f"Claude stop_reason: {response.stop_reason}")

            # ── Final answer ──────────────────────────────────────────────────
            if response.stop_reason == "end_turn":
                for block in response.content:
                    if hasattr(block, "text") and block.text.strip():
                        try:
                            result = json.loads(block.text)
                            result["generated_at"] = datetime.utcnow().isoformat()
                            return result
                        except json.JSONDecodeError:
                            logger.error("Claude returned non-JSON final response")
                            return _error_response(query, "Agent returned malformed JSON")
                return _error_response(query, "No text in agent response")

            # ── Tool use ──────────────────────────────────────────────────────
            if response.stop_reason == "tool_use":
                tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

                # Execute tools — parallelize independent calls
                tool_results = await _execute_tools_parallel(tool_use_blocks)

                # Add assistant message (with tool_use blocks) and tool results
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
                continue

            # Unexpected stop reason
            break

        return _error_response(query, "Agent exceeded maximum iterations")

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        return _error_response(query, f"AI service error: {str(e)}")
    except Exception as e:
        logger.exception(f"Research agent crashed: {e}")
        return _error_response(query, f"Unexpected error: {str(e)}")


async def _execute_tools_parallel(tool_use_blocks: list) -> list[dict]:
    """Execute all tool calls concurrently and return tool_result messages."""

    async def call_tool(block) -> dict:
        tool_name = block.name
        tool_input = block.input
        logger.info(f"Calling tool: {tool_name}({tool_input})")

        try:
            tool_fn = TOOL_MAP.get(tool_name)
            if tool_fn is None:
                result = {"error": f"Unknown tool: {tool_name}"}
            else:
                result = await tool_fn(**tool_input)
        except Exception as e:
            logger.error(f"Tool {tool_name} failed: {e}")
            result = {"error": str(e), "tool": tool_name}

        return {
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": json.dumps(result),
        }

    results = await asyncio.gather(*[call_tool(block) for block in tool_use_blocks])
    return list(results)


def _error_response(query: str, error: str) -> dict:
    return {
        "title": "Research Report — Error",
        "executive_summary": f"Could not complete research: {error}",
        "companies": [],
        "analysis": {
            "key_insights": [],
            "risk_factors": [],
            "opportunities": [],
            "competitive_landscape": "",
            "overall_sentiment": "neutral",
        },
        "tools_used": [],
        "sources": [],
        "error": error,
        "generated_at": datetime.utcnow().isoformat(),
        "query": query,
    }