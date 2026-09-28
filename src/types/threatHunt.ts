export type AssetEnvironment = 'PRODUCTION' | 'STAGING' | 'DMZ';

export type AssetType = 
  | 'API_GATEWAY' 
  | 'FINANCIAL_CHECKOUT' 
  | 'IDENTITY_IDP' 
  | 'DATABASE_CLUSTER';

export interface TargetAsset {
  id: string;
  domain: string;
  assetType: AssetType;
  environment: AssetEnvironment;
  activeThreatsCount: number;
  protectionStatus: 'ARMORED' | 'UNDER_ATTACK' | 'MONITORING';
}

export type AttackerStatus = 'ACTIVE_PROBE' | 'INTERCEPTED' | 'QUARANTINED';

export interface AttackerAttribution {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  asn: string;
  reverseDns: string;
  targetDomain: string;
  targetEndpoint: string;
  attackTechnique: string;
  mitreId: string;
  userFingerprint: string;
  isHoneypotTriggered: boolean;
  honeypotName?: string;
  status: AttackerStatus;
  timestamp: string;
}

export type DecoyType = 
  | 'SSH_BASTION' 
  | 'ADMIN_PORTAL' 
  | 'AWS_HONEYTOKEN' 
  | 'SQL_INJECTION_BAIT';

export interface HoneypotSensor {
  id: string;
  name: string;
  decoyType: DecoyType;
  virtualPort: number;
  status: 'ARMED' | 'TRIGGERED';
  trappedAttackersCount: number;
  lastTrappedAt: string;
  description: string;
}

export interface ThreatHuntSummary {
  totalAttributedAttackers: number;
  activeHoneypots: number;
  honeypotTrapsFired: number;
  quarantinedIps: number;
  underAttackAssetsCount: number;
}
