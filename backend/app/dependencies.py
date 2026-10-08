"""
Application Dependencies
Reusable FastAPI dependencies for service injection.
"""

from typing import Generator
import sqlite3
from backend.app.config import settings
from backend.app.services.warehouse import warehouse_service, get_db_connection
from backend.app.services.data_loader import data_loader


def get_warehouse():
    """Dependency for SQLite warehouse service."""
    return warehouse_service


def get_data_loader():
    """Dependency for cached analytical output loader service."""
    return data_loader


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Dependency for direct SQLite connection."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()
