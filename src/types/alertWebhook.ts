import { SeverityLevel, AttackType } from './telemetry';

export type WebhookChannel = 'SLACK' | 'DISCORD' | 'TELEGRAM' | 'PAGERDUTY' | 'CUSTOM_HTTP';

export type AlertTriggerLevel = 'ALL' | 'MEDIUM_AND_ABOVE' | 'HIGH_AND_CRITICAL' | 'CRITICAL_ONLY';

export interface WebhookConfig {
  id: string;
  name: string;
  channel: WebhookChannel;
  endpointUrl: string;
  triggerLevel: AlertTriggerLevel;
  isEnabled: boolean;
  secretToken?: string;
  lastDispatched?: string;
  deliveryStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'NEVER';
  totalDelivered: number;
  averageLatencyMs: number;
}

export interface DispatchedAlertRecord {
  id: string;
  timestamp: string;
  webhookId: string;
  channel: WebhookChannel;
  targetName: string;
  attackType: AttackType;
  severity: SeverityLevel;
  httpStatus: number;
  latencyMs: number;
  payloadSummary: string;
}

export interface WebhookFleetSummary {
  totalEndpoints: number;
  activeEndpoints: number;
  totalAlertsDispatched: number;
  deliverySuccessRate: number; // e.g. 99.94%
  averageDispatchLatencyMs: number; // e.g. 48ms
}
