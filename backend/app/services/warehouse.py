"""
Database / Warehouse Access Service
Safe read-only querying of cybercrime.db Star Schema SQLite database.
"""

import sqlite3
from typing import List, Dict, Any, Optional
from backend.app.config import settings


def get_db_connection() -> sqlite3.Connection:
    """Create a read-only SQLite database connection with row factory."""
    conn = sqlite3.connect(str(settings.DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


class WarehouseService:
    @staticmethod
    def get_states(admin_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cur = conn.cursor()
            query = "SELECT state_id, state_name, is_ut FROM dim_state"
            params = []
            if admin_type:
                if admin_type.lower() in ["ut", "union territory"]:
                    query += " WHERE is_ut = 1"
                elif admin_type.lower() in ["state"]:
                    query += " WHERE is_ut = 0"
            query += " ORDER BY state_id ASC"
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_categories(leaf_only: bool = False, act_group: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cur = conn.cursor()
            query = "SELECT category_id, category_name, category_display_name, act_group, parent_category, is_leaf, display_order FROM dim_crime_category WHERE 1=1"
            params = []
            if leaf_only:
                query += " AND is_leaf = 1"
            if act_group:
                query += " AND act_group = ?"
                params.append(act_group)
            query += " ORDER BY display_order ASC, category_id ASC"
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_motives(exclude_total: bool = True) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cur = conn.cursor()
            query = "SELECT motive_id, motive_name, is_total FROM dim_motive"
            params = []
            if exclude_total:
                query += " WHERE is_total = 0"
            query += " ORDER BY motive_id ASC"
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_state_summary_views() -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM v_state_summary_2023 ORDER BY total_cases DESC")
            return [dict(row) for row in cur.fetchall()]


warehouse_service = WarehouseService()
