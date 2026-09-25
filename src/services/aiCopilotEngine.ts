import { SecurityEvent } from '../types/telemetry';

export interface CopilotMessage {
  id: string;
  sender: 'ai' | 'analyst';
  timestamp: string;
  text: string;
  mitreTechnique?: string;
  suggestedAction?: {
    label: string;
    actionType: 'isolate' | 'mitigate' | 'waf';
    target: string;
  };
}

export const INITIAL_COPILOT_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    timestamp: '23:55:00',
    text: 'Hello Commander Atik. Telemetry daemon is active. High-frequency anomaly detected on node "alpha-gamma-01" with Volumetric SYN flood signatures.',
    mitreTechnique: 'MITRE ATT&CK: T1499.002 (Network DoS)',
    suggestedAction: {
      label: 'Isolate alpha-gamma-01 Node',
      actionType: 'isolate',
      target: 'alpha-gamma-01'
    }
  }
];

export function generateCopilotResponse(
  userPrompt: string,
  criticalEvents: SecurityEvent[]
): CopilotMessage {
  const now = new Date().toTimeString().split(' ')[0];
  const promptLower = userPrompt.toLowerCase();
  const topThreat = criticalEvents.find(e => e.severity === 'critical') || criticalEvents[0];

  if (promptLower.includes('ddos') || promptLower.includes('syn') || promptLower.includes('traffic')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      timestamp: now,
      text: `DDoS telemetry breakdown: Inbound traffic spike exceeds baseline by 340%. Signature matches SYN-flood targeting port 443. Recommended containment: deploy cloud rate-limiting and enforce SYN cookies.`,
      mitreTechnique: 'MITRE ATT&CK: T1499 (Endpoint Denial of Service)',
      suggestedAction: {
        label: 'Deploy Cloudflare WAF Rate Limiter',
        actionType: 'waf',
        target: topThreat?.targetNode || 'edge-gateway'
      }
    };
  }

  if (promptLower.includes('sqli') || promptLower.includes('database') || promptLower.includes('injection')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      timestamp: now,
      text: `SQL Injection telemetry detected: Payload contains UNION SELECT sequences targeting authentication tables. Input sanitization bypassed on authorization headers.`,
      mitreTechnique: 'MITRE ATT&CK: T1190 (Exploit Public-Facing Application)',
      suggestedAction: {
        label: 'Blacklist Remote IP (185.220.101.5)',
        actionType: 'mitigate',
        target: '185.220.101.5'
      }
    };
  }

  if (promptLower.includes('mitre') || promptLower.includes('tactics')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      timestamp: now,
      text: `Active MITRE ATT&CK Matrix:
• T1499.002 (Network Denial of Service) - High Confidence
• T1110 (Brute Force SSH Dictionary) - Moderate Confidence
• T1071 (Exfiltration Over C2 Channel) - Investigating
Defensive posture: Zero-Trust network segmentation active.`,
      mitreTechnique: 'MITRE ATT&CK Framework v14.1'
    };
  }

  if (promptLower.includes('report') || promptLower.includes('summary')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      timestamp: now,
      text: `SecOps Brief: Current system threat index is calculated across ${criticalEvents.length} active telemetry events. Immediate priority is isolating anomalous node clusters and patching public HTTP/SSH entry endpoints.`,
      mitreTechnique: 'SecOps Executive Audit Log'
    };
  }

  // Default intelligent contextual response
  return {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    timestamp: now,
    text: `Analyzing threat telemetry for "${userPrompt}". Primary risk vector originates from ${topThreat?.sourceIp || 'external subnets'} attacking ${topThreat?.targetNode || 'cluster'}. Machine learning confidence: ${topThreat?.anomalyScore ? topThreat.anomalyScore * 10 : 88}%.`,
    mitreTechnique: 'Heuristic Threat Evaluation',
    suggestedAction: {
      label: `Mitigate Alert ${topThreat?.id || 'SEC-Current'}`,
      actionType: 'mitigate',
      target: topThreat?.id || 'SEC-Current'
    }
  };
}
