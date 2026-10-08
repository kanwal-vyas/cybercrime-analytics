"""
Regression Schemas (Stages 7 & 14)
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class RegressionResponse(BaseModel):
    evaluation_design: str = Field(..., description="Train: 2020-2021 (N=70), Test: 2022 Held-Out (N=36)")
    selected_model: str = Field("Log-Linear OLS (Selected Best)", description="Selected top predictor")
    selected_metrics: Dict[str, float] = Field(..., description="Key metrics of top model (MAE, RMSE, R2, MedAE)")
    models: List[Dict[str, Any]] = Field(..., description="Regression leaderboard comparing all 10 candidate models")
    actual_vs_predicted: List[Dict[str, Any]] = Field(..., description="State-level predictions on 2022 test set")
