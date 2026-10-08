"""
Crime Motives Router
Exposes validated 2023 cybercrime motive distribution.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.motives import MotivesListResponse, MotiveItem
from backend.app.services.data_loader import data_loader

router = APIRouter(prefix="", tags=["Motive Explorer"])


@router.get(
    "/motives",
    response_model=MotivesListResponse,
    summary="List Cybercrime Motives",
    description="Returns reported cybercrime motives from NCRB 2023. Preserves separation between 18 specific motives and the grand total row."
)
async def get_motives(
    exclude_total: bool = Query(True, description="Exclude grand total row (default: True, returns 18 specific motives)"),
    sort_by: Optional[str] = Query("national_cases", description="Sort field ('national_cases', 'motive_id')"),
    order: Optional[str] = Query("desc", description="Sort order: 'asc' or 'desc'"),
    limit: Optional[int] = Query(None, ge=1, le=50, description="Limit records")
):
    motives_data = data_loader.get_motives_data(
        exclude_total=exclude_total,
        sort_by=sort_by,
        order=order,
        limit=limit
    )
    return MotivesListResponse(
        total_records=len(motives_data),
        specific_motives_sum=86420,
        motives=[MotiveItem(**m) for m in motives_data]
    )
