import { useEffect, useCallback, useState } from 'react';
import { slides } from '../data/slides';
import type { Slide } from '../data/slides';
import { ipTable } from '../data/firewall';

interface PresentationModeProps {
  onExit: () => void;
}

function CoverSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/10"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gold/8"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold/5"></div>
      </div>

      {/* Gold accent top bar */}
      <div className="w-24 h-1 bg-gold mb-8 rounded-full"></div>

      {/* Tag */}
      {slide.tag && (
        <div className="mb-6 animate-fade-in">
          <span className="text-xs font-bold tracking-[0.3em] text-gold uppercase border border-gold/50 px-4 py-1.5 rounded-full">
            {slide.tag}
          </span>
        </div>
      )}

      {/* Main title */}
      <h1 className="font-serif text-5xl md:text-6xl font-black text-white leading-tight mb-6 text-shadow animate-slide-up">
        {slide.title}
      </h1>

      {/* Subtitle */}
      {slide.subtitle && (
        <p className="text-blue-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 animate-fade-in">
          {slide.subtitle}
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px w-16 bg-gold/40"></div>
        <div className="w-2 h-2 rounded-full bg-gold"></div>
        <div className="h-px w-16 bg-gold/40"></div>
      </div>

      {/* Group info */}
      {slide.body && (
        <p className="text-white font-semibold text-base tracking-wide">{slide.body}</p>
      )}
      {slide.footer && (
        <p className="text-blue-300 text-sm mt-2">{slide.footer}</p>
      )}
    </div>
  );
}

function ObjectiveSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex h-full gap-6 px-12 py-8">
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-12 h-1 bg-navy mb-6 rounded-full"></div>
        <h2 className="font-serif text-4xl font-bold text-navy mb-6">{slide.title}</h2>
        <p className="text-gray-700 text-base leading-relaxed mb-8 max-w-xl">{slide.body}</p>

        {slide.points && (
          <div className="grid grid-cols-2 gap-3">
            {slide.points.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-navy/5 rounded-xl p-4 border border-navy/10 card-hover">
                <span className="text-2xl flex-shrink-0">{p.icon}</span>
                <div>
                  <div className="font-bold text-navy text-base">{p.text}</div>
                  {p.sub && <div className="text-gray-600 text-xs mt-0.5">{p.sub}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      {slide.sidePanel && (
        <div className="w-64 flex-shrink-0 gradient-navy rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-gold text-xs font-bold uppercase tracking-wider mb-3">{slide.sidePanel.title}</div>
          <p className="text-blue-100 text-sm leading-relaxed">{slide.sidePanel.body}</p>
        </div>
      )}
    </div>
  );
}

function CardsSlide({ slide, dark = false }: { slide: Slide; dark?: boolean }) {
  const gridCols = (slide.cards?.length ?? 0) <= 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
  return (
    <div className="flex flex-col h-full px-12 py-8 justify-center">
      <div className={`w-12 h-1 mb-5 rounded-full ${dark ? 'bg-gold' : 'bg-navy'}`}></div>
      <h2 className={`font-serif text-4xl font-bold mb-8 ${dark ? 'text-white' : 'text-navy'}`}>
        {slide.title}
      </h2>
      <div className={`grid ${gridCols} gap-5`}>
        {slide.cards?.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 flex flex-col gap-3 card-hover ${
              dark
                ? 'glass border border-gold/20'
                : 'bg-white border border-gray-100 shadow-md'
            }`}
          >
            {card.icon && <span className="text-3xl">{card.icon}</span>}
            <div>
              <div
                className={`font-bold text-lg mb-1 ${dark ? 'text-white' : 'text-navy'}`}
                style={!dark && card.color ? { color: card.color } : {}}
              >
                {card.title}
              </div>
              <p className={`text-sm leading-relaxed ${dark ? 'text-blue-200' : 'text-gray-600'}`}>
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlsSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col h-full px-12 py-8 justify-center">
      <div className="w-12 h-1 bg-gold mb-5 rounded-full"></div>
      <h2 className="font-serif text-4xl font-bold text-white mb-10">{slide.title}</h2>
      <div className="space-y-5">
        {slide.cards?.map((card, i) => (
          <div key={i} className="flex items-start gap-5 glass rounded-2xl p-6 border border-gold/20">
            <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center text-2xl flex-shrink-0 border border-gold/30">
              {card.icon}
            </div>
            <div>
              <div className="font-bold text-gold text-xl mb-2">{card.title}</div>
              <p className="text-blue-100 text-sm leading-relaxed">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagramSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col h-full px-12 py-6 justify-center items-center">
      <div className="w-12 h-1 bg-navy mb-4 rounded-full self-start"></div>
      <h2 className="font-serif text-3xl font-bold text-navy mb-4 self-start">{slide.title}</h2>
      <div className="flex-1 flex items-center justify-center w-full">
        <img
          src="/diagrama-red.png"
          alt="Diagrama de arquitectura de red"
          className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        />
      </div>
      {slide.caption && (
        <p className="text-gray-500 text-xs mt-3 italic text-center">{slide.caption}</p>
      )}
      {slide.note && (
        <div className="mt-3 bg-navy text-white text-xs px-4 py-2 rounded-lg max-w-3xl text-center">
          <span className="text-gold font-bold">⚠️ Regla clave: </span>
          {slide.note.replace('Regla clave: ', '')}
        </div>
      )}
    </div>
  );
}

function IPTableSlide() {
  const zones = ['Núcleo', 'DMZ', 'Oficinas', 'Red Crítica'];
  const zoneColors: Record<string, string> = {
    'Núcleo': '#4A148C',
    'DMZ': '#E67E22',
    'Oficinas': '#1565C0',
    'Red Crítica': '#8B0000',
  };
  return (
    <div className="flex flex-col h-full px-12 py-6 justify-center">
      <div className="w-12 h-1 bg-navy mb-4 rounded-full"></div>
      <h2 className="font-serif text-3xl font-bold text-navy mb-5">Direccionamiento IP</h2>
      <div className="overflow-auto rounded-xl shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-white">
              <th className="px-4 py-3 text-left font-semibold">Dispositivo</th>
              <th className="px-4 py-3 text-left font-semibold">Zona</th>
              <th className="px-4 py-3 text-left font-semibold font-mono">Dirección IP</th>
              <th className="px-4 py-3 text-left font-semibold">VLAN</th>
            </tr>
          </thead>
          <tbody>
            {ipTable.map((entry, i) => {
              const color = zoneColors[entry.zone] || '#162447';
              return (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2.5 font-medium text-navy">{entry.device}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: color }}>
                      {entry.zone}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-700">{entry.ip}</td>
                  <td className="px-4 py-2.5 text-gray-600">{entry.vlan || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FirewallRulesSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col h-full px-12 py-6 justify-center">
      <div className="w-12 h-1 bg-navy mb-4 rounded-full"></div>
      <h2 className="font-serif text-3xl font-bold text-navy mb-6">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* PERMIT column */}
        <div className="bg-green-50 rounded-2xl overflow-hidden border border-green-200">
          <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-bold text-white text-lg">PERMITIR</span>
          </div>
          <div className="p-4 space-y-2">
            {slide.columns?.permit.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 text-xs border border-green-100">
                <span className="text-green-500 mt-0.5 flex-shrink-0">●</span>
                <span className="text-gray-700">{rule}</span>
              </div>
            ))}
          </div>
        </div>
        {/* BLOCK column */}
        <div className="bg-red-50 rounded-2xl overflow-hidden border border-red-200">
          <div className="bg-red-600 px-5 py-3 flex items-center gap-2">
            <span className="text-xl">🚫</span>
            <span className="font-bold text-white text-lg">BLOQUEAR</span>
          </div>
          <div className="p-4 space-y-2">
            {slide.columns?.block.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 text-xs border border-red-100">
                <span className="text-red-500 mt-0.5 flex-shrink-0">●</span>
                <span className="text-gray-700">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IsolatedSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col h-full px-12 py-8 justify-center">
      <div className="w-12 h-1 bg-gold mb-5 rounded-full"></div>
      <h2 className="font-serif text-4xl font-bold text-white mb-6">{slide.title}</h2>
      {slide.highlight && (
        <div className="bg-gold/20 border border-gold/40 rounded-2xl px-6 py-4 mb-8">
          <p className="text-gold font-semibold text-base leading-relaxed">⚠️ {slide.highlight}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {slide.points?.map((p, i) => (
          <div key={i} className="glass border border-gold/20 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">{p.icon}</span>
            <div>
              <div className="font-bold text-white text-base mb-1">{p.text}</div>
              {p.sub && <div className="text-blue-200 text-xs leading-relaxed">{p.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConclusionSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/8"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gold/6"></div>
      </div>

      <div className="w-20 h-1 bg-gold mb-8 rounded-full"></div>
      <h2 className="font-serif text-4xl md:text-5xl font-black text-white leading-tight mb-8 text-shadow max-w-3xl">
        {slide.title}
      </h2>
      <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mb-12">
        {slide.body}
      </p>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px w-16 bg-gold/40"></div>
        <div className="text-3xl">🏦</div>
        <div className="h-px w-16 bg-gold/40"></div>
      </div>
      {slide.footer && (
        <p className="text-blue-300 text-sm mb-4">{slide.footer}</p>
      )}
      <div className="text-4xl font-serif font-black text-gold">¡Gracias!</div>
    </div>
  );
}

function renderSlide(slide: Slide) {
  switch (slide.type) {
    case 'cover': return <CoverSlide slide={slide} />;
    case 'objective': return <ObjectiveSlide slide={slide} />;
    case 'elements': return <CardsSlide slide={slide} />;
    case 'controls': return <ControlsSlide slide={slide} />;
    case 'diagram': return <DiagramSlide slide={slide} />;
    case 'ip-table': return <IPTableSlide />;
    case 'firewall-rules': return <FirewallRulesSlide slide={slide} />;
    case 'services': return <CardsSlide slide={slide} />;
    case 'isolated': return <IsolatedSlide slide={slide} />;
    case 'risks': return <CardsSlide slide={slide} />;
    case 'practices': return <CardsSlide slide={slide} />;
    case 'conclusion': return <ConclusionSlide slide={slide} />;
    default: return null;
  }
}

export function PresentationMode({ onExit }: PresentationModeProps) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [dir, setDir] = useState<'forward' | 'back'>('forward');
  const total = slides.length;

  const goTo = useCallback((index: number, direction: 'forward' | 'back' = 'forward') => {
    if (index < 0 || index >= total) return;
    setDir(direction);
    setAnimKey(k => k + 1);
    setCurrent(index);
  }, [total]);

  const next = useCallback(() => goTo(current + 1, 'forward'), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, 'back'), [current, goTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, onExit]);

  const slide = slides[current];
  const isNavy = slide.background === 'navy';

  return (
    <div className={`presentation-mode flex flex-col ${isNavy ? 'gradient-navy' : 'bg-surface'}`}>
      {/* Top bar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${isNavy ? 'border-white/10' : 'border-gray-200'} z-10`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">🏦</span>
          <span className={`font-serif font-bold text-sm ${isNavy ? 'text-gold' : 'text-navy'}`}>
            Arquitectura de Red Segura · Grupo 3
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm ${isNavy ? 'text-blue-300' : 'text-gray-500'}`}>
            {current + 1} / {total}
          </span>
          <button
            onClick={onExit}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              isNavy
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-navy/10 text-navy hover:bg-navy/20'
            }`}
          >
            ✕ Salir
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-hidden relative">
        <div
          key={animKey}
          className={`h-full slide-enter`}
          style={{ animation: `fadeIn 0.4s ease-out` }}
        >
          {renderSlide(slide)}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          disabled={current === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
            current === 0
              ? 'opacity-20 cursor-not-allowed'
              : isNavy
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-navy/10 text-navy hover:bg-navy/20'
          }`}
          aria-label="Diapositiva anterior"
        >
          ‹
        </button>
        <button
          onClick={next}
          disabled={current === total - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
            current === total - 1
              ? 'opacity-20 cursor-not-allowed'
              : isNavy
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-navy/10 text-navy hover:bg-navy/20'
          }`}
          aria-label="Siguiente diapositiva"
        >
          ›
        </button>
      </div>

      {/* Bottom bar: dots + counter */}
      <div className={`flex items-center justify-between px-6 py-3 border-t ${isNavy ? 'border-white/10' : 'border-gray-200'}`}>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 'forward' : 'back')}
              className={`slide-dot ${i === current ? 'active' : ''}`}
              aria-label={`Ir a diapositiva ${i + 1}`}
            />
          ))}
        </div>

        {/* Keyboard hint */}
        <div className={`text-xs ${isNavy ? 'text-blue-400' : 'text-gray-400'}`}>
          ← → Navegar · Esc Salir
        </div>
      </div>
    </div>
  );
}
