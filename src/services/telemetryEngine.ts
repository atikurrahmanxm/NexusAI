import { SecurityEvent, SystemMetrics, AttackType, SeverityLevel } from '../types/telemetry';

const SAMPLE_ATTACK_IPS = [
  '185.220.101.5',
  '45.154.255.89',
  '194.26.29.112',
  '103.149.28.14',
  '91.240.118.234',
  '192.168.1.105',
  '10.0.4.12'
];

const TARGET_NODES = [
  'alpha-gamma-01',
  'us-east-k8s-pod',
  'auth-gateway-primary',
  'db-cluster-replica-3',
  'edge-proxy-lon-02'
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'SEC-9081',
    timestamp: '23:54:12',
    sourceIp: '185.220.101.5',
    destinationPort: 443,
    protocol: 'HTTPS',
    attackType: 'DDoS',
    severity: 'critical',
    anomalyScore: 8.9,
    targetNode: 'alpha-gamma-01',
    details: 'Volumetric SYN flood detected exceeding 12,000 req/sec threshold.',
    status: 'flagged'
  },
  {
    id: 'SEC-9080',
    timestamp: '23:52:45',
    sourceIp: '45.154.255.89',
    destinationPort: 80,
    protocol: 'HTTP',
    attackType: 'SQLi',
    severity: 'high',
    anomalyScore: 7.4,
    targetNode: 'auth-gateway-primary',
    details: 'Blind SQL injection payload identified in Authorization header parameters.',
    status: 'investigating'
  },
  {
    id: 'SEC-9079',
    timestamp: '23:51:02',
    sourceIp: '194.26.29.112',
    destinationPort: 22,
    protocol: 'SSH',
    attackType: 'BruteForce',
    severity: 'high',
    anomalyScore: 6.8,
    targetNode: 'db-cluster-replica-3',
    details: 'Rapid authentication failures (140 attempts/min) using credential dictionary.',
    status: 'mitigated'
  },
  {
    id: 'SEC-9078',
    timestamp: '23:49:18',
    sourceIp: '103.149.28.14',
    destinationPort: 8080,
    protocol: 'TCP',
    attackType: 'PortScan',
    severity: 'medium',
    anomalyScore: 5.2,
    targetNode: 'edge-proxy-lon-02',
    details: 'Sequential TCP SYN port sweep across ports 8000-9000.',
    status: 'mitigated'
  },
  {
    id: 'SEC-9077',
    timestamp: '23:45:30',
    sourceIp: '91.240.118.234',
    destinationPort: 443,
    protocol: 'HTTPS',
    attackType: 'Malware',
    severity: 'critical',
    anomalyScore: 9.3,
    targetNode: 'us-east-k8s-pod',
    details: 'Encrypted C2 (Command & Control) beaconing outbound traffic signature.',
    status: 'flagged'
  },
  {
    id: 'SEC-9076',
    timestamp: '23:41:09',
    sourceIp: '192.168.1.105',
    destinationPort: 443,
    protocol: 'HTTPS',
    attackType: 'Benign',
    severity: 'low',
    anomalyScore: 1.1,
    targetNode: 'auth-gateway-primary',
    details: 'Routine telemetry health probe from authenticated cluster monitor.',
    status: 'resolved'
  }
];

export function calculateSystemMetrics(events: SecurityEvent[]): SystemMetrics {
  const activeThreats = events.filter(e => e.status === 'flagged' || e.status === 'investigating').length;
  const anomalies = events.filter(e => e.anomalyScore >= 6.5).length;
  
  // Calculate average anomaly score scaled to 0-100
  const avgAnomaly = events.length > 0 
    ? events.reduce((sum, e) => sum + e.anomalyScore, 0) / events.length
    : 0;
  
  const rawScore = Math.min(100, Math.round(avgAnomaly * 10 + activeThreats * 3));
  
  let threatLevel: SystemMetrics['threatLevel'] = 'LOW';
  if (rawScore >= 80) threatLevel = 'CRITICAL';
  else if (rawScore >= 65) threatLevel = 'HIGH';
  else if (rawScore >= 45) threatLevel = 'ELEVATED';
  else if (rawScore >= 25) threatLevel = 'MODERATE';

  return {
    activeThreats,
    threatDeltaPercentage: 5.4,
    dataAnomalies: anomalies,
    threatScore: rawScore,
    threatLevel,
    securedNodes: 1245,
    totalNodes: 1250,
    totalEventsProcessed: 48920 + events.length
  };
}

export function generateSyntheticSecurityEvent(): SecurityEvent {
  const attackTypes: AttackType[] = ['DDoS', 'SQLi', 'BruteForce', 'PortScan', 'Malware', 'Benign'];
  const severities: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];

  const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  const isAttack = type !== 'Benign';

  const severity: SeverityLevel = isAttack 
    ? severities[Math.floor(Math.random() * 3) + 1] 
    : 'low';

  const anomalyScore = isAttack 
    ? parseFloat((Math.random() * 4 + 5.5).toFixed(1)) 
    : parseFloat((Math.random() * 2 + 0.5).toFixed(1));

  const randomIp = SAMPLE_ATTACK_IPS[Math.floor(Math.random() * SAMPLE_ATTACK_IPS.length)];
  const target = TARGET_NODES[Math.floor(Math.random() * TARGET_NODES.length)];

  const eventId = `SEC-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0];

  return {
    id: eventId,
    timestamp,
    sourceIp: randomIp,
    destinationPort: type === 'DDoS' ? 443 : type === 'SQLi' ? 80 : 22,
    protocol: type === 'DDoS' ? 'HTTPS' : type === 'BruteForce' ? 'SSH' : 'TCP',
    attackType: type,
    severity,
    anomalyScore,
    targetNode: target,
    details: isAttack 
      ? `Heuristic detection identified anomalous ${type} signature from remote peer.` 
      : 'Standard encrypted handshake verified without anomalies.',
    status: isAttack ? 'flagged' : 'resolved'
  };
}
