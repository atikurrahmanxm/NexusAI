import { AttackType, SeverityLevel } from './telemetry';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  city: string;
}

export interface ThreatNodeLocation {
  id: string;
  name: string;
  xPercent: number; // 0 to 100 on 2D equirectangular projection
  yPercent: number;
  country: string;
  countryCode: string;
  isTargetCluster?: boolean;
}

export interface ActiveAttackVector {
  id: string;
  sourceIp: string;
  sourceLocation: ThreatNodeLocation;
  targetLocation: ThreatNodeLocation;
  attackType: AttackType;
  severity: SeverityLevel;
  timestamp: string;
}

export interface CountryAttackMetric {
  country: string;
  countryCode: string;
  count: number;
  percentage: number;
  topVector: AttackType;
}
