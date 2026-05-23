from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from uuid import UUID
from typing import Any
from app.models.user import UserRole


# ── Auth ──────────────────────────────────────────────────────────────────────

class OrgCreate(BaseModel):
    org_name: str
    invite_code: str | None = None  # if None, creates new org; if provided, joins existing


class UserSignup(BaseModel):
    email: EmailStr
    name: str
    password: str
    org_name: str | None = None       # required when creating new org
    invite_code: str | None = None    # required when joining existing org

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    email: str
    name: str
    role: UserRole
    org_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class OrgOut(BaseModel):
    id: UUID
    name: str
    invite_code: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Research ──────────────────────────────────────────────────────────────────

class ResearchQuery(BaseModel):
    query: str


class ReportUpdate(BaseModel):
    title: str | None = None
    tags: list[str] | None = None


class ReportOut(BaseModel):
    id: UUID
    query: str
    title: str
    report_data: dict[str, Any]
    tags: list[str]
    tickers: str
    created_at: datetime
    updated_at: datetime
    author_id: UUID

    model_config = {"from_attributes": True}


class ReportSummary(BaseModel):
    id: UUID
    title: str
    query: str
    tags: list[str]
    tickers: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Watchlist ─────────────────────────────────────────────────────────────────

class WatchlistAdd(BaseModel):
    ticker: str
    company_name: str
    notes: str | None = None


class WatchlistOut(BaseModel):
    id: UUID
    ticker: str
    company_name: str
    notes: str | None
    added_at: datetime

    model_config = {"from_attributes": True}from pydantic import BaseModel

class CompanyResearchRequest(BaseModel):
    ticker: str

class SummaryRequest(BaseModel):
    data: dict
