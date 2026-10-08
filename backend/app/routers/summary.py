"""
Executive Summary Router
Exposes authoritative 2023 national-level summary metrics.
"""

from fastapi import APIRouter
from backend.app.schemas.summary import ExecutiveSummaryResponse
from backend.app.services.data_loader import data_loader

router = APIRouter(prefix="", tags=["Executive Summary"])


@router.get(
    "/summary",
    response_model=ExecutiveSummaryResponse,
    summary="Get National Executive Summary",
    description="Returns authoritative national 2023 cybercrime metrics reconciling exactly to 86,420 total cases, legal act group subtotals, motive concentrations, and top-state rankings."
)
async def get_summary():
    return data_loader.get_executive_summary()
