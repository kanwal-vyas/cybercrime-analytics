"""
Outlier & Anomaly Detection Schemas (Stages 8 & 16)
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class OutliersResponse(BaseModel):
    framing: str = Field(..., description="State-Level Multivariate Departures (Statistical Extremity, Non-Causal)")
    methods_evaluated: List[str] = Field(..., description="4 evaluated outlier detection methods")
    consensus_scoring: str = Field(..., description="Range 0 to 4 methods agreeing on anomaly classification")
    consensus_jurisdictions: List[str] = Field(..., description="Jurisdictions flagged by all 4 methods")
    sensitivity_findings: str = Field(..., description="Sensitivity stability findings on N=34 vs N=36")
    consensus_summary: List[Dict[str, Any]] = Field(..., description="Consensus scores across all 36 States/UTs")
    volume_vs_composition: List[Dict[str, Any]] = Field(..., description="Dual-space volume vs composition classification")
