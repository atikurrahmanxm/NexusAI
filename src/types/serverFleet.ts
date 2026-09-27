export type CloudProvider = 'AWS' | 'GCP' | 'DigitalOcean' | 'Azure' | 'On-Premise' | 'Bare-Metal';

export type NodeStatus = 'ONLINE' | 'UNDER_ATTACK' | 'DEGRADED' | 'ISOLATED' | 'OFFLINE';

export interface ServerNode {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  provider: CloudProvider;
  region: string;
  os: string;
  status: NodeStatus;
  cpuUsage: number; // 0 - 100%
  memoryUsage: number; // 0 - 100%
  networkThroughputMbps: number; // Mbps
  activeConnections: number;
  agentVersion: string;
  lastHeartbeat: string;
  tags: string[];
  isIsolated: boolean;
  isolationTimestamp?: string;
  targetNodeKey: string; // matches telemetry targetNode
}

export interface NewServerPayload {
  name: string;
  ipAddress: string;
  provider: CloudProvider;
  region: string;
  os: string;
  tags: string[];
}

export interface FleetSummary {
  totalNodes: number;
  onlineNodes: number;
  underAttackNodes: number;
  isolatedNodes: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  totalNetworkMbps: number;
}
