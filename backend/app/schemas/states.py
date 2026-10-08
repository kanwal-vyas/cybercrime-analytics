"""
State & Union Territory Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class StateItem(BaseModel):
    state_id: int = Field(..., description="State dimensional identifier (1–36)")
    state_name: str = Field(..., description="State or Union Territory name")
    admin_type: str = Field(..., description="'State' or 'Union Territory'")
    is_ut: int = Field(..., description="1 for UT, 0 for State")
    total_cases: int = Field(..., description="Total registered cybercrime cases in 2023")
    national_rank: Optional[int] = Field(None, description="Volume rank nationally (1–36)")
    national_share: float = Field(..., description="Percentage of national cybercrime volume")
    it_act_cases: int = Field(..., description="Cases registered under IT Act")
    it_act_share: float = Field(..., description="Percentage share of IT Act offenses")
    ipc_cases: int = Field(..., description="Cases registered under IPC sections")
    ipc_share: float = Field(..., description="Percentage share of IPC offenses")
    sll_cases: int = Field(..., description="Cases registered under Special & Local Laws")
    sll_share: float = Field(..., description="Percentage share of SLL offenses")
    motive_fraud: int = Field(..., description="Cases with fraud motive")
    fraud_motive_share: float = Field(..., description="Percentage share with fraud motive")
    women_cases_total: int = Field(..., description="Total cybercrimes committed against women")
    child_cases_total: int = Field(..., description="Total cybercrimes committed against children")


class StatesListResponse(BaseModel):
    total_records: int = Field(..., description="Number of state records returned")
    national_total: int = Field(86420, description="National total cases across all 36 States/UTs")
    states: List[StateItem] = Field(..., description="List of State/UT summary objects")
