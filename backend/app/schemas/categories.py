"""
Crime Category Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CategoryItem(BaseModel):
    category_id: int = Field(..., description="Unique category dimensional key")
    category_display_name: str = Field(..., description="Formatted display name with legal section")
    act_group: str = Field(..., description="Legal Act grouping: 'IT Act', 'IPC', or 'SLL'")
    parent_category: Optional[str] = Field(None, description="Parent subtotal category if rolled up")
    is_leaf: int = Field(..., description="1 for independent leaf category, 0 for parent subtotal")
    section_reference: Optional[str] = Field(None, description="Statutory legal section reference")
    national_cases: int = Field(..., description="National total cases in 2023 for this category")
    national_share: float = Field(..., description="Percentage share of national total")
    category_rank: Optional[int] = Field(None, description="Rank by national case count")


class CategoriesListResponse(BaseModel):
    total_records: int = Field(..., description="Number of category records returned")
    leaf_only_filter: bool = Field(..., description="Whether parent subtotals were excluded")
    leaf_national_total: int = Field(86420, description="Sum of 40 leaf categories (reconciles to 86,420)")
    categories: List[CategoryItem] = Field(..., description="List of crime category objects")
