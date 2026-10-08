"""
States & Union Territories Router
Exposes validated 2023 State/UT cross-sectional metrics.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.states import StatesListResponse, StateItem
from backend.app.services.data_loader import data_loader

router = APIRouter(prefix="", tags=["Geographic Explorer"])


@router.get(
    "/states",
    response_model=StatesListResponse,
    summary="List State & UT Summaries",
    description="Returns cross-sectional metrics for all 36 Indian States and Union Territories from NCRB 2023."
)
async def get_states(
    state: Optional[str] = Query(None, description="Filter by state name substring (case-insensitive)"),
    admin_type: Optional[str] = Query(None, description="Filter by administrative type ('State' or 'Union Territory')"),
    sort_by: Optional[str] = Query("total_cases", description="Field to sort by (e.g. 'total_cases', 'it_act_share')"),
    order: Optional[str] = Query("desc", description="Sort order: 'asc' or 'desc'"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Maximum number of records to return")
):
    states_data = data_loader.get_states_data(
        state=state,
        admin_type=admin_type,
        sort_by=sort_by,
        order=order,
        limit=limit
    )
    return StatesListResponse(
        total_records=len(states_data),
        national_total=86420,
        states=[StateItem(**s) for s in states_data]
    )
