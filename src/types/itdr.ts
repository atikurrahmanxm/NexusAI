export type IdentityRiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  ip: string;
}

export interface AuthSessionEvent {
  id: string;
  userId: string;
  userName: string;
  email: string;
  timestamp: string;
  loginTime: number; // Unix timestamp in ms
  geo: GeoLocation;
  device: string;
  userAgent: string;
  authMethod: 'Password_MFA' | 'SSO_SAML' | 'OAuth2_Bearer' | 'API_Key';
  mfaAttempts: number;
  isImpossibleTravel: boolean;
  travelDistanceKm?: number;
  timeDeltaHours?: number;
  calculatedVelocityKmh?: number;
  isMfaFatigue: boolean;
  status: 'active' | 'revoked' | 'locked';
}

export interface IdentityUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'Global Admin' | 'Security Lead' | 'DevOps Engineer' | 'Billing Manager' | 'Standard User';
  mfaEnforced: boolean;
  lastActiveCity: string;
  lastActiveIp: string;
  riskScore: number; // 0 - 100
  riskLevel: IdentityRiskLevel;
  activeSessionsCount: number;
  isLocked: boolean;
}

export interface HaversineResult {
  cityA: string;
  cityB: string;
  distanceKm: number;
  timeDeltaHours: number;
  velocityKmh: number;
  isImpossible: boolean;
  explanation: string;
}
