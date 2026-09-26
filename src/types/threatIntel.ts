import { SeverityLevel } from './telemetry';

export type FeedSource = 'CISA-KEV' | 'AbuseIPDB' | 'AlienVault-OTX' | 'STIX-TAXII-2.1';

export interface IOCRecord {
  id: string;
  indicator: string;
  type: 'ipv4' | 'domain' | 'sha256' | 'cidr';
  threatActor: string;
  confidenceScore: number; // 0 - 100
  severity: SeverityLevel;
  feedSource: FeedSource;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  mitreId: string;
  mitreTechnique: string;
  status: 'active' | 'quarantined' | 'whitelisted';
}

export interface MitreTechniqueSummary {
  id: string;
  name: string;
  tactic: string;
  hits: number;
  severity: SeverityLevel;
  observedInTelemetry: boolean;
}

export interface MitreTacticGroup {
  id: string;
  name: string;
  techniques: MitreTechniqueSummary[];
}

export interface IpReputationResult {
  ip: string;
  reputationScore: number; // 0 (Clean) to 100 (Malicious)
  abuseConfidencePercentage: number;
  asn: string;
  isp: string;
  country: string;
  countryCode: string;
  isTorExitNode: boolean;
  isKnownBotnet: boolean;
  totalAbuseReports: number;
  lastReportedDate: string;
  associatedIncidents: string[];
  recommendedAction: string;
}
