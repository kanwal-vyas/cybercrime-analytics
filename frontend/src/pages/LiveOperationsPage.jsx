import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio,
  ShieldAlert,
  Radar,
  RefreshCw,
  Zap,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import IndiaChoroplethMap from '../components/charts/IndiaChoroplethMap';
import CertInFeed from '../components/live/CertInFeed';
import ThreatRadarPanel from '../components/live/ThreatRadarPanel';
import LiveIncidentTicker from '../components/live/LiveIncidentTicker';
import IncidentDetailModal from '../components/live/IncidentDetailModal';

/**
 * Tactical Operations Center (TOC) — Live Cyber Threat Intelligence & 1930 Triage Telemetry
 */
export default function LiveOperationsPage() {
  const [statesData, setStatesData] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [threatRadar, setThreatRadar] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const [outliersData, setOutliersData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [inspectedIncident, setInspectedIncident] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [livePulseState, setLivePulseState] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'threat_radar' | 'cert_in'

  const wsRef = useRef(null);
  const pulseTimerRef = useRef(null);

  // Trigger brief pulse animation on state
  const triggerStatePulse = useCallback((stateName) => {
    setLivePulseState(stateName);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => {
      setLivePulseState(null);
    }, 4000);
  }, []);

  // Fetch initial foundational data
  const fetchInitialData = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const [statesRes, advRes, radarRes, eventsRes, clusterRes, outliersRes] = await Promise.allSettled([
        api.getStates({ sort_by: 'total_cases', order: 'desc' }),
        api.getCertInAdvisories(),
        api.getThreatRadar(),
        api.getLiveEvents(15),
        api.getClusterProfiles(),
        api.getOutlierConsensus(),
      ]);

      if (statesRes.status === 'fulfilled') {
        setStatesData(statesRes.value.states || []);
      }
      if (advRes.status === 'fulfilled') {
        setAdvisories(advRes.value || []);
      }
      if (radarRes.status === 'fulfilled') {
        setThreatRadar(radarRes.value);
      }
      if (eventsRes.status === 'fulfilled') {
        setEvents(eventsRes.value || []);
      }
      if (clusterRes.status === 'fulfilled') {
        setClusteringData(clusterRes.value);
      }
      if (outliersRes.status === 'fulfilled') {
        setOutliersData(outliersRes.value);
      }
    } catch (err) {
      console.warn('Initial live operations load error:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    if (!isStreaming) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const wsUrl = api.getWebSocketUrl('/live/ws-triage');
    let socket;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (msgEvent) => {
        try {
          const payload = JSON.parse(msgEvent.data);
          if (payload.type === 'BACKLOG') {
            setEvents((prev) => {
              const existingIds = new Set(prev.map((e) => e.event_id));
              const newItems = payload.data.filter((e) => !existingIds.has(e.event_id));
              return [...newItems, ...prev].slice(0, 50);
            });
          } else if (payload.type === 'NEW_INCIDENT') {
            const newEvt = payload.data;
            setEvents((prev) => [newEvt, ...prev].slice(0, 50));
            triggerStatePulse(newEvt.state);
          }
        } catch {
          // Message format ignore
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (socket) socket.close();
    };
  }, [isStreaming, triggerStatePulse]);

  // Polling fallback if WebSocket drops but user wants streaming
  useEffect(() => {
    if (!isStreaming || isConnected) return;

    const interval = setInterval(async () => {
      try {
        const latest = await api.getLiveEvents(5);
        if (latest && latest.length > 0) {
          setEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.event_id));
            const fresh = latest.filter((e) => !existingIds.has(e.event_id));
            if (fresh.length > 0) {
              triggerStatePulse(fresh[0].state);
              return [...fresh, ...prev].slice(0, 50);
            }
            return prev;
          });
        }
      } catch {
        // Polling silent catch
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming, isConnected, triggerStatePulse]);

  // Manual event inject
  const handleTriggerManualEvent = async () => {
    try {
      const newEvt = await api.triggerLiveEvent();
      if (newEvt) {
        setEvents((prev) => [newEvt, ...prev].slice(0, 50));
        setSelectedEvent(newEvt);
        setSelectedState(newEvt.state);
        triggerStatePulse(newEvt.state);
      }
    } catch (err) {
      console.warn('Manual trigger failed:', err);
    }
  };

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    setSelectedState(evt.state);
    triggerStatePulse(evt.state);
    setInspectedIncident(evt);
  };

  const handleUpdateStatus = (eventId, newStatus) => {
    setEvents((prev) =>
      prev.map((e) => (e.event_id === eventId ? { ...e, status: newStatus } : e))
    );
    if (selectedEvent && selectedEvent.event_id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    if (inspectedIncident && inspectedIncident.event_id === eventId) {
      setInspectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Aggregated KPIs
  const totalAmountTracked = events.reduce((sum, e) => sum + (e.amount_inr || 0), 0);
  const criticalCount = events.filter((e) => e.urgency === 'CRITICAL').length;
  const frozenCount = events.filter((e) => e.status === 'ACCOUNT_FROZEN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Top TOC Command Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: isConnected ? '#1E2F23' : '#3D2D1B',
              border: isConnected ? '1px solid #3E6347' : '1px solid #7A5328',
              color: isConnected ? '#4ADE80' : '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radio size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
                TACTICAL OPERATIONS CENTER
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  backgroundColor: isConnected ? '#1E2F23' : '#3D2D1B',
                  color: isConnected ? '#4ADE80' : '#FBBF24',
                  border: isConnected ? '1px solid #3E6347' : '1px solid #7A5328',
                }}
              >
                {isConnected ? 'LIVE WEBSOCKET STREAMING' : 'POLLING TELEMETRY'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              National Cyber Triage & Real-Time Threat Center
            </h2>
          </div>
        </div>

        {/* Tactical Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {livePulseState && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                border: '1px solid #F87171',
                color: '#F87171',
                fontSize: '0.75rem',
                fontWeight: 700,
                animation: 'pulse 1s infinite',
              }}
            >
              <Zap size={14} /> LIVE INGESTION: {livePulseState}
            </div>
          )}

          <button
            onClick={handleTriggerManualEvent}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--color-sage-light)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Zap size={14} /> Simulate 1930 Incident
          </button>

          <button
            onClick={fetchInitialData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Real-Time Telemetry KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            QUEUE TELEMETRY (BUFFERED)
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {events.length} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Incidents</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-sage-light)', marginTop: '2px' }}>
            ● Stream active (3s Poisson cadence)
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            TOTAL VALUE AT RISK (INR)
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FBBF24' }}>
            ₹{totalAmountTracked.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Reported in active triage session
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            CRITICAL SEVERITY INCIDENTS
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F87171' }}>
            {criticalCount} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Urgent</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '2px' }}>
            Digital Arrest & Extortion cases
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            CFCFRMS LIEN / ACCOUNT FREEZES
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-sage-light)' }}>
            {frozenCount} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Interceptions</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-sage-light)', marginTop: '2px' }}>
            Mule account freeze issued
          </div>
        </div>
      </div>

      {/* Main Tactical Grid: Live Map + Live Ticker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: 'var(--space-4)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Live Incident Stream (Aligned to Map Height) */}
        <div style={{ height: '640px' }}>
          <LiveIncidentTicker
            events={events}
            isConnected={isConnected}
            isStreaming={isStreaming}
            onToggleStream={() => setIsStreaming(!isStreaming)}
            onTriggerEvent={handleTriggerManualEvent}
            onSelectEvent={handleSelectEvent}
            selectedEventId={selectedEvent?.event_id}
            height="640px"
          />
        </div>

        {/* Right Column: Live Tactical Map with Hotspot HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <IndiaChoroplethMap
            states={statesData}
            statesData={statesData}
            selectedState={selectedState}
            onSelectState={(name) => setSelectedState(name)}
            clusteringData={clusteringData}
            outliersData={outliersData}
            title={livePulseState ? `Live Ingestion Active: ${livePulseState}` : 'Real-Time National Tactical Map'}
            subtitle="Real-time incident dispatch overlays mapped onto 36 statutory jurisdictions"
            height="640px"
          />

          {/* Selected Event Tactical Card */}
          {selectedEvent && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: '#3D1C20',
                      color: '#F87171',
                    }}
                  >
                    SELECTED INCIDENT
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedEvent.event_id}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedEvent.modus_operandi}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Location: <strong style={{ color: 'var(--text-primary)' }}>{selectedEvent.district}, {selectedEvent.state}</strong> | Section: <span style={{ color: 'var(--color-sage-light)' }}>{selectedEvent.crime_category}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div>
                  <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FBBF24' }}>
                    ₹{selectedEvent.amount_inr?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Syndicate: <span style={{ color: 'var(--color-mauve-light)' }}>{selectedEvent.syndicate_origin}</span>
                  </div>
                </div>

                <button
                  onClick={() => setInspectedIncident(selectedEvent)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(80, 118, 86, 0.2)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--color-sage-light)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileText size={13} /> Inspect Case Dossier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: CERT-In Advisories & Threat Radar Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
          <button
            onClick={() => setActiveTab('threat_radar')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === 'threat_radar' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'threat_radar' ? '1px solid var(--border-strong)' : '1px solid transparent',
              color: activeTab === 'threat_radar' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Radar size={14} /> Active Threat Radar & IOCs
          </button>

          <button
            onClick={() => setActiveTab('cert_in')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === 'cert_in' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'cert_in' ? '1px solid var(--border-strong)' : '1px solid transparent',
              color: activeTab === 'cert_in' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldAlert size={14} /> CERT-In National Advisories ({advisories.length})
          </button>
        </div>

        {activeTab === 'threat_radar' ? (
          <ThreatRadarPanel radarData={threatRadar} loading={loadingInitial} />
        ) : (
          <CertInFeed advisories={advisories} loading={loadingInitial} />
        )}
      </div>

      {/* Incident Investigative Case Dossier Modal */}
      <IncidentDetailModal
        incident={inspectedIncident}
        onClose={() => setInspectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
