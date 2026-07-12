export interface IPEntry {
  device: string;
  zone: string;
  ip: string;
  vlan: string;
  zoneKey: 'nucleo' | 'dmz' | 'oficinas' | 'critica';
}

export const ipTable: IPEntry[] = [
  {
    device: 'NGFW (Firewall)',
    zone: 'Núcleo',
    ip: '10.0.0.1',
    vlan: '—',
    zoneKey: 'nucleo',
  },
  {
    device: 'IDS / Sensor de Monitoreo',
    zone: 'Núcleo',
    ip: '10.0.0.2',
    vlan: '—',
    zoneKey: 'nucleo',
  },
  {
    device: 'Servidor Web (Banca en Línea)',
    zone: 'DMZ',
    ip: '172.16.10.10',
    vlan: 'VLAN 10',
    zoneKey: 'dmz',
  },
  {
    device: 'Switch de Oficinas',
    zone: 'Oficinas',
    ip: '192.168.20.1',
    vlan: 'VLAN 20',
    zoneKey: 'oficinas',
  },
  {
    device: 'PCs Empleados',
    zone: 'Oficinas',
    ip: '192.168.20.100–199',
    vlan: 'VLAN 20',
    zoneKey: 'oficinas',
  },
  {
    device: 'PCs Gerencia',
    zone: 'Oficinas',
    ip: '192.168.20.10–19',
    vlan: 'VLAN 21',
    zoneKey: 'oficinas',
  },
  {
    device: 'Switch Core',
    zone: 'Red Crítica',
    ip: '10.10.10.1',
    vlan: 'VLAN 90',
    zoneKey: 'critica',
  },
  {
    device: 'Datacenter (Core Bancario)',
    zone: 'Red Crítica',
    ip: '10.10.10.10',
    vlan: 'VLAN 90',
    zoneKey: 'critica',
  },
  {
    device: 'Cajeros Automáticos (ATM)',
    zone: 'Red Crítica',
    ip: '10.10.20.0/24',
    vlan: 'VLAN 91',
    zoneKey: 'critica',
  },
];

export type FirewallOrigin =
  | 'Internet'
  | 'VPN/Sucursales'
  | 'DMZ'
  | 'Oficinas'
  | 'Red Crítica';
export type FirewallDestination =
  | 'Internet'
  | 'VPN/Sucursales'
  | 'DMZ'
  | 'Oficinas'
  | 'Red Crítica'
  | 'Núcleo';
export type FirewallProtocol =
  | 'HTTPS (443)'
  | 'HTTP (80)'
  | 'SSH (22)'
  | 'FTP (21)'
  | 'Telnet (23)'
  | 'SQL (1433/3306)'
  | 'IPSec/VPN';

export interface FirewallResult {
  allowed: boolean;
  explanation: string;
  rule?: string;
}

export const firewallOrigins: FirewallOrigin[] = [
  'Internet',
  'VPN/Sucursales',
  'DMZ',
  'Oficinas',
  'Red Crítica',
];

export const firewallDestinations: FirewallDestination[] = [
  'Internet',
  'DMZ',
  'Oficinas',
  'Red Crítica',
  'Núcleo',
];

export const firewallProtocols: FirewallProtocol[] = [
  'HTTPS (443)',
  'HTTP (80)',
  'SSH (22)',
  'FTP (21)',
  'Telnet (23)',
  'SQL (1433/3306)',
  'IPSec/VPN',
];

export function evaluateFirewall(
  origin: FirewallOrigin,
  destination: FirewallDestination,
  protocol: FirewallProtocol
): FirewallResult {
  // BLOQUEAR siempre: Telnet y FTP sin importar origen/destino
  if (protocol === 'Telnet (23)') {
    return {
      allowed: false,
      explanation:
        'Telnet (puerto 23) es un protocolo inseguro que transmite datos en texto plano. Está bloqueado en todas las reglas del firewall sin excepción.',
      rule: 'Deny-All Telnet (23) — Protocolo inseguro',
    };
  }
  if (protocol === 'FTP (21)') {
    return {
      allowed: false,
      explanation:
        'FTP (puerto 21) transmite credenciales y datos sin cifrado. Está bloqueado en todas las reglas del firewall sin excepción.',
      rule: 'Deny-All FTP (21) — Protocolo inseguro',
    };
  }

  // Internet → DMZ solo HTTPS
  if (origin === 'Internet' && destination === 'DMZ') {
    if (protocol === 'HTTPS (443)') {
      return {
        allowed: true,
        explanation:
          'El firewall permite tráfico HTTPS (puerto 443) desde Internet hacia la DMZ. Este es el único puerto habilitado para el acceso público al portal de banca en línea. Se aplica inspección SSL.',
        rule: 'PERMIT: Internet → DMZ | HTTPS (443) | Inspección SSL activa',
      };
    }
    return {
      allowed: false,
      explanation: `El tráfico ${protocol} desde Internet hacia la DMZ está bloqueado. Solo se permite HTTPS (443). El NGFW deniega cualquier otro protocolo o puerto desde la red pública.`,
      rule: `DENY: Internet → DMZ | ${protocol} | Solo HTTPS permitido`,
    };
  }

  // Internet → Red Crítica siempre bloqueado
  if (origin === 'Internet' && destination === 'Red Crítica') {
    return {
      allowed: false,
      explanation:
        'Acceso directo desde Internet hacia la Red Crítica está completamente bloqueado. No existe ruta directa entre la red pública e Internet hacia el Datacenter o los ATMs. Bloqueo total.',
      rule: 'DENY: Internet → Red Crítica | Bloqueo total — sin excepción',
    };
  }

  // Internet → Oficinas bloqueado
  if (origin === 'Internet' && destination === 'Oficinas') {
    return {
      allowed: false,
      explanation:
        'El acceso directo desde Internet hacia la red de Oficinas está bloqueado. Las Oficinas no son accesibles desde el exterior.',
      rule: 'DENY: Internet → Oficinas | No hay acceso externo directo',
    };
  }

  // VPN → Núcleo: cualquier protocolo permitido (cifrado IPSec)
  if (origin === 'VPN/Sucursales') {
    if (protocol === 'IPSec/VPN') {
      return {
        allowed: true,
        explanation:
          'Las sucursales se conectan al núcleo mediante túnel IPSec cifrado con autenticación mutua. El tráfico llega cifrado al NGFW que lo desencripta e inspecciona.',
        rule: 'PERMIT: VPN/Sucursales → Núcleo | IPSec — Autenticación Mutua',
      };
    }
    if (protocol === 'SSH (22)') {
      return {
        allowed: true,
        explanation:
          'SSH desde VPN de sucursales está permitido para administración remota segura de servidores y equipos de red, siempre dentro del túnel VPN cifrado.',
        rule: 'PERMIT: VPN/Sucursales → Núcleo | SSH (22) — Admin remoto',
      };
    }
    if (protocol === 'HTTPS (443)') {
      return {
        allowed: true,
        explanation:
          'HTTPS desde VPN de sucursales está permitido para acceso a aplicaciones internas del banco desde las sucursales remotas, dentro del túnel cifrado.',
        rule: 'PERMIT: VPN/Sucursales → Núcleo | HTTPS (443) — Acceso interno',
      };
    }
    return {
      allowed: false,
      explanation: `El protocolo ${protocol} desde VPN de sucursales no está en la lista de permitidos. Use IPSec, SSH o HTTPS para comunicaciones desde sucursales.`,
      rule: `DENY: VPN/Sucursales | ${protocol} — No autorizado`,
    };
  }

  // Oficinas → Internet
  if (origin === 'Oficinas' && destination === 'Internet') {
    if (protocol === 'HTTP (80)' || protocol === 'HTTPS (443)') {
      return {
        allowed: true,
        explanation:
          'Las Oficinas pueden acceder a Internet mediante HTTP/HTTPS, pero todo el tráfico pasa obligatoriamente por el Proxy Web del NGFW. El proxy filtra contenido y aplica políticas de uso aceptable.',
        rule: 'PERMIT: Oficinas → Internet | HTTP/HTTPS | Vía Proxy Web filtrado',
      };
    }
    return {
      allowed: false,
      explanation: `El protocolo ${protocol} desde Oficinas hacia Internet está bloqueado. Solo HTTP/HTTPS via proxy web está permitido. Protocolos directos no HTTP son denegados.`,
      rule: `DENY: Oficinas → Internet | ${protocol} — Solo HTTP/HTTPS vía Proxy`,
    };
  }

  // Oficinas → Red Crítica: BLOQUEO TOTAL
  if (origin === 'Oficinas' && destination === 'Red Crítica') {
    return {
      allowed: false,
      explanation:
        'BLOQUEO TOTAL: No existe ninguna ruta desde la red de Oficinas hacia la Red Crítica. Esta regla no tiene excepciones. El NGFW descarta cualquier paquete con este origen-destino, sin importar el protocolo o puerto.',
      rule: 'DENY: Oficinas → Red Crítica | BLOQUEO TOTAL — Sin excepción directa',
    };
  }

  // Oficinas → Núcleo
  if (origin === 'Oficinas' && destination === 'Núcleo') {
    return {
      allowed: false,
      explanation:
        'Las Oficinas no tienen acceso directo al Núcleo de seguridad. El NGFW es el punto único de inspección y no se puede acceder a su interfaz de gestión desde la red de Oficinas.',
      rule: 'DENY: Oficinas → Núcleo | Sin acceso de gestión desde Oficinas',
    };
  }

  // DMZ → Red Crítica solo SQL
  if (origin === 'DMZ' && destination === 'Red Crítica') {
    if (protocol === 'SQL (1433/3306)') {
      return {
        allowed: true,
        explanation:
          'El servidor de banca en línea (DMZ) puede consultar el Datacenter únicamente via puerto SQL (1433/3306). El acceso es de solo lectura y completamente auditado. Toda consulta genera un registro en el log de auditoría.',
        rule: 'PERMIT: DMZ → Red Crítica | SQL (1433/3306) — Solo Lectura, Auditada',
      };
    }
    return {
      allowed: false,
      explanation: `La DMZ solo puede comunicarse con la Red Crítica mediante el puerto SQL (1433/3306) para consultas de solo lectura. El protocolo ${protocol} desde la DMZ hacia la Red Crítica está bloqueado.`,
      rule: `DENY: DMZ → Red Crítica | ${protocol} — Solo SQL auditado permitido`,
    };
  }

  // DMZ → Oficinas
  if (origin === 'DMZ' && destination === 'Oficinas') {
    return {
      allowed: false,
      explanation:
        'No existe comunicación directa desde la DMZ hacia la red de Oficinas. La DMZ es una zona de exposición pública controlada y no debe tener acceso a redes internas corporativas.',
      rule: 'DENY: DMZ → Oficinas | Sin comunicación directa',
    };
  }

  // Red Crítica → cualquier destino externo
  if (origin === 'Red Crítica') {
    return {
      allowed: false,
      explanation:
        'La Red Crítica es un segmento air-gapped lógico. No inicia conexiones salientes hacia ninguna red externa. Solo recibe tráfico auditado desde la DMZ.',
      rule: 'DENY: Red Crítica → Exterior | Red aislada — No inicia conexiones',
    };
  }

  // Default: deny-all
  return {
    allowed: false,
    explanation: `La combinación ${origin} → ${destination} con protocolo ${protocol} no está en ninguna regla de permitir. El NGFW aplica política Deny-All por defecto: todo lo no explícitamente permitido es bloqueado.`,
    rule: 'DENY: Deny-All por defecto — Combinación no autorizada',
  };
}
