import { ServerNode, NewServerPayload, FleetSummary } from '../types/serverFleet';
import { SecurityEvent } from '../types/telemetry';

export const INITIAL_SERVER_FLEET: ServerNode[] = [
  {
    id: 'srv-01-auth',
    name: 'auth-gateway-primary',
    hostname: 'auth-gw-01.prod.nexus.internal',
    ipAddress: '10.0.1.45',
    provider: 'AWS',
    region: 'us-east-1 (N. Virginia)',
    os: 'Ubuntu 22.04 LTS',
    status: 'UNDER_ATTACK',
    cpuUsage: 78.4,
    memoryUsage: 64.2,
    networkThroughputMbps: 450.8,
    activeConnections: 3420,
    agentVersion: 'v2.4.1-secops',
    lastHeartbeat: 'Just now (1s ago)',
    tags: ['production', 'pci-dss', 'dmz', 'public-ingress'],
    isIsolated: false,
    targetNodeKey: 'auth-gateway-primary'
  },
  {
    id: 'srv-02-k8s',
    name: 'us-east-k8s-pod',
    hostname: 'k8s-worker-pool-03.us-east.cloud',
    ipAddress: '10.0.2.112',
    provider: 'GCP',
    region: 'us-central1 (Iowa)',
    os: 'Container-Optimized OS',
    status: 'UNDER_ATTACK',
    cpuUsage: 91.2,
    memoryUsage: 82.5,
    networkThroughputMbps: 820.4,
    activeConnections: 5890,
    agentVersion: 'v2.4.1-secops',
    lastHeartbeat: 'Just now (2s ago)',
    tags: ['kubernetes', 'api-microservices', 'production'],
    isIsolated: false,
    targetNodeKey: 'us-east-k8s-pod'
  },
  {
    id: 'srv-03-alpha',
    name: 'alpha-gamma-01',
    hostname: 'alpha-cluster-ingress.eu.net',
    ipAddress: '192.168.10.15',
    provider: 'DigitalOcean',
    region: 'fra1 (Frankfurt)',
    os: 'Debian 12 Bookworm',
    status: 'UNDER_ATTACK',
    cpuUsage: 86.7,
    memoryUsage: 71.9,
    networkThroughputMbps: 620.1,
    activeConnections: 4120,
    agentVersion: 'v2.4.0-secops',
    lastHeartbeat: 'Just now (4s ago)',
    tags: ['edge-proxy', 'ddos-shield', 'nginx'],
    isIsolated: false,
    targetNodeKey: 'alpha-gamma-01'
  },
  {
    id: 'srv-04-db',
    name: 'db-cluster-replica-3',
    hostname: 'pg-replica-03.internal.db',
    ipAddress: '10.0.4.88',
    provider: 'AWS',
    region: 'us-east-1 (N. Virginia)',
    os: 'Amazon Linux 2023',
    status: 'ONLINE',
    cpuUsage: 34.5,
    memoryUsage: 58.2,
    networkThroughputMbps: 88.3,
    activeConnections: 890,
    agentVersion: 'v2.4.1-secops',
    lastHeartbeat: 'Just now (3s ago)',
    tags: ['database', 'postgresql-ha', 'private-vpc'],
    isIsolated: false,
    targetNodeKey: 'db-cluster-replica-3'
  },
  {
    id: 'srv-05-edge',
    name: 'edge-proxy-lon-02',
    hostname: 'edge-cache-uk.nexus.cdn',
    ipAddress: '185.190.22.4',
    provider: 'Azure',
    region: 'uksouth (London)',
    os: 'Ubuntu 22.04 LTS',
    status: 'ONLINE',
    cpuUsage: 28.1,
    memoryUsage: 41.6,
    networkThroughputMbps: 184.2,
    activeConnections: 1250,
    agentVersion: 'v2.4.1-secops',
    lastHeartbeat: 'Just now (1s ago)',
    tags: ['cdn-edge', 'waf-enabled', 'ssl-termination'],
    isIsolated: false,
    targetNodeKey: 'edge-proxy-lon-02'
  },
  {
    id: 'srv-06-vault',
    name: 'payment-vault-prod',
    hostname: 'hsm-vault-01.secure.internal',
    ipAddress: '10.0.99.12',
    provider: 'Bare-Metal',
    region: 'ch-zur-01 (Zurich)',
    os: 'Hardened Alpine Linux 3.19',
    status: 'ONLINE',
    cpuUsage: 14.8,
    memoryUsage: 26.3,
    networkThroughputMbps: 22.4,
    activeConnections: 180,
    agentVersion: 'v2.4.1-secops',
    lastHeartbeat: 'Just now (2s ago)',
    tags: ['airgapped', 'zero-trust', 'tokenization', 'pci-level-1'],
    isIsolated: false,
    targetNodeKey: 'payment-vault-prod'
  }
];

const FLEET_STORAGE_KEY = 'nexus_server_fleet';

export function loadServerFleet(): ServerNode[] {
  try {
    const raw = localStorage.getItem(FLEET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load server fleet from storage', err);
  }
  return INITIAL_SERVER_FLEET;
}

export function saveServerFleet(nodes: ServerNode[]): void {
  try {
    localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(nodes));
  } catch (err) {
    console.error('Failed to save server fleet', err);
  }
}

export function computeFleetSummary(nodes: ServerNode[], events: SecurityEvent[]): FleetSummary {
  const totalNodes = nodes.length;
  if (totalNodes === 0) {
    return {
      totalNodes: 0,
      onlineNodes: 0,
      underAttackNodes: 0,
      isolatedNodes: 0,
      avgCpuUsage: 0,
      avgMemoryUsage: 0,
      totalNetworkMbps: 0
    };
  }

  // Correlate active attacks with target nodes
  const targetedNodeKeys = new Set(
    events
      .filter(e => e.status === 'flagged' || e.status === 'investigating')
      .map(e => e.targetNode)
  );

  let underAttackCount = 0;
  let isolatedCount = 0;
  let onlineCount = 0;
  let sumCpu = 0;
  let sumMem = 0;
  let sumNetwork = 0;

  nodes.forEach(node => {
    sumCpu += node.cpuUsage;
    sumMem += node.memoryUsage;
    sumNetwork += node.networkThroughputMbps;

    if (node.isIsolated) {
      isolatedCount++;
    } else if (targetedNodeKeys.has(node.targetNodeKey) || node.status === 'UNDER_ATTACK') {
      underAttackCount++;
    } else {
      onlineCount++;
    }
  });

  return {
    totalNodes,
    onlineNodes: onlineCount,
    underAttackNodes: underAttackCount,
    isolatedNodes: isolatedCount,
    avgCpuUsage: parseFloat((sumCpu / totalNodes).toFixed(1)),
    avgMemoryUsage: parseFloat((sumMem / totalNodes).toFixed(1)),
    totalNetworkMbps: parseFloat(sumNetwork.toFixed(1))
  };
}

export function toggleNodeIsolation(nodes: ServerNode[], nodeId: string): ServerNode[] {
  const updated = nodes.map(node => {
    if (node.id === nodeId) {
      const willIsolate = !node.isIsolated;
      return {
        ...node,
        isIsolated: willIsolate,
        status: willIsolate ? ('ISOLATED' as const) : ('ONLINE' as const),
        isolationTimestamp: willIsolate ? new Date().toLocaleTimeString() : undefined
      };
    }
    return node;
  });
  saveServerFleet(updated);
  return updated;
}

export function registerNewServer(
  nodes: ServerNode[],
  payload: NewServerPayload
): { updatedNodes: ServerNode[]; newServer: ServerNode } {
  const uniqueId = `srv-${Date.now().toString().slice(-4)}-${payload.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`;
  
  const newServer: ServerNode = {
    id: uniqueId,
    name: payload.name,
    hostname: `${payload.name}.node.nexus.internal`,
    ipAddress: payload.ipAddress,
    provider: payload.provider,
    region: payload.region,
    os: payload.os,
    status: 'ONLINE',
    cpuUsage: parseFloat((Math.random() * 20 + 15).toFixed(1)),
    memoryUsage: parseFloat((Math.random() * 25 + 25).toFixed(1)),
    networkThroughputMbps: parseFloat((Math.random() * 120 + 30).toFixed(1)),
    activeConnections: Math.floor(Math.random() * 800 + 150),
    agentVersion: 'v2.4.1-secops',
    lastHeartbeat: 'Connected (1s ago)',
    tags: payload.tags.length > 0 ? payload.tags : ['fleet-agent', 'monitored'],
    isIsolated: false,
    targetNodeKey: payload.name
  };

  const updatedNodes = [newServer, ...nodes];
  saveServerFleet(updatedNodes);
  return { updatedNodes, newServer };
}

export function removeServer(nodes: ServerNode[], nodeId: string): ServerNode[] {
  const updated = nodes.filter(n => n.id !== nodeId);
  saveServerFleet(updated);
  return updated;
}

export function generateAgentInstallScript(server: ServerNode): string {
  return `curl -sSL https://get.nexusai.security/agent.sh | sudo bash -s -- \\
  --token="nexus_token_${server.id}_live" \\
  --node="${server.name}" \\
  --cluster="prod-eu-west" \\
  --region="${server.region}" \\
  --enable-realtime-telemetry`;
}
