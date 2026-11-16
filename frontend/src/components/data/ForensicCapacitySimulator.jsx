import React, { useState, useMemo } from 'react';
import { Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Digital Forensic Capacity & Caseload Triage Simulator
 * Models daily digital forensic intake, triage throughput, forensic examiner capacity,
 * and evidence processing turnaround times under varying investigative resource constraints.
 */
export const ForensicCapacitySimulator = ({ className = '', style = {} }) => {
  // Operational Parameters
  const [dailyComplaints, setDailyComplaints] = useState(250); // Daily 1930/CCTNS cyber complaints
  const [activeExaminers, setActiveExaminers] = useState(12); // Trained digital forensic specialists
  const [workstations, setWorkstations] = useState(6); // Dedicated forensic workstations (write-blockers, imaging rigs)
  const [avgHoursPerDevice, setAvgHoursPerDevice] = useState(4.5); // Hours to acquire, hash, parse & triage per device
  const [triageFilterRate, setTriageFilterRate] = useState(65); // % complaints resolved at automated 1930 freeze layer without physical imaging

  // Analytical Calculations
  const metrics = useMemo(() => {
    // Complaints requiring deep physical device forensics
    const physicalEvidenceCases = Math.round(dailyComplaints * (1 - triageFilterRate / 100));

    // Devices per physical case (phones, laptops, storage drives, SIMs)
    const devicesToAnalyzePerDay = physicalEvidenceCases * 1.8;

    // Total forensic work-hours required daily
    const hoursNeededDaily = devicesToAnalyzePerDay * avgHoursPerDevice;

    // Maximum daily forensic capacity (8 productive hours/day per examiner, bounded by available workstations)
    const effectiveUnits = Math.min(activeExaminers, workstations * 2); // 2 shifts per workstation max
    const hoursAvailableDaily = effectiveUnits * 7.0; // 7 productive analysis hours per specialist

    // Daily throughput and backlog delta
    const casesTriagedDaily = Math.min(
      physicalEvidenceCases,
      Math.floor(hoursAvailableDaily / (1.8 * avgHoursPerDevice))
    );
    const dailyBacklogDelta = physicalEvidenceCases - casesTriagedDaily;

    // Turnaround time (days)
    const turnaroundDays = hoursAvailableDaily > 0 ? (hoursNeededDaily / hoursAvailableDaily) * 1.2 : 999;
    const utilizationPct = hoursAvailableDaily > 0 ? Math.min(100, Math.round((hoursNeededDaily / hoursAvailableDaily) * 100)) : 100;

    return {
      physicalEvidenceCases,
      devicesToAnalyzePerDay: Math.round(devicesToAnalyzePerDay),
      hoursNeededDaily: Math.round(hoursNeededDaily),
      hoursAvailableDaily: Math.round(hoursAvailableDaily),
      casesTriagedDaily,
      dailyBacklogDelta,
      turnaroundDays: turnaroundDays.toFixed(1),
      utilizationPct,
      isDeficit: dailyBacklogDelta > 0,
    };
  }, [dailyComplaints, activeExaminers, workstations, avgHoursPerDevice, triageFilterRate]);

  return (
    <div
      className={`forensic-capacity-simulator ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-panel)',
        ...style,
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Cpu size={18} color="var(--cat-amber)" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Digital Forensic Capacity & Investigative Throughput Simulator
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            Simulate digital device triage throughput, evidence backlog dynamics, and staffing bottlenecks under varying 1930 incident intake rates.
          </p>
        </div>

        <div
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: metrics.isDeficit ? 'rgba(239, 68, 68, 0.15)' : 'var(--cat-sage-bg)',
            border: `1px solid ${metrics.isDeficit ? 'rgba(239, 68, 68, 0.35)' : 'var(--cat-sage-border)'}`,
            color: metrics.isDeficit ? '#F87171' : 'var(--color-sage-light)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
          }}
        >
          {metrics.isDeficit ? `BACKLOG SURGE (+${metrics.dailyBacklogDelta}/day)` : 'EQUILIBRIUM ACHIEVED'}
        </div>
      </div>

      {/* Grid: Controls on Left, Metrics on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        {/* Sliders Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Daily Complaints */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily 1930 / CCTNS Complaints:</span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{dailyComplaints} cases/day</strong>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={dailyComplaints}
              onChange={(e) => setDailyComplaints(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Active Forensic Specialists */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Digital Forensic Examiners:</span>
              <strong style={{ color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>{activeExaminers} personnel</strong>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={activeExaminers}
              onChange={(e) => setActiveExaminers(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cat-sage)' }}
            />
          </div>

          {/* Forensic Imaging Rigs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Certified Forensic Workstations:</span>
              <strong style={{ color: 'var(--cat-slate)', fontFamily: 'var(--font-mono)' }}>{workstations} rigs</strong>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={workstations}
              onChange={(e) => setWorkstations(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cat-slate)' }}
            />
          </div>

          {/* Automated Triage Filter Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>1930 Automated Financial Filter Rate:</span>
              <strong style={{ color: 'var(--cat-amber)', fontFamily: 'var(--font-mono)' }}>{triageFilterRate}% automated</strong>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={triageFilterRate}
              onChange={(e) => setTriageFilterRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cat-amber)' }}
            />
          </div>

          {/* Analysis Hours per Device */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avg. Hours per Device (Imaging + Hash + Parse):</span>
              <strong style={{ color: 'var(--cat-mauve)', fontFamily: 'var(--font-mono)' }}>{avgHoursPerDevice} hrs</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="12.0"
              step="0.5"
              value={avgHoursPerDevice}
              onChange={(e) => setAvgHoursPerDevice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cat-mauve)' }}
            />
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>PHYSICAL LAB CASES</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {metrics.physicalEvidenceCases} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>cases/day</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DEVICES TO IMAGE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cat-amber)', fontFamily: 'var(--font-mono)' }}>
                {metrics.devicesToAnalyzePerDay} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>devices/day</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DAILY CAPACITY</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>
                {metrics.hoursAvailableDaily} <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>work-hrs</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>CAPACITY UTILIZATION</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: metrics.utilizationPct > 100 ? '#F87171' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {metrics.utilizationPct}%
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: `3px solid ${metrics.isDeficit ? '#EF4444' : 'var(--cat-sage)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              {metrics.isDeficit ? (
                <AlertTriangle size={14} color="#EF4444" />
              ) : (
                <CheckCircle2 size={14} color="var(--color-sage-light)" />
              )}
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: metrics.isDeficit ? '#F87171' : 'var(--color-sage-light)' }}>
                Estimated Turnaround: {metrics.turnaroundDays} Days
              </span>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {metrics.isDeficit
                ? `Current forensic lab staffing produces an accumulating deficit of ${metrics.dailyBacklogDelta} cases per day. Sec. 105 BNSS 2023 compliance requires acquiring additional forensic workstations or examiners.`
                : 'Current technical staffing is sufficient to process incoming physical electronic evidence within standard trial readiness timelines.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicCapacitySimulator;
