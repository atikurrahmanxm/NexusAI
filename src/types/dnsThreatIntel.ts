export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'NULL';

export type DnsClassification = 
  | 'benign' 
  | 'dga_suspicious' 
  | 'dga_malicious' 
  | 'tunneling_exfiltration' 
  | 'subdomain_takeover';

export interface EasmAsset {
  id: string;
  subdomain: string;
  recordType: DnsRecordType;
  targetValue: string;
  status: 'active' | 'dangling' | 'exposed_dev' | 'unresolved';
  takeoverRisk: boolean;
  openPorts: number[];
  tlsStatus: 'valid' | 'expiring_soon' | 'expired' | 'unencrypted';
  lastDiscovered: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  takeoverRemediation?: string;
}

export interface DnsQueryLog {
  id: string;
  timestamp: string;
  clientIp: string;
  domain: string;
  queryType: DnsRecordType;
  shannonEntropy: number;
  vowelRatio: number;
  length: number;
  classification: DnsClassification;
  malwareFamily?: string;
  payloadDecoded?: string;
  isSinkholed: boolean;
}

export interface CharFrequency {
  char: string;
  count: number;
  prob: number;
}

export interface EntropyAnalysis {
  domain: string;
  entropy: number;
  vowelRatio: number;
  digitRatio: number;
  length: number;
  classification: DnsClassification;
  explanation: string;
  charFrequencies: CharFrequency[];
}
