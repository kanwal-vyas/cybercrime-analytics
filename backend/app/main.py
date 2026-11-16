"""
Main FastAPI Application Entrypoint
Cyber Crime Analytics for National Security — Data Access API Layer
"""

import collections
import sqlite3
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.schemas.common import HealthResponse, ErrorResponse
from backend.app.routers import (
    summary_router,
    states_router,
    categories_router,
    motives_router,
    trends_router,
    models_router,
    live_router,
)

SERVER_START_TIME = time.time()

# Sliding Window Rate Limiter (180 requests/min per IP)
class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 180, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = collections.defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        self.requests[client_ip] = [t for t in self.requests[client_ip] if t > cutoff]
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        self.requests[client_ip].append(now)
        return True

rate_limiter = SlidingWindowRateLimiter(max_requests=180, window_seconds=60)

REQUIRED_DATABASE_OBJECTS = {
    "dim_state",
    "dim_year",
    "dim_crime_category",
    "dim_motive",
    "fact_cybercrime_category_2023",
    "fact_cybercrime_motive_2023",
    "fact_cybercrime_trend",
    "vw_state_cybercrime_summary",
    "vw_category_cybercrime_summary",
    "vw_act_group_summary",
    "vw_state_category_analysis",
    "vw_motive_summary",
    "vw_historical_trend_growth",
}


def ensure_database_ready() -> None:
    """Build a missing/empty warehouse and fail startup for an incomplete one."""
    db_path = settings.DB_PATH
    if db_path.exists():
        with sqlite3.connect(str(db_path)) as conn:
            existing_objects = {
                row[0]
                for row in conn.execute(
                    "SELECT name FROM sqlite_master WHERE type IN ('table', 'view')"
                )
            }
    else:
        existing_objects = set()

    if not existing_objects:
        from src.db_builder import build_database

        build_database(db_path)

        with sqlite3.connect(str(db_path)) as conn:
            existing_objects = {
                row[0]
                for row in conn.execute(
                    "SELECT name FROM sqlite_master WHERE type IN ('table', 'view')"
                )
            }

    missing_objects = REQUIRED_DATABASE_OBJECTS - existing_objects
    if missing_objects:
        missing_list = ", ".join(sorted(missing_objects))
        raise RuntimeError(
            f"Analytical warehouse at {db_path} is incomplete; missing: {missing_list}"
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_database_ready()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Specialized Data Access API Layer serving validated NCRB 2023 cybercrime datasets, "
        "relational warehouse star schemas, longitudinal panel trends (2018–2022), "
        "and validated machine learning models from Stages 1–18."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware for local React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler preventing stack trace leak."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Analytical Service Error: {str(exc)}", "error_type": "ServerError"}
    )


# Performance, Security Headers & Rate Limiting Middleware
@app.middleware("http")
async def performance_and_security_middleware(request: Request, call_next):
    # 1. Rate Limiting Check
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not rate_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "API rate limit exceeded (180 requests/minute). Please throttle client requests."},
            headers={"Retry-After": "60"}
        )

    # 2. Timing & Request ID
    start_time = time.perf_counter()
    request_id = str(uuid.uuid4())[:8]

    response = await call_next(request)

    process_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
    response.headers["X-Process-Time"] = f"{process_time_ms}ms"
    response.headers["X-Request-ID"] = request_id

    # 3. Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    return response


# Root Health Check Endpoint
@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System Health"],
    summary="API Health & Data Integrity Status"
)
async def health_check():
    return HealthResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        data_status="validated",
        analytical_stages=settings.ANALYTICAL_STATUS,
        ui_stage=20
    )


# System Runtime Diagnostics & Metrics Endpoint
@app.get(
    "/api/system/metrics",
    tags=["System Health"],
    summary="Operational Diagnostics & Warehouse Verification"
)
async def system_metrics():
    db_size = settings.DB_PATH.stat().st_size if settings.DB_PATH.exists() else 0
    uptime_seconds = round(time.time() - SERVER_START_TIME, 1)

    with sqlite3.connect(str(settings.DB_PATH)) as conn:
        table_counts = {
            "dim_state": conn.execute("SELECT COUNT(*) FROM dim_state").fetchone()[0],
            "dim_year": conn.execute("SELECT COUNT(*) FROM dim_year").fetchone()[0],
            "dim_crime_category": conn.execute("SELECT COUNT(*) FROM dim_crime_category").fetchone()[0],
            "dim_motive": conn.execute("SELECT COUNT(*) FROM dim_motive").fetchone()[0],
            "fact_cybercrime_category_2023": conn.execute("SELECT COUNT(*) FROM fact_cybercrime_category_2023").fetchone()[0],
            "fact_cybercrime_motive_2023": conn.execute("SELECT COUNT(*) FROM fact_cybercrime_motive_2023").fetchone()[0],
            "fact_cybercrime_trend": conn.execute("SELECT COUNT(*) FROM fact_cybercrime_trend").fetchone()[0],
        }
        reconciled_cases = conn.execute(
            "SELECT SUM(cases) FROM fact_cybercrime_category_2023 WHERE category_id IN (SELECT category_id FROM dim_crime_category WHERE is_leaf = 1)"
        ).fetchone()[0]

    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime_seconds": uptime_seconds,
        "database": {
            "path": str(settings.DB_PATH),
            "size_bytes": db_size,
            "size_kb": round(db_size / 1024, 1),
            "table_counts": table_counts,
            "reconciled_cases": reconciled_cases,
            "authoritative_invariant": 86420,
            "reconciliation_match": reconciled_cases == 86420
        },
        "rate_limit": {
            "max_requests_per_minute": rate_limiter.max_requests,
            "active_clients_tracked": len(rate_limiter.requests)
        }
    }


# Mount Sub-Routers under /api
app.include_router(summary_router, prefix=settings.API_V1_PREFIX)
app.include_router(states_router, prefix=settings.API_V1_PREFIX)
app.include_router(categories_router, prefix=settings.API_V1_PREFIX)
app.include_router(motives_router, prefix=settings.API_V1_PREFIX)
app.include_router(trends_router, prefix=settings.API_V1_PREFIX)
app.include_router(models_router, prefix=settings.API_V1_PREFIX)
app.include_router(live_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Cyber Crime Analytics for National Security API is running.",
        "documentation": "/docs",
        "health": "/api/health",
        "status": settings.ANALYTICAL_STATUS
    }
