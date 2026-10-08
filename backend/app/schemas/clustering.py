"""
Clustering Schemas (Stages 6 & 15)
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class ClusteringResponse(BaseModel):
    methodology: str = Field(..., description="K-Means Composition Clustering (Primary Baseline: K=4, random_state=42)")
    features: List[str] = Field(..., description="4 standardized composition share features")
    feature_space_exclusion: str = Field(..., description="Total volume strictly excluded from distance metric")
    silhouette_score: float = Field(0.551, description="Primary K=4 silhouette coefficient")
    cluster_profiles: List[Dict[str, Any]] = Field(..., description="Summary statistics for each cluster profile")
    state_assignments: List[Dict[str, Any]] = Field(..., description="State-level cluster memberships and coordinates")
    small_denominator_caution: str = Field(..., description="Caveat for Cluster 2 small-denominator UTs")
