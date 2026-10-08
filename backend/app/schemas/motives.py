"""
Motive Dimension Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class MotiveItem(BaseModel):
    motive_id: int = Field(..., description="Unique motive dimensional key")
    motive_name: str = Field(..., description="Stated motive classification name")
    is_total: int = Field(0, description="1 for grand total row, 0 for specific motive")
    national_cases: int = Field(..., description="National total cases in 2023 for this motive")
    states_reporting: Optional[int] = Field(None, description="Count of states reporting this motive")
    national_share: float = Field(..., description="Percentage share of national cybercrime volume")


class MotivesListResponse(BaseModel):
    total_records: int = Field(..., description="Number of motive records returned")
    specific_motives_sum: int = Field(86420, description="Sum of 18 specific motives (reconciles to 86,420)")
    motives: List[MotiveItem] = Field(..., description="List of motive summary objects")
