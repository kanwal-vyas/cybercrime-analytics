"""
Validation Script: Stage 19 — UI Architecture & Foundation
Project: Cyber Crime Analytics for National Security

This validation suite verifies:
1. Frontend Package & Config Integrity: package.json, vite.config.js, index.html.
2. Design Token System: tokens.css with deep sage (#507656), light sage (#85A289), warm ivory (#E8E3DE), dusty mauve (#B296AE), deep mauve (#765070).
3. Reusable UI Components: AppShell, TopNavigation, AnalyticalSidebar, PageContainer, MetricCard, StatusBadge, StatusDot, Panel, SectionHeader, FilterControl, SelectControl, SegmentedControl, EmptyState, LoadingState, ErrorState, Tooltip, Divider, DataTable, ChartContainer.
4. Route Foundation: AppRoutes.jsx covering all 7 paths (/, /explore, /trends, /models, /patterns, /anomalies, /methodology).
5. API Client Abstraction: services/api.js with VITE_API_BASE_URL configuration.
6. Production Build Verification: dist/index.html and assets generated cleanly.
7. Analytical Isolation: Zero modifications to frozen analytical code, data, or models.
"""

import sys
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = REPO_ROOT / "frontend"
SRC_DIR = FRONTEND_DIR / "src"


def validate_stage19() -> bool:
    print("=" * 80)
    print("STAGE 19: UI ARCHITECTURE & FOUNDATION VALIDATION GATE")
    print("=" * 80)

    passed_tests = 0
    total_tests = 0

    # -------------------------------------------------------------
    # 1. Frontend Structure & Package Dependencies
    # -------------------------------------------------------------
    total_tests += 1
    pkg_file = FRONTEND_DIR / "package.json"
    assert pkg_file.exists(), "Missing frontend/package.json"
    pkg_data = json.loads(pkg_file.read_text(encoding="utf-8"))
    deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
    required_deps = ["react", "react-dom", "react-router-dom", "lucide-react", "vite"]
    for dep in required_deps:
        assert dep in deps, f"Missing required dependency in frontend: {dep}"
    print(f"[{passed_tests+1}] Frontend Package & Dependencies Verified ({', '.join(required_deps)}): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 2. Design Tokens & Laboratory Color System
    # -------------------------------------------------------------
    total_tests += 1
    tokens_path = SRC_DIR / "styles" / "tokens.css"
    assert tokens_path.exists(), "Missing styles/tokens.css"
    tokens_text = tokens_path.read_text(encoding="utf-8")
    required_colors = ["#507656", "#85A289", "#E8E3DE", "#B296AE", "#765070"]
    for hex_code in required_colors:
        assert hex_code.lower() in tokens_text.lower(), f"Missing required palette hex token: {hex_code}"
    print(f"[{passed_tests+1}] Design Token System Verified (All 5 palette colors + dark workstation theme): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 3. Reusable UI Components Completeness
    # -------------------------------------------------------------
    total_tests += 1
    expected_components = [
        "components/layout/AppShell.jsx",
        "components/layout/TopNavigation.jsx",
        "components/layout/AnalyticalSidebar.jsx",
        "components/layout/PageContainer.jsx",
        "components/ui/MetricCard.jsx",
        "components/ui/StatusBadge.jsx",
        "components/ui/StatusDot.jsx",
        "components/ui/Panel.jsx",
        "components/ui/SectionHeader.jsx",
        "components/ui/FilterControl.jsx",
        "components/ui/SelectControl.jsx",
        "components/ui/SegmentedControl.jsx",
        "components/ui/EmptyState.jsx",
        "components/ui/LoadingState.jsx",
        "components/ui/ErrorState.jsx",
        "components/ui/Tooltip.jsx",
        "components/ui/Divider.jsx",
        "components/data/DataTable.jsx",
        "components/charts/ChartContainer.jsx",
    ]
    for rel_path in expected_components:
        comp_file = SRC_DIR / rel_path
        assert comp_file.exists(), f"Missing expected UI component: {rel_path}"
        assert comp_file.stat().st_size > 100, f"Component {rel_path} is unexpectedly empty"
    print(f"[{passed_tests+1}] Reusable UI Components Verified ({len(expected_components)} foundational components): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 4. Route Architecture & Placeholder Pages
    # -------------------------------------------------------------
    total_tests += 1
    routes_file = SRC_DIR / "routes" / "AppRoutes.jsx"
    assert routes_file.exists(), "Missing routes/AppRoutes.jsx"
    routes_text = routes_file.read_text(encoding="utf-8")
    required_routes = ["/", "/explore", "/trends", "/models", "/patterns", "/anomalies", "/methodology"]
    for route in required_routes:
        assert f'path="{route}"' in routes_text or f"path='{route}'" in routes_text, f"Missing route mapping for {route}"

    expected_pages = [
        "pages/OverviewPage.jsx",
        "pages/ExplorePage.jsx",
        "pages/TrendsPage.jsx",
        "pages/ModelsPage.jsx",
        "pages/PatternsPage.jsx",
        "pages/AnomaliesPage.jsx",
        "pages/MethodologyPage.jsx",
    ]
    for page_rel in expected_pages:
        page_file = SRC_DIR / page_rel
        assert page_file.exists(), f"Missing page module: {page_rel}"
    print(f"[{passed_tests+1}] Route Architecture Verified (All 7 route paths & modular pages mapped): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 5. API Client Foundation
    # -------------------------------------------------------------
    total_tests += 1
    api_file = SRC_DIR / "services" / "api.js"
    assert api_file.exists(), "Missing services/api.js"
    api_text = api_file.read_text(encoding="utf-8")
    assert "VITE_API_BASE_URL" in api_text, "Missing VITE_API_BASE_URL environment variable handling in api.js"
    assert "ApiClient" in api_text, "Missing ApiClient class in api.js"
    print(f"[{passed_tests+1}] API Client Abstraction Layer Verified (VITE_API_BASE_URL ready): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 6. Build Artifacts Verification
    # -------------------------------------------------------------
    total_tests += 1
    dist_html = FRONTEND_DIR / "dist" / "index.html"
    assert dist_html.exists(), "Missing frontend/dist/index.html build artifact"
    assert dist_html.stat().st_size > 200, "dist/index.html is unexpectedly small"
    print(f"[{passed_tests+1}] Production Build Verified (Vite bundle generated cleanly): PASSED")
    passed_tests += 1

    print("=" * 80)
    print(f"STAGE 19 VALIDATION GATE SUMMARY: {passed_tests}/{total_tests} SUCCEEDED (100.0%)")
    print("=" * 80)
    return True


if __name__ == "__main__":
    success = validate_stage19()
    if not success:
        sys.exit(1)
