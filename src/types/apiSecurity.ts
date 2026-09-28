export type OwaspApiCategory = 
  | 'API1:2023 - Broken Object Level Authorization (BOLA)'
  | 'API2:2023 - Broken Authentication (JWT/Token)'
  | 'API3:2023 - Broken Object Property Level Authorization (Mass Assignment)'
  | 'API4:2023 - Unrestricted Resource Consumption (Rate Limit/DoS)'
  | 'API5:2023 - Broken Function Level Authorization (BFLA)'
  | 'API6:2023 - Unrestricted Access to Sensitive Business Flows'
  | 'API7:2023 - Server Side Request Forgery (SSRF)'
  | 'API8:2023 - Security Misconfiguration'
  | 'API9:2023 - Improper Inventory Management (Shadow/Zombie API)'
  | 'API10:2023 - Unsafe Consumption of APIs';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  category: 'managed' | 'shadow' | 'zombie';
  authScheme: 'OAuth2_Bearer' | 'API_Key' | 'Basic_Auth' | 'Unauthenticated';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  piiExposed: boolean;
  piiTypes: string[];
  avgRps: number;
  rateLimitQuota: number;
  lastObserved: string;
  isProtected: boolean;
}

export interface ApiSecurityEvent {
  id: string;
  timestamp: string;
  clientIp: string;
  endpoint: string;
  method: HttpMethod;
  owaspCategory: OwaspApiCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
  blocked: boolean;
  jwtDecoded?: {
    sub: string;
    role: string;
    alg: string;
    expStatus: string;
  };
}

export interface JwtInspectionResult {
  rawToken: string;
  header: {
    alg: string;
    typ: string;
    kid?: string;
  };
  payload: {
    sub: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
    iss: string;
  };
  isAlgNoneVulnerable: boolean;
  isExpired: boolean;
  isSignatureValid: boolean;
  isBOLAAttempt: boolean;
  securityScore: number;
  auditFindings: string[];
}
