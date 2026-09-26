import { SecurityEvent } from '../types/telemetry';

export type FirewallSyntax = 'iptables' | 'ufw' | 'cloudflare' | 'aws_nacl' | 'nginx';

export interface CompiledPolicy {
  syntax: FirewallSyntax;
  code: string;
  ruleCount: number;
  blockedIps: string[];
}

export function compileSecurityPolicies(events: SecurityEvent[]): Record<FirewallSyntax, CompiledPolicy> {
  const threatEvents = events.filter(e => e.attackType !== 'Benign');
  const uniqueIps = Array.from(new Set(threatEvents.map(e => e.sourceIp)));

  // 1. iptables
  const iptablesLines = [
    '#!/bin/bash',
    '# NexusAI Autonomous SecOps - iptables Containment Script',
    `# Generated at: ${new Date().toISOString()}`,
    '# Threat Level: Active Mitigation Applied\n',
    'echo "[NEXUS] Enforcing kernel packet drop rules..."\n'
  ];

  threatEvents.forEach(e => {
    iptablesLines.push(
      `iptables -A INPUT -s ${e.sourceIp} -p ${e.protocol.toLowerCase()} --dport ${e.destinationPort} -j DROP -m comment --comment "NexusAI:${e.id}:${e.attackType}"`
    );
  });
  iptablesLines.push('\necho "[NEXUS] Kernel packet filtering verified."');

  // 2. ufw
  const ufwLines = [
    '# UFW (Uncomplicated Firewall) Containment Rules',
    `# Generated at: ${new Date().toISOString()}\n`
  ];
  uniqueIps.forEach(ip => {
    ufwLines.push(`sudo ufw insert 1 deny from ${ip} to any comment "NexusAI automated threat quarantine"`);
  });

  // 3. Cloudflare WAF Expression
  const cfIpsList = uniqueIps.map(ip => `"${ip}"`).join(' ');
  const cloudflareExpression = `(ip.src in {${cfIpsList}} and http.request.method in {"GET" "POST"}) or (cf.threat_score gt 65 and http.request.uri.path contains "/api")`;

  // 4. AWS NACL (Network Access Control List) JSON
  const awsNaclEntries = uniqueIps.map((ip, idx) => ({
    RuleNumber: 50 + idx * 5,
    Protocol: '-1',
    RuleAction: 'deny',
    Egress: false,
    CidrBlock: `${ip}/32`
  }));
  const awsNaclJson = JSON.stringify({
    NexusPolicyRevision: 'v1.0.4',
    NetworkAclEntries: awsNaclEntries,
    Timestamp: new Date().toISOString()
  }, null, 2);

  // 5. Nginx Server Blocklist
  const nginxLines = [
    '# Nginx Reverse Proxy Perimeter Blocklist',
    `# Updated: ${new Date().toISOString()}\n`,
    '# Drop unauthorized high-frequency connections',
    'limit_req_zone $binary_remote_addr zone=nexus_limit:10m rate=10r/s;\n'
  ];
  uniqueIps.forEach(ip => {
    nginxLines.push(`deny ${ip}; # Automated quarantine`);
  });
  nginxLines.push('\n# Fallback standard proxying\nlocation / {\n    limit_req zone=nexus_limit burst=20 nodelay;\n    proxy_pass http://nexus_cluster_upstream;\n}');

  return {
    iptables: {
      syntax: 'iptables',
      code: iptablesLines.join('\n'),
      ruleCount: threatEvents.length,
      blockedIps: uniqueIps
    },
    ufw: {
      syntax: 'ufw',
      code: ufwLines.join('\n'),
      ruleCount: uniqueIps.length,
      blockedIps: uniqueIps
    },
    cloudflare: {
      syntax: 'cloudflare',
      code: cloudflareExpression,
      ruleCount: uniqueIps.length,
      blockedIps: uniqueIps
    },
    aws_nacl: {
      syntax: 'aws_nacl',
      code: awsNaclJson,
      ruleCount: uniqueIps.length,
      blockedIps: uniqueIps
    },
    nginx: {
      syntax: 'nginx',
      code: nginxLines.join('\n'),
      ruleCount: uniqueIps.length,
      blockedIps: uniqueIps
    }
  };
}
