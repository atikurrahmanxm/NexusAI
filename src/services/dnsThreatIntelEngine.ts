import { DnsQueryLog, EasmAsset, EntropyAnalysis, CharFrequency, DnsClassification } from '../types/dnsThreatIntel';

// Mathematical Shannon Entropy calculation: H(X) = -sum(P(x) * log2(P(x)))
export function calculateShannonEntropy(text: string): number {
  if (!text || text.length === 0) return 0;
  
  // Clean string to evaluate entropy of the query label
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.length === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (const char of clean) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  const len = clean.length;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return parseFloat(entropy.toFixed(3));
}

// Extract primary subdomain label for entropy calculation
export function extractQueryLabel(domain: string): string {
  const parts = domain.trim().toLowerCase().split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return parts.length > 0 ? parts[0] : domain;
}

// Compute letter & symbol frequencies for visual UI histogram
export function computeCharFrequencies(text: string): CharFrequency[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return [];

  const counts: Record<string, number> = {};
  for (const c of clean) {
    counts[c] = (counts[c] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([char, count]) => ({
      char,
      count,
      prob: parseFloat((count / clean.length).toFixed(3))
    }))
    .sort((a, b) => b.count - a.count);
}

// Safe base64 string decoder for DNS tunneling exfiltration payloads
export function tryDecodeBase64(str: string): string | undefined {
  try {
    const clean = str.replace(/[^A-Za-z0-9+/=]/g, '');
    if (clean.length < 12) return undefined;
    const decoded = atob(clean);
    // Check if result contains printable ascii
    if (/^[\x20-\x7E\s]+$/.test(decoded)) {
      return decoded;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

// Comprehensive ML heuristic analyzer for any domain string
export function analyzeDomainEntropy(rawDomain: string): EntropyAnalysis {
  const domain = rawDomain.trim().toLowerCase();
  const label = extractQueryLabel(domain);
  const entropy = calculateShannonEntropy(label);
  const frequencies = computeCharFrequencies(label);

  const alphaOnly = label.replace(/[^a-z]/g, '');
  const vowels = (alphaOnly.match(/[aeiou]/g) || []).length;
  const vowelRatio = alphaOnly.length > 0 ? parseFloat((vowels / alphaOnly.length).toFixed(3)) : 0;
  
  const digits = (label.match(/[0-9]/g) || []).length;
  const digitRatio = label.length > 0 ? parseFloat((digits / label.length).toFixed(3)) : 0;

  // Check for DNS tunneling base64 chunks
  const decodedTunnel = tryDecodeBase64(label);

  let classification: DnsClassification = 'benign';
  let explanation = 'Standard lexical distribution typical of natural human-readable domain names.';

  if (decodedTunnel) {
    classification = 'tunneling_exfiltration';
    explanation = `High entropy (${entropy}) with verified Base64 exfiltration payload. Decoded string: "${decodedTunnel}".`;
  } else if (entropy >= 3.85 && (vowelRatio < 0.20 || digitRatio > 0.35)) {
    classification = 'dga_malicious';
    explanation = `High Shannon entropy (${entropy} >= 3.85) and abnormal consonant/digit clustering (vowels: ${(vowelRatio * 100).toFixed(0)}%). Characteristic of automated C2 DGA beacons.`;
  } else if (entropy >= 3.40 && vowelRatio < 0.28) {
    classification = 'dga_suspicious';
    explanation = `Elevated Shannon entropy (${entropy}) and non-standard character randomness. Requires heuristic monitoring.`;
  }

  return {
    domain,
    entropy,
    vowelRatio,
    digitRatio,
    length: label.length,
    classification,
    explanation,
    charFrequencies: frequencies
  };
}

// Default initial External Attack Surface (EASM) Assets
export const INITIAL_EASM_ASSETS: EasmAsset[] = [
  {
    id: 'EASM-01',
    subdomain: 'assets.nexus-security.io',
    recordType: 'CNAME',
    targetValue: 'nexus-bucket-legacy.s3.us-east-1.amazonaws.com',
    status: 'dangling',
    takeoverRisk: true,
    openPorts: [80, 443],
    tlsStatus: 'expired',
    lastDiscovered: '2026-09-28 16:45:10',
    riskLevel: 'critical',
    takeoverRemediation: 'AWS S3 bucket has been deleted in Cloud Console while CNAME record remains active. An attacker can register the bucket name to hijack the subdomain and serve malicious code.'
  },
  {
    id: 'EASM-02',
    subdomain: 'api.nexus-security.io',
    recordType: 'A',
    targetValue: '198.51.100.24',
    status: 'active',
    takeoverRisk: false,
    openPorts: [80, 443],
    tlsStatus: 'valid',
    lastDiscovered: '2026-09-28 17:00:22',
    riskLevel: 'low'
  },
  {
    id: 'EASM-03',
    subdomain: 'dev-staging.nexus-security.io',
    recordType: 'A',
    targetValue: '203.0.113.88',
    status: 'exposed_dev',
    takeoverRisk: false,
    openPorts: [80, 443, 8080, 9200],
    tlsStatus: 'expiring_soon',
    lastDiscovered: '2026-09-28 15:12:04',
    riskLevel: 'high',
    takeoverRemediation: 'Exposed internal Elasticsearch port (9200) and staging API port (8080) to public Internet. Restrict ingress via Security Group.'
  },
  {
    id: 'EASM-04',
    subdomain: 'auth.nexus-security.io',
    recordType: 'A',
    targetValue: '198.51.100.25',
    status: 'active',
    takeoverRisk: false,
    openPorts: [443],
    tlsStatus: 'valid',
    lastDiscovered: '2026-09-28 17:05:00',
    riskLevel: 'low'
  },
  {
    id: 'EASM-05',
    subdomain: 'mail.nexus-security.io',
    recordType: 'MX',
    targetValue: 'mx1.nexus-security.io',
    status: 'active',
    takeoverRisk: false,
    openPorts: [25, 465, 587],
    tlsStatus: 'valid',
    lastDiscovered: '2026-09-28 16:30:18',
    riskLevel: 'low'
  },
  {
    id: 'EASM-06',
    subdomain: 'legacy-billing.nexus-security.io',
    recordType: 'CNAME',
    targetValue: 'nexus-billing-v1.azurewebsites.net',
    status: 'dangling',
    takeoverRisk: true,
    openPorts: [80, 443],
    tlsStatus: 'expired',
    lastDiscovered: '2026-09-28 14:22:30',
    riskLevel: 'critical',
    takeoverRemediation: 'Azure App Service plan was decommissioned. Dangling AzureWebsites CNAME enables adversary subdomain claim.'
  }
];

// Default initial real-time DNS Traffic Queries
export const INITIAL_DNS_QUERIES: DnsQueryLog[] = [
  {
    id: 'DNS-9801',
    timestamp: '17:11:42',
    clientIp: '10.0.4.120',
    domain: 'g89f2xkz-m9q.c2-command.ru',
    queryType: 'TXT',
    shannonEntropy: 3.92,
    vowelRatio: 0.08,
    length: 15,
    classification: 'dga_malicious',
    malwareFamily: 'Emotet DGA',
    isSinkholed: true
  },
  {
    id: 'DNS-9802',
    timestamp: '17:10:55',
    clientIp: '10.0.2.45',
    domain: 'dXNlcl9jcmVkczpzZWNyZXRwYXNz.tunnel.exfil-nexus.net',
    queryType: 'TXT',
    shannonEntropy: 4.41,
    vowelRatio: 0.15,
    length: 32,
    classification: 'tunneling_exfiltration',
    malwareFamily: 'DNSExfil Python Tool',
    payloadDecoded: 'user_creds:secretpass',
    isSinkholed: true
  },
  {
    id: 'DNS-9803',
    timestamp: '17:09:12',
    clientIp: '10.0.1.18',
    domain: 'api.nexus-security.io',
    queryType: 'A',
    shannonEntropy: 2.45,
    vowelRatio: 0.40,
    length: 12,
    classification: 'benign',
    isSinkholed: false
  },
  {
    id: 'DNS-9804',
    timestamp: '17:07:30',
    clientIp: '10.0.4.120',
    domain: 'vwnpxztr89-beacon.org',
    queryType: 'A',
    shannonEntropy: 3.84,
    vowelRatio: 0.09,
    length: 14,
    classification: 'dga_malicious',
    malwareFamily: 'Cobalt Strike Malleable C2',
    isSinkholed: true
  },
  {
    id: 'DNS-9805',
    timestamp: '17:05:18',
    clientIp: '10.0.3.88',
    domain: 'c2hhMjU2X2tleV9leHBvcnQ.tunnel.exfil-nexus.net',
    queryType: 'TXT',
    shannonEntropy: 4.28,
    vowelRatio: 0.17,
    length: 27,
    classification: 'tunneling_exfiltration',
    malwareFamily: 'DNSExfil Python Tool',
    payloadDecoded: 'sha256_key_export',
    isSinkholed: true
  },
  {
    id: 'DNS-9806',
    timestamp: '17:03:02',
    clientIp: '10.0.2.14',
    domain: 'auth.cloudflare.com',
    queryType: 'A',
    shannonEntropy: 2.61,
    vowelRatio: 0.38,
    length: 14,
    classification: 'benign',
    isSinkholed: false
  },
  {
    id: 'DNS-9807',
    timestamp: '17:01:45',
    clientIp: '10.0.1.5',
    domain: 'assets.nexus-security.io',
    queryType: 'CNAME',
    shannonEntropy: 2.70,
    vowelRatio: 0.33,
    length: 15,
    classification: 'subdomain_takeover',
    isSinkholed: false
  },
  {
    id: 'DNS-9808',
    timestamp: '16:58:20',
    clientIp: '10.0.4.99',
    domain: 'kq9482z019mnvz.temp-drop.biz',
    queryType: 'A',
    shannonEntropy: 3.75,
    vowelRatio: 0.00,
    length: 14,
    classification: 'dga_suspicious',
    malwareFamily: 'Conficker Variant',
    isSinkholed: false
  }
];

// LocalStorage helpers
const EASM_STORAGE_KEY = 'nexus_easm_assets';
const DNS_QUERY_STORAGE_KEY = 'nexus_dns_queries';

export function loadEasmAssets(): EasmAsset[] {
  try {
    const saved = localStorage.getItem(EASM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }
  return INITIAL_EASM_ASSETS;
}

export function saveEasmAssets(assets: EasmAsset[]): void {
  try {
    localStorage.setItem(EASM_STORAGE_KEY, JSON.stringify(assets));
  } catch {
    // Quota
  }
}

export function loadDnsQueries(): DnsQueryLog[] {
  try {
    const saved = localStorage.getItem(DNS_QUERY_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }
  return INITIAL_DNS_QUERIES;
}

export function saveDnsQueries(queries: DnsQueryLog[]): void {
  try {
    localStorage.setItem(DNS_QUERY_STORAGE_KEY, JSON.stringify(queries));
  } catch {
    // Quota
  }
}

// BIND9 Response Policy Zone (RPZ) Exporter
export function exportRpzZoneFile(queries: DnsQueryLog[]): string {
  const badDomains = queries.filter(q => q.isSinkholed || q.classification === 'dga_malicious' || q.classification === 'tunneling_exfiltration');
  const uniqueDomains = Array.from(new Set(badDomains.map(q => q.domain)));

  let output = `; =====================================================================
; NexusAI Response Policy Zone (RPZ) - Autonomous DNS Sinkhole
; Generated for BIND9 Named Service
; Date: ${new Date().toISOString()}
; Total Blocked Malicious & C2 Domains: ${uniqueDomains.length}
; =====================================================================
$TTL 300
@       IN      SOA     localhost. root.localhost. (
                        ${Math.floor(Date.now() / 1000)} ; Serial
                        3600       ; Refresh
                        1800       ; Retry
                        604800     ; Expire
                        300 )      ; Minimum
@       IN      NS      localhost.

; --- SINKHOLED DGA & EXFILTRATION DOMAINS (NXDOMAIN / CNAME .) ---
`;

  uniqueDomains.forEach(domain => {
    output += `${domain.padEnd(45)} IN CNAME .\n`;
    output += `*.${domain.padEnd(43)} IN CNAME .\n`;
  });

  return output;
}

// CoreDNS Blocklist Exporter
export function exportCoreDnsBlocklist(queries: DnsQueryLog[]): string {
  const badDomains = queries.filter(q => q.isSinkholed || q.classification === 'dga_malicious' || q.classification === 'tunneling_exfiltration');
  const uniqueDomains = Array.from(new Set(badDomains.map(q => q.domain)));

  let output = `# NexusAI CoreDNS Threat Blocker Rules
# Corefile plugin: hosts /etc/coredns/nexus-blocklist.hosts
# Sinkhole IP: 0.0.0.0 (Null Route)

`;
  uniqueDomains.forEach(domain => {
    output += `0.0.0.0 ${domain}\n`;
  });

  return output;
}

// Pi-hole / AdGuard Home Blocklist Exporter
export function exportPiHoleBlocklist(queries: DnsQueryLog[]): string {
  const badDomains = queries.filter(q => q.isSinkholed || q.classification === 'dga_malicious' || q.classification === 'tunneling_exfiltration');
  const uniqueDomains = Array.from(new Set(badDomains.map(q => q.domain)));

  let output = `# NexusAI Pi-hole Threat Intelligence Blocklist
# Format: standard hosts file
# Updated: ${new Date().toISOString()}

`;
  uniqueDomains.forEach(domain => {
    output += `0.0.0.0 ${domain}\n`;
  });

  return output;
}
