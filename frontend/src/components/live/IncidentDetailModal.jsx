import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Landmark,
  Scale,
  Lock,
  Send,
  Copy,
  Check,
  Clock,
  MapPin,
  Building,
} from 'lucide-react';

/**
 * 1930 Incident Triage & Investigative Case Dossier Modal
 * Provides comprehensive legal, financial, forensic, and modus operandi breakdown
 * when clicking any live triage card in the queue.
 */
export default function IncidentDetailModal({
  incident = null,
  onClose = () => {},
  onUpdateStatus = () => {},
}) {
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(incident?.status || 'REPORTED');

  useEffect(() => {
    if (incident) {
      setCurrentStatus(incident.status);
    }
  }, [incident]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!incident) return null;

  const handleCopyBrief = () => {
    const brief = `[1930 NATIONAL CYBERCRIME CASE DOSSIER]
Case ID: ${incident.event_id}
Ack No: ${incident.ack_number || 'N/A'}
Reported: ${incident.date_display} ${incident.time_display}
Location: ${incident.district}, ${incident.state} (${incident.police_station || 'CCPS'})
Modus Operandi: ${incident.modus_operandi}
Amount Defrauded: ₹${incident.amount_inr?.toLocaleString('en-IN')}
Primary Channel: ${incident.channel || 'Digital Rail'}
Suspect Mule Account: ${incident.suspect_mule_account || 'Under Tracing'}
Transaction UTR: ${incident.utr_number || 'N/A'}
Statutory Penal Code: ${incident.crime_category} / ${incident.bns_section || 'Sec. 318(4) BNS 2023'}
Evidence Protocol: ${incident.evidence_protocol || 'Sec. 105 BNSS Videography'}
Current Triage Status: ${currentStatus}`;

    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFreezeAccount = () => {
    setCurrentStatus('ACCOUNT_FROZEN');
    onUpdateStatus(incident.event_id, 'ACCOUNT_FROZEN');
  };

  const handleDispatchPolice = () => {
    setCurrentStatus('DISPATCHED_TO_POLICE_STATION');
    onUpdateStatus(incident.event_id, 'DISPATCHED_TO_POLICE_STATION');
  };

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

  const urgencyBadge = getUrgencyBadge(incident.urgency);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
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
                backgroundColor: urgencyBadge.bg,
                border: `1px solid ${urgencyBadge.border}`,
                color: urgencyBadge.color,
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
                  1930 / I4C CFCFRMS CASE FILE
                </span>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {incident.ack_number || incident.event_id}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                {incident.modus_operandi}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="custom-scrollbar"
          style={{
            padding: 'var(--space-5)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Key Metric Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DEFRAUDED AMOUNT</div>
              <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24' }}>
                ₹{incident.amount_inr?.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SEVERITY LEVEL</div>
              <div style={{ marginTop: '3px' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: urgencyBadge.bg,
                    border: `1px solid ${urgencyBadge.border}`,
                    color: urgencyBadge.color,
                  }}
                >
                  {incident.urgency}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TRIAGE STATUS</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-sage-light)', marginTop: '2px' }}>
                ● {currentStatus.replace(/_/g, ' ')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>INCIDENT TIME</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {incident.time_display}
              </div>
            </div>
          </div>

          {/* Incident Jurisdiction */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="var(--color-sage-light)" />
              <span style={{ color: 'var(--text-muted)' }}>State/UT:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{incident.state}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>District:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{incident.district}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} color="var(--color-mauve-light)" />
              <span style={{ color: 'var(--text-muted)' }}>Jurisdiction:</span>
              <span style={{ color: 'var(--text-secondary)' }}>{incident.police_station || `${incident.district} Cyber Cell`}</span>
            </div>
          </div>

          {/* Section 1: Modus Operandi & Scam Execution Mechanics */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="tech-label" style={{ fontSize: '0.6875rem', marginBottom: '4px' }}>
              ATTACK MECHANICS & MODUS OPERANDI
            </div>
            <p style={{ margin: '0 0 var(--space-3) 0', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              {incident.mechanics || 'Complainant was targeted using social engineering, deceptive digital impersonation, and fraudulent payment channels.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: '0.8125rem', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Primary Delivery Channel: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{incident.channel || 'Digital Telecommunication'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Target Demographic: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{incident.target_profile || 'General Citizen'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Syndicate Cluster: </span>
                <strong style={{ color: 'var(--color-mauve-light)' }}>{incident.syndicate_origin}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Motive Classification: </span>
                <strong style={{ color: '#FBBF24' }}>{incident.motive}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Trace & Suspect Account */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Landmark size={15} color="#FBBF24" />
              <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
                FINANCIAL TRACE & MULE ACCOUNT LAYER
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: '0.8125rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>BENEFICIARY MULE IDENTIFIER</div>
                <div className="font-mono" style={{ color: '#F87171', fontWeight: 600, marginTop: '2px' }}>
                  {incident.suspect_mule_account || 'SBIN004189 / Acc: ********8821'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>TRANSACTION UTR / REF NO</div>
                <div className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {incident.utr_number || 'UTR928471029481'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>CFCFRMS GOLDEN HOUR LIEN</div>
                <div style={{ color: currentStatus === 'ACCOUNT_FROZEN' ? 'var(--color-sage-light)' : '#FBBF24', fontWeight: 600, marginTop: '2px' }}>
                  {currentStatus === 'ACCOUNT_FROZEN' ? '✓ Lien Marked (Funds Frozen)' : 'Pending Bank Liaison'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Legal Sanctions & Evidence Rules */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Scale size={15} color="var(--color-sage-light)" />
              <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
                STATUTORY LEGAL CHARGES & EVIDENCE MANDATES
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Information Technology Act (2000): </span>
                <strong style={{ color: 'var(--color-sage-light)' }}>{incident.crime_category}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Bharatiya Nyaya Sanhita (BNS 2023): </span>
                <strong style={{ color: 'var(--text-primary)' }}>{incident.bns_section || 'Sec. 318(4) BNS 2023 (Cheating)'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Evidence Mandates: </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Sec. 105 BNSS 2023 (Mandatory Audio-Video Recording of Seizure) & Sec. 63 BSA 2023 (Electronic Records Hash Certificate)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <button
            onClick={handleCopyBrief}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} color="var(--color-sage-light)" /> : <Copy size={14} />}
            {copied ? 'Copied Case Brief' : 'Copy Case Dossier'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {currentStatus !== 'ACCOUNT_FROZEN' && currentStatus !== 'DISPATCHED_TO_POLICE_STATION' && (
              <button
                onClick={handleFreezeAccount}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(80, 118, 86, 0.2)',
                  border: '1px solid var(--color-sage-light)',
                  color: 'var(--color-sage-light)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Lock size={14} /> Mark Lien / Freeze Account
              </button>
            )}

            {currentStatus !== 'DISPATCHED_TO_POLICE_STATION' && (
              <button
                onClick={handleDispatchPolice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-sage-deep)',
                  border: '1px solid var(--color-sage-light)',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Send size={14} /> Dispatch to CCPS Station
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
