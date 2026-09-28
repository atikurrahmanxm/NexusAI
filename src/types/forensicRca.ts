export type KillChainPhase = 
  | 'RECONNAISSANCE' 
  | 'INITIAL_ACCESS' 
  | 'EXECUTION' 
  | 'PERSISTENCE' 
  | 'PRIVILEGE_ESCALATION' 
  | 'LATERAL_MOVEMENT' 
  | 'EXFILTRATION' 
  | 'CONTAINMENT';

export type TimelineEventStatus = 'EXECUTED' | 'BLOCKED' | 'NEUTRALIZED';

export interface TimelineEvent {
  id: string;
  phase: KillChainPhase;
  timestamp: string;
  actor: string;
  action: string;
  targetResource: string;
  mitreTechnique: string;
  status: TimelineEventStatus;
  technicalDetails: string;
}

export interface ForensicArtifact {
  id: string;
  name: string;
  type: 'PCAP_CAPTURE' | 'PROCESS_TREE' | 'MEMORY_HASH' | 'AUTH_LOG' | 'FILE_HASH';
  hashSha256: string;
  details: string;
  collectedAt: string;
  sizeBytes: string;
}

export interface IncidentCase {
  id: string;
  caseNumber: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'CONTAINED' | 'INVESTIGATING' | 'RESOLVED';
  leadInvestigator: string;
  detectedAt: string;
  containedAt: string;
  mttrSeconds: number;
  blastRadiusScore: number; // 0 to 100
  impactedAssets: string[];
  rootCauseDescription: string;
  timelineEvents: TimelineEvent[];
  artifacts: ForensicArtifact[];
}

export interface RcaSummary {
  totalCases: number;
  containedCases: number;
  avgMttrSeconds: number;
  avgBlastRadiusScore: number;
  totalArtifactsSecured: number;
}
