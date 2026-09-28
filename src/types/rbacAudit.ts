export type UserRole = 'COMMANDER' | 'ANALYST' | 'AUDITOR' | 'DEVOPS';

export type ActionCategory = 
  | 'NODE_ISOLATION'
  | 'PLAYBOOK_EXECUTION'
  | 'FIREWALL_DEPLOY'
  | 'CVE_PATCH'
  | 'CHAOS_INJECTION'
  | 'POLICY_CHANGE'
  | 'AUTH_LOGIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  clearanceLevel: 'LEVEL_4_ROOT' | 'LEVEL_3_ANALYST' | 'LEVEL_2_AUDITOR' | 'LEVEL_2_DEVOPS';
  avatarInitials: string;
  department: string;
  permissions: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  category: ActionCategory;
  details: string;
  targetResource: string;
  sourceIp: string;
  status: 'SUCCESS' | 'DENIED';
  hashSha256: string;
}

export interface RbacFleetSummary {
  totalAuditedEvents: number;
  activeOperators: number;
  violationsCaught: number;
  complianceRating: string; // e.g. SOC 2 Type II Verified
}
