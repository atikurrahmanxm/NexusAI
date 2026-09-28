import { 
  SigmaDetectionRule, 
  DetectionEngineSummary 
} from '../types/detectionRule';

export const INITIAL_SIGMA_RULES: SigmaDetectionRule[] = [
  {
    id: 'rule-01',
    ruleCode: 'SIGMA-WEB-001',
    title: 'Blind SQL Injection in HTTP Request Parameters',
    status: 'ENABLED',
    severity: 'CRITICAL',
    category: 'WEB_APPLICATION',
    author: 'Atikur Rahman',
    mitreTactics: ['Initial Access', 'Defense Evasion'],
    mitreTechniques: ['T1190 - Exploit Public-Facing Application'],
    description: 'Detects boolean-based or time-based blind SQL injection patterns including UNION SELECT, sleep, and database metadata queries in URI query parameters or body payloads.',
    yamlDefinition: `title: Blind SQL Injection in HTTP Query
id: 5a8e32cb-8df1-4d3b-9a84-18fa901bf9e1
status: production
description: Detects SQL injection indicators in web server logs
author: Atikur Rahman
date: 2026/09/28
references:
    - https://attack.mitre.org/techniques/T1190/
logsource:
    category: webserver
    product: nginx
detection:
    selection:
        cs-uri-query|contains:
            - "UNION SELECT"
            - "' OR 1=1"
            - "benchmark("
            - "waitfor delay"
            - "pg_sleep"
    condition: selection
level: critical
tags:
    - attack.t1190
    - attack.initial_access`,
    queries: {
      splunkSpl: `index=web_proxy sourcetype=nginx_access (cs_uri_query="*UNION SELECT*" OR cs_uri_query="*' OR 1=1*" OR cs_uri_query="*pg_sleep*") | stats count by clientip, cs_uri_stem, cs_method | where count > 2`,
      elasticDsl: `{
  "query": {
    "bool": {
      "should": [
        { "wildcard": { "url.query": "*UNION SELECT*" } },
        { "wildcard": { "url.query": "*' OR 1=1*" } },
        { "wildcard": { "url.query": "*pg_sleep*" } }
      ],
      "minimum_should_match": 1
    }
  }
}`,
      sentinelKql: `W3CIISLog
| where csUriQuery has_any ("UNION SELECT", "' OR 1=1", "pg_sleep")
| summarize ThreatCount = count() by cIP, csUriStem, TimeGenerated
| where ThreatCount > 1`,
      crowdstrikeCql: `#event_simpleName=HttpProxyRequest (UriQuery="*UNION SELECT*" OR UriQuery="*' OR 1=1*") | aggregate(count() as Hits, groupBy=[SrcIP, UriPath])`
    },
    matchesCount: 42,
    lastMatchedAt: '12:24:19',
    falsePositiveRate: '< 0.05%'
  },
  {
    id: 'rule-02',
    ruleCode: 'SIGMA-AUTH-002',
    title: 'High-Frequency SSH & Identity Portal Credential Stuffing',
    status: 'ENABLED',
    severity: 'HIGH',
    category: 'IDENTITY_AUTH',
    author: 'Atikur Rahman',
    mitreTactics: ['Credential Access'],
    mitreTechniques: ['T1110.004 - Credential Stuffing'],
    description: 'Triggers when a single source IP generates more than 15 failed authentication attempts across multiple distinct usernames within a 60-second sliding time window.',
    yamlDefinition: `title: High-Frequency Credential Stuffing Spike
id: 9a2f7781-64d2-4e89-b001-c88fa0172bf4
status: production
description: Detects automated credential stuffing against SSH & SSO endpoints
author: Atikur Rahman
logsource:
    category: authentication
    product: linux_auth
detection:
    selection:
        action: "failed_login"
    timeframe: 60s
    condition: selection | count(target_user) by source_ip > 15
level: high
tags:
    - attack.t1110.004`,
    queries: {
      splunkSpl: `index=auth action=failure (app=sshd OR app=nexus_sso) | stats count, dc(user) as DistinctUsers by src_ip | where count > 15 AND DistinctUsers > 5`,
      elasticDsl: `{
  "query": {
    "match": { "event.outcome": "failure" }
  },
  "aggs": {
    "per_ip": {
      "terms": { "field": "source.ip", "min_doc_count": 15 },
      "aggs": { "unique_users": { "cardinality": { "field": "user.name" } } }
    }
  }
}`,
      sentinelKql: `SecurityEvent
| where EventID == 4625
| summarize FailedCount = count(), UniqueUsers = dcount(TargetUserName) by IpAddress, bin(TimeGenerated, 1m)
| where FailedCount > 15 and UniqueUsers > 5`,
      crowdstrikeCql: `#event_simpleName=UserLogonFailed2 | aggregate(count() as Fails, dcount(TargetUserName) as Users, groupBy=[SrcIP]) | Fails > 15`
    },
    matchesCount: 88,
    lastMatchedAt: '12:18:05',
    falsePositiveRate: '< 0.12%'
  },
  {
    id: 'rule-03',
    ruleCode: 'SIGMA-CLOUD-003',
    title: 'Canary AWS IAM Honeytoken Access from Anonymous Network',
    status: 'ENABLED',
    severity: 'CRITICAL',
    category: 'CLOUD_INFRA',
    author: 'Atikur Rahman',
    mitreTactics: ['Initial Access', 'Discovery'],
    mitreTechniques: ['T1078.004 - Cloud Accounts'],
    description: 'Fires an immediate P1 alert when API calls are made using canary AWS honeytoken credentials from Tor exit nodes or unverified public cloud subnets.',
    yamlDefinition: `title: Canary Honeytoken Invocation Alert
id: 3c914e66-f001-447a-8b92-5819aa14bc81
status: production
description: Alerts on any invocation of synthetic canary AWS IAM access keys
author: Atikur Rahman
logsource:
    category: cloudtrail
    product: aws
detection:
    selection:
        userIdentity.accessKeyId: "AKIA_CANARY_NEXUS_HONEYTOKEN"
    condition: selection
level: critical
tags:
    - attack.t1078.004`,
    queries: {
      splunkSpl: `index=aws_cloudtrail userIdentity.accessKeyId="AKIA_CANARY_NEXUS_HONEYTOKEN" | table _time, eventName, sourceIPAddress, userAgent, recipientAccountId`,
      elasticDsl: `{
  "query": {
    "term": { "aws.cloudtrail.user_identity.access_key_id": "AKIA_CANARY_NEXUS_HONEYTOKEN" }
  }
}`,
      sentinelKql: `AWSCloudTrail
| where AWSAccessKeyId == "AKIA_CANARY_NEXUS_HONEYTOKEN"
| project TimeGenerated, EventName, SourceIpAddress, UserAgent`,
      crowdstrikeCql: `#event_simpleName=CloudTrailEvent AWSAccessKeyId="AKIA_CANARY_NEXUS_HONEYTOKEN"`
    },
    matchesCount: 11,
    lastMatchedAt: '11:45:19',
    falsePositiveRate: '0.00% (High-Fidelity Canary)'
  },
  {
    id: 'rule-04',
    ruleCode: 'SIGMA-LINUX-004',
    title: 'Unauthorized Sudoers Modification & Root Privilege Escalation',
    status: 'ENABLED',
    severity: 'HIGH',
    category: 'ENDPOINT_LINUX',
    author: 'Atikur Rahman',
    mitreTactics: ['Privilege Escalation', 'Persistence'],
    mitreTechniques: ['T1548.003 - Sudo and Sudo Caching'],
    description: 'Detects write or append operations against /etc/sudoers or /etc/sudoers.d/ by non-provisioned configuration management accounts.',
    yamlDefinition: `title: Unauthorized Sudoers Modification
id: 881ba002-12aa-419f-93d1-419bba510101
status: production
description: Monitors file integrity events modifying sudoers privileges
author: Atikur Rahman
logsource:
    category: file_change
    product: linux_auditd
detection:
    selection:
        TargetFilename|startswith: "/etc/sudoers"
        Action: "WRITE"
    filter:
        ProcessPath: "/usr/bin/ansible-playbook"
    condition: selection and not filter
level: high
tags:
    - attack.t1548.003`,
    queries: {
      splunkSpl: `index=os sourcetype=auditd (file="/etc/sudoers" OR file="/etc/sudoers.d/*") action=WRITE process!="/usr/bin/ansible-playbook" | table _time, host, user, process, file`,
      elasticDsl: `{
  "query": {
    "bool": {
      "must": [
        { "wildcard": { "file.path": "/etc/sudoers*" } },
        { "term": { "event.action": "file_modified" } }
      ],
      "must_not": [
        { "term": { "process.executable": "/usr/bin/ansible-playbook" } }
      ]
    }
  }
}`,
      sentinelKql: `Syslog
| where ProcessName == "auditd" and SyslogMessage has "/etc/sudoers"
| project TimeGenerated, Computer, ProcessName, SyslogMessage`,
      crowdstrikeCql: `#event_simpleName=FileWritten FilePath="/etc/sudoers*" ImageFileName!="/usr/bin/ansible-playbook"`
    },
    matchesCount: 6,
    lastMatchedAt: '10:50:33',
    falsePositiveRate: '< 0.08%'
  },
  {
    id: 'rule-05',
    ruleCode: 'SIGMA-EXEC-005',
    title: 'Log4Shell & JNDI Remote Code Execution Exploit Probe',
    status: 'ENABLED',
    severity: 'CRITICAL',
    category: 'WEB_APPLICATION',
    author: 'Atikur Rahman',
    mitreTactics: ['Initial Access', 'Execution'],
    mitreTechniques: ['T1190 - Exploit Public-Facing Application'],
    description: 'Detects inbound HTTP headers containing JNDI lookup strings (\${jndi:ldap://, \${jndi:rmi://, \${jndi:dns://) attempting Remote Code Execution via CVE-2021-44228.',
    yamlDefinition: `title: JNDI Log4Shell Header Injection
id: c4881900-33ab-4ef1-9011-8177fa918b31
status: production
description: Detects JNDI protocol strings commonly leveraged in Log4j exploits
author: Atikur Rahman
logsource:
    category: webserver
    product: edge_proxy
detection:
    selection:
        http_headers|contains:
            - "\${jndi:ldap"
            - "\${jndi:rmi"
            - "\${jndi:dns"
            - "\${jndi:nis"
    condition: selection
level: critical
tags:
    - attack.t1190
    - attack.t1059`,
    queries: {
      splunkSpl: `index=waf (http_user_agent="*\${jndi:*" OR http_header="*\${jndi:*") | stats count by client_ip, host, http_user_agent`,
      elasticDsl: `{
  "query": {
    "wildcard": { "http.request.headers": "*\${jndi:*" }
  }
}`,
      sentinelKql: `AzureDiagnostics
| where requestUri_s has "\${jndi" or userAgent_s has "\${jndi"
| project TimeGenerated, clientIP_s, requestUri_s, userAgent_s`,
      crowdstrikeCql: `#event_simpleName=HttpProxyRequest (Headers="*\${jndi:*" OR UserAgent="*\${jndi:*")`
    },
    matchesCount: 19,
    lastMatchedAt: '10:55:00',
    falsePositiveRate: '< 0.01%'
  },
  {
    id: 'rule-06',
    ruleCode: 'SIGMA-NET-006',
    title: 'Volumetric SYN Flood & UDP Amplification Outlier',
    status: 'ENABLED',
    severity: 'MEDIUM',
    category: 'NETWORK_TRAFFIC',
    author: 'Atikur Rahman',
    mitreTactics: ['Impact'],
    mitreTechniques: ['T1499.004 - Endpoint Denial of Service'],
    description: 'Monitors netflow traffic counters detecting sudden packet-per-second (PPS) surges exceeding 25,000 pps without corresponding TCP ACK handshakes.',
    yamlDefinition: `title: Volumetric SYN Flood Traffic Spike
id: fa881290-7711-4cb9-b881-2299aa661298
status: production
description: Identifies anomalous SYN packet velocity characteristic of DDoS
author: Atikur Rahman
logsource:
    category: network_traffic
    product: netflow
detection:
    selection:
        tcp_flags: "SYN"
        packet_rate|gt: 25000
    condition: selection
level: medium
tags:
    - attack.t1499.004`,
    queries: {
      splunkSpl: `index=netflow tcp_flags=SYN | stats sum(packets) as TotalPackets by src_ip, dst_port | where TotalPackets > 25000`,
      elasticDsl: `{
  "query": {
    "bool": {
      "must": [
        { "term": { "network.transport": "tcp" } },
        { "term": { "tcp.flags.syn": true } },
        { "range": { "network.packets": { "gt": 25000 } } }
      ]
    }
  }
}`,
      sentinelKql: `NetworkSession
| where TransportProtocol == "TCP" and Flags has "SYN"
| summarize TotalPackets = sum(Packets) by SourceIP, DestinationPort
| where TotalPackets > 25000`,
      crowdstrikeCql: `#event_simpleName=NetworkConnect (Flags="SYN" AND Packets > 25000)`
    },
    matchesCount: 33,
    lastMatchedAt: '09:40:12',
    falsePositiveRate: '< 0.25%'
  }
];

const LOCAL_STORAGE_KEY_RULES = 'nexus_sigma_rules_v1';

export function loadDetectionRules(): SigmaDetectionRule[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_RULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Storage fallback
  }
  return INITIAL_SIGMA_RULES;
}

export function saveDetectionRules(rules: SigmaDetectionRule[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_RULES, JSON.stringify(rules));
  } catch {
    // Storage quota fallback
  }
}

export function toggleRuleStatus(rules: SigmaDetectionRule[], id: string): SigmaDetectionRule[] {
  const updated = rules.map(rule => {
    if (rule.id === id) {
      const newStatus = rule.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
      return {
        ...rule,
        status: newStatus as any
      };
    }
    return rule;
  });
  saveDetectionRules(updated);
  return updated;
}

export function triggerRuleTest(rules: SigmaDetectionRule[], id: string): SigmaDetectionRule[] {
  const updated = rules.map(rule => {
    if (rule.id === id) {
      return {
        ...rule,
        matchesCount: rule.matchesCount + 1,
        lastMatchedAt: new Date().toLocaleTimeString()
      };
    }
    return rule;
  });
  saveDetectionRules(updated);
  return updated;
}

export function calculateDetectionSummary(rules: SigmaDetectionRule[]): DetectionEngineSummary {
  const total = rules.length;
  const active = rules.filter(r => r.status === 'ENABLED').length;
  const totalDetections = rules.reduce((acc, r) => acc + r.matchesCount, 0);

  // Extract unique MITRE tactics
  const allTactics = new Set<string>();
  rules.forEach(r => r.mitreTactics.forEach(t => allTactics.add(t)));

  return {
    totalRules: total,
    activeRules: active,
    totalDetectionsFired: totalDetections,
    avgEvaluationLatencyUs: 4.8, // 4.8 microseconds evaluation speed
    coverageTacticsCount: allTactics.size
  };
}
