import { useState, useMemo } from 'react';
import { ipTable } from '../data/firewall';

type ZoneFilter = 'all' | 'nucleo' | 'dmz' | 'oficinas' | 'critica';

const zoneMeta: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  nucleo: { label: 'Núcleo', bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-600' },
  dmz: { label: 'DMZ', bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  oficinas: { label: 'Oficinas', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-600' },
  critica: { label: 'Red Crítica', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-700' },
};

export function IPTable() {
  const [filter, setFilter] = useState<ZoneFilter>('all');
  const [sortBy, setSortBy] = useState<'device' | 'zone' | 'ip' | 'vlan'>('zone');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let data = filter === 'all' ? ipTable : ipTable.filter(e => e.zoneKey === filter);
    data = [...data].sort((a, b) => {
      const va = a[sortBy] || '';
      const vb = b[sortBy] || '';
      const cmp = va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [filter, sortBy, sortDir]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const thClass = (col: typeof sortBy) =>
    `px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:bg-navy/80 transition-colors ${sortBy === col ? 'text-gold' : 'text-blue-200'}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="gradient-navy px-6 py-5 flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <div>
          <h3 className="font-serif text-xl font-bold text-white">Tabla de Direccionamiento IP</h3>
          <p className="text-blue-200 text-sm mt-0.5">Filtrable por zona · Click en columna para ordenar</p>
        </div>
      </div>

      {/* Zone filter */}
      <div className="px-6 py-4 bg-surface border-b border-gray-100 flex flex-wrap gap-2">
        {(['all', 'nucleo', 'dmz', 'oficinas', 'critica'] as ZoneFilter[]).map(z => (
          <button
            key={z}
            onClick={() => setFilter(z)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === z
                ? 'bg-navy text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-navy/40'
            }`}
          >
            {z === 'all' ? 'Todas las zonas' : zoneMeta[z]?.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-navy">
            <tr>
              <th className={thClass('device')} onClick={() => handleSort('device')}>
                Dispositivo {sortBy === 'device' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className={thClass('zone')} onClick={() => handleSort('zone')}>
                Zona {sortBy === 'zone' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className={thClass('ip')} onClick={() => handleSort('ip')}>
                Dirección IP {sortBy === 'ip' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className={thClass('vlan')} onClick={() => handleSort('vlan')}>
                VLAN {sortBy === 'vlan' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => {
              const meta = zoneMeta[entry.zoneKey];
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-100 hover:bg-surface transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-4 py-3 font-medium text-navy text-sm">{entry.device}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta?.bg} ${meta?.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta?.dot}`}></span>
                      {entry.zone}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">{entry.ip}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{entry.vlan || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-surface text-xs text-gray-500 border-t border-gray-100">
        Mostrando {filtered.length} de {ipTable.length} dispositivos
      </div>
    </div>
  );
}
