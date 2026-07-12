export type Zone = 'nucleo' | 'dmz' | 'oficinas' | 'critica' | 'perimetro';

export interface NetworkNode {
  id: string;
  label: string;
  sublabel?: string;
  zone: Zone;
  ip?: string;
  vlan?: string;
  description: string;
  risk: 'alto' | 'medio' | 'bajo';
  x: number;
  y: number;
  shape: 'hexagon' | 'circle' | 'diamond' | 'rect';
}

export interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  label: string;
  detail: string;
  style: 'solid' | 'dashed' | 'danger';
  bidirectional?: boolean;
}

export const networkNodes: NetworkNode[] = [
  {
    id: 'internet',
    label: 'Internet',
    sublabel: 'Clientes / Público General',
    zone: 'perimetro',
    description:
      'Red pública externa. Fuente de tráfico entrante hacia la DMZ. Todo el tráfico es inspeccionado por el NGFW antes de ingresar.',
    risk: 'alto',
    x: 520,
    y: 60,
    shape: 'circle',
  },
  {
    id: 'vpn',
    label: 'Túnel VPN',
    sublabel: 'Site-to-Site · Sucursales Remotas',
    zone: 'perimetro',
    description:
      'Enlace IPSec cifrado que conecta sucursales remotas al núcleo bancario de forma segura. Requiere autenticación mutua con certificados.',
    risk: 'medio',
    x: 280,
    y: 60,
    shape: 'rect',
  },
  {
    id: 'ngfw',
    label: 'NGFW',
    sublabel: 'Firewall de Nueva Generación',
    zone: 'nucleo',
    ip: '10.0.0.1',
    description:
      'Punto único de inspección de todo el tráfico. Aplica reglas permit/deny por zona, inspección SSL, y filtra protocolos inseguros (Telnet, FTP). Eje central de la seguridad perimetral.',
    risk: 'bajo',
    x: 450,
    y: 230,
    shape: 'hexagon',
  },
  {
    id: 'ids',
    label: 'IDS / IPS',
    sublabel: 'Sistema de Detección de Intrusos',
    zone: 'nucleo',
    ip: '10.0.0.2',
    description:
      'Sensor SPAN Port que recibe copia del tráfico del NGFW. Detecta patrones de ataque, emite alertas en tiempo real y puede bloquear automáticamente conexiones sospechosas.',
    risk: 'bajo',
    x: 650,
    y: 310,
    shape: 'diamond',
  },
  {
    id: 'webserver',
    label: 'Servidor Banca en Línea',
    sublabel: 'Plataforma Web Transaccional',
    zone: 'dmz',
    ip: '172.16.10.10',
    vlan: 'VLAN 10',
    description:
      'Portal web expuesto de forma controlada en la DMZ. Solo accesible por HTTPS (443). Consulta la base de datos del Datacenter via puerto BD auditado, solo lectura.',
    risk: 'medio',
    x: 160,
    y: 370,
    shape: 'circle',
  },
  {
    id: 'sw-oficinas',
    label: 'Switch Distribución',
    sublabel: 'Oficinas Administrativas',
    zone: 'oficinas',
    ip: '192.168.20.1',
    vlan: 'VLAN 20',
    description:
      'Switch de distribución para la red administrativa. Conecta PCs de empleados y gerencia. Salida a Internet filtrada por proxy web del NGFW.',
    risk: 'medio',
    x: 760,
    y: 280,
    shape: 'diamond',
  },
  {
    id: 'pc-gerencia',
    label: 'PCs Gerencia',
    sublabel: 'Acceso Administrativo',
    zone: 'oficinas',
    ip: '192.168.20.10–19',
    vlan: 'VLAN 21',
    description:
      'Estaciones de trabajo de gerencia con acceso privilegiado a sistemas administrativos. VLAN separada del resto de empleados. Sin acceso directo a Red Crítica.',
    risk: 'medio',
    x: 700,
    y: 430,
    shape: 'circle',
  },
  {
    id: 'pc-empleados',
    label: 'PCs Empleados',
    sublabel: 'Operación Diaria',
    zone: 'oficinas',
    ip: '192.168.20.100–199',
    vlan: 'VLAN 20',
    description:
      'Estaciones de trabajo del personal operativo. Acceso a Internet vía proxy filtrado. Sin ruta directa hacia la Red Crítica ni hacia la DMZ internamente.',
    risk: 'medio',
    x: 840,
    y: 430,
    shape: 'circle',
  },
  {
    id: 'sw-core',
    label: 'Switch Core',
    sublabel: 'Segmento Air-Gapped Lógico',
    zone: 'critica',
    ip: '10.10.10.1',
    vlan: 'VLAN 90',
    description:
      'Punto de distribución central de la Red Crítica. Lógicamente aislado del resto de la red corporativa. Solo recibe tráfico autorizado y auditado desde la DMZ vía el NGFW.',
    risk: 'alto',
    x: 260,
    y: 510,
    shape: 'diamond',
  },
  {
    id: 'atm',
    label: 'Cajeros Automáticos',
    sublabel: 'Red ATM Dedicada',
    zone: 'critica',
    ip: '10.10.20.0/24',
    vlan: 'VLAN 91',
    description:
      'Red dedicada para cajeros automáticos con protocolo cifrado propietario. Aislamiento estricto en VLAN 91. Canal dedicado ATM. Sin acceso desde Oficinas ni Internet.',
    risk: 'alto',
    x: 130,
    y: 650,
    shape: 'circle',
  },
  {
    id: 'datacenter',
    label: 'Datacenter',
    sublabel: 'Base de Datos Principal · Core Bancario',
    zone: 'critica',
    ip: '10.10.10.10',
    vlan: 'VLAN 90',
    description:
      'Base de datos central del banco. Acceso únicamente desde el servidor DMZ via puerto 1433/3306 (solo lectura, auditado). Sin exposición directa a Internet ni Oficinas.',
    risk: 'alto',
    x: 380,
    y: 650,
    shape: 'circle',
  },
];

export const networkConnections: NetworkConnection[] = [
  {
    id: 'internet-ngfw',
    from: 'internet',
    to: 'ngfw',
    label: 'Permitir SOLO HTTPS · Puerto 443',
    detail:
      'Solo se permite tráfico HTTPS (puerto 443) desde Internet hacia la DMZ. El NGFW aplica inspección SSL para detectar amenazas dentro del tráfico cifrado. Todo lo demás es bloqueado.',
    style: 'solid',
  },
  {
    id: 'vpn-ngfw',
    from: 'vpn',
    to: 'ngfw',
    label: 'Tráfico Cifrado IPSec · Autenticación Mutua',
    detail:
      'Túnel VPN site-to-site con protocolo IPSec. Requiere autenticación mutua con certificados digitales. El tráfico llega cifrado al NGFW que lo desencripta e inspecciona antes de routear.',
    style: 'solid',
  },
  {
    id: 'ngfw-dmz',
    from: 'ngfw',
    to: 'webserver',
    label: 'Permitir SOLO HTTPS · Denegar todo lo demás',
    detail:
      'El NGFW permite únicamente HTTPS (443) hacia el servidor web en la DMZ. Cualquier otro protocolo o puerto es denegado automáticamente. La DMZ está en VLAN 10 aislada.',
    style: 'solid',
  },
  {
    id: 'ngfw-oficinas',
    from: 'ngfw',
    to: 'sw-oficinas',
    label: 'Salida a Internet Filtrada · Proxy Web',
    detail:
      'Las Oficinas acceden a Internet únicamente a través del proxy web integrado en el NGFW. El tráfico de navegación es filtrado por categorías de contenido y protocolos permitidos.',
    style: 'solid',
  },
  {
    id: 'ngfw-critica',
    from: 'ngfw',
    to: 'sw-core',
    label: 'BLOQUEO TOTAL desde Oficinas · Sin excepción directa',
    detail:
      'El NGFW bloquea cualquier intento de acceso directo desde la red de Oficinas (VLAN 20/21) hacia la Red Crítica (VLAN 90/91). Esta regla no tiene excepciones. Solo la DMZ puede consultar el Datacenter por puerto BD auditado.',
    style: 'danger',
  },
  {
    id: 'ngfw-ids',
    from: 'ngfw',
    to: 'ids',
    label: 'Alertas en Tiempo Real · Bloqueo Automático',
    detail:
      'El NGFW envía una copia (SPAN Port) de todo el tráfico al sensor IDS/IPS. El IDS analiza patrones en tiempo real y puede enviar señales de bloqueo de vuelta al NGFW de forma automática.',
    style: 'dashed',
    bidirectional: true,
  },
  {
    id: 'dmz-critica',
    from: 'webserver',
    to: 'sw-core',
    label: 'Consulta Autorizada y Auditada · Puerto 1433/3306',
    detail:
      'El servidor de banca en línea (DMZ) puede consultar el Datacenter únicamente via puerto SQL (1433 para MSSQL, 3306 para MySQL). Acceso de solo lectura, completamente auditado. Toda consulta genera un log.',
    style: 'dashed',
  },
  {
    id: 'sw-core-atm',
    from: 'sw-core',
    to: 'atm',
    label: 'Protocolo Cifrado Propietario · Canal Dedicado ATM',
    detail:
      'Los cajeros automáticos se comunican con el Switch Core mediante un protocolo cifrado propietario de la red ATM. Canal físico y lógico dedicado en VLAN 91, completamente separado del tráfico corporativo.',
    style: 'solid',
  },
  {
    id: 'sw-core-dc',
    from: 'sw-core',
    to: 'datacenter',
    label: 'Red Crítica Interna · Alta Seguridad',
    detail:
      'Conexión interna de la Red Crítica entre el Switch Core y el Datacenter. Segmento air-gapped lógico sin ruta hacia redes externas. Solo accesible desde el exterior via el path auditado DMZ → NGFW → Switch Core.',
    style: 'solid',
  },
  {
    id: 'sw-oficinas-gerencia',
    from: 'sw-oficinas',
    to: 'pc-gerencia',
    label: 'VLAN 21 · Acceso Privilegiado',
    detail:
      'La gerencia opera en una VLAN separada (21) del resto de empleados. Tienen acceso a sistemas administrativos adicionales pero siguen sin ruta directa hacia la Red Crítica.',
    style: 'solid',
  },
  {
    id: 'sw-oficinas-empleados',
    from: 'sw-oficinas',
    to: 'pc-empleados',
    label: 'VLAN 20 · Operación Diaria',
    detail:
      'Los empleados operativos están en VLAN 20. Su tráfico de salida pasa por el proxy del NGFW. Sin acceso a la Red Crítica ni comunicación directa con la DMZ interna.',
    style: 'solid',
  },
];
