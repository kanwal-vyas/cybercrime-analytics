"""
Classification Schemas (Stage 13)
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class ClassificationModelItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    model: str = Field(..., alias="Model", description="Classification algorithm name")
    accuracy: float = Field(..., alias="Accuracy", description="Accuracy on 2022 held-out test evaluation set")
    balanced_accuracy: Optional[float] = Field(None, alias="Balanced Accuracy", description="Balanced accuracy")
    precision: float = Field(..., alias="Precision", description="Precision for high-volume regime")
    recall: float = Field(..., alias="Recall", description="Recall for high-volume regime")
    f1_score: float = Field(..., alias="F1-Score", description="F1-Score")
    roc_auc: Optional[float] = Field(None, alias="ROC-AUC", description="Area under ROC curve")
    specificity: Optional[float] = Field(None, alias="Specificity", description="True negative rate")


class ConfusionMatrixItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    model_name: str = Field(..., alias="model_name", description="Model algorithm name")
    tn: int = Field(..., alias="tn", description="True Negatives")
    fp: int = Field(..., alias="fp", description="False Positives")
    fn: int = Field(..., alias="fn", description="False Negatives")
    tp: int = Field(..., alias="tp", description="True Positives")


class ClassificationResponse(BaseModel):
    task_definition: str = Field(..., description="Binary State/UT High-Volume Regime Classification")
    target_definition: str = Field(..., description="HIGH_NEXT_YEAR: 1 if target_year cases >= 367.0, else 0")
    threshold: float = Field(367.0, description="Training partition median volume threshold (367.0 cases)")
    threshold_derivation: str = Field(..., description="Derived solely from training partition median (N=70, 2020-2021)")
    evaluation_design: str = Field(..., description="Strict Chronological Split (Train: 2020-2021 N=70, Test: 2022 Held-Out N=36)")
    train_obs_count: int = Field(70, description="Training observation count")
    test_obs_count: int = Field(36, description="Test observation count")
    features: List[str] = Field(..., description="6 historical lag features (zero contemporaneous leakage)")
    models: List[Dict[str, Any]] = Field(..., description="Classification model comparison leaderboard")
    confusion_matrices: List[Dict[str, Any]] = Field(..., description="Confusion matrix values on 2022 test set")
    feature_importance: List[Dict[str, Any]] = Field(..., description="Feature importance for tree architectures")
    academic_disclaimer: str = Field(..., description="Methodological interpretation: temporal scale persistence, non-causal")
