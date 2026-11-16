import React, { useState, useMemo } from 'react';
import { Network, Cpu, Landmark, Scale, Crosshair } from 'lucide-react';

/**
 * Interactive Modus Operandi & Cyber Threat Syndicate Knowledge Graph
 * Visualizes the relationships between Syndicate Hubs, Modus Operandi, Laundering Channels, and Legal Sections.
 */

const GRAPH_DATA = {
  nodes: [
    // 1. Syndicate Hubs (Red/Amber)
    { id: 'HUB-MEKONG', type: 'hub', label: 'Transnational Mekong Compounds', cluster: 'Mekong', x: 120, y: 100, scale: '₹1,500+ Cr/yr', codename: 'Op. Chakra II' },
    { id: 'HUB-MEWAT', type: 'hub', label: 'Mewat-Bharatpur Syndicate', cluster: 'Mewat', x: 120, y: 220, scale: '₹350+ Cr/yr', codename: 'Op. Cyber Prahar' },
    { id: 'HUB-JAMTARA', type: 'hub', label: 'Jamtara-Giridih Vishing Ring', cluster: 'Jamtara', x: 120, y: 340, scale: '₹120+ Cr/yr', codename: 'Op. Trishul' },
    { id: 'HUB-NCR', type: 'hub', label: 'NCR Layering & Mule Grid', cluster: 'NCR', x: 120, y: 460, scale: '₹800+ Cr/yr', codename: 'Op. Megh Chakra' },

    // 2. Modus Operandi (Sage/Green)
    { id: 'MO-DIGITAL-ARREST', type: 'modus', label: 'Digital Arrest (CBI/ED/Customs)', x: 380, y: 70, target: 'Senior Citizens', loss: 'Avg ₹40-90L' },
    { id: 'MO-STOCK-VIP', type: 'modus', label: 'Institutional Stock Trading VIP Group', x: 380, y: 150, target: 'HNIs & Investors', loss: 'Avg ₹25-60L' },
    { id: 'MO-JOB-TASK', type: 'modus', label: 'Part-Time Task & Crypto Recharge', x: 380, y: 230, target: 'Job Seekers & Youth', loss: 'Avg ₹3-8L' },
    { id: 'MO-ELEC-APK', type: 'modus', label: 'Electricity Disconnection Trojan APK', x: 380, y: 310, target: 'Utility Consumers', loss: 'Avg ₹50K-2L' },
    { id: 'MO-SEXTORTION', type: 'modus', label: 'Sextortion Video Recording Trap', x: 380, y: 390, target: 'Professionals', loss: 'Avg ₹1-5L' },
    { id: 'MO-AEPS', type: 'modus', label: 'AePS Biometric Silicone Clone', x: 380, y: 470, target: 'Rural Pensioners', loss: 'Avg ₹10-30K' },
    { id: 'MO-UPI-TRAP', type: 'modus', label: 'UPI QR Reverse Collect Exploit', x: 380, y: 550, target: 'P2P Sellers', loss: 'Avg ₹15-50K' },

    // 3. Financial Laundering Channels (Amber)
    { id: 'CHAN-MULE', type: 'channel', label: 'Mule Current/Savings Accounts (CFCFRMS Target)', x: 640, y: 140, vector: 'Banking Network' },
    { id: 'CHAN-CRYPTO', type: 'channel', label: 'P2P USDT / Tron TRC20 Wallets', x: 640, y: 260, vector: 'Offshore Crypto' },
    { id: 'CHAN-PG', type: 'channel', label: 'Compromised Payment Aggregators / Gateways', x: 640, y: 380, vector: 'Fintech Rail' },
    { id: 'CHAN-CSP', type: 'channel', label: 'CSP / Micro-ATM Cash Drains', x: 640, y: 500, vector: 'Cash Out' },

    // 4. Governing Legal Sanctions (Mauve)
    { id: 'LAW-66D', type: 'legal', label: 'Sec. 66D IT Act (Cheat by Personation)', x: 880, y: 100, statute: 'IT Act 2000' },
    { id: 'LAW-BNS318', type: 'legal', label: 'Sec. 318(4) BNS 2023 (Cheating / Fraud)', x: 880, y: 200, statute: 'BNS 2023' },
    { id: 'LAW-66C', type: 'legal', label: 'Sec. 66C IT Act (Identity Theft)', x: 880, y: 300, statute: 'IT Act 2000' },
    { id: 'LAW-BNS308', type: 'legal', label: 'Sec. 308(2) BNS 2023 (Extortion)', x: 880, y: 400, statute: 'BNS 2023' },
    { id: 'LAW-BNSS105', type: 'legal', label: 'Sec. 105 BNSS 2023 (Mandatory Videography)', x: 880, y: 500, statute: 'BNSS 2023' },
  ],
  links: [
    // Mekong links
    { source: 'HUB-MEKONG', target: 'MO-DIGITAL-ARREST' },
    { source: 'HUB-MEKONG', target: 'MO-STOCK-VIP' },
    { source: 'HUB-MEKONG', target: 'MO-JOB-TASK' },

    // Mewat links
    { source: 'HUB-MEWAT', target: 'MO-ELEC-APK' },
    { source: 'HUB-MEWAT', target: 'MO-SEXTORTION' },
    { source: 'HUB-MEWAT', target: 'MO-AEPS' },

    // Jamtara links
    { source: 'HUB-JAMTARA', target: 'MO-UPI-TRAP' },
    { source: 'HUB-JAMTARA', target: 'MO-JOB-TASK' },

    // NCR links
    { source: 'HUB-NCR', target: 'CHAN-MULE' },
    { source: 'HUB-NCR', target: 'CHAN-CRYPTO' },
    { source: 'HUB-NCR', target: 'MO-DIGITAL-ARREST' },

    // Modus Operandi -> Financial Channels
    { source: 'MO-DIGITAL-ARREST', target: 'CHAN-MULE' },
    { source: 'MO-STOCK-VIP', target: 'CHAN-CRYPTO' },
    { source: 'MO-JOB-TASK', target: 'CHAN-CRYPTO' },
    { source: 'MO-JOB-TASK', target: 'CHAN-PG' },
    { source: 'MO-ELEC-APK', target: 'CHAN-MULE' },
    { source: 'MO-SEXTORTION', target: 'CHAN-MULE' },
    { source: 'MO-AEPS', target: 'CHAN-CSP' },
    { source: 'MO-UPI-TRAP', target: 'CHAN-PG' },

    // Modus Operandi & Channels -> Legal Sections
    { source: 'MO-DIGITAL-ARREST', target: 'LAW-66D' },
    { source: 'MO-DIGITAL-ARREST', target: 'LAW-BNS318' },
    { source: 'MO-STOCK-VIP', target: 'LAW-BNS318' },
    { source: 'MO-JOB-TASK', target: 'LAW-66D' },
    { source: 'MO-ELEC-APK', target: 'LAW-66C' },
    { source: 'MO-SEXTORTION', target: 'LAW-BNS308' },
    { source: 'MO-AEPS', target: 'LAW-66C' },
    { source: 'MO-UPI-TRAP', target: 'LAW-66D' },

    // Evidence Mandate
    { source: 'CHAN-MULE', target: 'LAW-BNSS105' },
    { source: 'CHAN-CRYPTO', target: 'LAW-BNSS105' },
  ],
};

const NODE_THEMES = {
  hub: { fill: '#3D1C20', stroke: '#F87171', text: '#FCA5A5', icon: Crosshair },
  modus: { fill: '#1E2F23', stroke: '#85A289', text: '#D1E0D4', icon: Cpu },
  channel: { fill: '#3D2D1B', stroke: '#FBBF24', text: '#FDE68A', icon: Landmark },
  legal: { fill: '#362435', stroke: '#B296AE', text: '#E5D6E3', icon: Scale },
};

export default function SyndicateKnowledgeGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState('MO-DIGITAL-ARREST');

  // Adjacency mapping for instant graph traversal
  const adjacency = useMemo(() => {
    const map = new Map();
    GRAPH_DATA.nodes.forEach((n) => map.set(n.id, new Set()));
    GRAPH_DATA.links.forEach((l) => {
      map.get(l.source)?.add(l.target);
      map.get(l.target)?.add(l.source);
    });
    return map;
  }, []);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set();
    const set = new Set([selectedNodeId]);
    const neighbors = adjacency.get(selectedNodeId);
    if (neighbors) {
      neighbors.forEach((nbr) => {
        set.add(nbr);
        // 2-hop traversal
        adjacency.get(nbr)?.forEach((secondHop) => set.add(secondHop));
      });
    }
    return set;
  }, [selectedNodeId, adjacency]);

  const selectedNode = GRAPH_DATA.nodes.find((n) => n.id === selectedNodeId);

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
            <Network size={20} />
          </div>
          <div>
            <div className="tech-label" style={{ fontSize: '0.6875rem' }}>THREAT ACTOR & SYNDICATE TOPOLOGY</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              Modus Operandi & Scam Syndicate Knowledge Graph
            </h3>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#F87171' }}>
            ● Syndicate Hubs
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#85A289' }}>
            ● Modus Operandi
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#FBBF24' }}>
            ● Financial Rails
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#B296AE' }}>
            ● Legal Statutes
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Graph + Detail Dossier */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 0,
        }}
      >
        {/* Left: SVG Force / Layered Graph Canvas */}
        <div
          style={{
            backgroundColor: '#0D1410',
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          <svg
            viewBox="0 0 1020 620"
            style={{ width: '100%', height: '580px', display: 'block' }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Column Guide Headers */}
            <g opacity="0.3" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              <text x="120" y="30" textAnchor="middle">1. ORIGINATING HUBS</text>
              <text x="380" y="30" textAnchor="middle">2. MODUS OPERANDI</text>
              <text x="640" y="30" textAnchor="middle">3. FINANCIAL RAILS</text>
              <text x="880" y="30" textAnchor="middle">4. STATUTORY SECTIONS</text>
            </g>

            {/* Edges / Links */}
            {GRAPH_DATA.links.map((link, idx) => {
              const src = GRAPH_DATA.nodes.find((n) => n.id === link.source);
              const tgt = GRAPH_DATA.nodes.find((n) => n.id === link.target);
              if (!src || !tgt) return null;

              const isHighlighted =
                connectedNodeIds.has(src.id) && connectedNodeIds.has(tgt.id);

              return (
                <line
                  key={`link-${idx}`}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isHighlighted ? 'var(--color-sage-light)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeDasharray={isHighlighted ? 'none' : '4,4'}
                  opacity={isHighlighted ? 0.9 : 0.35}
                />
              );
            })}

            {/* Nodes */}
            {GRAPH_DATA.nodes.map((node) => {
              const theme = NODE_THEMES[node.type];
              const isSelected = selectedNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const opacity = !selectedNodeId || isConnected ? 1.0 : 0.25;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ cursor: 'pointer', opacity, transition: 'all 0.2s ease' }}
                >
                  {/* Outer Glow Halo for selected */}
                  {isSelected && (
                    <circle r="26" fill="none" stroke={theme.stroke} strokeWidth="2" strokeDasharray="3,3">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="10s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Node Shape */}
                  {node.type === 'hub' ? (
                    <rect
                      x="-14"
                      y="-14"
                      width="28"
                      height="28"
                      transform="rotate(45)"
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                  ) : node.type === 'channel' ? (
                    <rect
                      x="-16"
                      y="-12"
                      width="32"
                      height="24"
                      rx="4"
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                  ) : node.type === 'legal' ? (
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="20"
                      rx="8"
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                  ) : (
                    <circle
                      r="16"
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                  )}

                  {/* Label */}
                  <text
                    y="30"
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : theme.text}
                    fontSize="10"
                    fontWeight={isSelected ? 700 : 500}
                    fontFamily="var(--font-sans)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.label.length > 24 ? `${node.label.slice(0, 22)}…` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Tactical Node Dossier Panel */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: NODE_THEMES[selectedNode.type].fill,
                    border: `1px solid ${NODE_THEMES[selectedNode.type].stroke}`,
                    color: NODE_THEMES[selectedNode.type].stroke,
                  }}
                >
                  {selectedNode.type.toUpperCase()}
                </span>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedNode.id}
                </span>
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                {selectedNode.label}
              </h4>

              {/* Node Specific Metadata */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--bg-base)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {selectedNode.scale && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Volume: </span>
                    <strong style={{ color: '#F87171' }}>{selectedNode.scale}</strong>
                  </div>
                )}
                {selectedNode.codename && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>CBI / Police Operation: </span>
                    <strong style={{ color: 'var(--color-sage-light)' }}>{selectedNode.codename}</strong>
                  </div>
                )}
                {selectedNode.target && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target Demographic: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.target}</strong>
                  </div>
                )}
                {selectedNode.loss && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Average Ticket Size: </span>
                    <strong style={{ color: '#FBBF24' }}>{selectedNode.loss}</strong>
                  </div>
                )}
                {selectedNode.vector && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Laundering Vector: </span>
                    <strong style={{ color: 'var(--color-mauve-light)' }}>{selectedNode.vector}</strong>
                  </div>
                )}
                {selectedNode.statute && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Statutory Code: </span>
                    <strong style={{ color: 'var(--color-sage-light)' }}>{selectedNode.statute}</strong>
                  </div>
                )}
              </div>

              {/* Connected Entities Count */}
              <div style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Connected Pathways:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {adjacency.get(selectedNode.id)?.size || 0}
                </strong>{' '}
                direct operational links across syndicate grid.
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Click any node in the topology canvas to inspect syndicate links.
            </div>
          )}

          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(80, 118, 86, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Operational Note:</strong> Mapped using intelligence from I4C, CBI Operation Chakra chargesheets, and NCRB 2023 statutory classifications.
          </div>
        </div>
      </div>
    </div>
  );
}
