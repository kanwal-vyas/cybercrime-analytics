"""
Clustering Schemas (Stages 6 & 15)
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class ClusteringResponse(BaseModel):
    methodology: str = Field(..., description="K-Means Composition Clustering (Primary Baseline: K=4, random_state=42)")
    selected_k: int = Field(4, description="Selected number of clusters")
    algorithm: str = Field("K-Means", description="Primary clustering algorithm")
    scaling: str = Field("StandardScaler", description="Feature preprocessing scaling method")
    random_state: int = Field(42, description="Random seed for reproducibility")
    features: List[str] = Field(..., description="4 standardized composition share features")
    feature_space_exclusion: str = Field(..., description="Total volume strictly excluded from distance metric")
    silhouette_score: float = Field(0.3497, description="Primary Stage 6 / Stage 15 K=4 silhouette coefficient")
    calinski_harabasz: float = Field(20.25, description="Calinski-Harabasz index for K=4")
    davies_bouldin: float = Field(0.8849, description="Davies-Bouldin index for K=4")
    inertia: float = Field(49.6849, description="Inertia / WCSS for K=4")
    cluster_profiles: List[Dict[str, Any]] = Field(..., description="Summary statistics for each cluster profile")
    state_assignments: List[Dict[str, Any]] = Field(..., description="State-level cluster memberships and coordinates")
    sensitivity_stability_summary: str = Field(..., description="Sensitivity stability findings on N=34 vs N=36")
    small_denominator_caution: str = Field(..., description="Caveat for Cluster 2 small-denominator UTs")
