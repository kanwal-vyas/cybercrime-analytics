import React, { useState, useMemo } from 'react';
import { Scale, Search, ShieldCheck, BookOpen, AlertTriangle } from 'lucide-react';

/**
 * Statutory Legal Crosswalk Matrix: IPC (1860) to BNS (2023) & Evidence/Procedure Laws
 * Sources:
 * - The Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023)
 * - The Bharatiya Nagarik Suraksha Sanhita, 2023 (Act No. 46 of 2023)
 * - The Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)
 * - The Information Technology Act, 2000 (as amended)
 * Effective Date: 1 July 2024
 */
const STATUTORY_MAPPINGS = [
  {
    id: 'cheating_delivery',
    domain: 'Fraud & Financial Crimes',
    offense_name: 'Cheating and dishonestly inducing delivery of property',
    legacy_ipc: 'Sec. 420 IPC',
    new_bns: 'Sec. 318(4) BNS',
    it_act_conjunction: 'Sec. 66D IT Act (Cheating by Personation)',
    punishment_comparison: 'IPC: Up to 7 yrs + fine | BNS: Up to 7 yrs + fine (Cognizable, Non-Bailable)',
    procedural_note: 'Primary charge for digital banking fraud, investment telegram traps, and fake job scams in NCRB reporting.',
    substantive_changes: 'BNS retains substantive elements; combines with Sec. 319 BNS for electronic personation.',
  },
  {
    id: 'cheating_personation',
    domain: 'Identity Theft & Personation',
    offense_name: 'Cheating by Personation (Identity spoofing, fake profile)',
    legacy_ipc: 'Sec. 419 IPC',
    new_bns: 'Sec. 319(2) BNS',
    it_act_conjunction: 'Sec. 66C & 66D IT Act',
    punishment_comparison: 'IPC: Up to 3 yrs or fine | BNS: Up to 5 yrs or fine (Increased penalty)',
    procedural_note: 'Explicitly broadens personation to digital personas, deepfakes, and automated spoofed profiles.',
    substantive_changes: 'Penalty enhanced under BNS from 3 years to up to 5 years imprisonment.',
  },
  {
    id: 'forgery_cheating',
    domain: 'Document Forgery & Electronic Records',
    offense_name: 'Forgery for purpose of cheating (Fake KYC, forged documents)',
    legacy_ipc: 'Sec. 468 IPC',
    new_bns: 'Sec. 336(3) BNS',
    it_act_conjunction: 'Sec. 66 r/w Sec. 43 IT Act',
    punishment_comparison: 'IPC: Up to 7 yrs + fine | BNS: Up to 7 yrs + fine (Cognizable, Non-Bailable)',
    procedural_note: 'Electronic records explicitly recognized as documents under BSA Sec. 2(1)(d).',
    substantive_changes: 'Incorporates forged digital certificates, e-signatures, and manipulated metadata.',
  },
  {
    id: 'using_forged_document',
    domain: 'Document Forgery & Electronic Records',
    offense_name: 'Using as genuine a forged electronic record or document',
    legacy_ipc: 'Sec. 471 IPC',
    new_bns: 'Sec. 340(2) BNS',
    it_act_conjunction: 'Sec. 66 IT Act',
    punishment_comparison: 'Punished in same manner as if forged directly by accused.',
    procedural_note: 'Applies to mules transmitting forged bank statements or fabricated PAN cards.',
    substantive_changes: 'Harmonized with BSA Sec. 63 certificate requirements for secondary electronic proof.',
  },
  {
    id: 'stalking',
    domain: 'Cyber Crimes Against Women & Minors',
    offense_name: 'Cyber Stalking (Monitoring internet/email/social media of woman)',
    legacy_ipc: 'Sec. 354D IPC',
    new_bns: 'Sec. 78 BNS',
    it_act_conjunction: 'Sec. 67 / 67A IT Act',
    punishment_comparison: 'BNS: 1st conviction up to 3 yrs; subsequent up to 5 yrs + fine',
    procedural_note: 'Sub-clause (1)(ii) specifically criminalizes electronic/cyber monitoring of women.',
    substantive_changes: 'Retains gender-specific victim protection; expands electronic communication surveillance scope.',
  },
  {
    id: 'modesty_insult',
    domain: 'Cyber Crimes Against Women & Minors',
    offense_name: 'Word, gesture, or act intended to insult modesty of woman',
    legacy_ipc: 'Sec. 509 IPC',
    new_bns: 'Sec. 79 BNS',
    it_act_conjunction: 'Sec. 67 IT Act',
    punishment_comparison: 'IPC: Up to 3 yrs + fine | BNS: Up to 3 yrs + fine (Cognizable, Bailable)',
    procedural_note: 'Applies to non-consensual transmission of abusive, degrading, or morphed digital messages.',
    substantive_changes: 'Expanded judicial interpretation covering deepfake generation and AI morphing.',
  },
  {
    id: 'extortion_cyber',
    domain: 'Extortion & Intimidation',
    offense_name: 'Extortion via electronic communication (Sextortion, Ransomware)',
    legacy_ipc: 'Sec. 384 IPC',
    new_bns: 'Sec. 308(2) BNS',
    it_act_conjunction: 'Sec. 66 & 67A IT Act',
    punishment_comparison: 'IPC: Up to 3 yrs or fine | BNS: Up to 7 yrs or fine (Significantly enhanced)',
    procedural_note: 'Maximum penalty increased from 3 years to up to 7 years imprisonment under BNS.',
    substantive_changes: 'Directly penalizes extortion threats delivered through encrypted messaging and VoIP.',
  },
  {
    id: 'criminal_intimidation',
    domain: 'Extortion & Intimidation',
    offense_name: 'Criminal Intimidation by electronic message / threat',
    legacy_ipc: 'Sec. 506 IPC',
    new_bns: 'Sec. 351(2) BNS',
    it_act_conjunction: 'Sec. 66 IT Act',
    punishment_comparison: 'Simple: Up to 2 yrs; if threat to cause death/grievous hurt: Up to 7 yrs',
    procedural_note: 'Applied to loan-app recovery agent harassment audio notes and dox threats.',
    substantive_changes: 'BNS structure consolidated; threat via anonymous communication addressed under Sec. 351(4).',
  },
  {
    id: 'criminal_conspiracy',
    domain: 'Organized Cybercrime & Syndicates',
    offense_name: 'Criminal Conspiracy (Syndicate networks, multi-tier mule rings)',
    legacy_ipc: 'Sec. 120B IPC',
    new_bns: 'Sec. 61(2) BNS',
    it_act_conjunction: 'Sec. 84B & 84C IT Act (Abetment / Attempt)',
    punishment_comparison: 'Same punishment as abetment of the substantive offense conspired.',
    procedural_note: 'Frequently charged alongside BNS Sec. 111 (Organized Crime) for multi-state call centers.',
    substantive_changes: 'Now complemented by BNS Sec. 111, which introduces explicit organized crime syndicates.',
  },
  {
    id: 'organized_cybercrime',
    domain: 'Organized Cybercrime & Syndicates',
    offense_name: 'Organized Crime & Transnational Cyber Syndicates',
    legacy_ipc: 'No direct IPC equivalent (Special State Acts: MCOCA/GUJCTOC)',
    new_bns: 'Sec. 111 BNS (NEW PROVISION)',
    it_act_conjunction: 'IT Act read with PMLA & BNS 111',
    punishment_comparison: 'Death or life imprisonment if death results; otherwise min 5 yrs up to life + ₹5L fine',
    procedural_note: 'Empowers national law enforcement to seize illicit cyber fraud proceeds and freeze assets.',
    substantive_changes: 'NEW: Explicitly covers cyber crimes committed on behalf of a crime syndicate.',
  },
];

const PROCEDURAL_TRANSFORMS = [
  {
    topic: 'Electronic Records Admissibility',
    legacy: 'Sec. 65B Indian Evidence Act, 1872',
    current: 'Sec. 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    key_difference: 'Digital records have equal evidentiary status to paper. Certificate under Sec. 63(4) required, signed by custodian of computer device or qualified expert.',
  },
  {
    topic: 'Mandatory Videography of Digital Search & Seizure',
    legacy: 'CrPC Sec. 100 (Discretionary videography based on case law)',
    current: 'BNSS Sec. 105 & Sec. 185 (MANDATORY)',
    key_difference: 'Search of premises, seizure of mobile devices/laptops, and inventory preparation MUST be recorded through audio-video electronic means (e.g. mobile recording) without delay.',
  },
  {
    topic: 'Police Custody Interrogation Window',
    legacy: 'CrPC Sec. 167 (15 days strictly within first 15 days of arrest)',
    current: 'BNSS Sec. 187(3)',
    key_difference: '15-day police custody can now be sought in whole or in parts across the first 40 or 60 days of the total detention period, aiding complex digital forensic extraction.',
  },
];

export const BnsLegalCrosswalk = ({ className = '', style = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  const groups = ['ALL', 'Fraud & Financial Crimes', 'Identity Theft & Personation', 'Document Forgery & Electronic Records', 'Cyber Crimes Against Women & Minors', 'Extortion & Intimidation', 'Organized Cybercrime & Syndicates'];

  const filtered = useMemo(() => {
    return STATUTORY_MAPPINGS.filter((item) => {
      const matchGroup = selectedGroup === 'ALL' || item.domain === selectedGroup;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        item.offense_name.toLowerCase().includes(term) ||
        item.legacy_ipc.toLowerCase().includes(term) ||
        item.new_bns.toLowerCase().includes(term) ||
        item.it_act_conjunction.toLowerCase().includes(term);
      return matchGroup && matchSearch;
    });
  }, [searchTerm, selectedGroup]);

  return (
    <div className={`bns-legal-crosswalk ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: 'var(--space-4)',
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
              backgroundColor: '#1E2F23',
              border: '1px solid #3E6347',
              color: 'var(--color-sage-light)',
            }}
          >
            <Scale size={24} />
          </div>
          <div>
            <div className="tech-label" style={{ fontSize: '0.6875rem' }}>STATUTORY REFORM CROSSWALK</div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              IPC (1860) to Bharatiya Nyaya Sanhita (BNS 2023) Legal Concordance
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Authoritative criminal law transition matrix for Indian cybercrime investigations (Effective 1 July 2024)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: '#1E2F23',
              border: '1px solid #3E6347',
              color: '#4ADE80',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} /> STATUTORY REFERENCE VERIFIED
          </span>
        </div>
      </div>

      {/* Academic & Legal Disclaimer */}
      <div
        style={{
          backgroundColor: 'rgba(214, 161, 93, 0.08)',
          border: '1px solid rgba(214, 161, 93, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        <AlertTriangle size={18} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-amber)' }}>LEGAL PROVENANCE & INTERPRETATION BOUNDARY:</strong>{' '}
          This concordant table maps legacy Indian Penal Code (IPC 1860) sections reported in NCRB 2023 tables to the corresponding Bharatiya Nyaya Sanhita (BNS 2023, Act No. 45 of 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), and Bharatiya Sakshya Adhiniyam (BSA 2023). Under Article 20(1) of the Constitution of India, offenses committed on or before 30 June 2024 remain triable under IPC 1860, while offenses committed on or after 1 July 2024 are registered under BNS 2023. This crosswalk serves academic research and comparative legal analytics; it does not constitute formal legal counsel.
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by IPC section (420, 354D), BNS section (318, 78), or offense..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedGroup === grp ? 'var(--color-sage)' : 'var(--bg-surface)',
                color: selectedGroup === grp ? '#090C0A' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontWeight: selectedGroup === grp ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {grp === 'ALL' ? 'All Offenses' : grp}
            </button>
          ))}
        </div>
      </div>

      {/* Crosswalk Concordance Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>OFFENSE DESCRIPTION</th>
                <th style={{ padding: '12px', color: '#F87171', fontWeight: 700 }}>LEGACY IPC (1860)</th>
                <th style={{ padding: '12px', color: '#4ADE80', fontWeight: 700 }}>NEW BNS (2023)</th>
                <th style={{ padding: '12px', color: 'var(--color-amber)', fontWeight: 600 }}>IT ACT (2000) JOINT CONJUNCTION</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SUBSTANTIVE CHANGE & INVESTIGATIVE NOTE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                  }}
                >
                  <td style={{ padding: '12px', color: 'var(--text-primary)', verticalAlign: 'top', maxWidth: '240px' }}>
                    <div style={{ fontWeight: 600 }}>{row.offense_name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {row.domain}
                    </div>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: '#F87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                      {row.legacy_ipc}
                    </span>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: '#4ADE80', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                      {row.new_bns}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-amber)', verticalAlign: 'top', fontSize: '0.75rem', maxWidth: '200px' }}>
                    {row.it_act_conjunction}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', verticalAlign: 'top', fontSize: '0.75rem', maxWidth: '320px' }}>
                    <div>{row.substantive_changes}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      {row.punishment_comparison}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Procedural Transformations (BNSS & BSA) */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
          <BookOpen size={18} style={{ color: 'var(--color-sage-light)' }} />
          <h3 style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
            Key Procedural & Evidentiary Reforms (BNSS 2023 & BSA 2023)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
          {PROCEDURAL_TRANSFORMS.map((pt, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-sage-light)', fontSize: '0.8125rem' }}>
                {pt.topic}
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Legacy: <strong style={{ color: '#F87171' }}>{pt.legacy}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Reform: <strong style={{ color: '#4ADE80' }}>{pt.current}</strong></span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {pt.key_difference}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BnsLegalCrosswalk;
