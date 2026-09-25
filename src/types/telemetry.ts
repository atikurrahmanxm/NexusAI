export type AttackType = 
  | 'DDoS' 
  | 'SQLi' 
  | 'BruteForce' 
  | 'PortScan' 
  | 'Malware' 
  | 'Phishing' 
  | 'Benign';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'investigating' | 'mitigated' | 'flagged' | 'resolved';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SSH';
  attackType: AttackType;
  severity: SeverityLevel;
  anomalyScore: number; // 0.0 to 10.0
  targetNode: string;
  details: string;
  status: IncidentStatus;
}

export interface SystemMetrics {
  activeThreats: number;
  threatDeltaPercentage: number;
  dataAnomalies: number;
  threatScore: number; // 0 to 100
  threatLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  securedNodes: number;
  totalNodes: number;
  totalEventsProcessed: number;
}

export interface ThreatDistribution {
  type: AttackType;
  count: number;
  percentage: number;
}
