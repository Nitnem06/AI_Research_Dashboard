from fastapi import APIRouter, HTTPException
from app.schemas import CompanyResearchRequest, SummaryRequest
from app.services.research_service import ResearchService

router = APIRouter()
research_service = ResearchService()

@router.post("/company")
async def research_company(request: CompanyResearchRequest):
    try:
        return await research_service.get_company_research(request.ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize(request: SummaryRequest):
    try:
        return await research_service.summarize_research(request.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
