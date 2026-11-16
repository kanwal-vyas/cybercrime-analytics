"""
Live Cyber Threat Intelligence & 1930 Incident Triage Router
Exposes curated CERT-In advisories, threat radar IOCs, and demonstration telemetry.

Architectural Note:
-------------------
All `/live/*` endpoints operate strictly on an in-memory ephemeral queue (`collections.deque`)
and static reference feeds. They do NOT write to or modify the SQLite analytical warehouse
(`cybercrime.db`), which remains strictly immutable and read-only.
"""

import asyncio
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from backend.app.services.live_feed import live_feed_service

router = APIRouter(prefix="/live", tags=["Live Threat Intelligence & Demonstration Telemetry"])


@router.get(
    "/cert-in",
    summary="Get Active CERT-In Security Advisories (Curated)",
    description="Returns curated official CERT-In vulnerability bulletins and national cyber alerts published by CERT-In."
)
def get_cert_in_advisories() -> List[Dict[str, Any]]:
    return live_feed_service.get_cert_in_advisories()


@router.get(
    "/threat-radar",
    summary="Get Indian Cyber Threat Radar IOCs (Curated)",
    description="Returns curated Indicators of Compromise (phishing domains, APK hashes, mule clusters) derived from public DoT/NCIIPC/CFCFRMS advisories."
)
def get_threat_radar() -> Dict[str, Any]:
    return live_feed_service.get_threat_radar()


@router.get(
    "/events",
    summary="Get Recent 1930 / CCTNS Incident Triage Events (Simulated)",
    description="Returns recent incident triage telemetry records calibrated against empirical NCRB 2023 state volume distributions for demonstration purposes."
)
def get_recent_events(limit: int = Query(default=25, ge=1, le=100)) -> List[Dict[str, Any]]:
    return live_feed_service.get_latest_events(limit=limit)


@router.post(
    "/generate-event",
    summary="Trigger Demonstration Incident Event (In-Memory Simulator)",
    description="Generates an immediate statistically calibrated incident triage event into the ephemeral in-memory buffer. Operates purely in-memory; does NOT mutate the SQLite analytical warehouse."
)
def trigger_event() -> Dict[str, Any]:
    return live_feed_service.add_new_event()


@router.websocket("/ws-triage")
async def websocket_triage_stream(websocket: WebSocket):
    """
    WebSocket endpoint streaming statistically calibrated 1930 / CCTNS demonstration triage events in real time.
    Sends a new simulated event every 3.0 seconds to demonstrate reactive dashboard ingestion.
    """
    await websocket.accept()
    try:
        # Send initial backlog on connect
        backlog = live_feed_service.get_latest_events(limit=10)
        await websocket.send_json({"type": "BACKLOG", "data": backlog})

        # Streaming loop
        while True:
            await asyncio.sleep(3.0)
            event = live_feed_service.add_new_event()
            await websocket.send_json({"type": "NEW_INCIDENT", "data": event})
    except WebSocketDisconnect:
        pass
    except Exception:
        await websocket.close()
