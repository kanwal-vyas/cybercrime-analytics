"""
Unit tests for Live Cyber Threat Intelligence & Incident Triage API
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_cert_in_advisories_endpoint():
    """Verify CERT-In endpoint returns active advisories with required fields."""
    response = client.get("/api/live/cert-in")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    for item in data:
        assert "advisory_id" in item
        assert "title" in item
        assert "severity" in item
        assert item["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        assert "affected_systems" in item


def test_threat_radar_endpoint():
    """Verify Threat Radar endpoint returns tactical overview and IOC list."""
    response = client.get("/api/live/threat-radar")
    assert response.status_code == 200
    data = response.json()
    assert "tactical_overview" in data
    assert "iocs" in data
    assert data["tactical_overview"]["active_threat_level"]
    assert len(data["iocs"]) >= 3
    for ioc in data["iocs"]:
        assert "ioc_id" in ioc
        assert "indicator" in ioc
        assert "threat_category" in ioc
        assert "origin_cluster" in ioc


def test_live_events_endpoint():
    """Verify Incident triage events endpoint returns valid calibrated records."""
    response = client.get("/api/live/events?limit=10")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) == 10
    evt = events[0]
    assert "event_id" in evt
    assert "state" in evt
    assert "district" in evt
    assert "modus_operandi" in evt
    assert "crime_category" in evt
    assert "amount_inr" in evt
    assert "urgency" in evt


def test_generate_event_endpoint():
    """Verify on-demand instant incident creation endpoint."""
    response = client.post("/api/live/generate-event")
    assert response.status_code == 200
    evt = response.json()
    assert evt["event_id"].startswith("1930-EVT-")
    assert evt["state"]
    assert evt["amount_inr"] > 0
