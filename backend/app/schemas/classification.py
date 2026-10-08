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
    target: str = Field(..., description="Target definition: High Volume Regime (Binary)")
    evaluation_design: str = Field(..., description="Train: 2020-2021 (N=70), Test: 2022 Held-Out (N=36)")
    academic_caveat: str = Field(..., description="Caveat regarding high temporal volume persistence")
    models: List[Dict[str, Any]] = Field(..., description="Classification model comparison leaderboard")
    confusion_matrices: List[Dict[str, Any]] = Field(..., description="Confusion matrix values on 2022 test set")
