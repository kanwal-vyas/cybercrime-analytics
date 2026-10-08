"""
Historical Trend Router
Exposes validated 2018–2022 panel trends with explicit missingness transparency.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.trends import TrendResponse
from backend.app.services.data_loader import data_loader

router = APIRouter(prefix="", tags=["Historical Trends"])


@router.get(
    "/trend",
    response_model=TrendResponse,
    summary="Get 2018–2022 Historical Cybercrime Trends",
    description="Returns national and state-level longitudinal panel trends from 2018 to 2022 (RS AU 226). Preserves historical isolation and unimputed nulls for Ladakh in 2018/2019."
)
async def get_trend(
    state: Optional[str] = Query(None, description="Filter state time series by name"),
    year: Optional[int] = Query(None, ge=2018, le=2022, description="Filter national series to single annual period"),
    admin_type: Optional[str] = Query(None, description="'State' or 'Union Territory'")
):
    trend_data = data_loader.get_trend_data(
        state=state,
        year=year,
        admin_type=admin_type
    )
    return TrendResponse(**trend_data)
