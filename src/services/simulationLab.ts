import { SecurityEvent, AttackType, SeverityLevel } from '../types/telemetry';

export interface AttackCampaignConfig {
  attackType: AttackType;
  targetNode: string;
  intensityRate: number; // e.g. 5000 to 50000 req/sec
  originRegion: 'Eastern Europe' | 'Asia Pacific' | 'North America' | 'Tor Network';
}

export interface SimulationResult {
  generatedEvents: SecurityEvent[];
  consoleLogs: string[];
  peakZScore: number;
}

const REGION_IP_MAP = {
  'Eastern Europe': ['45.154.255.89', '91.240.118.234'],
  'Asia Pacific': ['103.149.28.14', '118.25.10.8'],
  'North America': ['198.51.100.42', '203.0.113.19'],
  'Tor Network': ['185.220.101.5', '185.220.101.7']
};

export function runAttackSimulationCampaign(config: AttackCampaignConfig): SimulationResult {
  const ipPool = REGION_IP_MAP[config.originRegion] || ['185.220.101.5'];
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0];
  const generatedEvents: SecurityEvent[] = [];
  const consoleLogs: string[] = [];

  consoleLogs.push(`[CAMPAIGN_START] Launching synthetic ${config.attackType} scenario against ${config.targetNode}.`);
  consoleLogs.push(`[TRAFFIC_ENGAGED] Ingestion burst simulated at ${config.intensityRate.toLocaleString()} requests/second from ${config.originRegion}.`);

  let count = 4;
  let baseScore = 7.5;
  let severity: SeverityLevel = 'high';

  if (config.attackType === 'DDoS') {
    count = 6;
    baseScore = 8.8 + Math.min(1.0, config.intensityRate / 50000);
    severity = 'critical';
    consoleLogs.push(`[TELEMETRY_ANOMALY] SYN packet backlog exceeded threshold on ${config.targetNode}:443.`);
  } else if (config.attackType === 'SQLi') {
    count = 4;
    baseScore = 9.1;
    severity = 'critical';
    consoleLogs.push('[WAF_HEURISTIC] Automated UNION SELECT injection pattern flagged in HTTP authorization payload.');
  } else if (config.attackType === 'BruteForce') {
    count = 5;
    baseScore = 7.2;
    severity = 'high';
    consoleLogs.push('[AUTH_FAILURE] 180 concurrent SSH dictionary attempts registered.');
  } else if (config.attackType === 'PortScan') {
    count = 4;
    baseScore = 6.4;
    severity = 'medium';
    consoleLogs.push('[RECON_DETECTED] Sequential TCP SYN sweep observed across ports 8000-9000.');
  } else {
    count = 4;
    baseScore = 8.2;
    severity = 'critical';
    consoleLogs.push('[C2_SIGNATURE] Outbound high-entropy beaconing sequence confirmed.');
  }

  for (let i = 0; i < count; i++) {
    const ip = ipPool[i % ipPool.length];
    const eventId = `SIM-${Math.floor(1000 + Math.random() * 9000)}-${i + 1}`;
    const score = parseFloat(Math.min(9.9, baseScore + (Math.random() * 0.4 - 0.2)).toFixed(1));

    generatedEvents.push({
      id: eventId,
      timestamp,
      sourceIp: ip,
      destinationPort: config.attackType === 'DDoS' ? 443 : config.attackType === 'SQLi' ? 80 : 22,
      protocol: config.attackType === 'DDoS' ? 'HTTPS' : config.attackType === 'BruteForce' ? 'SSH' : 'TCP',
      attackType: config.attackType,
      severity,
      anomalyScore: score,
      targetNode: config.targetNode,
      details: `[SIMULATION LAB] High-intensity ${config.attackType} wave (${config.intensityRate.toLocaleString()} req/s) from ${ip}.`,
      status: 'flagged'
    });
  }

  consoleLogs.push(`[ML_DETECTION] Statistical anomaly flagged: Z-Score spiked past critical limit (+3.4σ).`);
  consoleLogs.push(`[AUTO_DEFENSE] Quarantine recommendation compiled for ${generatedEvents.length} malicious IP nodes.`);

  return {
    generatedEvents,
    consoleLogs,
    peakZScore: 3.4
  };
}
