# Multi-stage production Dockerfile for Cyber Crime Analytics FastAPI Backend
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./root_requirements.txt
COPY backend/requirements.txt ./backend_requirements.txt

RUN pip install --no-cache-dir --user -r root_requirements.txt -r backend_requirements.txt

# Final minimal runtime image
FROM python:3.12-slim AS runner

WORKDIR /app

# Create non-root system user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/data /app/dashboard /app/outputs && \
    chown -R appuser:appuser /app

# Copy installed Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application files
COPY --chown=appuser:appuser backend/ /app/backend/
COPY --chown=appuser:appuser src/ /app/src/
COPY --chown=appuser:appuser sql/ /app/sql/
COPY --chown=appuser:appuser data/ /app/data/
COPY --chown=appuser:appuser dashboard/ /app/dashboard/
COPY --chown=appuser:appuser outputs/ /app/outputs/

ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONPATH=/app \
    PYTHONUNBUFFERED=1

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
