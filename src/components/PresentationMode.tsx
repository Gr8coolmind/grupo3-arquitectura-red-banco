import { useEffect, useCallback, useState } from 'react';
import { slides } from '../data/slides';
import type { Slide } from '../data/slides';
import { ipTable } from '../data/firewall';

interface PresentationModeProps {
  onExit: () => void;
}

// ─── Shared layout wrapper ───────────────────────────────────────────────────
// Every slide gets this: full dark-navy background with decorative elements
function SlideShell({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #0d1a33 0%, #162447 60%, #1a2d5a 100%)' }}>
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #C9A227, transparent)' }} />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #4A148C, transparent)' }} />
      {accent && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #C9A227, transparent)' }} />}
      {children}
    </div>
  );
}

// ─── Slide number label ───────────────────────────────────────────────────────
function SlideTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center text-xs font-bold tracking-[0.25em] uppercase px-3 py-1 rounded-full border" style={{ color: '#C9A227', borderColor: 'rgba(201,162,39,0.4)', background: 'rgba(201,162,39,0.08)' }}>
      {text}
    </span>
  );
}

// ─── Gold divider ─────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px flex-1 max-w-16" style={{ background: 'rgba(201,162,39,0.35)' }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A227' }} />
      <div className="h-px flex-1 max-w-16" style={{ background: 'rgba(201,162,39,0.35)' }} />
    </div>
  );
}

// ─── Slide title ─────────────────────────────────────────────────────────────
function SlideTitle({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 className={`font-serif font-black text-white leading-tight ${center ? 'text-center' : ''}`} style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
      {children}
    </h2>
  );
}

// ─── 1. PORTADA ──────────────────────────────────────────────────────────────
function CoverSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell accent>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
        {slide.tag && <div className="mb-5"><SlideTag text={slide.tag} /></div>}

        <h1 className="font-serif font-black text-white mb-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.15, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p className="mb-8 max-w-2xl leading-relaxed" style={{ color: 'rgba(147,197,253,0.9)', fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)' }}>
            {slide.subtitle}
          </p>
        )}

        <GoldDivider />

        {slide.body && <p className="font-semibold text-white tracking-wide" style={{ fontSize: '0.95rem' }}>{slide.body}</p>}
        {slide.footer && <p className="mt-2" style={{ color: 'rgba(147,197,253,0.7)', fontSize: '0.85rem' }}>{slide.footer}</p>}
      </div>
    </SlideShell>
  );
}

// ─── 2. OBJETIVO ─────────────────────────────────────────────────────────────
function ObjectiveSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell>
      <div className="flex-1 flex flex-col px-14 py-10 justify-center gap-6">
        <div>
          <SlideTag text="02 · Objetivo" />
          <div className="mt-3"><SlideTitle>{slide.title}</SlideTitle></div>
        </div>

        <p className="leading-relaxed max-w-3xl" style={{ color: 'rgba(191,219,254,0.85)', fontSize: 'clamp(0.82rem, 1.3vw, 0.97rem)' }}>
          {slide.body}
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-3xl">
          {slide.points?.map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,162,39,0.2)' }}>
              <span className="text-2xl flex-shrink-0 leading-none">{p.icon}</span>
              <div>
                <div className="font-bold text-white text-sm">{p.text}</div>
                {p.sub && <div className="text-xs mt-0.5" style={{ color: 'rgba(147,197,253,0.7)' }}>{p.sub}</div>}
              </div>
            </div>
          ))}
        </div>

        {slide.sidePanel && (
          <div className="rounded-xl px-5 py-4 max-w-3xl" style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)' }}>
            <div className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: '#C9A227' }}>{slide.sidePanel.title}</div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(191,219,254,0.8)' }}>{slide.sidePanel.body}</p>
          </div>
        )}
      </div>
    </SlideShell>
  );
}

// ─── Genérico: TARJETAS (slides 3, 8, 10, 11) ─────────────────────────────
function CardsSlide({ slide, tag }: { slide: Slide; tag: string }) {
  const count = slide.cards?.length ?? 0;
  const cols = count <= 3 ? 'repeat(3,1fr)' : count === 4 ? 'repeat(2,1fr)' : 'repeat(3,1fr)';

  return (
    <SlideShell>
      <div className="flex-1 flex flex-col px-12 py-8 justify-center gap-5">
        <div>
          <SlideTag text={tag} />
          <div className="mt-3"><SlideTitle>{slide.title}</SlideTitle></div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: cols }}>
          {slide.cards?.map((card, i) => (
            <div key={i} className="rounded-2xl p-5 flex flex-col gap-2.5" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${card.color ? card.color + '44' : 'rgba(255,255,255,0.1)'}` }}>
              {card.icon && <span className="text-3xl leading-none">{card.icon}</span>}
              <div>
                <div className="font-bold text-sm" style={{ color: card.color || '#C9A227' }}>{card.title}</div>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(191,219,254,0.75)' }}>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// ─── 4. CONTROLES ────────────────────────────────────────────────────────────
function ControlsSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell accent>
      <div className="flex-1 flex flex-col px-12 py-10 justify-center gap-6">
        <div>
          <SlideTag text="04 · Controles" />
          <div className="mt-3"><SlideTitle>{slide.title}</SlideTitle></div>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl">
          {slide.cards?.map((card, i) => (
            <div key={i} className="flex items-start gap-5 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,162,39,0.25)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.35)' }}>
                {card.icon}
              </div>
              <div>
                <div className="font-bold mb-1.5" style={{ color: '#C9A227', fontSize: '1.05rem' }}>{card.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(191,219,254,0.8)' }}>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// ─── 5. DIAGRAMA ─────────────────────────────────────────────────────────────
function DiagramSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell>
      <div className="flex-1 flex flex-col px-10 py-6 items-center justify-center gap-4">
        <div className="text-center">
          <SlideTag text="05 · Diagrama" />
          <div className="mt-2"><SlideTitle center>{slide.title}</SlideTitle></div>
        </div>

        {/* Diagram image */}
        <div className="flex-1 flex items-center justify-center w-full max-w-5xl" style={{ minHeight: 0 }}>
          <img
            src="/diagrama-red.png"
            alt="Diagrama de arquitectura de red bancaria"
            className="max-h-full max-w-full rounded-2xl"
            style={{ objectFit: 'contain', maxHeight: 'calc(100vh - 240px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,162,39,0.2)' }}
          />
        </div>

        {slide.note && (
          <div className="rounded-xl px-5 py-2.5 w-full max-w-4xl text-center" style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(191,219,254,0.85)' }}>
              <span className="font-bold" style={{ color: '#C9A227' }}>⚠ Regla clave: </span>
              {slide.note.replace('Regla clave: ', '')}
            </p>
          </div>
        )}
      </div>
    </SlideShell>
  );
}

// ─── 6. TABLA IP ─────────────────────────────────────────────────────────────
const zoneColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Núcleo':       { bg: 'rgba(74,20,140,0.4)',  text: '#ce93d8', dot: '#ab47bc' },
  'DMZ':          { bg: 'rgba(230,126,34,0.3)',  text: '#ffb74d', dot: '#fb8c00' },
  'Oficinas':     { bg: 'rgba(21,101,192,0.35)', text: '#90caf9', dot: '#1e88e5' },
  'Red Crítica':  { bg: 'rgba(139,0,0,0.4)',     text: '#ef9a9a', dot: '#e53935' },
};

function IPTableSlide() {
  return (
    <SlideShell>
      <div className="flex-1 flex flex-col px-10 py-8 gap-5 justify-center">
        <div>
          <SlideTag text="06 · Direccionamiento IP" />
          <div className="mt-3"><SlideTitle>Tabla de Direccionamiento IP</SlideTitle></div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Table header */}
          <div className="grid grid-cols-4 px-5 py-3" style={{ background: 'rgba(201,162,39,0.15)', borderBottom: '1px solid rgba(201,162,39,0.25)' }}>
            {['Dispositivo', 'Zona', 'Dirección IP', 'VLAN'].map(h => (
              <div key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: '#C9A227' }}>{h}</div>
            ))}
          </div>
          {/* Rows */}
          {ipTable.map((row, i) => {
            const zc = zoneColors[row.zone] || { bg: 'rgba(255,255,255,0.05)', text: '#ccc', dot: '#999' };
            return (
              <div key={i} className="grid grid-cols-4 px-5 py-2.5 items-center" style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', borderBottom: i < ipTable.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div className="text-sm font-medium text-white">{row.device}</div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: zc.bg, color: zc.text }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: zc.dot }} />
                    {row.zone}
                  </span>
                </div>
                <div className="font-mono text-sm" style={{ color: 'rgba(191,219,254,0.9)' }}>{row.ip}</div>
                <div className="text-sm" style={{ color: 'rgba(191,219,254,0.6)' }}>{row.vlan || '—'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}

// ─── 7. REGLAS FIREWALL ───────────────────────────────────────────────────────
function FirewallRulesSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell>
      <div className="flex-1 flex flex-col px-10 py-8 gap-5 justify-center">
        <div>
          <SlideTag text="07 · Reglas de Firewall" />
          <div className="mt-3"><SlideTitle>{slide.title}</SlideTitle></div>
        </div>

        <div className="grid grid-cols-2 gap-5 flex-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {/* PERMIT */}
          <div className="rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'rgba(34,197,94,0.15)', borderBottom: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-lg">✅</span>
              <span className="font-bold text-sm" style={{ color: '#4ade80' }}>TRÁFICO PERMITIDO</span>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-auto">
              {slide.columns?.permit.map((rule, i) => {
                const parts = rule.split(' | ');
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }}>→</span>
                    <div>
                      <div className="text-xs font-bold text-white">{parts[0]}</div>
                      {parts.slice(1).map((p, j) => (
                        <div key={j} className="text-xs mt-0.5" style={{ color: 'rgba(191,219,254,0.65)' }}>{p}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BLOCK */}
          <div className="rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'rgba(239,68,68,0.15)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="text-lg">🚫</span>
              <span className="font-bold text-sm" style={{ color: '#f87171' }}>TRÁFICO BLOQUEADO</span>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-auto">
              {slide.columns?.block.map((rule, i) => {
                const parts = rule.split(' | ');
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: '#f87171' }}>✕</span>
                    <div>
                      <div className="text-xs font-bold text-white">{parts[0]}</div>
                      {parts.slice(1).map((p, j) => (
                        <div key={j} className="text-xs mt-0.5" style={{ color: 'rgba(191,219,254,0.65)' }}>{p}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ─── 9. SISTEMAS AISLADOS ────────────────────────────────────────────────────
function IsolatedSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell accent>
      <div className="flex-1 flex flex-col px-12 py-8 gap-5 justify-center">
        <div>
          <SlideTag text="09 · Sistemas Aislados" />
          <div className="mt-3"><SlideTitle>{slide.title}</SlideTitle></div>
        </div>

        {slide.highlight && (
          <div className="rounded-xl px-5 py-3 max-w-4xl" style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.35)' }}>
            <p className="text-sm leading-relaxed font-medium" style={{ color: '#fbbf24' }}>⚠ {slide.highlight}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          {slide.points?.map((p, i) => (
            <div key={i} className="flex items-start gap-4 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,162,39,0.2)' }}>
              <span className="text-2xl flex-shrink-0 leading-none">{p.icon}</span>
              <div>
                <div className="font-bold text-white text-sm mb-1">{p.text}</div>
                {p.sub && <div className="text-xs leading-relaxed" style={{ color: 'rgba(191,219,254,0.7)' }}>{p.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// ─── 12. CONCLUSIÓN ───────────────────────────────────────────────────────────
function ConclusionSlide({ slide }: { slide: Slide }) {
  return (
    <SlideShell accent>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-14 gap-5">
        <SlideTag text="12 · Conclusión" />

        <h2 className="font-serif font-black text-white max-w-3xl" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.2, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {slide.title}
        </h2>

        <p className="max-w-2xl leading-relaxed" style={{ color: 'rgba(191,219,254,0.85)', fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}>
          {slide.body}
        </p>

        <GoldDivider />

        <div className="text-4xl">🏦</div>
        {slide.footer && <p className="text-sm" style={{ color: 'rgba(147,197,253,0.7)' }}>{slide.footer}</p>}
        <div className="font-serif font-black text-4xl" style={{ color: '#C9A227' }}>¡Gracias!</div>
      </div>
    </SlideShell>
  );
}

// ─── Router de slides ─────────────────────────────────────────────────────────
function renderSlide(slide: Slide, index: number) {
  const tagMap: Record<number, string> = {
    3: '03 · Elementos', 8: '08 · Servicios', 10: '10 · Riesgos', 11: '11 · Buenas Prácticas',
  };
  switch (slide.type) {
    case 'cover':         return <CoverSlide slide={slide} />;
    case 'objective':     return <ObjectiveSlide slide={slide} />;
    case 'elements':      return <CardsSlide slide={slide} tag={tagMap[index + 1] || '03 · Elementos'} />;
    case 'controls':      return <ControlsSlide slide={slide} />;
    case 'diagram':       return <DiagramSlide slide={slide} />;
    case 'ip-table':      return <IPTableSlide />;
    case 'firewall-rules': return <FirewallRulesSlide slide={slide} />;
    case 'services':      return <CardsSlide slide={slide} tag="08 · Servicios" />;
    case 'isolated':      return <IsolatedSlide slide={slide} />;
    case 'risks':         return <CardsSlide slide={slide} tag="10 · Riesgos" />;
    case 'practices':     return <CardsSlide slide={slide} tag="11 · Buenas Prácticas" />;
    case 'conclusion':    return <ConclusionSlide slide={slide} />;
    default:              return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PresentationMode({ onExit }: PresentationModeProps) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const total = slides.length;

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= total) return;
    setAnimKey(k => k + 1);
    setCurrent(index);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

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
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="presentation-mode flex flex-col" style={{ background: '#0d1a33' }}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏦</span>
          <span className="font-serif font-bold text-sm" style={{ color: '#C9A227' }}>Arquitectura de Red Segura · Grupo 3</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono font-bold" style={{ color: 'rgba(201,162,39,0.9)' }}>{current + 1} / {total}</span>
          <button
            onClick={onExit}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            ✕ Salir
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #C9A227, #e8b830)' }} />
      </div>

      {/* ── Slide content ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Nav arrows */}
        <button
          onClick={prev}
          disabled={current === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all"
          style={{ background: current === 0 ? 'transparent' : 'rgba(255,255,255,0.08)', color: current === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)', cursor: current === 0 ? 'not-allowed' : 'pointer' }}
          aria-label="Anterior"
        >‹</button>

        <button
          onClick={next}
          disabled={current === total - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all"
          style={{ background: current === total - 1 ? 'transparent' : 'rgba(255,255,255,0.08)', color: current === total - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)', cursor: current === total - 1 ? 'not-allowed' : 'pointer' }}
          aria-label="Siguiente"
        >›</button>

        {/* Slide */}
        <div
          key={animKey}
          className="h-full w-full"
          style={{ animation: 'fadeIn 0.35s ease-out' }}
        >
          {renderSlide(slide, current)}
        </div>
      </div>

      {/* ── Bottom bar: dots centrados ── */}
      <div className="flex items-center justify-center px-6 py-3 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Prev shortcut */}
        <div className="absolute left-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>← → Navegar · Esc Salir</div>

        {/* Dots — CENTRADOS */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Diapositiva ${i + 1}`}
              title={`Diapositiva ${i + 1}`}
              style={{
                width: i === current ? '22px' : '7px',
                height: '7px',
                borderRadius: i === current ? '4px' : '50%',
                background: i === current ? '#C9A227' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.25s ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Slide name */}
        <div className="absolute right-6 text-xs font-mono" style={{ color: 'rgba(201,162,39,0.6)' }}>
          {current + 1}/{total}
        </div>
      </div>
    </div>
  );
}
