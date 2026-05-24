from sqlalchemy import Column, String, JSON, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.utils.database import Base


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    author_id = Column(UUID(as_uuid=True), nullable=False)

    query = Column(String, nullable=False)
    title = Column(String, nullable=False)

    report_data = Column(JSON, nullable=False)
    tags = Column(JSON, default=list)
    tickers = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    added_by = Column(UUID(as_uuid=True), nullable=False)

    ticker = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    added_at = Column(DateTime, default=datetime.utcnow)