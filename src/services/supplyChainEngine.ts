import { SbomComponent, TyposquattingAnalysis } from '../types/supplyChain';

// Popular canonical open-source package ecosystem names
const CANONICAL_PACKAGES = [
  'express',
  'lodash',
  'react',
  'axios',
  'request',
  'chalk',
  'jsonwebtoken',
  'moment',
  'fastapi',
  'pydantic',
  'requests',
  'urllib3',
  'cryptography',
  'numpy',
  'pandas',
  'flask',
  'cross-env',
  'webpack',
  'typescript'
];

// Mathematical Levenshtein Edit Distance Algorithm
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

// Compute Typosquatting risk score & detection verdict
export function detectTyposquatting(candidate: string): TyposquattingAnalysis {
  const clean = candidate.trim().toLowerCase();
  
  // Exact match with known legitimate library
  if (CANONICAL_PACKAGES.includes(clean)) {
    return {
      packageName: candidate,
      canonicalTarget: clean,
      levenshteinDistance: 0,
      similarityRatio: 1.0,
      isTyposquatting: false,
      verdict: 'legitimate_package',
      explanation: `Verified genuine package corresponding exactly to official canonical registry library "${clean}".`
    };
  }

  let minDistance = Infinity;
  let closestTarget = '';

  for (const canonical of CANONICAL_PACKAGES) {
    const dist = calculateLevenshteinDistance(clean, canonical);
    if (dist < minDistance) {
      minDistance = dist;
      closestTarget = canonical;
    }
  }

  const maxLen = Math.max(clean.length, closestTarget.length);
  const similarity = maxLen > 0 ? parseFloat((1 - minDistance / maxLen).toFixed(2)) : 0;

  // Typosquatting criteria: distance <= 2 or similarity >= 0.80 but not identical
  const isTyposquat = minDistance > 0 && (minDistance <= 2 || similarity >= 0.80);

  let verdict: TyposquattingAnalysis['verdict'] = 'legitimate_package';
  let explanation = `Package name does not match any known malicious typosquatting heuristics.`;

  if (isTyposquat && (minDistance === 1 || similarity >= 0.88)) {
    verdict = 'malicious_typosquat';
    explanation = `CRITICAL TYPOSQUATTING ALERT: Candidate "${candidate}" is a 1-character permutation of popular library "${closestTarget}" (Levenshtein distance: ${minDistance}, Similarity: ${(similarity * 100).toFixed(0)}%). High risk of credential harvesting or reverse shell payload.`;
  } else if (isTyposquat) {
    verdict = 'suspicious';
    explanation = `SUSPICIOUS NAME SIMILARITY: Candidate shares phonetic and lexical similarity with "${closestTarget}" (distance: ${minDistance}). Verify package maintainer and download stats.`;
  }

  return {
    packageName: candidate,
    canonicalTarget: closestTarget,
    levenshteinDistance: minDistance,
    similarityRatio: similarity,
    isTyposquatting: isTyposquat,
    verdict,
    explanation
  };
}

// Initial Curated Software Bill of Materials (SBOM) Components
export const INITIAL_SBOM_COMPONENTS: SbomComponent[] = [
  {
    id: 'SBOM-01',
    name: 'xz',
    version: '5.6.0',
    ecosystem: 'os_package',
    license: 'Public-Domain',
    licenseCategory: 'permissive',
    directDependency: false,
    depth: 3,
    cveCount: 1,
    cves: ['CVE-2024-3094'],
    maxCvss: 10.0,
    isTyposquattingRisk: false,
    isBackdoorRisk: true,
    riskTier: 'critical',
    remediation: 'Immediate downgrade required: Rollback xz-utils to version 5.4.5 or upgrade to 5.6.4+ where malicious obfuscated test files were eradicated.',
    purl: 'pkg:deb/debian/xz@5.6.0?arch=amd64'
  },
  {
    id: 'SBOM-02',
    name: 'jsonwebtoken',
    version: '8.5.1',
    ecosystem: 'npm',
    license: 'MIT',
    licenseCategory: 'permissive',
    directDependency: true,
    depth: 1,
    cveCount: 1,
    cves: ['CVE-2022-23529'],
    maxCvss: 9.8,
    isTyposquattingRisk: false,
    isBackdoorRisk: false,
    riskTier: 'critical',
    remediation: 'Upgrade to jsonwebtoken@9.0.0 or higher. Patches arbitrary code execution via forged secretOrPublicKey parameter.',
    purl: 'pkg:npm/jsonwebtoken@8.5.1'
  },
  {
    id: 'SBOM-03',
    name: 'colors',
    version: '1.4.1',
    ecosystem: 'npm',
    license: 'MIT',
    licenseCategory: 'permissive',
    directDependency: false,
    depth: 2,
    cveCount: 1,
    cves: ['CVE-2022-21724'],
    maxCvss: 7.5,
    isTyposquattingRisk: false,
    isBackdoorRisk: true,
    riskTier: 'high',
    remediation: 'Maintainer protestware DoS loop detected. Pin version to 1.4.0 or migrate to picocolors.',
    purl: 'pkg:npm/colors@1.4.1'
  },
  {
    id: 'SBOM-04',
    name: 'log4j-core',
    version: '2.14.1',
    ecosystem: 'maven',
    license: 'Apache-2.0',
    licenseCategory: 'permissive',
    directDependency: false,
    depth: 4,
    cveCount: 2,
    cves: ['CVE-2021-44228', 'CVE-2021-45046'],
    maxCvss: 10.0,
    isTyposquattingRisk: false,
    isBackdoorRisk: false,
    riskTier: 'critical',
    remediation: 'Upgrade to org.apache.logging.log4j:log4j-core:2.17.1 to fully disable JNDI LDAP lookup lookups.',
    purl: 'pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1'
  },
  {
    id: 'SBOM-05',
    name: 'gpl-network-helper',
    version: '2.0.4',
    ecosystem: 'npm',
    license: 'GPL-3.0-only',
    licenseCategory: 'copyleft_viral',
    directDependency: true,
    depth: 1,
    cveCount: 0,
    cves: [],
    maxCvss: 0.0,
    isTyposquattingRisk: false,
    isBackdoorRisk: false,
    riskTier: 'medium',
    remediation: 'License Compliance Conflict: GPL-3.0 is a viral copyleft license that requires proprietary codebase disclosure upon distribution. Replace with MIT/Apache-2.0 alternative.',
    purl: 'pkg:npm/gpl-network-helper@2.0.4'
  },
  {
    id: 'SBOM-06',
    name: 'react',
    version: '18.3.1',
    ecosystem: 'npm',
    license: 'MIT',
    licenseCategory: 'permissive',
    directDependency: true,
    depth: 1,
    cveCount: 0,
    cves: [],
    maxCvss: 0.0,
    isTyposquattingRisk: false,
    isBackdoorRisk: false,
    riskTier: 'low',
    purl: 'pkg:npm/react@18.3.1'
  },
  {
    id: 'SBOM-07',
    name: 'fastapi',
    version: '0.110.0',
    ecosystem: 'pypi',
    license: 'MIT',
    licenseCategory: 'permissive',
    directDependency: true,
    depth: 1,
    cveCount: 0,
    cves: [],
    maxCvss: 0.0,
    isTyposquattingRisk: false,
    isBackdoorRisk: false,
    riskTier: 'low',
    purl: 'pkg:pypi/fastapi@0.110.0'
  }
];

// CycloneDX 1.5 JSON Exporter
export function exportCycloneDxJson(components: SbomComponent[]): string {
  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:nexus-sbom-${Math.floor(Date.now() / 1000)}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        {
          vendor: 'NexusAI Cyber Defense Systems',
          name: 'Nexus Supply Chain Inspector',
          version: '2.5.0'
        }
      ],
      component: {
        type: 'application',
        name: 'NexusAI Enterprise SecOps Platform',
        version: '1.0.0'
      }
    },
    components: components.map(c => ({
      type: c.ecosystem === 'os_package' ? 'operating-system' : 'library',
      name: c.name,
      version: c.version,
      purl: c.purl,
      licenses: [
        {
          license: {
            id: c.license
          }
        }
      ],
      properties: [
        { name: 'nexus:riskTier', value: c.riskTier },
        { name: 'nexus:cveCount', value: String(c.cveCount) },
        { name: 'nexus:maxCvss', value: String(c.maxCvss) },
        { name: 'nexus:isBackdoorRisk', value: String(c.isBackdoorRisk) }
      ]
    }))
  };

  return JSON.stringify(sbom, null, 2);
}

// SPDX 2.3 JSON Exporter
export function exportSpdxJson(components: SbomComponent[]): string {
  const spdx = {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: 'NexusAI-Enterprise-SBOM',
    documentNamespace: `https://nexus-security.io/spdxdocs/nexus-sbom-${Date.now()}`,
    creationInfo: {
      created: new Date().toISOString(),
      creators: ['Tool: NexusAI Supply Chain Sentinel v2.5', 'Person: Atikur Rahman']
    },
    packages: components.map((c, idx) => ({
      SPDXID: `SPDXRef-Package-${idx + 1}-${c.name}`,
      name: c.name,
      versionInfo: c.version,
      packageFileName: `${c.name}-${c.version}`,
      downloadLocation: 'NOASSERTION',
      licenseConcluded: c.license,
      licenseDeclared: c.license,
      externalRefs: [
        {
          referenceCategory: 'PACKAGE-MANAGER',
          referenceType: 'purl',
          referenceLocator: c.purl
        }
      ]
    }))
  };

  return JSON.stringify(spdx, null, 2);
}

// LocalStorage helpers
const SBOM_COMPONENTS_KEY = 'nexus_sbom_components';

export function loadSbomComponents(): SbomComponent[] {
  try {
    const saved = localStorage.getItem(SBOM_COMPONENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }
  return INITIAL_SBOM_COMPONENTS;
}

export function saveSbomComponents(components: SbomComponent[]): void {
  try {
    localStorage.setItem(SBOM_COMPONENTS_KEY, JSON.stringify(components));
  } catch {
    // Quota
  }
}
