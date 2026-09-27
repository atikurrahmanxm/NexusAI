import { AttackType, SeverityLevel } from './telemetry';

export type PlaybookActionType = 
  | 'BLOCK_IP_FIREWALL'
  | 'RATE_LIMIT_GATEWAY'
  | 'ZERO_TRUST_ISOLATE'
  | 'INVALIDATE_AUTH_TOKENS'
  | 'WAF_CAPTCHA_CHALLENGE'
  | 'SNAPSHOT_MEMORY_DUMP'
  | 'DISPATCH_WEBHOOK_ALERT'
  | 'QUARANTINE_CONTAINER';

export type PlaybookMode = 'FULL_AUTONOMOUS' | 'MANUAL_APPROVAL';

export type StepExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface PlaybookStep {
  id: string;
  order: number;
  name: string;
  actionType: PlaybookActionType;
  targetService: string; // e.g. 'Cloudflare WAF', 'Linux iptables', 'K8s CNI Mesh'
  description: string;
  commandSnippet: string;
  status: StepExecutionStatus;
  durationMs?: number;
  outputLog?: string;
}

export interface PlaybookTrigger {
  attackType: AttackType | 'ANY_CRITICAL';
  minSeverity: SeverityLevel;
  minAnomalyScore: number;
  conditionDescription: string;
}

export interface Playbook {
  id: string;
  name: string;
  tagline: string;
  description: string;
  trigger: PlaybookTrigger;
  mode: PlaybookMode;
  isActive: boolean;
  steps: PlaybookStep[];
  executionCount: number;
  meanExecutionTimeMs: number;
  lastExecutedTimestamp?: string;
  lastTargetIp?: string;
  tags: string[];
}

export interface PlaybookExecutionResult {
  playbookId: string;
  executionId: string;
  timestamp: string;
  success: boolean;
  totalDurationMs: number;
  logs: string[];
}

export interface SoarMetrics {
  totalPlaybooks: number;
  activeAutonomous: number;
  totalRemediations: number;
  meanTimeToRespondSeconds: number; // e.g. 1.2 seconds
  successRatePercentage: number; // e.g. 99.8%
}
