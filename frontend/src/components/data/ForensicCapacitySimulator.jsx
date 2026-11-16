import React, { useState, useMemo } from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

/**
 * Digital Forensics Laboratory Throughput & Capacity Simulator
 * 
 * Mathematical Model & Methodological Formulation:
 * ------------------------------------------------
 * - Benchmark Standard: Based on CDAC / CFSL / DFSL evidence handling workflows (ISO/IEC 27037)
 * - Workdays per Month: 22 working days
 * - Effective Workbench Hours: 6.5 hours/day per analyst (deducting chain-of-custody logging, court testimonies, and imaging calibration)
 * - Workstation Bounds: Analysis is bounded by available physical forensic extraction rigs
 * 
 * Formulas:
 * ---------
 * 1. Labor Pool Capacity (Hours/Mo) = Qualified Examiners * 22 Workdays * 6.5 Effective Hours
 * 2. Total Processing Hours/Device  = Acquisition & Triage Hours + Parsing, Carving & Reporting Hours
 * 3. Monthly Examination Throughput = floor(Labor Pool Capacity / Total Processing Hours per Device)
 * 4. Monthly Net Backlog Delta     = Monthly Device Seizures - Monthly Examination Throughput
 * 5. Clearance Runway (Months)      = Initial Backlog / |Net Monthly Delta| (if Net Delta < 0)
 * 6. Resource Utilization Rate (%)  = (Monthly Seizures * Hours per Device) / Labor Pool Capacity * 100
 */
export const ForensicCapacitySimulator = ({ className = '', style = {} }) => {
  // Operational Parameters
  const [examiners, setExaminers] = useState(8);
  const [acquisitionHours, setAcquisitionHours] = useState(8);
  const [analysisHours, setAnalysisHours] = useState(16);
  const [monthlySeizures, setMonthlySeizures] = useState(110);
  const [initialBacklog, setInitialBacklog] = useState(320);

  // Constants based on DFSL standard working norms
  const WORKDAYS_PER_MONTH = 22;
  const EFFECTIVE_HOURS_PER_DAY = 6.5;

  const simResults = useMemo(() => {
    const totalLaborHours = examiners * WORKDAYS_PER_MONTH * EFFECTIVE_HOURS_PER_DAY;
    const hoursPerDevice = acquisitionHours + analysisHours;
    const monthlyThroughput = Math.max(1, Math.floor(totalLaborHours / hoursPerDevice));
    const netMonthlyDelta = monthlySeizures - monthlyThroughput;

    let monthsToClear = null;
    let backlogStatus = 'STABLE';

    if (netMonthlyDelta > 0) {
      backlogStatus = 'ACCUMULATING';
    } else if (netMonthlyDelta < 0) {
      backlogStatus = 'CLEARING';
      monthsToClear = Math.ceil(initialBacklog / Math.abs(netMonthlyDelta));
    }

    const utilizationPct = Math.min(100, Math.round(((monthlySeizures * hoursPerDevice) / totalLaborHours) * 100));

    return {
      totalLaborHours: Math.round(totalLaborHours),
      hoursPerDevice,
      monthlyThroughput,
      netMonthlyDelta,
      monthsToClear,
      backlogStatus,
      utilizationPct,
      dailyThroughput: (monthlyThroughput / WORKDAYS_PER_MONTH).toFixed(1),
    };
  }, [examiners, acquisitionHours, analysisHours, monthlySeizures, initialBacklog]);

  return (
    <div
      className={`forensic-capacity-simulator ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-panel)',
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#1E2F23',
              border: '1px solid #3E6347',
              color: 'var(--color-sage-light)',
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div className="tech-label" style={{ fontSize: '0.6875rem' }}>WHAT-IF CAPACITY SIMULATOR</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              Digital Forensic Laboratory Capacity & Backlog Dynamics
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Simulates forensic turnaround times and evidentiary backlog accumulation under varying resource constraints
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: simResults.backlogStatus === 'CLEARING' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            border: simResults.backlogStatus === 'CLEARING' ? '1px solid #4ADE80' : '1px solid #F87171',
            color: simResults.backlogStatus === 'CLEARING' ? '#4ADE80' : '#F87171',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {simResults.backlogStatus === 'CLEARING' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          BACKLOG {simResults.backlogStatus} ({simResults.netMonthlyDelta > 0 ? `+${simResults.netMonthlyDelta}` : simResults.netMonthlyDelta} devices / mo)
        </span>
      </div>

      {/* Methodological Context & Assumptions Notice */}
      <div
        style={{
          backgroundColor: 'rgba(214, 161, 93, 0.08)',
          border: '1px solid rgba(214, 161, 93, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Info size={18} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-amber)' }}>METHODOLOGICAL FORMULATION & AUDIT BOUNDARIES:</strong>{' '}
          Calculations are based on empirical digital forensics standards (ISO/IEC 27037). Baseline parameters assume 22 monthly workdays and 6.5 effective workbench analysis hours/analyst/day (excluding administrative chain-of-custody logging and expert testimony). This what-if simulator illustrates sensitivity curves; it is strictly an analytical planning benchmark and not an operational audit of any specific State or Central Forensic Science Laboratory (CFSL).
        </div>
      </div>

      {/* Interactive Sliders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Qualified Forensic Examiners</span>
            <strong style={{ color: 'var(--color-sage-light)' }}>{examiners} Analysts</strong>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={examiners}
            onChange={(e) => setExaminers(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-sage)' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Capacity: {simResults.totalLaborHours} effective work-hours / mo
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Acquisition & Triage Time</span>
            <strong style={{ color: 'var(--color-sage-light)' }}>{acquisitionHours} hrs / device</strong>
          </div>
          <input
            type="range"
            min={2}
            max={24}
            value={acquisitionHours}
            onChange={(e) => setAcquisitionHours(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-sage)' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Physical bit-stream imaging & hashing
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Analysis & Reporting Time</span>
            <strong style={{ color: 'var(--color-sage-light)' }}>{analysisHours} hrs / device</strong>
          </div>
          <input
            type="range"
            min={4}
            max={48}
            value={analysisHours}
            onChange={(e) => setAnalysisHours(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-sage)' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Data carving, indexing & BSA Sec. 63 report
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Seizure Influx</span>
            <strong style={{ color: 'var(--color-sage-light)' }}>{monthlySeizures} devices</strong>
          </div>
          <input
            type="range"
            min={10}
            max={300}
            value={monthlySeizures}
            onChange={(e) => setMonthlySeizures(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-sage)' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Incoming phones, drives & SIM cards
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Existing Pending Backlog</span>
            <strong style={{ color: 'var(--color-sage-light)' }}>{initialBacklog} devices</strong>
          </div>
          <input
            type="range"
            min={50}
            max={800}
            step={10}
            value={initialBacklog}
            onChange={(e) => setInitialBacklog(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-sage)' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Current evidence room inventory
          </div>
        </div>
      </div>

      {/* Computed Outputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
        <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY THROUGHPUT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-sage-light)', marginTop: '4px' }}>
            {simResults.monthlyThroughput}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>completed cases / month (~{simResults.dailyThroughput}/day)</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EXPENDITURE / DEVICE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {simResults.hoursPerDevice} <span style={{ fontSize: '0.875rem' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>acquisition ({acquisitionHours}h) + analysis ({analysisHours}h)</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>WORKFORCE UTILIZATION</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: simResults.utilizationPct > 100 ? '#F87171' : '#4ADE80', marginTop: '4px' }}>
            {simResults.utilizationPct}%
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {simResults.utilizationPct > 100 ? 'Severe Deficit (>100%)' : 'Manageable workload'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED BACKLOG RUNWAY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: simResults.monthsToClear ? '#4ADE80' : '#F87171', marginTop: '4px' }}>
            {simResults.monthsToClear ? `${simResults.monthsToClear} mo` : 'Deficit'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {simResults.monthsToClear ? 'time to zero existing backlog' : 'backlog continuously expanding'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicCapacitySimulator;
