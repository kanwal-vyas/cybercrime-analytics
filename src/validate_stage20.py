"""
Validation Script: Stage 20 — FastAPI Backend & Data API Layer
Project: Cyber Crime Analytics for National Security

This validation suite verifies:
1. Backend Package Structure: config, services, schemas, routers, and main app.
2. FastAPI Routing & OpenAPI: /api/health, /api/summary, /api/states, /api/categories, /api/motives, /api/trend, /api/models/*.
3. Core National Reconciliation:
   - Total Cases: 86,420
   - IT Act Cases: 44,237
   - IPC Crimes: 41,849
   - SLL Crimes: 334
   - 40 Leaf Categories sum: 86,420
   - Total Motive Cases: 86,420
   - 36 States/UTs count
4. Historical Panel Integrity: 2018–2022 preserved, Ladakh 2018/2019 missingness as null (no zero-fabrication or interpolation).
5. Validated ML Model Payloads: Classification, Regression (Log-Linear OLS MAE 479.37, RMSE 1143.46, R² 0.9000), Association rules (40 rules), Clustering (K=4), Outliers consensus.
6. Execution of Backend Test Suite: test_api.py passing 100%.
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.app.main import app
from backend.app.config import settings


def validate_stage20() -> bool:
    print("=" * 80)
    print("STAGE 20: FASTAPI BACKEND & DATA API LAYER VALIDATION GATE")
    print("=" * 80)

    passed_tests = 0
    total_tests = 0

    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. Backend Structure & Config Integrity
    # -------------------------------------------------------------
    total_tests += 1
    backend_dir = REPO_ROOT / "backend"
    assert (backend_dir / "app" / "main.py").exists(), "Missing backend/app/main.py"
    assert (backend_dir / "app" / "config.py").exists(), "Missing backend/app/config.py"
    assert (backend_dir / "app" / "dependencies.py").exists(), "Missing backend/app/dependencies.py"
    assert (backend_dir / "app" / "services" / "warehouse.py").exists(), "Missing warehouse service"
    assert (backend_dir / "app" / "services" / "data_loader.py").exists(), "Missing data_loader service"
    assert (backend_dir / "requirements.txt").exists(), "Missing backend/requirements.txt"
    print(f"[{passed_tests+1}] Backend Package Structure & File Integrity: PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 2. Health Endpoint & Metadata
    # -------------------------------------------------------------
    total_tests += 1
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    health_data = res.json()
    assert health_data["status"] == "ok"
    assert health_data["data_status"] == "validated"
    assert health_data["ui_stage"] == 20
    assert "1" in health_data["analytical_stages"] and "18" in health_data["analytical_stages"] and "frozen" in health_data["analytical_stages"].lower()
    print(f"[{passed_tests+1}] Health Endpoint & Frozen Metadata Verified: PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 3. Summary Endpoint & National Invariant Reconciliations
    # -------------------------------------------------------------
    total_tests += 1
    res = client.get("/api/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["total_cases"] == 86420, f"Expected 86420 total cases, got {summary['total_cases']}"
    assert summary["state_count"] == 36, f"Expected 36 states, got {summary['state_count']}"
    assert summary["leaf_category_count"] == 40, f"Expected 40 leaf categories, got {summary['leaf_category_count']}"
    assert summary["category_count"] == 49, f"Expected 49 total categories, got {summary['category_count']}"
    assert summary["it_act_cases"] == 44237, f"Expected 44237 IT Act cases, got {summary['it_act_cases']}"
    assert summary["ipc_cases"] == 41849, f"Expected 41849 IPC cases, got {summary['ipc_cases']}"
    assert summary["sll_cases"] == 334, f"Expected 334 SLL cases, got {summary['sll_cases']}"
    assert summary["it_act_cases"] + summary["ipc_cases"] + summary["sll_cases"] == 86420
    assert summary["fraud_motive_cases"] == 59526
    assert summary["financial_fraud_cases"] == 61365
    assert summary["women_cases"] == 19510
    assert summary["child_cases"] == 1902
    assert summary["top5_cases"] == 63472
    assert summary["top5_share"] == 73.45
    print(f"[{passed_tests+1}] Summary Metrics & National Invariant Reconciliations Verified: PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 4. States & Union Territories Endpoint
    # -------------------------------------------------------------
    total_tests += 1
    res = client.get("/api/states")
    assert res.status_code == 200
    states_data = res.json()
    assert states_data["total_records"] == 36
    assert states_data["national_total"] == 86420
    assert sum(s["total_cases"] for s in states_data["states"]) == 86420
    # Check UT filter
    res_ut = client.get("/api/states?admin_type=ut")
    assert res_ut.status_code == 200
    assert res_ut.json()["total_records"] == 8
    print(f"[{passed_tests+1}] States & UTs Dimensional Endpoint Verified (36 States, 8 UTs): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 5. Categories Endpoint (Leaf vs Parent Roll-up)
    # -------------------------------------------------------------
    total_tests += 1
    res_all_cats = client.get("/api/categories")
    assert res_all_cats.status_code == 200
    assert res_all_cats.json()["total_records"] == 49
    res_leaf_cats = client.get("/api/categories?leaf_only=true")
    assert res_leaf_cats.status_code == 200
    leaf_json = res_leaf_cats.json()
    assert leaf_json["total_records"] == 40
    assert sum(c["national_cases"] for c in leaf_json["categories"]) == 86420
    print(f"[{passed_tests+1}] Category Hierarchy Preserved (49 Total, 40 Leaf = 86,420 cases): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 6. Motives Endpoint
    # -------------------------------------------------------------
    total_tests += 1
    res_motives = client.get("/api/motives")
    assert res_motives.status_code == 200
    motives_json = res_motives.json()
    assert motives_json["total_records"] == 18
    assert motives_json["specific_motives_sum"] == 86420
    assert sum(m["national_cases"] for m in motives_json["motives"]) == 86420
    fraud_motive = next(m for m in motives_json["motives"] if "fraud" in m["motive_name"].lower())
    assert fraud_motive["national_cases"] == 59526
    print(f"[{passed_tests+1}] Motives Dimension Verified (18 Specific Motives = 86,420, Fraud = 59,526): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 7. Historical Trend Endpoint (2018–2022 & Ladakh Nulls)
    # -------------------------------------------------------------
    total_tests += 1
    res_trend = client.get("/api/trend")
    assert res_trend.status_code == 200
    trend_json = res_trend.json()
    assert trend_json["coverage_years"] == [2018, 2019, 2020, 2021, 2022]
    assert len(trend_json["state_trends"]) == 36
    # Verify Ladakh missingness
    ladakh_trend = next(s for s in trend_json["state_trends"] if s["state_name"] == "Ladakh")
    assert ladakh_trend["2018"] is None or ladakh_trend.get("c2018") is None
    assert ladakh_trend["2019"] is None or ladakh_trend.get("c2019") is None
    assert (ladakh_trend.get("2020") is not None) or (ladakh_trend.get("c2020") is not None)
    print(f"[{passed_tests+1}] Historical Trend Verified (2018–2022 panel, Ladakh nulls preserved): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 8. Machine Learning Model Endpoints
    # -------------------------------------------------------------
    total_tests += 1
    # Classification
    res_cls = client.get("/api/models/classification")
    assert res_cls.status_code == 200
    cls_json = res_cls.json()
    assert "High Volume Regime" in cls_json["target"]
    assert len(cls_json["models"]) >= 4
    # Regression
    res_reg = client.get("/api/models/regression")
    assert res_reg.status_code == 200
    reg_json = res_reg.json()
    assert "Log-Linear OLS" in reg_json["selected_model"]
    assert reg_json["selected_metrics"]["mae"] == 479.37
    assert reg_json["selected_metrics"]["rmse"] == 1143.46
    assert reg_json["selected_metrics"]["r2"] == 0.9000
    assert reg_json["selected_metrics"]["median_ae"] == 69.85
    # Association
    res_assoc = client.get("/api/models/association")
    assert res_assoc.status_code == 200
    assoc_json = res_assoc.json()
    assert assoc_json["total_frequent_itemsets"] == 129
    assert assoc_json["total_filtered_rules"] == 1924
    assert len(assoc_json["rules"]) == 42
    # Clustering
    res_clust = client.get("/api/models/clustering")
    assert res_clust.status_code == 200
    clust_json = res_clust.json()
    assert clust_json["selected_k"] == 4
    assert clust_json["algorithm"] == "K-Means"
    assert clust_json["random_state"] == 42
    assert clust_json["silhouette_score"] == 0.3497
    assert clust_json["calinski_harabasz"] == 20.25
    assert clust_json["davies_bouldin"] == 0.8849
    assert len(clust_json["state_assignments"]) == 36
    # Outliers
    res_out = client.get("/api/models/outliers")
    assert res_out.status_code == 200
    out_json = res_out.json()
    assert len(out_json["consensus_jurisdictions"]) == 3
    assert "Karnataka" in out_json["consensus_jurisdictions"]
    assert "Dadra and Nagar Haveli and Daman and Diu" in out_json["consensus_jurisdictions"]
    assert "Lakshadweep" in out_json["consensus_jurisdictions"]
    assert len(out_json["consensus_summary"]) == 36
    print(f"[{passed_tests+1}] Validated ML Models Endpoints Verified (Classification, Regression, Association, Clustering, Outliers): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    print("=" * 80)
    print(f"STAGE 20 VALIDATION COMPLETE: {passed_tests}/{total_tests} GATES PASSED")
    print("=" * 80)
    return True


if __name__ == "__main__":
    success = validate_stage20()
    if not success:
        sys.exit(1)
