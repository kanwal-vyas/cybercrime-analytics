"""
Association Rule Schemas (Stages 5 & 12)
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class AssociationResponse(BaseModel):
    methodology_label: str = Field(..., description="Association Rule Mining — State-Level Syllabus Demonstration")
    transaction_definition: str = Field(..., description="36 Indian States & UTs (N = 36) with 8 Binarized Profile Indicators")
    algorithms: str = Field(..., description="Apriori & FP-Growth (100% Mathematical Rule Equivalence)")
    min_support: float = Field(0.25, description="Minimum support threshold")
    min_confidence: float = Field(0.60, description="Minimum confidence threshold")
    total_frequent_itemsets: int = Field(129, description="Total frequent itemsets mined")
    total_filtered_rules: int = Field(1924, description="Total rules meeting support & confidence thresholds")
    key_highlighted_rule: Dict[str, Any] = Field(..., description="Primary highlighted co-occurrence rule")
    rules: List[Dict[str, Any]] = Field(..., description="Key mined association rules")
