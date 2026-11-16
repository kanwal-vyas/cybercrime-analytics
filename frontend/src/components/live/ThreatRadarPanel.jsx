import React from 'react';
import { Radar, AlertOctagon, CheckCircle2 } from 'lucide-react';

/**
 * Indian Cyber Threat Radar & IOC Interception Dashboard
 */
export default function ThreatRadarPanel({ radarData = null, loading = false }) {
  const overview = radarData?.tactical_overview || {
    active_threat_level: 'ELEVATED (LEVEL 3)',
    blocked_fraud_domains_30d: 18420,
    frozen_mule_accounts_30d: 48950,
    frozen_amount_inr_crores: 326.45,
    suspended_sim_cards_dot: 128500,
    last_synced: 'Real-time sync',
  };

  const iocs = radarData?.iocs || [];

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
              backgroundColor: '#1E2F23',
              border: '1px solid #3E6347',
              color: 'var(--color-sage-light)',
            }}
          >
            <Radar size={20} />
          </div>
          <div>
            <div className="tech-label" style={{ fontSize: '0.6875rem' }}>INDIAN THREAT INTELLIGENCE RADAR (CURATED REFERENCE)</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              Active Phishing & Infrastructure Indicators
            </h3>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Derived from official DoT / NCIIPC / I4C CFCFRMS published advisories
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#3D2D1B',
              border: '1px solid #7A5328',
              color: '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertOctagon size={12} /> {overview.active_threat_level}
          </span>
        </div>
      </div>

      {/* National Interception KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>BLOCKED FRAUD DOMAINS</div>
          <div className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {overview.blocked_fraud_domains_30d?.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>FROZEN MULE ACCOUNTS</div>
          <div className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FBBF24' }}>
            {overview.frozen_mule_accounts_30d?.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TOTAL VALUE FROZEN</div>
          <div className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-sage-light)' }}>
            ₹{overview.frozen_amount_inr_crores} Cr
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SUSPENDED SIMS (DoT)</div>
          <div className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F87171' }}>
            {overview.suspended_sim_cards_dot?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Indicators of Compromise (IOC) List */}
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading threat radar indicators...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Indicator / Signature</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Target Entity</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Syndicate Cluster</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Interception Status</th>
              </tr>
            </thead>
            <tbody>
              {iocs.map((ioc) => (
                <tr
                  key={ioc.ioc_id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {ioc.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div className="font-mono" style={{ color: '#F87171', fontWeight: 600 }}>
                      {ioc.indicator}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{ioc.threat_category}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {ioc.targeted_entity}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-mauve-light)' }}>
                    {ioc.origin_cluster}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-sage-light)' }}>
                      <CheckCircle2 size={13} />
                      <span style={{ fontSize: '0.75rem' }}>{ioc.mitigation_status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
