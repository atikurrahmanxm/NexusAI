import { UserProfile, AuditLogEntry, ActionCategory, RbacFleetSummary } from '../types/rbacAudit';

export const USER_PROFILES: UserProfile[] = [
  {
    id: 'user-01-commander',
    name: 'Atikur Rahman',
    email: 'atikurrahmanxm@gmail.com',
    role: 'COMMANDER',
    roleTitle: 'SecOps Commander & Architect',
    clearanceLevel: 'LEVEL_4_ROOT',
    avatarInitials: 'AR',
    department: 'Enterprise Security Operations',
    permissions: [
      'ALL_ROOT_PRIVILEGES',
      'ZERO_TRUST_ISOLATE',
      'SOAR_PLAYBOOK_EXECUTE',
      'FIREWALL_RULE_DEPLOY',
      'CVE_PATCH_APPLY',
      'CHAOS_ATTACK_TRIGGER',
      'WEBHOOK_ADMIN'
    ]
  },
  {
    id: 'user-02-analyst',
    name: 'Sarah Chen',
    email: 's.chen@security.internal',
    role: 'ANALYST',
    roleTitle: 'Lead Threat Intelligence Analyst',
    clearanceLevel: 'LEVEL_3_ANALYST',
    avatarInitials: 'SC',
    department: 'Threat Analysis & Forensics',
    permissions: [
      'READ_TELEMETRY',
      'SEARCH_FORENSICS',
      'STIX_INTEL_QUERY',
      'IP_REPUTATION_LOOKUP',
      'EXPORT_DOSSIER'
    ]
  },
  {
    id: 'user-03-auditor',
    name: 'Marcus Vance',
    email: 'm.vance@compliance.internal',
    role: 'AUDITOR',
    roleTitle: 'SOC 2 & ISO Lead Auditor',
    clearanceLevel: 'LEVEL_2_AUDITOR',
    avatarInitials: 'MV',
    department: 'Risk, Governance & Compliance',
    permissions: [
      'READ_AUDIT_LOGS',
      'EXPORT_EXECUTIVE_PDF',
      'VIEW_COMPLIANCE_GRADE'
    ]
  },
  {
    id: 'user-04-devops',
    name: 'Elena Rostova',
    email: 'e.rostova@cloudops.internal',
    role: 'DEVOPS',
    roleTitle: 'Site Reliability & Infrastructure Lead',
    clearanceLevel: 'LEVEL_2_DEVOPS',
    avatarInitials: 'ER',
    department: 'Cloud Platform Engineering',
    permissions: [
      'READ_FLEET_STATUS',
      'REGISTER_SERVER_NODE',
      'VIEW_STREAM_GATEWAY',
      'PROBE_LATENCY'
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-9801',
    timestamp: '12:05:42',
    actorId: 'user-01-commander',
    actorName: 'Atikur Rahman',
    actorRole: 'COMMANDER',
    category: 'NODE_ISOLATION',
    details: 'Zero-Trust network isolation enforced on compromised host.',
    targetResource: 'alpha-gamma-01',
    sourceIp: '192.168.1.10',
    status: 'SUCCESS',
    hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    id: 'aud-9802',
    timestamp: '11:58:19',
    actorId: 'user-01-commander',
    actorName: 'Atikur Rahman',
    actorRole: 'COMMANDER',
    category: 'CVE_PATCH',
    details: 'Applied urgent security patch for OpenSSH regreSSHion (CVE-2024-6387).',
    targetResource: 'auth-gateway-primary',
    sourceIp: '192.168.1.10',
    status: 'SUCCESS',
    hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  {
    id: 'aud-9803',
    timestamp: '11:42:30',
    actorId: 'user-01-commander',
    actorName: 'Atikur Rahman',
    actorRole: 'COMMANDER',
    category: 'PLAYBOOK_EXECUTION',
    details: 'Executed SOAR autonomous playbook PB-01-DDOS against attacking subnet.',
    targetResource: 'Edge WAF Mesh',
    sourceIp: '192.168.1.10',
    status: 'SUCCESS',
    hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  },
  {
    id: 'aud-9804',
    timestamp: '11:15:02',
    actorId: 'user-03-auditor',
    actorName: 'Marcus Vance',
    actorRole: 'AUDITOR',
    category: 'NODE_ISOLATION',
    details: 'Attempted to isolate db-cluster-replica-3 without root authorization.',
    targetResource: 'db-cluster-replica-3',
    sourceIp: '10.0.5.88',
    status: 'DENIED',
    hashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
  }
];

const ACTIVE_USER_KEY = 'nexus_active_user_profile';
const AUDIT_STORAGE_KEY = 'nexus_audit_ledger_records';

export function loadActiveUser(): UserProfile {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (err) {
    console.error('Failed to load active user profile', err);
  }
  return USER_PROFILES[0]; // Default to Atikur Rahman (Commander)
}

export function saveActiveUser(user: UserProfile): void {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save active user profile', err);
  }
}

export function loadAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load audit logs', err);
  }
  return INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save audit logs', err);
  }
}

function generatePseudoHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function recordAuditEvent(
  actor: UserProfile,
  category: ActionCategory,
  details: string,
  targetResource: string,
  status: 'SUCCESS' | 'DENIED' = 'SUCCESS'
): AuditLogEntry {
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0];

  const newEntry: AuditLogEntry = {
    id: `aud-${Date.now().toString().slice(-4)}`,
    timestamp,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    category,
    details,
    targetResource,
    sourceIp: '192.168.1.10',
    status,
    hashSha256: generatePseudoHash()
  };

  return newEntry;
}

export function canPerformAction(user: UserProfile, action: ActionCategory): boolean {
  if (user.role === 'COMMANDER') return true;

  switch (action) {
    case 'NODE_ISOLATION':
    case 'FIREWALL_DEPLOY':
    case 'CHAOS_INJECTION':
    case 'POLICY_CHANGE':
      return false; // Only Commander
    case 'PLAYBOOK_EXECUTION':
    case 'CVE_PATCH':
      return user.role === 'DEVOPS';
    case 'AUTH_LOGIN':
      return true;
    default:
      return true;
  }
}

export function calculateRbacSummary(logs: AuditLogEntry[]): RbacFleetSummary {
  const total = logs.length;
  const violations = logs.filter(l => l.status === 'DENIED').length;

  return {
    totalAuditedEvents: total || 148,
    activeOperators: USER_PROFILES.length,
    violationsCaught: violations,
    complianceRating: 'SOC 2 Type II & ISO 27001 Verified'
  };
}
