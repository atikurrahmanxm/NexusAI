import { ApiEndpoint, ApiSecurityEvent, JwtInspectionResult } from '../types/apiSecurity';

export const INITIAL_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'EP-01',
    method: 'POST',
    path: '/api/v2/financial/wire_transfer',
    category: 'managed',
    authScheme: 'OAuth2_Bearer',
    riskLevel: 'critical',
    piiExposed: true,
    piiTypes: ['Bank Account', 'Routing Number', 'User UUID'],
    avgRps: 45,
    rateLimitQuota: 60,
    lastObserved: '2026-09-28 17:15:20',
    isProtected: true
  },
  {
    id: 'EP-02',
    method: 'GET',
    path: '/v1/legacy/export_users_dump',
    category: 'zombie',
    authScheme: 'Unauthenticated',
    riskLevel: 'critical',
    piiExposed: true,
    piiTypes: ['Email', 'Password Hash (bcrypt)', 'Phone Number', 'Full Name'],
    avgRps: 12,
    rateLimitQuota: 0,
    lastObserved: '2026-09-28 17:12:05',
    isProtected: false
  },
  {
    id: 'EP-03',
    method: 'GET',
    path: '/beta/internal/debug_metrics',
    category: 'shadow',
    authScheme: 'API_Key',
    riskLevel: 'high',
    piiExposed: true,
    piiTypes: ['Server Memory Dump', 'Database Connection Strings'],
    avgRps: 8,
    rateLimitQuota: 100,
    lastObserved: '2026-09-28 16:55:40',
    isProtected: false
  },
  {
    id: 'EP-04',
    method: 'GET',
    path: '/api/v1/users/{id}/billing',
    category: 'managed',
    authScheme: 'OAuth2_Bearer',
    riskLevel: 'high',
    piiExposed: true,
    piiTypes: ['Credit Card Last4', 'Billing Address', 'Tax ID'],
    avgRps: 180,
    rateLimitQuota: 250,
    lastObserved: '2026-09-28 17:18:10',
    isProtected: true
  },
  {
    id: 'EP-05',
    method: 'POST',
    path: '/internal/webhooks/trigger',
    category: 'shadow',
    authScheme: 'Unauthenticated',
    riskLevel: 'critical',
    piiExposed: false,
    piiTypes: [],
    avgRps: 4,
    rateLimitQuota: 20,
    lastObserved: '2026-09-28 16:40:15',
    isProtected: false
  },
  {
    id: 'EP-06',
    method: 'POST',
    path: '/api/v1/auth/token',
    category: 'managed',
    authScheme: 'Basic_Auth',
    riskLevel: 'medium',
    piiExposed: true,
    piiTypes: ['User UUID', 'Session Refresh Token'],
    avgRps: 340,
    rateLimitQuota: 500,
    lastObserved: '2026-09-28 17:20:00',
    isProtected: true
  }
];

export const INITIAL_API_SECURITY_EVENTS: ApiSecurityEvent[] = [
  {
    id: 'ASE-9401',
    timestamp: '17:21:04',
    clientIp: '198.51.100.77',
    endpoint: '/api/v1/users/8849/billing',
    method: 'GET',
    owaspCategory: 'API1:2023 - Broken Object Level Authorization (BOLA)',
    severity: 'critical',
    details: 'BOLA/IDOR exploit: Authenticated caller "user_104" attempted to read billing records of object "user_8849" without scope.',
    blocked: true,
    jwtDecoded: {
      sub: 'user_104',
      role: 'standard_user',
      alg: 'RS256',
      expStatus: 'Valid'
    }
  },
  {
    id: 'ASE-9402',
    timestamp: '17:19:42',
    clientIp: '185.220.101.45',
    endpoint: '/api/v2/financial/wire_transfer',
    method: 'POST',
    owaspCategory: 'API2:2023 - Broken Authentication (JWT/Token)',
    severity: 'critical',
    details: 'JWT Signature Bypass exploit: Client forged authorization header using "alg": "none" and omitted cryptographic signature.',
    blocked: true,
    jwtDecoded: {
      sub: 'admin_root',
      role: 'superadmin',
      alg: 'none',
      expStatus: 'Vulnerable (Alg: None)'
    }
  },
  {
    id: 'ASE-9403',
    timestamp: '17:16:15',
    clientIp: '103.21.244.18',
    endpoint: '/api/v1/users/profile',
    method: 'PUT',
    owaspCategory: 'API3:2023 - Broken Object Property Level Authorization (Mass Assignment)',
    severity: 'high',
    details: 'Mass Assignment attack: Client injected unauthorized parameters {"role": "superadmin", "tier": "enterprise_free", "verified": true}.',
    blocked: true
  },
  {
    id: 'ASE-9404',
    timestamp: '17:14:00',
    clientIp: '45.33.32.156',
    endpoint: '/v1/legacy/export_users_dump',
    method: 'GET',
    owaspCategory: 'API9:2023 - Improper Inventory Management (Shadow/Zombie API)',
    severity: 'critical',
    details: 'Unauthenticated scraper accessed deprecated zombie endpoint exposing 12,000+ customer bcrypt password hashes.',
    blocked: true
  },
  {
    id: 'ASE-9405',
    timestamp: '17:10:30',
    clientIp: '194.26.29.112',
    endpoint: '/internal/webhooks/trigger',
    method: 'POST',
    owaspCategory: 'API7:2023 - Server Side Request Forgery (SSRF)',
    severity: 'critical',
    details: 'SSRF Attack: Target URL payload contained internal AWS metadata IP "http://169.254.169.254/latest/meta-data/iam/security-credentials".',
    blocked: true
  },
  {
    id: 'ASE-9406',
    timestamp: '17:05:12',
    clientIp: '91.240.118.66',
    endpoint: '/api/v1/auth/token',
    method: 'POST',
    owaspCategory: 'API4:2023 - Unrestricted Resource Consumption (Rate Limit/DoS)',
    severity: 'medium',
    details: 'Rate limit violation: Burst of 1,280 requests/sec exceeded endpoint quota threshold (500 req/s). Enforced 429 Too Many Requests.',
    blocked: true
  }
];

// Base64Url helper
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Preset JWT generation for sandbox testing
export function createSampleJwt(type: 'valid' | 'alg_none' | 'expired' | 'bola'): string {
  const nowSec = Math.floor(Date.now() / 1000);

  if (type === 'valid') {
    const header = { alg: 'RS256', typ: 'JWT', kid: 'rsa-key-nexus-2026' };
    const payload = {
      sub: 'usr_secops_9921',
      name: 'Atikur Rahman',
      role: 'security_lead',
      iat: nowSec - 300,
      exp: nowSec + 3600,
      iss: 'https://auth.nexus-security.io'
    };
    return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.e30_mock_rsa256_cryptographic_signature_verified_ok_8829`;
  }

  if (type === 'alg_none') {
    const header = { alg: 'none', typ: 'JWT' };
    const payload = {
      sub: 'admin_root',
      name: 'Adversary (Elevated)',
      role: 'superadmin',
      iat: nowSec - 100,
      exp: nowSec + 7200,
      iss: 'https://auth.nexus-security.io'
    };
    return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.`;
  }

  if (type === 'expired') {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: 'usr_old_session',
      name: 'Stale Session',
      role: 'analyst',
      iat: nowSec - 100000,
      exp: nowSec - 50000, // Expired in the past!
      iss: 'https://auth.nexus-security.io'
    };
    return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.mock_hs256_stale_signature_1294`;
  }

  // BOLA exploit
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    sub: 'user_104', // Token belongs to user_104
    name: 'Attacker Account',
    role: 'standard_user',
    iat: nowSec - 200,
    exp: nowSec + 3600,
    iss: 'https://auth.nexus-security.io'
  };
  return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.mock_bola_jwt_signature_4892`;
}

// Deep JWT Security Inspector
export function inspectJwtToken(rawToken: string, accessedResourceId: string = 'user_8849'): JwtInspectionResult {
  const parts = rawToken.trim().split('.');
  const findings: string[] = [];
  let score = 100;

  let header = { alg: 'UNKNOWN', typ: 'JWT' };
  let payload = {
    sub: 'unknown',
    name: 'unknown',
    role: 'unknown',
    iat: 0,
    exp: 0,
    iss: 'unknown'
  };

  try {
    if (parts[0]) {
      header = JSON.parse(base64UrlDecode(parts[0]));
    }
    if (parts[1]) {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    }
  } catch {
    findings.push('Malformed JWT: Failed to parse Base64Url JSON headers or payload.');
    score -= 60;
  }

  const isAlgNone = header.alg.toLowerCase() === 'none' || !parts[2] || parts[2].length === 0;
  if (isAlgNone) {
    findings.push('CRITICAL: "alg": "none" vulnerability detected. Token lacks cryptographic digital signature.');
    score -= 50;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp > 0 && payload.exp < nowSec;
  if (isExpired) {
    findings.push(`HIGH: Token expired at unix timestamp ${payload.exp} (${Math.round((nowSec - payload.exp) / 60)} minutes ago).`);
    score -= 30;
  }

  // BOLA inspection
  const isBOLA = payload.sub !== accessedResourceId && accessedResourceId.startsWith('user_');
  if (isBOLA) {
    findings.push(`CRITICAL: BOLA/IDOR Mismatch! Token subject "${payload.sub}" does not match requested object ID "${accessedResourceId}".`);
    score -= 40;
  }

  if (header.alg === 'HS256') {
    findings.push('MEDIUM: Symmetric HMAC-SHA256 used instead of Asymmetric RS256/ES256 public key cryptography.');
    score -= 10;
  }

  if (findings.length === 0) {
    findings.push('VERIFIED: Strong asymmetric signature algorithm, valid expiration window, and authorization claims matched.');
  }

  return {
    rawToken,
    header,
    payload,
    isAlgNoneVulnerable: isAlgNone,
    isExpired,
    isSignatureValid: !isAlgNone && parts.length === 3 && parts[2].length > 10,
    isBOLAAttempt: isBOLA,
    securityScore: Math.max(0, score),
    auditFindings: findings
  };
}

// Export OpenAPI 3.1 Hardened Schema
export function exportOpenApiSchema(endpoints: ApiEndpoint[]): string {
  let yaml = `# =====================================================================
# NexusAI Automated OpenAPI 3.1 Hardened API Security Specification
# Generated Date: ${new Date().toISOString()}
# Strict OWASP API Top 10 Guardrails Enabled
# =====================================================================
openapi: 3.1.0
info:
  title: NexusAI Protected Enterprise API
  version: 2.4.0
  description: Hardened API gateway schema with mandatory OAuth2 scopes, rate limiting, and PII protection.
servers:
  - url: https://api.nexus-security.io/v2
    description: Production API Gateway (Protected)

paths:
`;

  endpoints.forEach(ep => {
    yaml += `  ${ep.path}:
    ${ep.method.toLowerCase()}:
      summary: ${ep.category.toUpperCase()} Endpoint - Risk [${ep.riskLevel.toUpperCase()}]
      security:
        - OAuth2Bearer:
            - "read:${ep.path.split('/')[2] || 'core'}"
            - "write:${ep.path.split('/')[2] || 'core'}"
      parameters:
        - in: header
          name: X-Nexus-RateLimit-Limit
          schema:
            type: integer
            default: ${ep.rateLimitQuota}
      responses:
        '200':
          description: Authorized request verified against BOLA and Mass Assignment.
        '401':
          description: Missing or invalid JWT cryptographic signature.
        '403':
          description: BOLA/IDOR Subject Claim Mismatch Forbidden.
        '429':
          description: Rate limit quota exceeded.
`;
  });

  yaml += `
components:
  securitySchemes:
    OAuth2Bearer:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Asymmetric RS256 signed JWT with mandatory audience, subject, and scope verification.
`;

  return yaml;
}

// Export Cloudflare API Shield / Envoy Schema Rule
export function exportCloudflareApiShield(endpoints: ApiEndpoint[]): string {
  const rules = endpoints.map(ep => ({
    endpoint: ep.path,
    method: ep.method,
    category: ep.category,
    action: ep.category === 'zombie' ? 'BLOCK' : 'VALIDATE_SCHEMA_AND_RATE_LIMIT',
    rate_limit_per_minute: ep.rateLimitQuota * 60,
    jwt_validation: {
      required: ep.authScheme === 'OAuth2_Bearer',
      disallow_alg_none: true,
      allowed_algorithms: ['RS256', 'ES256']
    },
    pii_masking: ep.piiExposed,
    pii_fields: ep.piiTypes
  }));

  return JSON.stringify({
    schema_version: 'nexus.api-shield.v1',
    created_at: new Date().toISOString(),
    total_endpoints: endpoints.length,
    shield_rules: rules
  }, null, 2);
}

// LocalStorage helpers
const API_ENDPOINTS_KEY = 'nexus_api_endpoints';
const API_EVENTS_KEY = 'nexus_api_security_events';

export function loadApiEndpoints(): ApiEndpoint[] {
  try {
    const saved = localStorage.getItem(API_ENDPOINTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Quota
  }
  return INITIAL_API_ENDPOINTS;
}

export function saveApiEndpoints(endpoints: ApiEndpoint[]): void {
  try {
    localStorage.setItem(API_ENDPOINTS_KEY, JSON.stringify(endpoints));
  } catch {
    // Quota
  }
}

export function loadApiSecurityEvents(): ApiSecurityEvent[] {
  try {
    const saved = localStorage.getItem(API_EVENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Quota
  }
  return INITIAL_API_SECURITY_EVENTS;
}

export function saveApiSecurityEvents(events: ApiSecurityEvent[]): void {
  try {
    localStorage.setItem(API_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Quota
  }
}
