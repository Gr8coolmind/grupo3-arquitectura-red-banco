import { useState } from 'react';
import {
  firewallOrigins,
  firewallDestinations,
  firewallProtocols,
  evaluateFirewall,
} from '../data/firewall';
import type {
  FirewallOrigin,
  FirewallDestination,
  FirewallProtocol,
} from '../data/firewall';

export function RuleSimulator() {
  const [origin, setOrigin] = useState<FirewallOrigin>('Internet');
  const [destination, setDestination] = useState<FirewallDestination>('DMZ');
  const [protocol, setProtocol] = useState<FirewallProtocol>('HTTPS (443)');
  const [result, setResult] = useState<ReturnType<typeof evaluateFirewall> | null>(null);
  const [key, setKey] = useState(0);

  const handleEvaluate = () => {
    const r = evaluateFirewall(origin, destination, protocol);
    setResult(r);
    setKey(k => k + 1);
  };

  const selectClass =
    'w-full bg-white border-2 border-navy/20 rounded-xl px-4 py-3 text-navy font-medium focus:outline-none focus:border-gold transition-colors cursor-pointer hover:border-navy/40';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="gradient-navy px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <h3 className="font-serif text-xl font-bold text-white">Simulador de Reglas de Firewall</h3>
            <p className="text-blue-200 text-sm mt-0.5">Evalúa si el tráfico sería permitido o bloqueado por el NGFW</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-navy/70 mb-2 uppercase tracking-wide">
              🌐 Origen
            </label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value as FirewallOrigin)}
              className={selectClass}
            >
              {firewallOrigins.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy/70 mb-2 uppercase tracking-wide">
              🎯 Destino
            </label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value as FirewallDestination)}
              className={selectClass}
            >
              {firewallDestinations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy/70 mb-2 uppercase tracking-wide">
              📡 Protocolo / Puerto
            </label>
            <select
              value={protocol}
              onChange={e => setProtocol(e.target.value as FirewallProtocol)}
              className={selectClass}
            >
              {firewallProtocols.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Traffic visualization */}
        <div className="flex items-center justify-center gap-3 mb-6 bg-surface rounded-xl p-4">
          <div className="bg-navy text-white px-4 py-2 rounded-lg font-semibold text-sm">
            {origin}
          </div>
          <div className="flex items-center gap-1 text-navy/50">
            <div className="h-0.5 w-12 bg-navy/30"></div>
            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-navy/20">{protocol}</span>
            <div className="h-0.5 w-12 bg-navy/30"></div>
            <span className="text-navy/50">→</span>
          </div>
          <div className="bg-navy text-white px-4 py-2 rounded-lg font-semibold text-sm">
            {destination}
          </div>
        </div>

        {/* Evaluate button */}
        <button
          onClick={handleEvaluate}
          className="w-full bg-gold hover:bg-gold-light text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-gold/30 active:scale-95 text-lg"
        >
          🔍 Evaluar Regla
        </button>

        {/* Result */}
        {result && (
          <div
            key={key}
            className={`mt-6 result-pop rounded-2xl overflow-hidden border-2 ${
              result.allowed
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
            }`}
          >
            {/* Result header */}
            <div className={`px-6 py-4 flex items-center gap-4 ${result.allowed ? 'bg-green-500' : 'bg-red-600'}`}>
              <span className="text-4xl">{result.allowed ? '✅' : '🚫'}</span>
              <div>
                <div className="text-white font-bold text-2xl font-serif">
                  {result.allowed ? 'PERMITIDO' : 'BLOQUEADO'}
                </div>
                {result.rule && (
                  <div className="text-white/80 text-xs font-mono mt-0.5">{result.rule}</div>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="px-6 py-4">
              <p className={`text-base leading-relaxed ${result.allowed ? 'text-green-900' : 'text-red-900'}`}>
                {result.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Quick test examples */}
        {!result && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setOrigin('Internet');
                setDestination('DMZ');
                setProtocol('HTTPS (443)');
                setTimeout(() => {
                  setResult(evaluateFirewall('Internet', 'DMZ', 'HTTPS (443)'));
                  setKey(k => k + 1);
                }, 50);
              }}
              className="text-xs bg-green-50 border border-green-200 text-green-800 rounded-lg px-3 py-2 hover:bg-green-100 transition-colors text-left"
            >
              <span className="font-semibold">✅ Probar permitido:</span>
              <br />Internet → DMZ | HTTPS
            </button>
            <button
              onClick={() => {
                setOrigin('Oficinas');
                setDestination('Red Crítica');
                setProtocol('SQL (1433/3306)');
                setTimeout(() => {
                  setResult(evaluateFirewall('Oficinas', 'Red Crítica', 'SQL (1433/3306)'));
                  setKey(k => k + 1);
                }, 50);
              }}
              className="text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 hover:bg-red-100 transition-colors text-left"
            >
              <span className="font-semibold">🚫 Probar bloqueado:</span>
              <br />Oficinas → Red Crítica | SQL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
