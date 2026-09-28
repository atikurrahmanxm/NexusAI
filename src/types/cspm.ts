export type CloudProvider = 'AWS' | 'GCP' | 'AZURE' | 'KUBERNETES';

export type ComplianceStandard = 
  | 'CIS_BENCHMARK'
  | 'PCI_DSS_4'
  | 'SOC_2_TYPE_II'
  | 'HIPAA'
  | 'ISO_27001';

export type PostureFindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PostureFindingStatus = 'FAILED' | 'PASSED' | 'REMEDIATED' | 'SUPPRESSED';

export interface PostureFinding {
  id: string;
  title: string;
  description: string;
  cloudProvider: CloudProvider;
  resourceId: string;
  resourceType: string;
  region: string;
  severity: PostureFindingSeverity;
  status: PostureFindingStatus;
  standards: ComplianceStandard[];
  controlId: string;
  remediationCli: string;
  remediationTerraform: string;
  detectedAt: string;
  impactScore: number;
}

export interface ComplianceScore {
  standard: ComplianceStandard;
  label: string;
  score: number; // 0 to 100
  totalControls: number;
  passedControls: number;
  failedControls: number;
  badgeColor: string;
}

export interface CspmSummary {
  overallHealthScore: number;
  totalAssetsAudited: number;
  criticalMisconfigs: number;
  highMisconfigs: number;
  remediatedCount: number;
  passedCount: number;
  complianceScores: ComplianceScore[];
}
