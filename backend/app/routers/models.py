"""
Machine Learning & Analytical Models Router
Exposes validated outputs from Stages 5, 6, 7, 8, 12, 13, 14, 15, and 16.
"""

from fastapi import APIRouter
from backend.app.schemas.classification import ClassificationResponse
from backend.app.schemas.regression import RegressionResponse
from backend.app.schemas.association import AssociationResponse
from backend.app.schemas.clustering import ClusteringResponse
from backend.app.schemas.outliers import OutliersResponse
from backend.app.services.data_loader import data_loader

router = APIRouter(prefix="/models", tags=["Machine Learning & Pattern Mining"])


@router.get(
    "/classification",
    response_model=ClassificationResponse,
    summary="Get Classification Model Results (Stage 13)",
    description="Returns supervised classification leaderboards and confusion matrices on the 2022 held-out test evaluation set (High-Volume Regime prediction)."
)
async def get_classification_models():
    return data_loader.get_classification_models()


@router.get(
    "/regression",
    response_model=RegressionResponse,
    summary="Get Regression & Prediction Results (Stages 7 & 14)",
    description="Returns regression model comparison metrics, actual vs. predicted values on 2022 held-out panel, and confirms Log-Linear OLS (R² = 0.9000) as the selected predictor."
)
async def get_regression_models():
    return data_loader.get_regression_models()


@router.get(
    "/association",
    response_model=AssociationResponse,
    summary="Get Association Rules & Frequent Itemsets (Stages 5 & 12)",
    description="Returns Apriori and FP-Growth frequent itemsets (129) and filtered association rules (1,924) mined across 36 state profile transactions with non-causal interpretation."
)
async def get_association_rules():
    return data_loader.get_association_rules()


@router.get(
    "/clustering",
    response_model=ClusteringResponse,
    summary="Get Cluster Taxonomy & Assignments (Stages 6 & 15)",
    description="Returns K-Means K=4 composition profile taxonomy, silhouette validation, 36 state cluster assignments, and small-denominator caveats."
)
async def get_clustering_models():
    return data_loader.get_clustering_models()


@router.get(
    "/outliers",
    response_model=OutliersResponse,
    summary="Get Multidimensional Anomaly Results (Stages 8 & 16)",
    description="Returns multivariate anomaly detections across Robust Mahalanobis (MinCovDet), LOF, Isolation Forest, Tukey IQR fences, consensus scores (0-4), and volume vs. composition separation."
)
async def get_outliers_data():
    return data_loader.get_outliers_data()
