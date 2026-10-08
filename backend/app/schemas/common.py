"""
Common Pydantic Schemas
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field("ok", description="Service health status")
    project: str = Field(..., description="Project title")
    data_status: str = Field(..., description="Validation and freeze status of underlying data")
    analytical_stages: str = Field(..., description="Analytical stages completed and frozen")
    ui_stage: int = Field(20, description="Current UI engineering track stage")


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message details")
    error_type: Optional[str] = Field(None, description="Error classification")
