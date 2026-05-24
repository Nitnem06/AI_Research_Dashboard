from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, delete

from app.utils.database import get_db
from app.models.user import User
from app.models.research import ResearchReport, WatchlistItem
from app.schemas import ResearchQuery, ReportOut, ReportSummary, ReportUpdate, WatchlistAdd, WatchlistOut
from app.utils.security import get_current_user
from app.services.orchestration import OrchestrationService
from app.services.ai.vector_store.retriever import search_knowledge_base

router = APIRouter(prefix="/api/research", tags=["research"])


# ── Research reports ──────────────────────────────────────────────────────────

@router.post("/query", response_model=ReportOut, status_code=201)
async def run_research(
    payload: ResearchQuery,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run AI research agent and persist the report. Tenant-scoped to current org."""
    if not payload.query.strip():
        raise HTTPException(status_code=422, detail="Query cannot be empty")
    if len(payload.query) > 2000:
        raise HTTPException(status_code=422, detail="Query too long (max 2000 chars)")

    # Initialize the orchestration service
        # Initialize orchestration service
    orchestration_service = OrchestrationService()

    try:
        results = await orchestration_service.run_research(payload.query)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Research orchestration failed"
        )

    report_data = results["report_data"]
    market_data = results["market_data"]
    news_data = results["news_data"]
    summary = results["summary"]

    # Extract tickers
    tickers = ",".join(
        c.get("ticker", "")
        for c in report_data.get("companies", [])
        if c.get("ticker")
    )

    # Generate title
    title = report_data.get("title") or f"Research: {payload.query[:80]}"

    # Attach orchestration outputs
    report_data["market_data"] = market_data
    report_data["news_data"] = news_data
    report_data["summary"] = summary

    # Save report
    report = ResearchReport(
        org_id=current_user.org_id,
        author_id=current_user.id,
        query=payload.query,
        title=title,
        report_data=report_data,
        tags=[],
        tickers=tickers,
    )

    db.add(report)

    await db.commit()
    await db.refresh(report)

    return report


@router.get("/reports", response_model=list[ReportSummary])
async def list_reports(
    search: str | None = Query(None),
    tag: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all research reports for current org (tenant-scoped)."""
    stmt = (
        select(ResearchReport)
        .where(ResearchReport.org_id == current_user.org_id)  # ← tenant isolation
        .order_by(ResearchReport.created_at.desc())
        .limit(50)
    )
    if search:
        stmt = stmt.where(
            or_(
                ResearchReport.title.ilike(f"%{search}%"),
                ResearchReport.query.ilike(f"%{search}%"),
                ResearchReport.tickers.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(stmt)
    reports = result.scalars().all()

    if tag:
        reports = [r for r in reports if tag.lower() in [t.lower() for t in (r.tags or [])]]

    return reports


@router.get("/reports/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific report. Enforces tenant isolation."""
    result = await db.execute(
        select(ResearchReport).where(
            and_(
                ResearchReport.id == report_id,
                ResearchReport.org_id == current_user.org_id,  # ← org isolation
            )
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.patch("/reports/{report_id}", response_model=ReportOut)
async def update_report(
    report_id: UUID,
    payload: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update report title or tags."""
    result = await db.execute(
        select(ResearchReport).where(
            and_(
                ResearchReport.id == report_id,
                ResearchReport.org_id == current_user.org_id,
            )
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if payload.title is not None:
        report.title = payload.title
    if payload.tags is not None:
        report.tags = payload.tags

    await db.commit()
    await db.refresh(report)
    return report


@router.delete("/reports/{report_id}", status_code=204)
async def delete_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a report. Tenant-scoped."""
    result = await db.execute(
        select(ResearchReport).where(
            and_(
                ResearchReport.id == report_id,
                ResearchReport.org_id == current_user.org_id,
            )
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    await db.delete(report)
    await db.commit()


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard stats for current org."""
    count_result = await db.execute(
        select(func.count(ResearchReport.id)).where(ResearchReport.org_id == current_user.org_id)
    )
    report_count = count_result.scalar()

    watchlist_result = await db.execute(
        select(func.count(WatchlistItem.id)).where(WatchlistItem.org_id == current_user.org_id)
    )
    watchlist_count = watchlist_result.scalar()

    return {
        "total_reports": report_count,
        "watchlist_companies": watchlist_count,
    }


# ── Watchlist ─────────────────────────────────────────────────────────────────

@router.get("/watchlist", response_model=list[WatchlistOut])
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WatchlistItem)
        .where(WatchlistItem.org_id == current_user.org_id)
        .order_by(WatchlistItem.added_at.desc())
    )
    return result.scalars().all()


@router.post("/watchlist", response_model=WatchlistOut, status_code=201)
async def add_to_watchlist(
    payload: WatchlistAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Prevent duplicates within the same org
    existing = await db.execute(
        select(WatchlistItem).where(
            and_(
                WatchlistItem.org_id == current_user.org_id,
                WatchlistItem.ticker == payload.ticker.upper(),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already in watchlist")

    item = WatchlistItem(
        org_id=current_user.org_id,
        added_by=current_user.id,
        ticker=payload.ticker.upper(),
        company_name=payload.company_name,
        notes=payload.notes,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/watchlist/{item_id}", status_code=204)
async def remove_from_watchlist(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WatchlistItem).where(
            and_(
                WatchlistItem.id == item_id,
                WatchlistItem.org_id == current_user.org_id,
            )
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    await db.delete(item)
    await db.commit()

router = APIRouter()

@router.post("/search")
async def search(query: str, company: str | None = None):
    return await search_knowledge_base(query, company)