export type PackageEcosystem = 'npm' | 'pypi' | 'go' | 'maven' | 'cargo' | 'os_package';

export type SupplyChainRiskTier = 'critical' | 'high' | 'medium' | 'low';

export type LicenseCategory = 'permissive' | 'copyleft_viral' | 'proprietary' | 'unlicensed';

export interface SbomComponent {
  id: string;
  name: string;
  version: string;
  ecosystem: PackageEcosystem;
  license: string;
  licenseCategory: LicenseCategory;
  directDependency: boolean;
  depth: number;
  cveCount: number;
  cves: string[];
  maxCvss: number;
  isTyposquattingRisk: boolean;
  isBackdoorRisk: boolean;
  riskTier: SupplyChainRiskTier;
  remediation?: string;
  purl: string; // Package URL format (RFC 3986)
}

export interface TyposquattingAnalysis {
  packageName: string;
  canonicalTarget: string;
  levenshteinDistance: number;
  similarityRatio: number;
  isTyposquatting: boolean;
  verdict: 'malicious_typosquat' | 'suspicious' | 'legitimate_package';
  explanation: string;
}

export interface SbomManifest {
  bomFormat: 'CycloneDX' | 'SPDX';
  specVersion: string;
  serialNumber: string;
  version: number;
  timestamp: string;
  totalComponents: number;
  vulnerableComponents: number;
  licenseViolations: number;
}
