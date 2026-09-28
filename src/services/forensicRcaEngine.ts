import { 
  IncidentCase, 
  RcaSummary 
} from '../types/forensicRca';

export const INITIAL_INCIDENT_CASES: IncidentCase[] = [
  {
    id: 'case-01',
    caseNumber: 'INC-2026-0984',
    title: 'Multi-Stage SQL Injection & Canary Honeytoken Exfiltration Attempt',
    severity: 'CRITICAL',
    status: 'CONTAINED',
    leadInvestigator: 'Atikur Rahman',
    detectedAt: '11:40:12',
    containedAt: '12:10:05',
    mttrSeconds: 72, // 1.2 minutes
    blastRadiusScore: 28,
    impactedAssets: [
      'api.nexus-defense.io (Edge Ingress)',
      'pay.nexus-banking.corp (Target App)',
      'auth.sso-identity.internal (Canary Target)'
    ],
    rootCauseDescription: 'External Tor relay host leveraged an unescaped SQL parameter in the user query endpoint, triggering a canary honeytoken trap which led to immediate automated containment by NexusAI SOAR.',
    timelineEvents: [
      {
        id: 'tl-01',
        phase: 'RECONNAISSANCE',
        timestamp: '11:40:12',
        actor: '185.220.101.5 (Tor Exit Relay / Amsterdam)',
        action: 'Automated Port Sweep & Directory Enumeration',
        targetResource: 'api.nexus-defense.io:443',
        mitreTechnique: 'T1595.002 - Vulnerability Scanning',
        status: 'EXECUTED',
        technicalDetails: 'High-speed HTTP GET probes against /api/v1/ endpoints probing for debug endpoints and exposed swagger specs.'
      },
      {
        id: 'tl-02',
        phase: 'INITIAL_ACCESS',
        timestamp: '11:52:40',
        actor: '185.220.101.5 (Tor Exit Relay / Amsterdam)',
        action: 'Boolean Blind SQL Injection Exploit Payload',
        targetResource: 'api.nexus-defense.io/v1/users',
        mitreTechnique: 'T1190 - Exploit Public-Facing Application',
        status: 'BLOCKED',
        technicalDetails: "Injected payload: ' OR 1=1 UNION SELECT schema_name FROM information_schema.schemata--. Flagged by WAF and routed into honeytoken trap."
      },
      {
        id: 'tl-03',
        phase: 'EXECUTION',
        timestamp: '12:04:19',
        actor: '198.51.100.77 (Compromised AWS Node)',
        action: 'Canary AWS IAM Honeytoken Key Invocation',
        targetResource: 'auth.sso-identity.internal',
        mitreTechnique: 'T1078.004 - Cloud Accounts',
        status: 'BLOCKED',
        technicalDetails: 'Invoked STS GetCallerIdentity with synthetic canary credentials AKIA_CANARY_NEXUS_HONEYTOKEN, triggering P1 high-fidelity security alarm.'
      },
      {
        id: 'tl-04',
        phase: 'LATERAL_MOVEMENT',
        timestamp: '12:08:33',
        actor: '198.51.100.77 (Compromised AWS Node)',
        action: 'Unauthorized Internal VPC Peering Route Probe',
        targetResource: 'db-cluster-eu.nexus.net:5432',
        mitreTechnique: 'T1021.002 - SMB/Remote Services',
        status: 'BLOCKED',
        technicalDetails: 'Attempted SYN connection to internal PostgreSQL cluster; intercepted and rejected by Zero-Trust mesh boundary policies.'
      },
      {
        id: 'tl-05',
        phase: 'CONTAINMENT',
        timestamp: '12:10:05',
        actor: 'NexusAI SOAR Playbook Engine (Autonomous)',
        action: 'Zero-Trust Host Quarantine & BGP Route Nulling',
        targetResource: 'Multi-Cloud Edge Firewall Mesh',
        mitreTechnique: 'M1037 - Filter Network Traffic',
        status: 'NEUTRALIZED',
        technicalDetails: 'Executed Playbook PB-03-RANSOMWARE: Boundary firewall updated, BGP blackhole route deployed, and adversary IP subnets permanently quarantined.'
      }
    ],
    artifacts: [
      {
        id: 'art-01',
        name: 'full_packet_capture_sqli_exploit.pcap',
        type: 'PCAP_CAPTURE',
        hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        details: 'Raw TCP stream 185.220.101.5:41829 -> 10.0.1.5:443 containing SQL injection payload buffers.',
        collectedAt: '12:10:20',
        sizeBytes: '4.2 MB'
      },
      {
        id: 'art-02',
        name: 'process_lineage_nginx_worker.tree',
        type: 'PROCESS_TREE',
        hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        details: 'PID tree verification showing Nginx master PID 1024 spawn sandboxed worker with 0 child shell executions.',
        collectedAt: '12:11:00',
        sizeBytes: '18 KB'
      },
      {
        id: 'art-03',
        name: 'canary_honeytoken_audit_receipt.json',
        type: 'AUTH_LOG',
        hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        details: 'CloudTrail EventRecord ID 890123 documenting adversary IP attempting STS assume-role with canary keys.',
        collectedAt: '12:12:15',
        sizeBytes: '64 KB'
      }
    ]
  },
  {
    id: 'case-02',
    caseNumber: 'INC-2026-0982',
    title: 'Distributed Credential Stuffing & Admin Portal Probes',
    severity: 'HIGH',
    status: 'RESOLVED',
    leadInvestigator: 'Atikur Rahman',
    detectedAt: '11:10:02',
    containedAt: '11:25:30',
    mttrSeconds: 45,
    blastRadiusScore: 12,
    impactedAssets: [
      'pay.nexus-banking.corp/wp-login.php',
      'auth-gateway-primary'
    ],
    rootCauseDescription: 'Automated dictionary fuzzing targeting exposed administrative login interface. Mitigated via rate-limiting WAF rules and IP reputation blacklisting.',
    timelineEvents: [
      {
        id: 'tl-11',
        phase: 'RECONNAISSANCE',
        timestamp: '11:10:02',
        actor: '103.114.98.42 (Dhaka, BD)',
        action: 'Wfuzz Dictionary Probe on Admin Login',
        targetResource: 'pay.nexus-banking.corp/wp-login.php',
        mitreTechnique: 'T1595 - Active Scanning',
        status: 'EXECUTED',
        technicalDetails: 'Sent 350 requests/min targeting common admin usernames (admin, root, operator).'
      },
      {
        id: 'tl-12',
        phase: 'INITIAL_ACCESS',
        timestamp: '11:24:15',
        actor: '103.114.98.42 (Dhaka, BD)',
        action: 'High-Frequency Password Guessing Burst',
        targetResource: 'pay.nexus-banking.corp',
        mitreTechnique: 'T1110.001 - Password Guessing',
        status: 'BLOCKED',
        technicalDetails: 'Exceeded threshold of 15 failures in 60 seconds; triggered Sigma Rule SIGMA-AUTH-002.'
      },
      {
        id: 'tl-13',
        phase: 'CONTAINMENT',
        timestamp: '11:25:30',
        actor: 'NexusAI SOAR Playbook PB-02-BRUTEFORCE',
        action: 'Automated Rate-Limiting & Ingress Block',
        targetResource: 'Border WAF & Edge IP Blocklist',
        mitreTechnique: 'M1037 - Filter Network Traffic',
        status: 'NEUTRALIZED',
        technicalDetails: 'Deployed temporary 24-hour IP drop rule and dispatched RFC 2142 notice to Link3 Technologies abuse desk.'
      }
    ],
    artifacts: [
      {
        id: 'art-11',
        name: 'auth_failure_audit_stream.log',
        type: 'AUTH_LOG',
        hashSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        details: 'Linux auditd log stream showing 88 failed pam_unix attempts from 103.114.98.42.',
        collectedAt: '11:26:00',
        sizeBytes: '280 KB'
      }
    ]
  },
  {
    id: 'case-03',
    caseNumber: 'INC-2026-0979',
    title: 'OpenSSH regreSSHion (CVE-2024-6387) Remote Probe',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    leadInvestigator: 'Atikur Rahman',
    detectedAt: '10:15:20',
    containedAt: '10:31:00',
    mttrSeconds: 60,
    blastRadiusScore: 8,
    impactedAssets: [
      'alpha-gamma-01 (Production Node)'
    ],
    rootCauseDescription: 'Host running OpenSSH < 9.8p1 received malformed asynchronous SIGALRM signal sequence. Remediated via 1-click package patch.',
    timelineEvents: [
      {
        id: 'tl-21',
        phase: 'RECONNAISSANCE',
        timestamp: '10:15:20',
        actor: '45.148.10.88 (Selectel / Russia)',
        action: 'SSH Service Fingerprint Probe',
        targetResource: 'alpha-gamma-01:22',
        mitreTechnique: 'T1046 - Network Service Discovery',
        status: 'EXECUTED',
        technicalDetails: 'Captured SSH-2.0-OpenSSH_8.9p1 Ubuntu banner to determine vulnerable glibc glibc ASLR timing.'
      },
      {
        id: 'tl-22',
        phase: 'CONTAINMENT',
        timestamp: '10:31:00',
        actor: 'NexusAI 1-Click CVE Patch Manager',
        action: 'Upgraded OpenSSH to 9.8p1-1ubuntu1',
        targetResource: 'alpha-gamma-01',
        mitreTechnique: 'M1051 - Update Software',
        status: 'NEUTRALIZED',
        technicalDetails: 'Automated apt patch script executed, daemon restarted, vulnerability mitigated.'
      }
    ],
    artifacts: [
      {
        id: 'art-21',
        name: 'openssh_patch_verification.sig',
        type: 'FILE_HASH',
        hashSha256: 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        details: 'GPG signed apt package installation receipt confirming OpenSSH 9.8p1 upgrade.',
        collectedAt: '10:32:00',
        sizeBytes: '12 KB'
      }
    ]
  }
];

const LOCAL_STORAGE_KEY_CASES = 'nexus_rca_cases_v1';

export function loadIncidentCases(): IncidentCase[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CASES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Storage fallback
  }
  return INITIAL_INCIDENT_CASES;
}

export function saveIncidentCases(cases: IncidentCase[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CASES, JSON.stringify(cases));
  } catch {
    // Storage quota fallback
  }
}

export function markCaseResolved(cases: IncidentCase[], id: string): IncidentCase[] {
  const updated = cases.map(c => {
    if (c.id === id) {
      return {
        ...c,
        status: 'RESOLVED' as const
      };
    }
    return c;
  });
  saveIncidentCases(updated);
  return updated;
}

export function calculateRcaSummary(cases: IncidentCase[]): RcaSummary {
  const total = cases.length;
  const contained = cases.filter(c => c.status === 'CONTAINED' || c.status === 'RESOLVED').length;
  const avgMttr = Math.round(cases.reduce((acc, c) => acc + c.mttrSeconds, 0) / (total || 1));
  const avgBlast = Math.round(cases.reduce((acc, c) => acc + c.blastRadiusScore, 0) / (total || 1));
  const totalArtifacts = cases.reduce((acc, c) => acc + c.artifacts.length, 0);

  return {
    totalCases: total,
    containedCases: contained,
    avgMttrSeconds: avgMttr,
    avgBlastRadiusScore: avgBlast,
    totalArtifactsSecured: totalArtifacts
  };
}

export function generateRcaMarkdownReport(incidentCase: IncidentCase): string {
  return `# INCIDENT POST-MORTEM & ROOT CAUSE ANALYSIS (RCA) DOSSIER
**Case Number:** ${incidentCase.caseNumber}
**Classification:** ${incidentCase.severity} SEVERITY
**Status:** ${incidentCase.status}
**Lead Investigator:** ${incidentCase.leadInvestigator} (SecOps Commander)
**Incident Timestamp:** ${incidentCase.detectedAt} UTC
**Containment Timestamp:** ${incidentCase.containedAt} UTC
**Mean Time to Remediation (MTTR):** ${incidentCase.mttrSeconds} seconds
**Blast Radius Score:** ${incidentCase.blastRadiusScore} / 100

---

## 1. Executive Summary
${incidentCase.title}
${incidentCase.rootCauseDescription}

## 2. Impacted Infrastructure & Assets
${incidentCase.impactedAssets.map(a => `- ${a}`).join('\n')}

## 3. Reconstructed Cyber Kill-Chain Timeline
| Phase | Timestamp | Actor | Action | MITRE ATT&CK | Status |
|---|---|---|---|---|---|
${incidentCase.timelineEvents.map(e => `| ${e.phase} | ${e.timestamp} | ${e.actor} | ${e.action} | ${e.mitreTechnique} | ${e.status} |`).join('\n')}

## 4. Cryptographic Forensic Artifacts Vault
${incidentCase.artifacts.map(a => `
### ${a.name} (${a.sizeBytes})
- **Type:** ${a.type}
- **SHA-256 Digest:** \`${a.hashSha256}\`
- **Forensic Details:** ${a.details}
- **Collected At:** ${a.collectedAt} UTC
`).join('\n')}

---
*Report cryptographically signed & archived by NexusAI Forensic RCA Engine.*
*SOC Operations Center &bull; Atikur Rahman &bull; atikurrahmanxm@gmail.com*`;
}
