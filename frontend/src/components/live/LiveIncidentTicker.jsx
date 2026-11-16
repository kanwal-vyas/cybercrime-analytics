import React, { useState } from 'react';
import { Play, Pause, Zap } from 'lucide-react';

/**
 * Live 1930 / CCTNS Incident Triage Stream & Dispatch Feed
 */
export default function LiveIncidentTicker({
  events = [],
  isConnected = false,
  isStreaming = true,
  onToggleStream = () => {},
  onTriggerEvent = () => {},
  onSelectEvent = () => {},
  selectedEventId = null,
}) {
  const [filterUrgency, setFilterUrgency] = useState('ALL');

  const filtered = events.filter((e) => {
    if (filterUrgency === 'ALL') return true;
    return e.urgency === filterUrgency;
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return { bg: '#3D1C20', border: '#7A2E36', color: '#F87171' };
      case 'HIGH':
        return { bg: '#3D2D1B', border: '#7A5328', color: '#FBBF24' };
      default:
        return { bg: '#1C2E24', border: '#2D5E3F', color: '#85A289' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCOUNT_FROZEN':
        return { color: '#85A289', text: 'Lien / Frozen' };
      case 'UNDER_TRIAGE':
        return { color: '#FBBF24', text: 'Under Triage' };
      case 'DISPATCHED_TO_POLICE_STATION':
        return { color: '#B296AE', text: 'Police Dispatched' };
      default:
        return { color: '#9CA3AF', text: 'Reported' };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '580px',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#4ADE80' : '#FBBF24',
              boxShadow: isConnected ? '0 0 8px #4ADE80' : 'none',
              animation: isConnected ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            1930 / CFCFRMS LIVE TRIAGE DISPATCH
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onTriggerEvent}
            title="Inject Immediate Incident Event"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-strong)',
              color: 'var(--color-sage-light)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Zap size={12} /> Inject
          </button>

          <button
            onClick={onToggleStream}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: isStreaming ? 'rgba(80, 118, 86, 0.2)' : 'var(--bg-base)',
              border: '1px solid var(--border-strong)',
              color: isStreaming ? '#85A289' : 'var(--text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isStreaming ? <Pause size={12} /> : <Play size={12} />}
            {isStreaming ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Filter strip */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ color: 'var(--text-muted)' }}>
          Queue Depth: <strong style={{ color: 'var(--text-primary)' }}>{events.length}</strong> incidents
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'CRITICAL', 'HIGH'].map((urg) => (
            <button
              key={urg}
              onClick={() => setFilterUrgency(urg)}
              style={{
                background: filterUrgency === urg ? 'var(--bg-surface-elevated)' : 'transparent',
                border: filterUrgency === urg ? '1px solid var(--border-strong)' : 'none',
                color: filterUrgency === urg ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No live events match this filter. Waiting for new stream dispatches...
          </div>
        ) : (
          filtered.map((evt) => {
            const urgency = getUrgencyBadge(evt.urgency);
            const status = getStatusBadge(evt.status);
            const isSelected = selectedEventId === evt.event_id;

            return (
              <div
                key={evt.event_id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(80, 118, 86, 0.15)' : 'var(--bg-surface-elevated)',
                  border: isSelected ? '1px solid var(--color-sage-light)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Event header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: urgency.bg,
                        border: `1px solid ${urgency.border}`,
                        color: urgency.color,
                      }}
                    >
                      {evt.urgency}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {evt.state}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      ({evt.district})
                    </span>
                  </div>

                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {evt.time_display}
                  </span>
                </div>

                {/* Modus Operandi */}
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {evt.modus_operandi}
                </div>

                {/* Details Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#FBBF24' }}>
                    ₹{evt.amount_inr?.toLocaleString('en-IN')}
                  </span>

                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: status.color }}>
                    ● {status.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
