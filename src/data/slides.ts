export type SlideBackground = 'navy' | 'light';

export interface SlidePoint {
  icon?: string;
  text: string;
  sub?: string;
}

export interface SlideCard {
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface Slide {
  id: number;
  type:
    | 'cover'
    | 'objective'
    | 'elements'
    | 'controls'
    | 'diagram'
    | 'ip-table'
    | 'firewall-rules'
    | 'services'
    | 'isolated'
    | 'risks'
    | 'practices'
    | 'conclusion';
  background: SlideBackground;
  title?: string;
  subtitle?: string;
  tag?: string;
  body?: string;
  points?: SlidePoint[];
  cards?: SlideCard[];
  sidePanel?: { title: string; body: string };
  columns?: { permit: string[]; block: string[] };
  footer?: string;
  highlight?: string;
  caption?: string;
  note?: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    type: 'cover',
    background: 'navy',
    tag: 'CIBERSEGURIDAD Y HACKING ÉTICO',
    title: 'Arquitectura de Red Segura de un Banco',
    subtitle:
      'Diseño de infraestructura, segmentación y controles de seguridad para la red de una entidad bancaria',
    body: 'GRUPO 3 · Actividad académica en equipo · TEP PUCMM',
    footer: 'Presentado a: Prof. Diana Diplán',
  },
  {
    id: 2,
    type: 'objective',
    background: 'light',
    title: 'Objetivo de la Actividad',
    body: 'Como Grupo 3, se nos asignó diseñar la arquitectura de red de un banco, aplicando los conceptos estudiados sobre descubrimiento de sistemas operativos, enumeración, footprinting y detección de intrusos, para construir una infraestructura realista, segmentada y defendible ante amenazas.',
    points: [
      {
        icon: '🎯',
        text: 'Diseñar',
        sub: 'topología completa de red bancaria',
      },
      {
        icon: '🔒',
        text: 'Segmentar',
        sub: 'zonas por nivel de criticidad',
      },
      {
        icon: '🛡️',
        text: 'Proteger',
        sub: 'con Firewall, IDS y VPN',
      },
      {
        icon: '⚠️',
        text: 'Analizar',
        sub: 'riesgos y aislamiento de sistemas',
      },
    ],
    sidePanel: {
      title: 'Contexto Académico',
      body: 'Ejercicio de cierre del módulo de reconocimiento y enumeración: aplicar la teoría a un caso realista de infraestructura crítica.',
    },
  },
  {
    id: 3,
    type: 'elements',
    background: 'light',
    title: 'Elementos a Diseñar',
    cards: [
      {
        title: 'Cajeros Automáticos',
        description:
          'Red ATM dedicada, con protocolo cifrado propietario y aislamiento estricto',
        icon: '🏧',
        color: '#8B0000',
      },
      {
        title: 'Plataforma Web',
        description:
          'Portal de banca en línea expuesto de forma controlada en la DMZ',
        icon: '🌐',
        color: '#E67E22',
      },
      {
        title: 'Oficinas',
        description:
          'Estaciones de empleados y gerencia sobre la red administrativa interna',
        icon: '🏢',
        color: '#1565C0',
      },
      {
        title: 'Datacenter',
        description:
          'Base de datos del núcleo bancario, alojada en la red crítica aislada',
        icon: '🗄️',
        color: '#8B0000',
      },
    ],
  },
  {
    id: 4,
    type: 'controls',
    background: 'navy',
    title: 'Controles de Seguridad Obligatorios',
    cards: [
      {
        title: 'Firewall (NGFW)',
        description:
          'Firewall de nueva generación como punto único de inspección de todo el tráfico entrante y saliente, aplicando reglas de permitir/bloquear por zona.',
        icon: '🔥',
        color: '#C9A227',
      },
      {
        title: 'IDS/IPS',
        description:
          'Sistema de detección (y prevención) de intrusos que monitorea el tráfico reflejado del firewall y emite alertas ante actividad sospechosa.',
        icon: '👁️',
        color: '#C9A227',
      },
      {
        title: 'VPN',
        description:
          'Túnel cifrado tipo site-to-site que conecta sucursales remotas al núcleo de forma segura y autenticada.',
        icon: '🔐',
        color: '#C9A227',
      },
    ],
  },
  {
    id: 5,
    type: 'diagram',
    background: 'light',
    title: 'Diagrama de Arquitectura de Red',
    caption:
      'Fuente: diagrama elaborado por el equipo en Draw.io a partir del código Mermaid de la arquitectura propuesta.',
    note: 'Regla clave: todo el tráfico pasa por el NGFW. Se permite HTTPS hacia la DMZ y VPN cifrada desde sucursales; se bloquea totalmente el acceso directo de Oficinas hacia la Red Crítica.',
  },
  {
    id: 6,
    type: 'ip-table',
    background: 'light',
    title: 'Direccionamiento IP',
  },
  {
    id: 7,
    type: 'firewall-rules',
    background: 'light',
    title: 'Reglas del Firewall',
    columns: {
      permit: [
        'Internet → DMZ | HTTPS (443) | Inspección SSL',
        'VPN/Sucursales → Núcleo | IPSec cifrado | Autenticación Mutua',
        'Oficinas → Internet | HTTP/HTTPS | Vía Proxy Web',
        'DMZ → Red Crítica | Puerto BD (1433/3306) | Solo Lectura, Auditada',
      ],
      block: [
        'Oficinas → Red Crítica | Cualquier protocolo | Sin excepción directa',
        'Internet → Red Crítica | Acceso directo | Bloqueo total',
        'Cualquier origen | Telnet (23) | Protocolo inseguro',
        'Cualquier origen | FTP (21) | Protocolo inseguro',
        'DMZ → Oficinas | Sin comunicación directa',
        'Cualquier combinación no listada | Deny-All por defecto',
      ],
    },
  },
  {
    id: 8,
    type: 'services',
    background: 'light',
    title: 'Servicios Utilizados',
    cards: [
      {
        title: 'DNS',
        description:
          'Traduce nombres de dominio del portal bancario a direcciones IP',
        icon: '📡',
        color: '#1565C0',
      },
      {
        title: 'DHCP',
        description:
          'Asigna automáticamente direcciones IP a equipos de las Oficinas',
        icon: '📋',
        color: '#1565C0',
      },
      {
        title: 'HTTP',
        description:
          'Protocolo base de navegación web, sin cifrado — evitado en producción',
        icon: '⚠️',
        color: '#E67E22',
      },
      {
        title: 'HTTPS',
        description:
          'Acceso cifrado a la banca en línea; único puerto permitido desde Internet',
        icon: '🔒',
        color: '#4A148C',
      },
      {
        title: 'SSH',
        description:
          'Administración remota segura de servidores y equipos de red',
        icon: '💻',
        color: '#162447',
      },
      {
        title: 'SMTP',
        description:
          'Envío de correo saliente y notificaciones internas del banco',
        icon: '📧',
        color: '#37474F',
      },
    ],
  },
  {
    id: 9,
    type: 'isolated',
    background: 'navy',
    title: '¿Qué Sistemas Deben Estar Aislados?',
    highlight:
      'La Red Crítica (Datacenter y Cajeros Automáticos) debe permanecer lógicamente aislada del resto de la red, sin ruta directa desde Oficinas ni desde Internet.',
    points: [
      {
        icon: '🗄️',
        text: 'Datacenter / Core Bancario',
        sub: 'Base de datos principal — acceso solo desde DMZ vía puerto BD auditado',
      },
      {
        icon: '🏧',
        text: 'Cajeros Automáticos (ATM)',
        sub: 'Red ATM dedicada con protocolo propietario — aislamiento estricto VLAN 91',
      },
      {
        icon: '🔀',
        text: 'Segmento del Switch Core',
        sub: 'Punto de distribución interno de la Red Crítica — sin ruta hacia Oficinas',
      },
      {
        icon: '🖥️',
        text: 'Consola/Gestión del IDS-Firewall',
        sub: 'Administración fuera de banda — acceso solo con autenticación multifactor',
      },
    ],
  },
  {
    id: 10,
    type: 'risks',
    background: 'light',
    title: '¿Qué Riesgos Existen?',
    cards: [
      {
        title: 'Ataques a la Banca en Línea',
        description:
          'Inyección SQL, XSS, fuerza bruta contra el portal DMZ. Mitigado por WAF y HTTPS obligatorio.',
        icon: '🌐',
        color: '#E67E22',
      },
      {
        title: 'Propagación de Malware Interno',
        description:
          'Movimiento lateral desde PCs de Oficinas. Contenido por segmentación VLAN y reglas deny-all.',
        icon: '🦠',
        color: '#8B0000',
      },
      {
        title: 'Jackpotting / Manipulación de ATMs',
        description:
          'Acceso no autorizado a la red ATM. Mitigado por VLAN 91 aislada y protocolo propietario.',
        icon: '🏧',
        color: '#8B0000',
      },
      {
        title: 'Fuga de Datos del Datacenter',
        description:
          'Exfiltración desde el Core Bancario. Contenida por acceso auditado puerto 1433/3306 solo lectura.',
        icon: '🗄️',
        color: '#8B0000',
      },
      {
        title: 'VPN Mal Configurada',
        description:
          'Túnel inseguro hacia sucursales. Mitigado por IPSec con autenticación mutua y certificados.',
        icon: '🔐',
        color: '#E67E22',
      },
      {
        title: 'Reconocimiento Externo (Footprinting)',
        description:
          'Mapeo de la red desde Internet. Mitigado por NGFW que oculta topología interna.',
        icon: '🔍',
        color: '#37474F',
      },
    ],
  },
  {
    id: 11,
    type: 'practices',
    background: 'light',
    title: 'Medidas de Protección y Buenas Prácticas',
    cards: [
      {
        title: '1. Segmentación Estricta',
        description:
          'VLANs diferenciadas por criticidad: DMZ (10), Oficinas (20/21), Crítica (90/91). Sin rutas cruzadas.',
        icon: '🔀',
        color: '#162447',
      },
      {
        title: '2. Sistemas Actualizados',
        description:
          'Parches de seguridad regulares en todos los dispositivos. Gestión centralizada de actualizaciones.',
        icon: '🔄',
        color: '#162447',
      },
      {
        title: '3. Control de Accesos',
        description:
          'Principio de mínimo privilegio. MFA para administradores. Roles diferenciados por zona.',
        icon: '🔑',
        color: '#162447',
      },
      {
        title: '4. Monitoreo con IDS',
        description:
          'Sensor SPAN Port que replica tráfico del NGFW. Alertas en tiempo real y bloqueo automático.',
        icon: '👁️',
        color: '#162447',
      },
      {
        title: '5. Cifrado Extremo a Extremo',
        description:
          'HTTPS/TLS para servicios web, IPSec para VPN, protocolo propietario cifrado para ATMs.',
        icon: '🔒',
        color: '#162447',
      },
      {
        title: '6. Documentación y Auditoría',
        description:
          'Logs centralizados de todas las reglas. Auditorías periódicas y pruebas de penetración.',
        icon: '📋',
        color: '#162447',
      },
    ],
  },
  {
    id: 12,
    type: 'conclusion',
    background: 'navy',
    title:
      'Una red bancaria segura se construye por capas, no por un único control',
    body: 'El diseño del Grupo 3 combina segmentación estricta, un firewall central como punto único de inspección, monitoreo continuo con IDS y cifrado en todos los enlaces externos. Así, un banco puede exponer servicios necesarios — como su banca en línea — sin comprometer los sistemas más críticos: el Datacenter y los Cajeros Automáticos.',
    footer: 'Grupo 3 · Ciberseguridad y Hacking Ético · Prof. Diana Diplán',
  },
];
