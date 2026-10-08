"""
Crime Categories Router
Exposes statutory category classifications with leaf vs parent subtotal preservation.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.categories import CategoriesListResponse, CategoryItem
from backend.app.services.data_loader import data_loader

router = APIRouter(prefix="", tags=["Category Explorer"])


@router.get(
    "/categories",
    response_model=CategoriesListResponse,
    summary="List Crime Categories",
    description="Returns statutory legal categories from NCRB 2023. Preserves distinction between 40 independent leaf categories and 9 parent roll-up subtotals."
)
async def get_categories(
    act_group: Optional[str] = Query(None, description="Filter by legal Act Group ('IT Act', 'IPC', 'SLL')"),
    leaf_only: bool = Query(False, description="Set to true to exclude parent subtotals and return only the 40 leaf categories"),
    sort_by: Optional[str] = Query("national_cases", description="Sort field ('national_cases', 'category_name', 'category_id')"),
    order: Optional[str] = Query("desc", description="Sort order: 'asc' or 'desc'"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Limit records")
):
    categories_data = data_loader.get_categories_data(
        act_group=act_group,
        leaf_only=leaf_only,
        sort_by=sort_by,
        order=order,
        limit=limit
    )
    return CategoriesListResponse(
        total_records=len(categories_data),
        leaf_only_filter=leaf_only,
        leaf_national_total=86420,
        categories=[CategoryItem(**c) for c in categories_data]
    )
