import React, { useState, useMemo } from 'react';
import { Scale, Search } from 'lucide-react';

/**
 * Statutory Legal Crosswalk Matrix
 * Maps legacy Indian Penal Code (IPC 1860) & Indian Evidence Act (IEA 1872) provisions
 * to the Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023),
 * and Bharatiya Sakshya Adhiniyam (BSA 2023) alongside IT Act 2000 provisions.
 */

const LEGAL_CROSSWALK_DATA = [
  {
    domain: 'Fraud & Financial Crimes',
    legacySection: 'Sec. 420 IPC',
    legacyTitle: 'Cheating and dishonestly inducing delivery of property',
    newSection: 'Sec. 318(4) BNS 2023',
    newTitle: 'Cheating with inducement to deliver property',
    itActCrosswalk: 'Sec. 66D IT Act (Punishment for cheating by personation by using computer resource)',
    proceduralShift: 'Cognizable & non-bailable; triable by Magistrate of the First Class. Penalty up to 7 years imprisonment and fine.',
    operationalImplication: 'Primary charge for digital banking fraud, investment telegram traps, and fake job scams in NCRB reporting.',
  },
  {
    domain: 'Identity Theft & Personation',
    legacySection: 'Sec. 419 IPC',
    legacyTitle: 'Punishment for cheating by personation',
    newSection: 'Sec. 319(2) BNS 2023',
    newTitle: 'Cheating by personation',
    itActCrosswalk: 'Sec. 66C IT Act (Identity theft) & Sec. 66D IT Act',
    proceduralShift: 'Explicitly broadens personation to digital personas, deepfakes, and automated spoofed profiles. Up to 5 years imprisonment or fine or both.',
    operationalImplication: 'Applied in Digital Arrest scams where actors impersonate CBI, ED, Mumbai Police, and Customs officials over video calls.',
  },
  {
    domain: 'Cyber Extortion & Blackmail',
    legacySection: 'Sec. 384 IPC',
    legacyTitle: 'Punishment for extortion',
    newSection: 'Sec. 308(2) BNS 2023',
    newTitle: 'Extortion',
    itActCrosswalk: 'Sec. 66E IT Act (Violation of privacy) & Sec. 67A IT Act (Sexually explicit acts)',
    proceduralShift: 'Imprisonment of either description for a term which may extend to 7 years, or with fine, or with both.',
    operationalImplication: 'Governs sextortion video blackmail, ransomware demand extortion, and loan-app contact harassment syndicates.',
  },
  {
    domain: 'Forgery of Electronic Records',
    legacySection: 'Sec. 468 & 471 IPC',
    legacyTitle: 'Forgery for purpose of cheating & using forged document as genuine',
    newSection: 'Sec. 336(3) & 340(2) BNS 2023',
    newTitle: 'Forgery for purpose of cheating & using forged electronic record as genuine',
    itActCrosswalk: 'Sec. 66 IT Act (Computer related offences) & Sec. 74 IT Act (Publication for fraudulent purpose)',
    proceduralShift: 'Direct statutory parity between physical instruments and electronic records, digital signatures, and metadata files.',
    operationalImplication: 'Covers fake court arrest warrants, forged RBI verification letters, and cloned KYC utility bills.',
  },
  {
    domain: 'Insult to Modesty of Women',
    legacySection: 'Sec. 509 IPC',
    legacyTitle: 'Word, gesture or act intended to insult modesty of a woman',
    newSection: 'Sec. 79 BNS 2023',
    newTitle: 'Word, gesture or act intended to insult modesty of a woman',
    itActCrosswalk: 'Sec. 67 IT Act & Sec. 67A IT Act',
    proceduralShift: 'Includes intrusive surveillance and electronic tracking. Term may extend to 3 years with fine; subsequent conviction up to 5 years.',
    operationalImplication: 'Key statutory provision for cyberstalking, non-consensual image dissemination, and morphed social media abuse.',
  },
  {
    domain: 'Digital Evidence Search & Seizure',
    legacySection: 'Sec. 100 CrPC 1973',
    legacyTitle: 'Persons in charge of closed place to allow search',
    newSection: 'Sec. 105 BNSS 2023',
    newTitle: 'Recording of search and seizure through audio-video electronic means',
    itActCrosswalk: 'Sec. 78 IT Act (Power to investigate offences)',
    proceduralShift: 'MANDATORY videography and audio-visual recording of digital device seizure, hashing, and packaging at crime scene without delay.',
    operationalImplication: 'Strict evidentiary requirement for digital forensic officers; non-compliance may compromise trial admissibility.',
  },
  {
    domain: 'Electronic Records Admissibility',
    legacySection: 'Sec. 65B IEA 1872',
    legacyTitle: 'Admissibility of electronic records (Mandatory Certificate)',
    newSection: 'Sec. 63 BSA 2023',
    newTitle: 'Admissibility of electronic records in evidence',
    itActCrosswalk: 'Sec. 65B Certificate replaced by Schedule Certificate under Sec. 63(4) BSA 2023',
    proceduralShift: 'Requires certified statement by person in charge of device or expert, confirming integrity of hash values and cryptographic custody.',
    operationalImplication: 'Governs server log extracts, CDR/IPDR cellular records, WhatsApp chat exports, and database forensics presented in court.',
  },
];

export const BnsLegalCrosswalk = ({ className = '', style = {} }) => {
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchTerm] = useState('');

  const domains = useMemo(() => {
    const set = new Set(LEGAL_CROSSWALK_DATA.map((d) => d.domain));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return LEGAL_CROSSWALK_DATA.filter((item) => {
      const matchDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
      const matchSearch =
        !q ||
        item.legacySection.toLowerCase().includes(q) ||
        item.newSection.toLowerCase().includes(q) ||
        item.legacyTitle.toLowerCase().includes(q) ||
        item.newTitle.toLowerCase().includes(q) ||
        item.itActCrosswalk.toLowerCase().includes(q) ||
        item.operationalImplication.toLowerCase().includes(q);
      return matchDomain && matchSearch;
    });
  }, [selectedDomain, searchQuery]);

  return (
    <div
      className={`bns-legal-crosswalk ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-panel)',
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Scale size={18} color="var(--color-sage-light)" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bharatiya Nyaya Sanhita (BNS 2023) Legal Crosswalk
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            Statutory mapping across IPC (1860) / CrPC (1973) / IEA (1872) and new criminal laws effective July 1, 2024.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            aria-label="Filter by Legal Domain"
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {domains.map((dom) => (
              <option key={dom} value={dom}>
                {dom === 'ALL' ? 'ALL LEGAL DOMAINS' : dom.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search section or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search crosswalk provisions"
              style={{
                padding: '6px 10px 6px 28px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                minWidth: '200px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {filteredData.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderTop: '3px solid var(--cat-sage)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {/* Domain & Section Headers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    color: 'var(--color-sage-light)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.domain}
                </span>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {item.newSection}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.newTitle}
                </div>
              </div>

              <div
                style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--cat-mauve-bg)',
                  border: '1px solid var(--cat-mauve-border)',
                  color: 'var(--cat-mauve)',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                was {item.legacySection}
              </div>
            </div>

            {/* IT Act Crosswalk */}
            <div
              style={{
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '2px solid var(--cat-amber)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
              }}
            >
              <strong style={{ color: 'var(--cat-amber)', display: 'block', marginBottom: '2px' }}>
                IT Act 2000 Concurrence:
              </strong>
              {item.itActCrosswalk}
            </div>

            {/* Operational Implication */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              {item.operationalImplication}
            </p>

            {/* Procedural Shift */}
            <div
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-dim)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 'var(--space-2)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Statutory Shift: </span>
              {item.proceduralShift}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BnsLegalCrosswalk;
