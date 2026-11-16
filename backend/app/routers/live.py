"""
Live Cyber Threat Intelligence & 1930 Incident Triage Router
Exposes CERT-In advisories, Indian threat radar IOCs, and streaming telemetry.
"""

import asyncio
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from backend.app.services.live_feed import live_feed_service

router = APIRouter(prefix="/live", tags=["Live Cyber Threat Intelligence"])


@router.get("/cert-in", summary="Get Active CERT-In Security Advisories")
def get_cert_in_advisories() -> List[Dict[str, Any]]:
    """Returns official CERT-In vulnerability bulletins and national cyber alerts."""
    return live_feed_service.get_cert_in_advisories()


@router.get("/threat-radar", summary="Get Indian Cyber Threat Radar IOCs")
def get_threat_radar() -> Dict[str, Any]:
    """Returns active Indian phishing domains, malware hashes, and national interception statistics."""
    return live_feed_service.get_threat_radar()


@router.get("/events", summary="Get Recent 1930 / CCTNS Incident Triage Events")
def get_recent_events(limit: int = Query(default=25, ge=1, le=100)) -> List[Dict[str, Any]]:
    """Returns the most recent incident triage telemetry records."""
    return live_feed_service.get_latest_events(limit=limit)


@router.post("/generate-event", summary="Generate Instant Incident Triage Event")
def trigger_event() -> Dict[str, Any]:
    """Generates an immediate statistically calibrated incident triage event."""
    return live_feed_service.add_new_event()


@router.websocket("/ws-triage")
async def websocket_triage_stream(websocket: WebSocket):
    """
    WebSocket endpoint streaming live 1930 / CCTNS cyber triage events in real time.
    Sends new event every 2.5 - 4.5 seconds.
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
