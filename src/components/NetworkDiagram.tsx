import { useState, useCallback } from 'react';
import { networkNodes, networkConnections } from '../data/nodes';
import type { NetworkNode, NetworkConnection } from '../data/nodes';
import { ZoneBadge } from './ZoneBadge';

// Zone rectangles layout for the SVG diagram
interface ZoneRect {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  textColor: string;
}

const zoneRects: ZoneRect[] = [
  { id: 'perimetro', label: 'ZONA DE PERÍMETRO EXTERNO', x: 200, y: 10, w: 420, h: 130, color: '#CFD8DC', textColor: '#37474F' },
  { id: 'nucleo', label: 'NÚCLEO DE SEGURIDAD PERIMETRAL', x: 300, y: 185, w: 420, h: 220, color: '#EDE7F6', textColor: '#4A148C' },
  { id: 'dmz', label: 'ZONA DESMILITARIZADA (DMZ)', x: 10, y: 295, w: 240, h: 150, color: '#FFF3E0', textColor: '#E67E22' },
  { id: 'oficinas', label: 'RED INTERNA — OFICINAS ADMINISTRATIVAS', x: 620, y: 220, w: 230, h: 270, color: '#E3F2FD', textColor: '#1565C0' },
  { id: 'critica', label: 'RED CRÍTICA AISLADA — ALTA SEGURIDAD', x: 10, y: 485, w: 540, h: 230, color: '#FFEBEE', textColor: '#8B0000' },
];

// Simplified node positions for the SVG (within 820x750 viewBox)
interface SVGNode {
  id: string;
  label: string;
  sublabel?: string;
  cx: number;
  cy: number;
  zone: string;
  shape: 'circle' | 'hexagon' | 'diamond' | 'rect';
  r: number;
}

const svgNodes: SVGNode[] = [
  { id: 'internet', label: 'INTERNET', sublabel: 'Clientes / Público General', cx: 490, cy: 75, zone: 'perimetro', shape: 'circle', r: 42 },
  { id: 'vpn', label: 'Túnel VPN', sublabel: 'Site-to-Site', cx: 280, cy: 75, zone: 'perimetro', shape: 'rect', r: 38 },
  { id: 'ngfw', label: 'NGFW', sublabel: 'Firewall Nueva Gen.', cx: 460, cy: 270, zone: 'nucleo', shape: 'hexagon', r: 48 },
  { id: 'ids', label: 'IDS / IPS', sublabel: 'Detección de Intrusos', cx: 620, cy: 330, zone: 'nucleo', shape: 'diamond', r: 38 },
  { id: 'webserver', label: 'Servidor Banca', sublabel: 'Plataforma Web', cx: 125, cy: 370, zone: 'dmz', shape: 'circle', r: 42 },
  { id: 'sw-oficinas', label: 'Switch Dist.', sublabel: 'Oficinas', cx: 730, cy: 280, zone: 'oficinas', shape: 'diamond', r: 30 },
  { id: 'pc-gerencia', label: 'PCs Gerencia', sublabel: 'Admin', cx: 685, cy: 430, zone: 'oficinas', shape: 'circle', r: 28 },
  { id: 'pc-empleados', label: 'PCs Empleados', sublabel: 'Operación', cx: 780, cy: 430, zone: 'oficinas', shape: 'circle', r: 28 },
  { id: 'sw-core', label: 'Switch Core', sublabel: 'Air-Gapped', cx: 260, cy: 540, zone: 'critica', shape: 'diamond', r: 36 },
  { id: 'atm', label: 'Cajeros ATM', sublabel: 'Red Dedicada', cx: 110, cy: 660, zone: 'critica', shape: 'circle', r: 42 },
  { id: 'datacenter', label: 'Datacenter', sublabel: 'Core Bancario', cx: 390, cy: 660, zone: 'critica', shape: 'circle', r: 42 },
];

// Connection paths
interface SVGConnection {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  style: 'solid' | 'dashed' | 'danger';
  bidirectional?: boolean;
}

const svgConnections: SVGConnection[] = [
  { id: 'internet-ngfw', fromId: 'internet', toId: 'ngfw', label: 'HTTPS 443', style: 'solid' },
  { id: 'vpn-ngfw', fromId: 'vpn', toId: 'ngfw', label: 'IPSec', style: 'solid' },
  { id: 'ngfw-dmz', fromId: 'ngfw', toId: 'webserver', label: 'Solo HTTPS', style: 'solid' },
  { id: 'ngfw-oficinas', fromId: 'ngfw', toId: 'sw-oficinas', label: 'Proxy Web', style: 'solid' },
  { id: 'ngfw-critica', fromId: 'ngfw', toId: 'sw-core', label: 'BLOQUEADO', style: 'danger' },
  { id: 'ngfw-ids', fromId: 'ngfw', toId: 'ids', label: 'SPAN Port', style: 'dashed', bidirectional: true },
  { id: 'dmz-critica', fromId: 'webserver', toId: 'sw-core', label: 'BD 1433/3306', style: 'dashed' },
  { id: 'sw-core-atm', fromId: 'sw-core', toId: 'atm', label: 'Propietario', style: 'solid' },
  { id: 'sw-core-dc', fromId: 'sw-core', toId: 'datacenter', label: 'Interno', style: 'solid' },
  { id: 'sw-oficinas-gerencia', fromId: 'sw-oficinas', toId: 'pc-gerencia', label: 'VLAN 21', style: 'solid' },
  { id: 'sw-oficinas-empleados', fromId: 'sw-oficinas', toId: 'pc-empleados', label: 'VLAN 20', style: 'solid' },
];

function getNodePos(id: string) {
  return svgNodes.find(n => n.id === id);
}

function getZoneColor(zone: string): string {
  const colors: Record<string, string> = {
    nucleo: '#4A148C',
    dmz: '#E67E22',
    oficinas: '#1565C0',
    critica: '#8B0000',
    perimetro: '#37474F',
  };
  return colors[zone] || '#999';
}

function HexagonPath({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
  return <polygon points={points} />;
}

function DiamondPath({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <polygon
      points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
    />
  );
}

interface NodeDrawerProps {
  node: NetworkNode | null;
  onClose: () => void;
}

function NodeDrawer({ node, onClose }: NodeDrawerProps) {
  if (!node) return null;
  const riskColor = node.risk === 'alto' ? 'bg-red-600' : node.risk === 'medio' ? 'bg-orange-500' : 'bg-green-600';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="drawer-slide w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ backgroundColor: getZoneColor(node.zone) }} className="px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-white">{node.label}</h3>
              {node.sublabel && <p className="text-white/80 text-sm mt-1">{node.sublabel}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none ml-4 flex-shrink-0"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Zone */}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Zona de Red</span>
            <div className="mt-1">
              <ZoneBadge zone={node.zone as any} size="md" />
            </div>
          </div>

          {/* IP */}
          {node.ip && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección IP</span>
              <p className="mt-1 font-mono text-lg font-bold text-navy">{node.ip}</p>
            </div>
          )}

          {/* VLAN */}
          {node.vlan && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">VLAN</span>
              <p className="mt-1 font-mono text-base font-semibold text-navy">{node.vlan}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</span>
            <p className="mt-2 text-gray-700 leading-relaxed">{node.description}</p>
          </div>

          {/* Risk level */}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nivel de Riesgo</span>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-bold text-sm ${riskColor}`}>
                {node.risk === 'alto' ? '⚠️' : node.risk === 'medio' ? '🔶' : '✅'}
                {node.risk.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConnectionPopoverProps {
  connection: NetworkConnection | null;
  x: number;
  y: number;
  onClose: () => void;
}

function ConnectionPopover({ connection, x, y, onClose }: ConnectionPopoverProps) {
  if (!connection) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in border-2 border-navy/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-serif font-bold text-navy text-base">{connection.label}</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{connection.detail}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-8 h-1 rounded ${connection.style === 'danger' ? 'bg-red-500' : connection.style === 'dashed' ? 'bg-purple-500' : 'bg-navy'}`}></div>
          <span className="text-xs text-gray-500 capitalize">
            {connection.style === 'danger' ? '🚫 Tráfico bloqueado' : connection.style === 'dashed' ? '📊 Canal de monitoreo/consulta' : '✅ Tráfico permitido'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function NetworkDiagram() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);
  const [connPopoverPos] = useState({ x: 0, y: 0 });
  const [showOriginal, setShowOriginal] = useState(false);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = networkNodes.find(n => n.id === nodeId);
    if (node) setSelectedNode(node);
  }, []);

  const handleConnectionClick = useCallback((connId: string) => {
    const conn = networkConnections.find(c => c.id === connId);
    if (conn) setSelectedConnection(conn);
  }, []);

  const getNodeOpacity = (nodeId: string) => {
    if (!hoveredNode) return 1;
    // Find connections involving the hovered node
    const relatedNodes = new Set([hoveredNode]);
    svgConnections.forEach(c => {
      if (c.fromId === hoveredNode) relatedNodes.add(c.toId);
      if (c.toId === hoveredNode) relatedNodes.add(c.fromId);
    });
    return relatedNodes.has(nodeId) ? 1 : 0.25;
  };

  const getConnOpacity = (conn: SVGConnection) => {
    if (!hoveredNode) return 1;
    return (conn.fromId === hoveredNode || conn.toId === hoveredNode) ? 1 : 0.1;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="gradient-navy px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <h3 className="font-serif text-xl font-bold text-white">Diagrama de Arquitectura de Red</h3>
            <p className="text-blue-200 text-sm mt-0.5">Click en nodos para detalles · Hover para resaltar conexiones</p>
          </div>
        </div>
        <button
          onClick={() => setShowOriginal(true)}
          className="flex items-center gap-2 bg-gold hover:bg-gold-light text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
        >
          🖼️ Ver diagrama original
        </button>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-surface border-b border-gray-100 flex flex-wrap gap-4 text-xs">
        {[
          { color: '#37474F', label: 'Perímetro' },
          { color: '#4A148C', label: 'Núcleo/Firewall' },
          { color: '#E67E22', label: 'DMZ' },
          { color: '#1565C0', label: 'Oficinas' },
          { color: '#8B0000', label: 'Red Crítica' },
        ].map(z => (
          <div key={z.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: z.color }}></div>
            <span className="text-gray-600 font-medium">{z.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-navy"></div>
          <span className="text-gray-600">Permitido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-red-500 border-dashed"></div>
          <span className="text-gray-600">Bloqueado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-purple-500" style={{ borderTop: '2px dashed #7c3aed' }}></div>
          <span className="text-gray-600">Monitoreo</span>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="p-4 overflow-x-auto">
        <svg
          viewBox="0 0 820 750"
          className="w-full max-w-4xl mx-auto"
          style={{ minWidth: '640px', height: 'auto' }}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#162447" />
            </marker>
            <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#DC2626" />
            </marker>
            <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#7c3aed" />
            </marker>
            <marker id="arrow-back" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
              <path d="M0,0 L0,8 L8,4 Z" fill="#7c3aed" />
            </marker>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Zone backgrounds */}
          {zoneRects.map(z => (
            <g key={z.id}>
              <rect
                x={z.x} y={z.y} width={z.w} height={z.h}
                fill={z.color}
                stroke={z.textColor}
                strokeWidth="1.5"
                strokeDasharray={z.id === 'critica' ? '6,3' : 'none'}
                rx="8"
                opacity="0.85"
              />
              <text
                x={z.x + 10} y={z.y + 18}
                fontSize="9"
                fontWeight="700"
                fill={z.textColor}
                letterSpacing="0.5"
                style={{ textTransform: 'uppercase' }}
              >
                {z.label}
              </text>
            </g>
          ))}

          {/* Connections */}
          {svgConnections.map(conn => {
            const from = svgNodes.find(n => n.id === conn.fromId);
            const to = svgNodes.find(n => n.id === conn.toId);
            if (!from || !to) return null;

            const isHovered = hoveredNode === conn.fromId || hoveredNode === conn.toId;
            const opacity = getConnOpacity(conn);
            const color = conn.style === 'danger' ? '#DC2626' : conn.style === 'dashed' ? '#7c3aed' : '#162447';
            const markerId = conn.style === 'danger' ? 'url(#arrow-red)' : conn.style === 'dashed' ? 'url(#arrow-purple)' : 'url(#arrow)';

            // Calculate line direction for shortening
            const dx = to.cx - from.cx;
            const dy = to.cy - from.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;
            const startR = from.r + 5;
            const endR = to.r + 8;

            const x1 = from.cx + nx * startR;
            const y1 = from.cy + ny * startR;
            const x2 = to.cx - nx * endR;
            const y2 = to.cy - ny * endR;

            // Midpoint for label
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g
                key={conn.id}
                style={{ opacity, transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onClick={() => handleConnectionClick(conn.id)}
              >
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray={conn.style === 'dashed' ? '6,4' : conn.style === 'danger' ? '8,4' : 'none'}
                  markerEnd={markerId}
                  markerStart={conn.bidirectional ? 'url(#arrow-back)' : undefined}
                />
                {/* Invisible thick line for easier clicking */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="transparent"
                  strokeWidth="20"
                />
                {/* Label */}
                {isHovered && (
                  <g>
                    <rect
                      x={mx - 32} y={my - 10}
                      width="64" height="18"
                      rx="4" fill="white"
                      stroke={color}
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x={mx} y={my + 4}
                      textAnchor="middle"
                      fontSize="8"
                      fill={color}
                      fontWeight="600"
                    >
                      {conn.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {svgNodes.map(node => {
            const color = getZoneColor(node.zone);
            const opacity = getNodeOpacity(node.id);
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                style={{
                  opacity,
                  transition: 'opacity 0.2s ease',
                  cursor: 'pointer',
                  filter: isHovered ? `drop-shadow(0 0 8px ${color}88)` : 'url(#shadow)',
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node.id)}
              >
                {node.shape === 'circle' && (
                  <circle cx={node.cx} cy={node.cy} r={node.r} fill={color} />
                )}
                {node.shape === 'hexagon' && (
                  <HexagonPath cx={node.cx} cy={node.cy} r={node.r} />
                )}
                {node.shape === 'diamond' && (
                  <DiamondPath cx={node.cx} cy={node.cy} r={node.r} />
                )}
                {node.shape === 'rect' && (
                  <rect
                    x={node.cx - node.r * 1.4} y={node.cy - node.r * 0.7}
                    width={node.r * 2.8} height={node.r * 1.4}
                    rx="6" fill={color}
                  />
                )}
                {/* Inner lighter circle for depth */}
                {node.shape === 'circle' && (
                  <circle cx={node.cx} cy={node.cy} r={node.r * 0.7} fill="rgba(255,255,255,0.12)" />
                )}
                {/* Label */}
                <text
                  x={node.cx} y={node.cy - 4}
                  textAnchor="middle"
                  fontSize={node.r > 40 ? "9" : "8"}
                  fontWeight="700"
                  fill="white"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={node.cx} y={node.cy + 8}
                    textAnchor="middle"
                    fontSize="7"
                    fill="rgba(255,255,255,0.8)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.sublabel}
                  </text>
                )}
                {/* Hover ring */}
                {isHovered && (
                  <circle
                    cx={node.cx} cy={node.cy} r={node.r + 6}
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="2"
                    opacity="0.8"
                    style={{ animation: 'pulse 1.5s infinite' }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Drawer */}
      {selectedNode && (
        <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}

      {/* Connection Popover */}
      {selectedConnection && (
        <ConnectionPopover
          connection={selectedConnection}
          x={connPopoverPos.x}
          y={connPopoverPos.y}
          onClose={() => setSelectedConnection(null)}
        />
      )}

      {/* Original Diagram Modal */}
      {showOriginal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowOriginal(false)}
        >
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setShowOriginal(false)}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-gold"
            >
              ×
            </button>
            <img
              src="/diagrama-red.png"
              alt="Diagrama de red original"
              className="w-full rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
