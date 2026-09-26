import { SecurityEvent, AttackType, SeverityLevel } from '../types/telemetry';

export interface ParseResult {
  events: SecurityEvent[];
  totalParsed: number;
  anomaliesDetected: number;
  formatDetected: 'nginx' | 'auth_ssh' | 'json' | 'generic';
}

/**
 * Regex for standard Nginx / Apache Combined Log Format:
 * 127.0.0.1 - - [26/Sep/2026:23:55:00 +0000] "GET /api/v1/users HTTP/1.1" 200 452 "-" "Mozilla/5.0..."
 */
const NGINX_LOG_REGEX = /^(\S+) \S+ \S+ \[([^:]+):(\d+:\d+:\d+) [^\]]+\] "(\S+) (.*?) (\S+)" (\d{3}) (\d+)/;

/**
 * Regex for Linux Auth / SSH failed login logs:
 * Sep 26 23:52:10 server sshd[1234]: Failed password for invalid user admin from 185.220.101.5 port 45212 ssh2
 */
const SSH_AUTH_LOG_REGEX = /(\w{3}\s+\d+\s+\d+:\d+:\d+).*?sshd\[\d+\]:\s+(Failed password|Accepted password|Invalid user).*?from\s+(\d+\.\d+\.\d+\.\d+)\s+port\s+(\d+)/i;

export function parseRawLogText(rawText: string): ParseResult {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const events: SecurityEvent[] = [];
  let format: ParseResult['formatDetected'] = 'generic';

  // Check if JSON format
  if (lines.length > 0 && lines[0].startsWith('{') && lines[0].endsWith('}')) {
    try {
      const parsedJson = lines.map(l => JSON.parse(l));
      format = 'json';
      parsedJson.forEach((item, index) => {
        events.push({
          id: item.id || `LOG-J${index + 100}`,
          timestamp: item.timestamp || new Date().toTimeString().split(' ')[0],
          sourceIp: item.sourceIp || item.ip || '192.168.1.50',
          destinationPort: item.port || 443,
          protocol: item.protocol || 'HTTPS',
          attackType: (item.attackType as AttackType) || 'Benign',
          severity: (item.severity as SeverityLevel) || 'low',
          anomalyScore: typeof item.anomalyScore === 'number' ? item.anomalyScore : 2.5,
          targetNode: item.targetNode || 'cluster-node-inbound',
          details: item.details || 'Parsed from JSON log line',
          status: item.anomalyScore >= 6.0 ? 'flagged' : 'resolved'
        });
      });

      return {
        events,
        totalParsed: events.length,
        anomaliesDetected: events.filter(e => e.anomalyScore >= 6.0).length,
        formatDetected: format
      };
    } catch {
      // Fall through to regex parser
    }
  }

  // Iterate lines and parse with heuristics
  lines.forEach((line, idx) => {
    const eventId = `LOG-${Math.floor(1000 + Math.random() * 9000)}-${idx + 1}`;
    const now = new Date().toTimeString().split(' ')[0];

    // Check SSH Auth log
    const sshMatch = line.match(SSH_AUTH_LOG_REGEX);
    if (sshMatch) {
      format = 'auth_ssh';
      const isFailed = sshMatch[2].toLowerCase().includes('failed') || sshMatch[2].toLowerCase().includes('invalid');
      const ip = sshMatch[3];
      const port = parseInt(sshMatch[4], 10) || 22;

      events.push({
        id: eventId,
        timestamp: now,
        sourceIp: ip,
        destinationPort: port,
        protocol: 'SSH',
        attackType: isFailed ? 'BruteForce' : 'Benign',
        severity: isFailed ? 'high' : 'low',
        anomalyScore: isFailed ? 7.6 : 1.2,
        targetNode: 'auth-gateway-primary',
        details: isFailed 
          ? `SSH authentication brute force pattern detected: "${line.substring(0, 75)}..."` 
          : 'Successful authenticated SSH connection.',
        status: isFailed ? 'flagged' : 'resolved'
      });
      return;
    }

    // Check Nginx / HTTP Log
    const nginxMatch = line.match(NGINX_LOG_REGEX);
    if (nginxMatch) {
      format = 'nginx';
      const ip = nginxMatch[1];
      const time = nginxMatch[3];
      const method = nginxMatch[4];
      const path = decodeURIComponent(nginxMatch[5]);
      const statusCode = parseInt(nginxMatch[7], 10);

      // Check for SQLi signatures in URI
      const isSqli = /('|--|UNION|SELECT|INSERT|DROP|OR\s+1=1|<script>|\.\.\/)/i.test(path);
      // Check for 5xx errors or 403 forbidden scans
      const isScan = statusCode === 403 || statusCode === 404 || path.includes('.env') || path.includes('wp-login');

      let attackType: AttackType = 'Benign';
      let severity: SeverityLevel = 'low';
      let anomalyScore = 1.4;

      if (isSqli) {
        attackType = 'SQLi';
        severity = 'critical';
        anomalyScore = 9.2;
      } else if (isScan) {
        attackType = 'PortScan';
        severity = 'medium';
        anomalyScore = 6.4;
      }

      events.push({
        id: eventId,
        timestamp: time || now,
        sourceIp: ip,
        destinationPort: 443,
        protocol: 'HTTPS',
        attackType,
        severity,
        anomalyScore,
        targetNode: 'edge-proxy-lon-02',
        details: `${method} request to ${path.substring(0, 50)} returned status ${statusCode}`,
        status: anomalyScore >= 6.0 ? 'flagged' : 'resolved'
      });
      return;
    }

    // Generic fallback line parser
    const isError = /error|fail|drop|deny|attack|anomaly/i.test(line);
    events.push({
      id: eventId,
      timestamp: now,
      sourceIp: '198.51.100.' + (idx % 250 + 1),
      destinationPort: 80,
      protocol: 'TCP',
      attackType: isError ? 'Malware' : 'Benign',
      severity: isError ? 'high' : 'low',
      anomalyScore: isError ? 6.8 : 1.5,
      targetNode: 'cluster-node-inbound',
      details: line.substring(0, 80),
      status: isError ? 'flagged' : 'resolved'
    });
  });

  return {
    events,
    totalParsed: events.length,
    anomaliesDetected: events.filter(e => e.anomalyScore >= 6.0).length,
    formatDetected: format
  };
}

/**
 * Built-in real-world attack scenarios for instant demo testing
 */
export const PRESET_ATTACK_SCENARIOS = {
  ddosWave: `185.220.101.5 - - [27/Sep/2026:00:01:02 +0000] "GET / HTTP/1.1" 503 1042 "-" "curl/7.68.0"
185.220.101.6 - - [27/Sep/2026:00:01:02 +0000] "GET /login HTTP/1.1" 503 1042 "-" "curl/7.68.0"
185.220.101.7 - - [27/Sep/2026:00:01:03 +0000] "GET /api HTTP/1.1" 503 1042 "-" "curl/7.68.0"
185.220.101.8 - - [27/Sep/2026:00:01:03 +0000] "GET / HTTP/1.1" 503 1042 "-" "curl/7.68.0"
45.154.255.89 - - [27/Sep/2026:00:01:04 +0000] "GET /assets/main.css HTTP/1.1" 503 1042 "-" "curl/7.68.0"`,

  sqlInjectionBurst: `194.26.29.112 - - [27/Sep/2026:00:02:10 +0000] "GET /api/users?id=1%20OR%201=1 HTTP/1.1" 500 231 "-" "sqlmap/1.5"
194.26.29.112 - - [27/Sep/2026:00:02:12 +0000] "POST /api/auth/login?user=admin'%20UNION%20SELECT%20password%20FROM%20users-- HTTP/1.1" 403 120 "-" "python-requests"
194.26.29.112 - - [27/Sep/2026:00:02:15 +0000] "GET /../../etc/passwd HTTP/1.1" 404 150 "-" "Mozilla/5.0"`,

  sshBruteForce: `Sep 27 00:03:01 cluster-01 sshd[4012]: Failed password for invalid user root from 103.149.28.14 port 41232 ssh2
Sep 27 00:03:03 cluster-01 sshd[4015]: Failed password for invalid user admin from 103.149.28.14 port 41234 ssh2
Sep 27 00:03:05 cluster-01 sshd[4018]: Failed password for invalid user ubnt from 103.149.28.14 port 41236 ssh2
Sep 27 00:03:07 cluster-01 sshd[4021]: Failed password for invalid user guest from 103.149.28.14 port 41238 ssh2`
};
