"""
Configuration Module for Cyber Crime Analytics Backend
Resolves paths dynamically relative to repository root.
"""

import os
from pathlib import Path
from typing import List

# Resolve repository root: backend/app/config.py -> backend/app -> backend -> REPO_ROOT
REPO_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings:
    PROJECT_NAME: str = "Cyber Crime Analytics for National Security"
    API_V1_PREFIX: str = "/api"
    VERSION: str = "1.0.0"
    ANALYTICAL_STATUS: str = "Stages 1–18 Audited & Frozen"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]
    
    # Authoritative Data Paths (Repository relative)
    DB_PATH: Path = Path(os.getenv("DB_PATH", str(REPO_ROOT / "data" / "database" / "cybercrime.db")))
    PROCESSED_DATA_DIR: Path = Path(os.getenv("PROCESSED_DATA_DIR", str(REPO_ROOT / "data" / "processed")))
    DASHBOARD_DATA_DIR: Path = Path(os.getenv("DASHBOARD_DATA_DIR", str(REPO_ROOT / "dashboard" / "powerbi_data")))
    OUTPUTS_TABLES_DIR: Path = Path(os.getenv("OUTPUTS_TABLES_DIR", str(REPO_ROOT / "outputs" / "tables")))


settings = Settings()
