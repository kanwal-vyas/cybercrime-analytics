"""
FastAPI Backend Integration & Data Reconciliation Tests
Cyber Crime Analytics for National Security — Stage 20
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    """Verify health endpoint and analytical freeze status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["data_status"] == "validated"
    assert "Stages 1–18" in data["analytical_stages"]
    assert data["ui_stage"] == 20


def test_summary():
    """Verify authoritative 2023 national totals reconciliation."""
    res = client.get("/api/summary")
    assert res.status_code == 200
    data = res.json()
    
    # 11 Core Authoritative Reconciliations
    assert data["total_cases"] == 86420, "National total != 86,420"
    assert data["state_count"] == 36, "State count != 36"
    assert data["it_act_cases"] == 44237, "IT Act cases != 44,237"
    assert data["ipc_cases"] == 41849, "IPC cases != 41,849"
    assert data["sll_cases"] == 334, "SLL cases != 334"
    assert data["fraud_motive_cases"] == 59526, "Fraud motive cases != 59,526"
    assert data["women_cases"] == 19510, "Women cases != 19,510"
    assert data["child_cases"] == 1902, "Child cases != 1,902"
    assert data["top5_cases"] == 63472, "Top 5 cases != 63,472"
    assert round(data["top5_share"], 2) == 73.45, "Top 5 share != 73.45%"
    assert data["top_leaf_category_cases"] == 25334, "Sec 66D != 25,334"
    assert data["second_leaf_category_cases"] == 16943, "Sec 420 != 16,943"
    assert data["financial_fraud_cases"] == 61365, "Combined financial fraud != 61,365"
    assert data["historical_growth_pct"] == 141.83, "Historical growth != 141.83%"


def test_states():
    """Verify 36 State/UT cross-sectional endpoint."""
    res = client.get("/api/states")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] == 36
    assert data["national_total"] == 86420
    states = data["states"]
    assert len(states) == 36
    
    # Sum check
    total_cases_sum = sum(s["total_cases"] for s in states)
    assert total_cases_sum == 86420
    
    # Top state check
    assert states[0]["state_name"] == "Karnataka"
    assert states[0]["total_cases"] == 21889
    
    # Filter check for UTs
    res_ut = client.get("/api/states?admin_type=Union%20Territory")
    assert res_ut.status_code == 200
    data_ut = res_ut.json()
    assert data_ut["total_records"] == 8
    assert all(s["is_ut"] == 1 for s in data_ut["states"])


def test_categories():
    """Verify crime categories endpoint and leaf vs parent distinction."""
    res_all = client.get("/api/categories")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["total_records"] == 49
    
    # Leaf only filter
    res_leaf = client.get("/api/categories?leaf_only=true")
    assert res_leaf.status_code == 200
    data_leaf = res_leaf.json()
    assert data_leaf["total_records"] == 40
    
    # Leaf summation check
    leaf_sum = sum(c["national_cases"] for c in data_leaf["categories"])
    assert leaf_sum == 86420, f"Leaf categories sum {leaf_sum} != 86,420"
    
    # Act group filter
    res_it = client.get("/api/categories?act_group=IT%20Act&leaf_only=true")
    assert res_it.status_code == 200
    it_sum = sum(c["national_cases"] for c in res_it.json()["categories"])
    assert it_sum == 44237, f"IT Act leaf sum {it_sum} != 44,237"


def test_motives():
    """Verify motive distribution endpoint and grand total separation."""
    res = client.get("/api/motives?exclude_total=true")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] == 18
    motive_sum = sum(m["national_cases"] for m in data["motives"])
    assert motive_sum == 86420, f"Specific motives sum {motive_sum} != 86,420"
    
    # Verify Fraud is top motive
    fraud_motive = data["motives"][0]
    assert fraud_motive["motive_name"] == "Fraud"
    assert fraud_motive["national_cases"] == 59526


def test_trend():
    """Verify historical trend endpoint (2018–2022) and Ladakh nulls."""
    res = client.get("/api/trend")
    assert res.status_code == 200
    data = res.json()
    assert data["coverage_years"] == [2018, 2019, 2020, 2021, 2022]
    assert data["c2018_national_total"] == 27248
    assert data["c2022_national_total"] == 65893
    assert data["total_5yr_expansion_pct"] == 141.83
    
    # Verify Ladakh missing values are None (null in JSON)
    ladakh_row = next(s for s in data["state_trends"] if s["state_name"] == "Ladakh")
    assert ladakh_row["2018"] is None, "Ladakh 2018 must be null (unimputed)"
    assert ladakh_row["2019"] is None, "Ladakh 2019 must be null (unimputed)"
    assert ladakh_row["2020"] is not None, "Ladakh 2020 must be present"


def test_models_classification():
    """Verify Stage 13 classification models endpoint."""
    res = client.get("/api/models/classification")
    assert res.status_code == 200
    data = res.json()
    assert "High Volume Regime" in data["target"]
    assert len(data["models"]) >= 5
    
    # Find Decision Tree
    dt_model = next(m for m in data["models"] if "Decision Tree" in m.get("Model", ""))
    assert pytest.approx(dt_model["Accuracy"], 0.01) == 0.9722


def test_models_regression():
    """Verify Stage 7/14 regression models endpoint."""
    res = client.get("/api/models/regression")
    assert res.status_code == 200
    data = res.json()
    assert "Log-Linear" in data["selected_model"]
    metrics = data["selected_metrics"]
    assert pytest.approx(metrics["mae"], 0.1) == 479.37
    assert pytest.approx(metrics["rmse"], 0.1) == 1143.46
    assert pytest.approx(metrics["r2"], 0.01) == 0.9000
    assert pytest.approx(metrics["median_ae"], 0.1) == 69.85
    assert len(data["actual_vs_predicted"]) == 36


def test_models_association():
    """Verify Stage 5/12 association rules endpoint."""
    res = client.get("/api/models/association")
    assert res.status_code == 200
    data = res.json()
    assert data["total_frequent_itemsets"] == 129
    assert data["total_filtered_rules"] == 1924
    assert len(data["rules"]) > 0


def test_models_clustering():
    """Verify Stage 6/15 clustering models endpoint."""
    res = client.get("/api/models/clustering")
    assert res.status_code == 200
    data = res.json()
    assert data["selected_k"] == 4
    assert data["algorithm"] == "K-Means"
    assert data["random_state"] == 42
    assert pytest.approx(data["silhouette_score"], 0.0001) == 0.3497
    assert data["calinski_harabasz"] == 20.25
    assert data["davies_bouldin"] == 0.8849
    assert len(data["cluster_profiles"]) == 4
    assert len(data["state_assignments"]) == 36


def test_models_outliers():
    """Verify Stage 8/16 outlier and anomaly detection endpoint."""
    res = client.get("/api/models/outliers")
    assert res.status_code == 200
    data = res.json()
    assert len(data["consensus_summary"]) == 36
    assert set(data["consensus_jurisdictions"]) == {
        "Karnataka",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Lakshadweep"
    }
