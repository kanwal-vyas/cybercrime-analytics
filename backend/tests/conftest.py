import sys
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.main import ensure_database_ready


@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    """Ensure the SQLite analytical warehouse is fully built and ready before any tests run."""
    ensure_database_ready()
