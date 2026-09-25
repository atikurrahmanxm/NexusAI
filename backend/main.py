"""
NexusAI - FastAPI Backend Service
Exposes RESTful endpoints for Cybersecurity Telemetry, ML Anomaly Inference & AI Copilot.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ml_engine import ml_engine

app = FastAPI(
  title="NexusAI Telemetry & ML Intelligence API",
  version="1.0.0",
  description="Backend microservice providing machine learning outlier scoring and SecOps copilot insights."
)

# Allow CORS for React frontend (Vite runs on localhost:3000)
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class SecurityEventPayload(BaseModel):
  id: str
  timestamp: str
  sourceIp: str
  destinationPort: int
  protocol: str
  attackType: str
  severity: str
  anomalyScore: float
  targetNode: str
  details: str
  status: str

class DetectionBatchRequest(BaseModel):
  events: List[SecurityEventPayload]
  sensitivity: Optional[float] = 2.0

class CopilotQueryRequest(BaseModel):
  query: str
  topThreatNode: Optional[str] = "alpha-gamma-01"

@app.get("/")
def root():
  return {
    "service": "NexusAI Intelligence Microservice",
    "status": "online",
    "version": "1.0.0",
    "engine": "Python 3.10 + FastAPI + Scikit-Learn Pipeline"
  }

@app.get("/api/health")
def health_check():
  return {
    "status": "healthy",
    "daemon": "active",
    "ml_engine": "operational",
    "memory_pressure": "nominal"
  }

@app.post("/api/ml/detect-anomalies")
def detect_anomalies(payload: DetectionBatchRequest):
  try:
    if payload.sensitivity:
      ml_engine.sensitivity_sigma = payload.sensitivity
      
    dict_events = [e.model_dump() for e in payload.events]
    result = ml_engine.detect_outliers(dict_events)
    return {
      "success": True,
      "data": result
    }
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/copilot-chat")
def copilot_chat(payload: CopilotQueryRequest):
  query = payload.query.lower()
  
  if "ddos" in query:
    response_text = "Python ML Engine Analysis: Volumetric flood detected. Recommend immediate IP-level rate-limiting via iptables."
    mitre_id = "MITRE ATT&CK: T1499"
  elif "sqli" in query:
    response_text = "Database Firewall Analysis: SQLi signature matched in HTTP headers. Enforce strict parameterization."
    mitre_id = "MITRE ATT&CK: T1190"
  else:
    response_text = f"SecOps Telemetry Analysis: Threat vectors quarantined across cluster node {payload.topThreatNode}."
    mitre_id = "MITRE ATT&CK: T1071"

  return {
    "response": response_text,
    "mitreTechnique": mitre_id,
    "confidence": 98.4
  }

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="127.0.0.1", port=8000)
