"""
Main FastAPI Application Entrypoint
Cyber Crime Analytics for National Security — Data Access API Layer
"""

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
)

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
    openapi_url="/openapi.json"
)

# CORS Middleware for local React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler preventing stack trace leak."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Analytical Service Error: {str(exc)}", "error_type": "ServerError"}
    )


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


# Mount Sub-Routers under /api
app.include_router(summary_router, prefix=settings.API_V1_PREFIX)
app.include_router(states_router, prefix=settings.API_V1_PREFIX)
app.include_router(categories_router, prefix=settings.API_V1_PREFIX)
app.include_router(motives_router, prefix=settings.API_V1_PREFIX)
app.include_router(trends_router, prefix=settings.API_V1_PREFIX)
app.include_router(models_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Cyber Crime Analytics for National Security API is running.",
        "documentation": "/docs",
        "health": "/api/health",
        "status": settings.ANALYTICAL_STATUS
    }
