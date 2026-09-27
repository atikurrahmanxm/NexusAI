import { WebhookConfig, DispatchedAlertRecord, WebhookFleetSummary } from '../types/alertWebhook';
import { SecurityEvent } from '../types/telemetry';

export const INITIAL_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-slack-01',
    name: 'Slack SOC Escalations (#secops-alerts)',
    channel: 'SLACK',
    endpointUrl: 'https://hooks.slack.com/services/T048A1/B098K2/8f2k9x...4m',
    triggerLevel: 'HIGH_AND_CRITICAL',
    isEnabled: true,
    lastDispatched: '4m ago',
    deliveryStatus: 'SUCCESS',
    totalDelivered: 1420,
    averageLatencyMs: 42
  },
  {
    id: 'wh-discord-02',
    name: 'Discord Incident Response War-Room',
    channel: 'DISCORD',
    endpointUrl: 'https://discord.com/api/webhooks/109482910481/a8f9c...91',
    triggerLevel: 'CRITICAL_ONLY',
    isEnabled: true,
    lastDispatched: '18m ago',
    deliveryStatus: 'SUCCESS',
    totalDelivered: 680,
    averageLatencyMs: 56
  },
  {
    id: 'wh-telegram-03',
    name: 'Telegram SecOps On-Call Bot (@NexusSecOpsBot)',
    channel: 'TELEGRAM',
    endpointUrl: 'https://api.telegram.org/bot682910481:AAH.../sendMessage',
    triggerLevel: 'CRITICAL_ONLY',
    isEnabled: true,
    lastDispatched: '45m ago',
    deliveryStatus: 'SUCCESS',
    totalDelivered: 890,
    averageLatencyMs: 38
  },
  {
    id: 'wh-pagerduty-04',
    name: 'PagerDuty Tier-1 SRE & SOC Escalation Bridge',
    channel: 'PAGERDUTY',
    endpointUrl: 'https://events.pagerduty.com/v2/enqueue',
    triggerLevel: 'CRITICAL_ONLY',
    isEnabled: true,
    lastDispatched: '1h ago',
    deliveryStatus: 'SUCCESS',
    totalDelivered: 240,
    averageLatencyMs: 65
  },
  {
    id: 'wh-custom-05',
    name: 'Corporate SIEM / Jira Service Desk Webhook',
    channel: 'CUSTOM_HTTP',
    endpointUrl: 'https://siem.corp.nexus.internal/api/v1/secops/events',
    triggerLevel: 'ALL',
    isEnabled: false,
    lastDispatched: 'Yesterday',
    deliveryStatus: 'SUCCESS',
    totalDelivered: 3120,
    averageLatencyMs: 28
  }
];

export const INITIAL_DISPATCHED_LOGS: DispatchedAlertRecord[] = [
  {
    id: 'rec-901',
    timestamp: '23:54:13',
    webhookId: 'wh-slack-01',
    channel: 'SLACK',
    targetName: 'Slack SOC Escalations',
    attackType: 'DDoS',
    severity: 'critical',
    httpStatus: 200,
    latencyMs: 41,
    payloadSummary: 'Volumetric SYN flood on alpha-gamma-01 (185.220.101.5) dispatched to #secops-alerts.'
  },
  {
    id: 'rec-902',
    timestamp: '23:52:46',
    webhookId: 'wh-discord-02',
    channel: 'DISCORD',
    targetName: 'Discord War-Room',
    attackType: 'SQLi',
    severity: 'high',
    httpStatus: 200,
    latencyMs: 54,
    payloadSummary: 'Blind SQL Injection on auth-gateway-primary (45.154.255.89) embedded in Discord war-room.'
  },
  {
    id: 'rec-903',
    timestamp: '23:51:03',
    webhookId: 'wh-telegram-03',
    channel: 'TELEGRAM',
    targetName: 'Telegram SecOps Bot',
    attackType: 'BruteForce',
    severity: 'high',
    httpStatus: 200,
    latencyMs: 37,
    payloadSummary: 'SSH dictionary attack on db-cluster-replica-3 (194.26.29.112) pushed to on-call mobile channel.'
  }
];

const WEBHOOK_STORAGE_KEY = 'nexus_webhook_configs';
const LOGS_STORAGE_KEY = 'nexus_webhook_logs';

export function loadWebhooks(): WebhookConfig[] {
  try {
    const raw = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load webhooks', err);
  }
  return INITIAL_WEBHOOKS;
}

export function saveWebhooks(webhooks: WebhookConfig[]): void {
  try {
    localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(webhooks));
  } catch (err) {
    console.error('Failed to save webhooks', err);
  }
}

export function loadDispatchedLogs(): DispatchedAlertRecord[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load webhook logs', err);
  }
  return INITIAL_DISPATCHED_LOGS;
}

export function saveDispatchedLogs(logs: DispatchedAlertRecord[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save webhook logs', err);
  }
}

export function toggleWebhookActive(webhooks: WebhookConfig[], id: string): WebhookConfig[] {
  const updated = webhooks.map(wh => {
    if (wh.id === id) {
      return { ...wh, isEnabled: !wh.isEnabled };
    }
    return wh;
  });
  saveWebhooks(updated);
  return updated;
}

export function deleteWebhook(webhooks: WebhookConfig[], id: string): WebhookConfig[] {
  const updated = webhooks.filter(wh => wh.id !== id);
  saveWebhooks(updated);
  return updated;
}

export function addCustomWebhook(
  webhooks: WebhookConfig[],
  payload: Omit<WebhookConfig, 'id' | 'deliveryStatus' | 'totalDelivered' | 'averageLatencyMs' | 'lastDispatched'>
): WebhookConfig[] {
  const newWebhook: WebhookConfig = {
    ...payload,
    id: `wh-${payload.channel.toLowerCase()}-${Date.now().toString().slice(-4)}`,
    deliveryStatus: 'NEVER',
    totalDelivered: 0,
    averageLatencyMs: 45
  };
  const updated = [newWebhook, ...webhooks];
  saveWebhooks(updated);
  return updated;
}

export function calculateWebhookSummary(webhooks: WebhookConfig[]): WebhookFleetSummary {
  const total = webhooks.length;
  const active = webhooks.filter(w => w.isEnabled).length;
  const totalAlerts = webhooks.reduce((sum, w) => sum + w.totalDelivered, 0);

  return {
    totalEndpoints: total,
    activeEndpoints: active,
    totalAlertsDispatched: totalAlerts || 6350,
    deliverySuccessRate: 99.94,
    averageDispatchLatencyMs: 44
  };
}

export function simulateDispatchAlert(
  webhook: WebhookConfig,
  event?: SecurityEvent
): { updatedWebhook: WebhookConfig; record: DispatchedAlertRecord; mockPreviewPayload: object } {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const latency = Math.floor(Math.random() * 35 + 28);

  const sampleEvent: SecurityEvent = event || {
    id: 'SEC-LIVE-ALERT',
    timestamp: timeStr,
    sourceIp: '185.220.101.5',
    destinationPort: 443,
    protocol: 'HTTPS',
    attackType: 'DDoS',
    severity: 'critical',
    anomalyScore: 9.2,
    targetNode: 'auth-gateway-primary',
    details: 'Volumetric SYN flood anomaly detected exceeding 12,000 req/sec threshold.',
    status: 'flagged'
  };

  const updatedWebhook: WebhookConfig = {
    ...webhook,
    totalDelivered: webhook.totalDelivered + 1,
    deliveryStatus: 'SUCCESS',
    lastDispatched: 'Just now (1s ago)'
  };

  const record: DispatchedAlertRecord = {
    id: `rec-${Date.now().toString().slice(-5)}`,
    timestamp: timeStr,
    webhookId: webhook.id,
    channel: webhook.channel,
    targetName: webhook.name,
    attackType: sampleEvent.attackType,
    severity: sampleEvent.severity,
    httpStatus: 200,
    latencyMs: latency,
    payloadSummary: `[${webhook.channel}] ${sampleEvent.attackType} alert on ${sampleEvent.targetNode} (${sampleEvent.sourceIp}) delivered in ${latency}ms.`
  };

  // Generate real channel-specific payload structures
  let mockPreviewPayload: object = {};

  if (webhook.channel === 'SLACK') {
    mockPreviewPayload = {
      channel: '#secops-alerts',
      username: 'NexusAI Autonomous Copilot',
      icon_emoji: ':shield:',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `🚨 CRITICAL SECURITY ALERT: ${sampleEvent.attackType}` }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Source IP:*\n\`${sampleEvent.sourceIp}\`` },
            { type: 'mrkdwn', text: `*Target Node:*\n\`${sampleEvent.targetNode}\`` },
            { type: 'mrkdwn', text: `*Severity:*\n*${sampleEvent.severity.toUpperCase()}*` },
            { type: 'mrkdwn', text: `*Anomaly Score:*\n\`${sampleEvent.anomalyScore} / 10\`` }
          ]
        },
        {
          type: 'actions',
          elements: [
            { type: 'button', text: { type: 'plain_text', text: 'Quarantine IP (Edge WAF)' }, style: 'danger' },
            { type: 'button', text: { type: 'plain_text', text: 'View Telemetry Dossier' } }
          ]
        }
      ]
    };
  } else if (webhook.channel === 'DISCORD') {
    mockPreviewPayload = {
      username: 'NexusAI SOC Bot',
      avatar_url: 'https://nexusai.security/logo.png',
      embeds: [
        {
          title: `⚠️ Incident Notification: ${sampleEvent.attackType} Detected`,
          color: 15158332, // Red hex
          fields: [
            { name: 'Attacker IP', value: sampleEvent.sourceIp, inline: true },
            { name: 'Target Server', value: sampleEvent.targetNode, inline: true },
            { name: 'Anomaly Rating', value: `${sampleEvent.anomalyScore} / 10`, inline: true },
            { name: 'Details', value: sampleEvent.details }
          ],
          footer: { text: 'NexusAI Autonomous Telemetry Gateway' },
          timestamp: new Date().toISOString()
        }
      ]
    };
  } else if (webhook.channel === 'TELEGRAM') {
    mockPreviewPayload = {
      chat_id: '@NexusOnCallSecOps',
      parse_mode: 'MarkdownV2',
      text: `*🚨 NEXUSAI CRITICAL INCIDENT*\n\n*Type:* \`${sampleEvent.attackType}\`\n*Attacker:* \`${sampleEvent.sourceIp}\`\n*Target Node:* \`${sampleEvent.targetNode}\`\n*Status:* \`${sampleEvent.status}\`\n\n_Auto-mitigation playbook active\\._`
    };
  } else {
    mockPreviewPayload = {
      event_type: 'SECURITY_ANOMALY_TRIGGER',
      incident_id: sampleEvent.id,
      timestamp: new Date().toISOString(),
      source_ip: sampleEvent.sourceIp,
      target_resource: sampleEvent.targetNode,
      anomaly_score: sampleEvent.anomalyScore,
      severity: sampleEvent.severity,
      action_taken: 'ZERO_TRUST_CONTAINMENT_SCHEDULED'
    };
  }

  return { updatedWebhook, record, mockPreviewPayload };
}
