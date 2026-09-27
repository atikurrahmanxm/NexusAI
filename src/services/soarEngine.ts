import { Playbook, PlaybookExecutionResult, SoarMetrics } from '../types/soarPlaybook';

export const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 'PB-01-DDOS',
    name: 'Volumetric L7 / SYN Flood Auto-Mitigation',
    tagline: 'Autonomous DDoS Edge Throttling & BGP Blackhole Rule Injection',
    description: 'Triggers when requests exceed 10,000 req/sec or anomalous L7 HTTP flood signatures are detected.',
    trigger: {
      attackType: 'DDoS',
      minSeverity: 'high',
      minAnomalyScore: 7.0,
      conditionDescription: 'Requests > 10,000/s or Anomaly Score ≥ 7.0'
    },
    mode: 'FULL_AUTONOMOUS',
    isActive: true,
    executionCount: 684,
    meanExecutionTimeMs: 420,
    lastExecutedTimestamp: '12m ago',
    lastTargetIp: '185.220.101.5',
    tags: ['ddos', 'edge-waf', 'cloudflare', 'rate-limit'],
    steps: [
      {
        id: 's1',
        order: 1,
        name: 'Activate Edge WAF Rate Limiting',
        actionType: 'RATE_LIMIT_GATEWAY',
        targetService: 'Cloudflare WAF / AWS Shield',
        description: 'Throttle inbound HTTP requests from offending ASN to 50 req/min.',
        commandSnippet: 'curl -X POST https://api.cloudflare.com/client/v4/zones/{id}/rate_limits',
        status: 'idle'
      },
      {
        id: 's2',
        order: 2,
        name: 'Drop Inbound Subnet at Linux Kernel Edge',
        actionType: 'BLOCK_IP_FIREWALL',
        targetService: 'Linux iptables / Netfilter',
        description: 'Inject direct DROP rule into PREROUTING table for zero CPU packet parsing overhead.',
        commandSnippet: 'iptables -I PREROUTING -t raw -s {SOURCE_IP} -j DROP',
        status: 'idle'
      },
      {
        id: 's3',
        order: 3,
        name: 'Dispatch PagerDuty Incident & SecOps Webhook',
        actionType: 'DISPATCH_WEBHOOK_ALERT',
        targetService: 'Slack #secops-alerts / PagerDuty',
        description: 'Notify on-call response team with attack telemetry, bandwidth graphs, and block confirmations.',
        commandSnippet: 'dispatch_webhook(event.critical, payload=telemetry_dossier)',
        status: 'idle'
      }
    ]
  },
  {
    id: 'PB-02-SQLI',
    name: 'SQL Injection & Zero-Day Database Defense',
    tagline: 'Instant Query Interception, Token Revocation & Read Pool Isolation',
    description: 'Intercepts anomalous SQL tokens (UNION SELECT, blind sleep injection) in URL and authorization headers.',
    trigger: {
      attackType: 'SQLi',
      minSeverity: 'high',
      minAnomalyScore: 6.8,
      conditionDescription: 'Heuristic SQLi pattern match or Anomaly Score ≥ 6.8'
    },
    mode: 'FULL_AUTONOMOUS',
    isActive: true,
    executionCount: 412,
    meanExecutionTimeMs: 290,
    lastExecutedTimestamp: '28m ago',
    lastTargetIp: '45.154.255.89',
    tags: ['sqli', 'waf-rules', 'db-isolation', 'zero-day'],
    steps: [
      {
        id: 's1',
        order: 1,
        name: 'Terminate Malicious Database Sessions',
        actionType: 'QUARANTINE_CONTAINER',
        targetService: 'PostgreSQL RDS Primary Pool',
        description: 'Kill all open connections and active queries initiated by the offending user/tenant.',
        commandSnippet: "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE client_addr = '{SOURCE_IP}'",
        status: 'idle'
      },
      {
        id: 's2',
        order: 2,
        name: 'Enforce Global Edge WAF Quarantine Rule',
        actionType: 'BLOCK_IP_FIREWALL',
        targetService: 'Cloudflare WAF / AWS WAFv2',
        description: 'Blacklist attacker IP address across all cloud points of presence globally.',
        commandSnippet: 'aws wafv2 update-ip-set --name "NexusQuarantine" --addresses "{SOURCE_IP}/32"',
        status: 'idle'
      },
      {
        id: 's3',
        order: 3,
        name: 'Invalidate Compromised Session & Rotate JWT Tokens',
        actionType: 'INVALIDATE_AUTH_TOKENS',
        targetService: 'Redis Token Revocation Cluster',
        description: 'Add active authorization tokens to Redis blacklist with TTL=86400s.',
        commandSnippet: 'redis-cli SETEX blacklist:token:{TOKEN_HASH} 86400 "quarantined_sqli"',
        status: 'idle'
      }
    ]
  },
  {
    id: 'PB-03-BRUTE',
    name: 'Credential Stuffing & SSH Dictionary Lockout',
    tagline: 'Adaptive Fail2ban Blacklist & Mandatory Step-Up MFA Challenge',
    description: 'Mitigates rapid authentication failures (>100 attempts/min) using credential dictionary lists.',
    trigger: {
      attackType: 'BruteForce',
      minSeverity: 'medium',
      minAnomalyScore: 6.0,
      conditionDescription: 'Auth Failures > 100/min or Anomaly Score ≥ 6.0'
    },
    mode: 'FULL_AUTONOMOUS',
    isActive: true,
    executionCount: 890,
    meanExecutionTimeMs: 180,
    lastExecutedTimestamp: '1h ago',
    lastTargetIp: '194.26.29.112',
    tags: ['brute-force', 'ssh', 'fail2ban', 'mfa-challenge'],
    steps: [
      {
        id: 's1',
        order: 1,
        name: 'Enforce 24-Hour Null-Route in Linux Fail2ban',
        actionType: 'BLOCK_IP_FIREWALL',
        targetService: 'Linux fail2ban / PAM',
        description: 'Directly reject SSH handshake attempts on port 22 with TCP RST.',
        commandSnippet: 'fail2ban-client set sshd banip {SOURCE_IP}',
        status: 'idle'
      },
      {
        id: 's2',
        order: 2,
        name: 'Trigger Cloudflare Turnstile / Managed Challenge',
        actionType: 'WAF_CAPTCHA_CHALLENGE',
        targetService: 'Cloudflare Turnstile API',
        description: 'Force interactive cryptographic challenge for web logins originating from same ASN.',
        commandSnippet: 'waf.rules.create(action="challenge", filter="ip.src eq {SOURCE_IP}")',
        status: 'idle'
      },
      {
        id: 's3',
        order: 3,
        name: 'Mandate Identity Provider Step-Up MFA',
        actionType: 'INVALIDATE_AUTH_TOKENS',
        targetService: 'Okta / Auth0 Identity Mesh',
        description: 'Require FIDO2 / WebAuthn hardware token confirmation on next user sign-in.',
        commandSnippet: 'idp.users.enforce_mfa(target="{TARGET_USER}", challenge="webauthn")',
        status: 'idle'
      }
    ]
  },
  {
    id: 'PB-04-RANSOMWARE',
    name: 'Ransomware & C2 Beaconing Zero-Trust Containment',
    tagline: 'Hardware Virtual NIC Teardown & Live Volatile RAM Forensics Snapshot',
    description: 'Triggered when encrypted C2 beaconing or lateral SMB worm replication attempts are confirmed.',
    trigger: {
      attackType: 'Malware',
      minSeverity: 'critical',
      minAnomalyScore: 8.5,
      conditionDescription: 'Confirmed C2 beacon or Anomaly Score ≥ 8.5'
    },
    mode: 'MANUAL_APPROVAL',
    isActive: true,
    executionCount: 142,
    meanExecutionTimeMs: 650,
    lastExecutedTimestamp: '3h ago',
    lastTargetIp: '198.51.100.24',
    tags: ['malware', 'c2-beacon', 'zero-trust', 'forensics', 'lime-dump'],
    steps: [
      {
        id: 's1',
        order: 1,
        name: 'Zero-Trust Virtual Interface Isolation',
        actionType: 'ZERO_TRUST_ISOLATE',
        targetService: 'K8s Calico / Linux Kernel veth',
        description: 'Sever all outbound and lateral network communication while keeping host CPU alive for inspection.',
        commandSnippet: 'ip link set dev eth0 down && iptables -P FORWARD DROP',
        status: 'idle'
      },
      {
        id: 's2',
        order: 2,
        name: 'Snapshot Volatile Memory Dump (LiME Kernel Module)',
        actionType: 'SNAPSHOT_MEMORY_DUMP',
        targetService: 'LiME Memory Forensics Agent',
        description: 'Capture active cryptographic keys and process memory tree to encrypted S3 audit bucket.',
        commandSnippet: 'insmod lime.ko "path=/mnt/vault/mem_dump_{TIMESTAMP}.bin format=raw"',
        status: 'idle'
      },
      {
        id: 's3',
        order: 3,
        name: 'Revoke Cloud Instance IAM Role & Tokens',
        actionType: 'QUARANTINE_CONTAINER',
        targetService: 'AWS IAM / GCP Service Accounts',
        description: 'Strip cloud metadata credentials to prevent attackers from accessing S3 or Cloud SQL.',
        commandSnippet: 'aws iam detach-role-policy --role-name "NodeRole" --policy-arn "arn:aws:iam::..."',
        status: 'idle'
      }
    ]
  }
];

const SOAR_STORAGE_KEY = 'nexus_soar_playbooks';

export function loadPlaybooks(): Playbook[] {
  try {
    const raw = localStorage.getItem(SOAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load playbooks from storage', err);
  }
  return INITIAL_PLAYBOOKS;
}

export function savePlaybooks(playbooks: Playbook[]): void {
  try {
    localStorage.setItem(SOAR_STORAGE_KEY, JSON.stringify(playbooks));
  } catch (err) {
    console.error('Failed to save playbooks', err);
  }
}

export function togglePlaybookActive(playbooks: Playbook[], id: string): Playbook[] {
  const updated = playbooks.map(pb => {
    if (pb.id === id) {
      return { ...pb, isActive: !pb.isActive };
    }
    return pb;
  });
  savePlaybooks(updated);
  return updated;
}

export function togglePlaybookMode(playbooks: Playbook[], id: string): Playbook[] {
  const updated = playbooks.map(pb => {
    if (pb.id === id) {
      const newMode = pb.mode === 'FULL_AUTONOMOUS' ? 'MANUAL_APPROVAL' : 'FULL_AUTONOMOUS';
      return { ...pb, mode: newMode as Playbook['mode'] };
    }
    return pb;
  });
  savePlaybooks(updated);
  return updated;
}

export function calculateSoarMetrics(playbooks: Playbook[]): SoarMetrics {
  const total = playbooks.length;
  const activeAutonomous = playbooks.filter(p => p.isActive && p.mode === 'FULL_AUTONOMOUS').length;
  const totalRemediations = playbooks.reduce((sum, p) => sum + p.executionCount, 0);

  return {
    totalPlaybooks: total,
    activeAutonomous,
    totalRemediations: totalRemediations || 2128,
    meanTimeToRespondSeconds: 1.2,
    successRatePercentage: 99.8
  };
}

export function simulateExecutePlaybook(
  playbook: Playbook,
  sourceIp: string = '185.220.101.5'
): { updatedPlaybook: Playbook; result: PlaybookExecutionResult } {
  const duration = Math.floor(Math.random() * 200 + 280);
  const now = new Date().toLocaleTimeString();

  const logs = [
    `[${now}] [SOAR-TRIGGER] Condition met: ${playbook.trigger.conditionDescription}`,
    `[${now}] [TARGET-IDENTIFIED] Offending Source: ${sourceIp} | Mode: ${playbook.mode}`,
    ...playbook.steps.map(s => 
      `[${now}] [STEP-${s.order}] ${s.name} executed on [${s.targetService}] in ${Math.floor(duration / 3)}ms.`
    ),
    `[${now}] [CONTAINMENT-SUCCESS] Playbook ${playbook.id} successfully completed in ${duration}ms.`
  ];

  const updatedPlaybook: Playbook = {
    ...playbook,
    executionCount: playbook.executionCount + 1,
    lastExecutedTimestamp: 'Just now (1s ago)',
    lastTargetIp: sourceIp
  };

  const result: PlaybookExecutionResult = {
    playbookId: playbook.id,
    executionId: `exec-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    success: true,
    totalDurationMs: duration,
    logs
  };

  return { updatedPlaybook, result };
}
