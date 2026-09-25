import { SecurityEvent } from '../types/telemetry';

export interface AnomalyReport {
  eventId: string;
  timestamp: string;
  sourceIp: string;
  featureName: string;
  observedValue: number;
  mean: number;
  standardDeviation: number;
  zScore: number;
  isAnomaly: boolean;
  confidencePercentage: number;
  recommendedAction: string;
}

export interface StatisticalBaseline {
  mean: number;
  stdDev: number;
  thresholdZ: number;
  totalSamples: number;
}

/**
 * Calculates Mean (mu) and Standard Deviation (sigma) of a dataset.
 */
export function calculateStatistics(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 1 };

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance) || 1; // Prevent division by zero

  return {
    mean: parseFloat(mean.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2))
  };
}

/**
 * Calculates Z-Score: Z = (X - mu) / sigma
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return parseFloat(((value - mean) / stdDev).toFixed(2));
}

/**
 * Runs statistical anomaly detection on a batch of security events based on anomaly scores and request rates.
 */
export function analyzeEventsForAnomalies(
  events: SecurityEvent[],
  thresholdZ: number = 2.0
): { reports: AnomalyReport[]; baseline: StatisticalBaseline } {
  const scores = events.map(e => e.anomalyScore);
  const { mean, stdDev } = calculateStatistics(scores);

  const reports: AnomalyReport[] = events.map(event => {
    const zScore = calculateZScore(event.anomalyScore, mean, stdDev);
    const isAnomaly = Math.abs(zScore) >= thresholdZ || event.anomalyScore >= 7.0;

    // Confidence calculation based on standard deviations away from mean
    const confidence = Math.min(99.9, Math.max(65.0, 75.0 + Math.abs(zScore) * 8.5));

    let recommendedAction = 'Monitor traffic pattern';
    if (event.anomalyScore >= 8.5 || zScore > 3.0) {
      recommendedAction = `Immediate IP blacklisting & node isolation (${event.targetNode})`;
    } else if (isAnomaly) {
      recommendedAction = 'Deploy adaptive rate-limiting (WAF rule #409)';
    }

    return {
      eventId: event.id,
      timestamp: event.timestamp,
      sourceIp: event.sourceIp,
      featureName: 'Heuristic Threat Entropy',
      observedValue: event.anomalyScore,
      mean,
      standardDeviation: stdDev,
      zScore,
      isAnomaly,
      confidencePercentage: parseFloat(confidence.toFixed(1)),
      recommendedAction
    };
  });

  return {
    reports,
    baseline: {
      mean,
      stdDev,
      thresholdZ,
      totalSamples: events.length
    }
  };
}
