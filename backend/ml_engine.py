"""
NexusAI - Python Machine Learning Anomaly Detection Engine
Implements statistical and heuristic outlier detection for cybersecurity telemetry.
"""

from typing import List, Dict, Any
import math

class TelemetryMLEngine:
    def __init__(self, sensitivity_sigma: float = 2.0):
        self.sensitivity_sigma = sensitivity_sigma

    def calculate_statistics(self, values: List[float]) -> Dict[str, float]:
        """Calculates arithmetic mean and standard deviation."""
        if not values:
            return {"mean": 0.0, "std_dev": 1.0}
        
        n = len(values)
        mean = sum(values) / n
        variance = sum((x - mean) ** 2 for x in values) / n
        std_dev = math.sqrt(variance) or 1.0
        
        return {
            "mean": round(mean, 2),
            "std_dev": round(std_dev, 2)
        }

    def detect_outliers(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes security event stream and flags anomalous outliers based on 
        standard deviation deviations (Z-score algorithm).
        """
        scores = [float(e.get("anomalyScore", 1.0)) for e in events]
        stats = self.calculate_statistics(scores)
        mean, std_dev = stats["mean"], stats["std_dev"]

        analyzed_events = []
        outlier_count = 0

        for event in events:
            score = float(event.get("anomalyScore", 1.0))
            z_score = round((score - mean) / std_dev, 2)
            is_anomaly = abs(z_score) >= self.sensitivity_sigma or score >= 7.0

            if is_anomaly:
                outlier_count += 1

            analyzed_events.append({
                **event,
                "zScore": z_score,
                "isAnomaly": is_anomaly,
                "confidence": min(99.9, round(75.0 + abs(z_score) * 8.5, 1))
            })

        return {
            "baseline": {
                "mean": mean,
                "stdDev": std_dev,
                "thresholdSigma": self.sensitivity_sigma,
                "totalAnalyzed": len(events),
                "anomaliesDetected": outlier_count
            },
            "events": analyzed_events
        }

# Global singleton engine instance
ml_engine = TelemetryMLEngine()
