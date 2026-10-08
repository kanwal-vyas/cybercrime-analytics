"""
Historical Trend Schemas (2018–2022)
"""

from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class NationalTrendItem(BaseModel):
    year: int = Field(..., description="Annual reporting period (2018–2022)")
    national_total_cases: int = Field(..., description="National total cybercrime cases registered")
    prev_year_cases: Optional[float] = Field(None, description="Previous year national volume")
    yoy_growth_pct: Optional[float] = Field(None, description="Year-over-year percentage change")


class StateTrendItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    state_name: str = Field(..., description="State or Union Territory name")
    admin_type: str = Field(..., description="'State' or 'Union Territory'")
    c2018: Optional[int] = Field(None, alias="2018", description="2018 registered cases (null for Ladakh)")
    c2019: Optional[int] = Field(None, alias="2019", description="2019 registered cases (null for Ladakh)")
    c2020: Optional[int] = Field(None, alias="2020", description="2020 registered cases")
    c2021: Optional[int] = Field(None, alias="2021", description="2021 registered cases")
    c2022: Optional[int] = Field(None, alias="2022", description="2022 registered cases")
    total_5yr_cases: Optional[int] = Field(None, description="Cumulative cases across 5 years")
    growth_2018_2022_pct: Optional[float] = Field(None, description="5-year growth percentage where non-null")


class TrendResponse(BaseModel):
    series_name: str = Field(..., description="Name of the historical panel dataset")
    coverage_years: List[int] = Field([2018, 2019, 2020, 2021, 2022], description="Years included in panel")
    total_5yr_expansion_pct: float = Field(141.83, description="National 5-year growth from 27,248 to 65,893")
    c2018_national_total: int = Field(27248, description="2018 national total")
    c2022_national_total: int = Field(65893, description="2022 national total")
    series_isolation_note: str = Field(..., description="Isolation disclaimer from 2023 detailed dataset")
    ladakh_missingness_note: str = Field(..., description="Disclosure of Ladakh 2018/2019 unimputed nulls")
    national_trends: List[NationalTrendItem] = Field(..., description="National yearly totals")
    state_trends: List[StateTrendItem] = Field(..., description="State-level longitudinal series")
