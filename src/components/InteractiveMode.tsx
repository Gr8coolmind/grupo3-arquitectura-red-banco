
import { NetworkDiagram } from './NetworkDiagram';
import { RuleSimulator } from './RuleSimulator';
import { IPTable } from './IPTable';

interface InteractiveModeProps {
  onStartPresentation: () => void;
}

const services = [
  { name: 'DNS', icon: '📡', description: 'Traduce nombres de dominio del portal bancario a direcciones IP', color: '#1565C0' },
  { name: 'DHCP', icon: '📋', description: 'Asigna automáticamente direcciones IP a equipos de las Oficinas', color: '#1565C0' },
  { name: 'HTTP', icon: '⚠️', description: 'Protocolo base de navegación web, sin cifrado — evitado en producción', color: '#E67E22', warn: true },
  { name: 'HTTPS', icon: '🔒', description: 'Acceso cifrado a la banca en línea; único puerto permitido desde Internet', color: '#4A148C' },
  { name: 'SSH', icon: '💻', description: 'Administración remota segura de servidores y equipos de red', color: '#162447' },
  { name: 'SMTP', icon: '📧', description: 'Envío de correo saliente y notificaciones internas del banco', color: '#37474F' },
];

const isolatedSystems = [
  { icon: '🗄️', name: 'Datacenter / Core Bancario', description: 'Base de datos principal — acceso solo desde DMZ vía puerto BD auditado', severity: 'alto' },
  { icon: '🏧', name: 'Cajeros Automáticos (ATM)', description: 'Red ATM dedicada con protocolo propietario — aislamiento estricto VLAN 91', severity: 'alto' },
  { icon: '🔀', name: 'Segmento del Switch Core', description: 'Punto de distribución interno de la Red Crítica — sin ruta hacia Oficinas', severity: 'alto' },
  { icon: '🖥️', name: 'Consola/Gestión del IDS-Firewall', description: 'Administración fuera de banda — acceso solo con autenticación multifactor', severity: 'medio' },
];

const risks = [
  { icon: '🌐', title: 'Ataques a la Banca en Línea', description: 'Inyección SQL, XSS, fuerza bruta contra el portal DMZ. Mitigado por WAF y HTTPS obligatorio.', severity: 'alto' },
  { icon: '🦠', title: 'Propagación de Malware Interno', description: 'Movimiento lateral desde PCs de Oficinas. Contenido por segmentación VLAN y reglas deny-all.', severity: 'alto' },
  { icon: '🏧', title: 'Jackpotting / Manipulación de ATMs', description: 'Acceso no autorizado a la red ATM. Mitigado por VLAN 91 aislada y protocolo propietario.', severity: 'alto' },
  { icon: '🗄️', title: 'Fuga de Datos del Datacenter', description: 'Exfiltración desde el Core Bancario. Contenida por acceso auditado puerto 1433/3306 solo lectura.', severity: 'alto' },
  { icon: '🔐', title: 'VPN Mal Configurada', description: 'Túnel inseguro hacia sucursales. Mitigado por IPSec con autenticación mutua y certificados.', severity: 'medio' },
  { icon: '🔍', title: 'Reconocimiento Externo (Footprinting)', description: 'Mapeo de la red desde Internet. Mitigado por NGFW que oculta topología interna.', severity: 'medio' },
];

const practices = [
  { num: '01', title: 'Segmentación Estricta', description: 'VLANs diferenciadas por criticidad: DMZ (10), Oficinas (20/21), Crítica (90/91). Sin rutas cruzadas.', icon: '🔀' },
  { num: '02', title: 'Sistemas Actualizados', description: 'Parches de seguridad regulares en todos los dispositivos. Gestión centralizada de actualizaciones.', icon: '🔄' },
  { num: '03', title: 'Control de Accesos', description: 'Principio de mínimo privilegio. MFA para administradores. Roles diferenciados por zona.', icon: '🔑' },
  { num: '04', title: 'Monitoreo con IDS', description: 'Sensor SPAN Port que replica tráfico del NGFW. Alertas en tiempo real y bloqueo automático.', icon: '👁️' },
  { num: '05', title: 'Cifrado Extremo a Extremo', description: 'HTTPS/TLS para servicios web, IPSec para VPN, protocolo propietario cifrado para ATMs.', icon: '🔒' },
  { num: '06', title: 'Documentación y Auditoría', description: 'Logs centralizados de todas las reglas. Auditorías periódicas y pruebas de penetración.', icon: '📋' },
];

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h2 className="font-serif text-3xl font-bold text-navy">{title}</h2>
      </div>
      {subtitle && <p className="text-gray-500 ml-12">{subtitle}</p>}
      <div className="mt-3 ml-12 w-16 h-1 bg-gold rounded-full"></div>
    </div>
  );
}

export function InteractiveMode({ onStartPresentation }: InteractiveModeProps) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* ===== HERO ===== */}
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/8"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gold/6"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-gold/8"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="text-center">
            <span className="inline-block text-xs font-bold tracking-[0.3em] text-gold uppercase border border-gold/40 px-4 py-1.5 rounded-full mb-6">
              CIBERSEGURIDAD Y HACKING ÉTICO
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-black text-white leading-tight mb-6 text-shadow">
              Arquitectura de Red<br />
              <span className="text-gold">Segura de un Banco</span>
            </h1>
            <p className="text-blue-200 text-xl mb-4">
              Grupo 3 · Ciberseguridad y Hacking Ético · TEP PUCMM
            </p>
            <p className="text-blue-300/70 text-sm mb-10">Presentado a: Prof. Diana Diplán</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection('diagram')}
                className="bg-gold hover:bg-gold-light text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5"
              >
                🗺️ Explorar el Diagrama
              </button>
              <button
                onClick={() => scrollToSection('simulator')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl transition-all border border-white/20 hover:-translate-y-0.5"
              >
                🔥 Simulador de Firewall
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { label: 'Zonas de Red', value: '5', sub: 'Perímetro → Crítica' },
              { label: 'Reglas de Firewall', value: '10+', sub: 'Deny-all por defecto' },
              { label: 'Dispositivos', value: '9', sub: 'IP asignadas' },
              { label: 'VLANs', value: '5', sub: 'Segmentación estricta' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl px-5 py-4 text-center border border-white/10">
                <div className="text-3xl font-black text-gold font-serif">{stat.value}</div>
                <div className="text-white font-semibold text-sm mt-1">{stat.label}</div>
                <div className="text-blue-300/70 text-xs mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ===== INTERACTIVE DIAGRAM ===== */}
        <section id="diagram">
          <SectionTitle
            icon="🗺️"
            title="Diagrama Interactivo de Red"
            subtitle="Hover sobre los nodos para resaltar conexiones · Click para ver detalles"
          />
          <NetworkDiagram />
        </section>

        {/* ===== FIREWALL SIMULATOR ===== */}
        <section id="simulator">
          <SectionTitle
            icon="🔥"
            title="Simulador de Reglas de Firewall"
            subtitle="Selecciona origen, destino y protocolo para evaluar si el tráfico sería permitido"
          />
          <RuleSimulator />
        </section>

        {/* ===== IP TABLE ===== */}
        <section id="ip-table">
          <SectionTitle
            icon="📋"
            title="Tabla de Direccionamiento IP"
            subtitle="Filtrable por zona · Click en encabezados para ordenar"
          />
          <IPTable />
        </section>

        {/* ===== SERVICES ===== */}
        <section id="services">
          <SectionTitle
            icon="🌐"
            title="Servicios de Red Utilizados"
            subtitle="Protocolos activos en la infraestructura bancaria"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-5 shadow-md border-2 card-hover ${s.warn ? 'border-orange-200' : 'border-transparent'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: s.color + '22', border: `1px solid ${s.color}44` }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-base" style={{ color: s.color }}>{s.name}</div>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== RISKS & ISOLATED ===== */}
        <section id="risks">
          <SectionTitle
            icon="⚠️"
            title="Riesgos y Sistemas Aislados"
            subtitle="Análisis de amenazas y sistemas que deben permanecer aislados"
          />
          <div className="grid md:grid-cols-2 gap-6">
            {/* Isolated systems */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="gradient-navy px-6 py-4">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <span>🔒</span> Sistemas Aislados
                </h3>
                <p className="text-blue-200 text-xs mt-1">Deben permanecer lógicamente aislados</p>
              </div>
              <div className="p-4 space-y-3">
                {isolatedSystems.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-gray-100">
                    <span className="text-xl flex-shrink-0">{s.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-navy text-sm">{s.name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                          s.severity === 'alto' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {s.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-4">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <span>⚠️</span> Riesgos Identificados
                </h3>
                <p className="text-red-200 text-xs mt-1">Amenazas y vectores de ataque</p>
              </div>
              <div className="p-4 space-y-3">
                {risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-gray-100">
                    <span className="text-xl flex-shrink-0">{r.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-navy text-sm">{r.title}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                          r.severity === 'alto' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {r.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1 leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== BEST PRACTICES ===== */}
        <section id="practices">
          <SectionTitle
            icon="🛡️"
            title="Medidas de Protección y Buenas Prácticas"
            subtitle="Controles recomendados para la infraestructura bancaria"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {practices.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 card-hover group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-xs font-black text-gold font-serif leading-none">{p.num}</div>
                    <div className="text-2xl mt-1">{p.icon}</div>
                  </div>
                  <div>
                    <div className="font-bold text-navy text-base group-hover:text-core transition-colors">{p.title}</div>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="gradient-navy mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-gold font-serif text-lg font-bold mb-2">Grupo 3</div>
          <p className="text-blue-200 text-sm">
            Ciberseguridad y Hacking Ético · TEP PUCMM · Prof. Diana Diplán
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gold/40 mx-auto"></div>
        </div>
      </footer>
    </div>
  );
}
