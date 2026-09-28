export type SigmaRuleSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SigmaRuleCategory = 
  | 'WEB_APPLICATION' 
  | 'CLOUD_INFRA' 
  | 'ENDPOINT_LINUX' 
  | 'IDENTITY_AUTH' 
  | 'NETWORK_TRAFFIC';

export type RuleStatus = 'ENABLED' | 'TESTING' | 'DISABLED';

export interface TranspiledQueries {
  splunkSpl: string;
  elasticDsl: string;
  sentinelKql: string;
  crowdstrikeCql: string;
}

export interface SigmaDetectionRule {
  id: string;
  ruleCode: string;
  title: string;
  status: RuleStatus;
  severity: SigmaRuleSeverity;
  category: SigmaRuleCategory;
  author: string;
  mitreTactics: string[];
  mitreTechniques: string[];
  description: string;
  yamlDefinition: string;
  queries: TranspiledQueries;
  matchesCount: number;
  lastMatchedAt?: string;
  falsePositiveRate: string;
}

export interface DetectionEngineSummary {
  totalRules: number;
  activeRules: number;
  totalDetectionsFired: number;
  avgEvaluationLatencyUs: number;
  coverageTacticsCount: number;
}
