import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Clock, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * CERT-In (Indian Computer Emergency Response Team) Security Advisories Panel
 */
export default function CertInFeed({ advisories = [], loading = false }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = advisories.filter((adv) => {
    if (filterSeverity === 'ALL') return true;
    return adv.severity === filterSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#3D1C20', border: '#7A2E36', color: '#F87171', label: 'CRITICAL' };
      case 'HIGH':
        return { bg: '#3D2D1B', border: '#7A5328', color: '#FBBF24', label: 'HIGH' };
      case 'MEDIUM':
        return { bg: '#1C2E24', border: '#2D5E3F', color: '#85A289', label: 'MEDIUM' };
      default:
        return { bg: '#232A25', border: '#3A483F', color: '#9CA3AF', label: severity };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
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
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#3D1C20',
              border: '1px solid #7A2E36',
              color: '#F87171',
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="tech-label" style={{ fontSize: '0.6875rem' }}>NATIONAL CYBER DEFENSE</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              CERT-In Official Security Advisories
            </h3>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-base)', padding: '3px', borderRadius: '6px' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                background: filterSeverity === sev ? 'var(--bg-surface-elevated)' : 'transparent',
                border: filterSeverity === sev ? '1px solid var(--border-strong)' : '1px solid transparent',
                color: filterSeverity === sev ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Advisories List */}
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading live CERT-In bulletins...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No advisories match the selected severity filter.
          </div>
        ) : (
          filtered.map((adv) => {
            const badge = getSeverityBadge(adv.severity);
            const isExpanded = expandedId === adv.advisory_id;

            return (
              <div
                key={adv.advisory_id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: 'var(--space-3) var(--space-4)',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: isExpanded ? 'rgba(80, 118, 86, 0.05)' : 'transparent',
                }}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : adv.advisory_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {adv.advisory_id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {adv.published_date}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                      {adv.title}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Target: <span style={{ color: 'var(--text-secondary)' }}>{adv.affected_systems}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--bg-base)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Threat Profile:</strong> {adv.threat_type}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Technical Advisory Summary:</strong> {adv.summary}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <a
                        href={adv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--color-sage-light)',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Read Full Bulletin on CERT-In Portal <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
