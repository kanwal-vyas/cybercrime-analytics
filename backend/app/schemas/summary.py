"""
Executive Summary Schemas
"""

from typing import List
from pydantic import BaseModel, Field


class ExecutiveSummaryResponse(BaseModel):
    total_cases: int = Field(86420, description="Authoritative total registered cybercrime cases in 2023")
    state_count: int = Field(36, description="Total number of Indian States and Union Territories")
    category_count: int = Field(49, description="Total legal crime categories in hierarchy")
    leaf_category_count: int = Field(40, description="Total independent leaf crime categories")
    it_act_cases: int = Field(44237, description="Cases under Information Technology Act")
    it_act_share: float = Field(51.19, description="Percentage share of IT Act offenses")
    ipc_cases: int = Field(41849, description="Cases under IPC sections read with IT Act")
    ipc_share: float = Field(48.43, description="Percentage share of IPC offenses")
    sll_cases: int = Field(334, description="Cases under Special and Local Laws")
    sll_share: float = Field(0.39, description="Percentage share of SLL offenses")
    fraud_motive_cases: int = Field(59526, description="Cases registered with fraud as primary motive")
    fraud_motive_share: float = Field(68.88, description="Percentage share of fraud motive cases")
    women_cases: int = Field(19510, description="Cybercrimes committed against women")
    women_share: float = Field(22.58, description="Percentage share of cybercrimes against women")
    child_cases: int = Field(1902, description="Cybercrimes committed against children")
    child_share: float = Field(2.20, description="Percentage share of cybercrimes against children")
    top_state: str = Field("Karnataka", description="Highest volume state in 2023")
    top_state_cases: int = Field(21889, description="Total cases registered in top state")
    top_state_share: float = Field(25.33, description="National percentage share of top state")
    top5_cases: int = Field(63472, description="Cumulative volume across top 5 states")
    top5_share: float = Field(73.45, description="Cumulative share across top 5 states")
    top5_states: List[str] = Field(..., description="Names of top 5 highest volume states")
    top_leaf_category: str = Field(..., description="Highest volume independent leaf category")
    top_leaf_category_cases: int = Field(25334, description="Cases in top leaf category (Sec.66D)")
    top_leaf_category_share: float = Field(29.31, description="Percentage share of top leaf category")
    second_leaf_category: str = Field(..., description="Second highest independent leaf category")
    second_leaf_category_cases: int = Field(16943, description="Cases in second leaf category (Sec.420)")
    second_leaf_category_share: float = Field(19.61, description="Percentage share of second leaf category")
    financial_fraud_cases: int = Field(61365, description="Combined financial fraud and cheating cases")
    financial_fraud_share: float = Field(71.01, description="Percentage share of financial fraud and cheating")
    historical_start_year: int = Field(2018, description="Start year of historical panel series")
    historical_end_year: int = Field(2022, description="End year of historical panel series")
    historical_growth_pct: float = Field(141.83, description="5-year historical expansion percentage")
    data_provenance: str = Field(..., description="Official government data source citation")
    audit_verdict: str = Field(..., description="Audit and validation status")
