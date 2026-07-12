import type { Zone } from '../data/nodes';

const zoneConfig: Record<Zone, { label: string; bg: string; text: string; border: string }> = {
  nucleo: { label: 'Núcleo', bg: 'bg-purple-900', text: 'text-purple-100', border: 'border-purple-500' },
  dmz: { label: 'DMZ', bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-400' },
  oficinas: { label: 'Oficinas', bg: 'bg-blue-700', text: 'text-white', border: 'border-blue-400' },
  critica: { label: 'Red Crítica', bg: 'bg-red-900', text: 'text-red-100', border: 'border-red-500' },
  perimetro: { label: 'Perímetro', bg: 'bg-slate-600', text: 'text-slate-100', border: 'border-slate-400' },
};

export function ZoneBadge({ zone, size = 'sm' }: { zone: Zone; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = zoneConfig[zone];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'md' ? 'text-sm px-3 py-1' : 'text-base px-4 py-1.5';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}>
      {cfg.label}
    </span>
  );
}

export function zoneColor(zone: Zone): string {
  const colors: Record<Zone, string> = {
    nucleo: '#4A148C',
    dmz: '#E67E22',
    oficinas: '#1565C0',
    critica: '#8B0000',
    perimetro: '#37474F',
  };
  return colors[zone];
}

export function zoneLabel(zone: Zone): string {
  return zoneConfig[zone].label;
}
