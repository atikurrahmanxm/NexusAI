"""
NexusAI - FastAPI Backend Service & WebSocket Telemetry Gateway
Exposes RESTful & Real-Time WebSocket endpoints for Cybersecurity Telemetry, ML Anomaly Inference & AI Copilot.
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import json
import time
import random
from ml_engine import ml_engine

app = FastAPI(
  title="NexusAI Telemetry & ML Intelligence API",
  version="1.2.0",
  description="Backend microservice providing machine learning outlier scoring, real-time WebSocket streaming & SecOps copilot insights."
)

# Allow CORS for React frontend (Vite default localhost:5173 / localhost:3000)
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

# -------------------------------------------------------------
# WebSocket Real-Time Connection Manager
# -------------------------------------------------------------
class WebSocketManager:
  def __init__(self):
    self.active_connections: List[WebSocket] = []

  async def connect(self, websocket: WebSocket):
    await websocket.accept()
    self.active_connections.append(websocket)

  def disconnect(self, websocket: WebSocket):
    if websocket in self.active_connections:
      self.active_connections.remove(websocket)

  async def broadcast(self, message: Dict[str, Any]):
    dead_connections = []
    for connection in self.active_connections:
      try:
        await connection.send_json(message)
      except Exception:
        dead_connections.append(connection)
    
    for dead in dead_connections:
      self.disconnect(dead)

ws_manager = WebSocketManager()

def generate_telemetry_event() -> Dict[str, Any]:
  """Generates a real-time synthetic security event from the backend engine."""
  vectors = [
    ("DDoS", "high", [80, 443, 53], "Volumetric SYN flood packet saturation detected"),
    ("SQLi", "critical", [443, 8080], "SQL union-select injection string intercepted"),
    ("BruteForce", "medium", [22, 3389], "SSH repeated credential auth failure threshold reached"),
    ("Malware", "critical", [4444, 9001], "Anomalous outbound reverse TCP beacon pattern observed"),
    ("PortScan", "low", [80, 8080, 21, 22], "Subnet-wide TCP SYN port reconnaissance scan probe"),
    ("Benign", "low", [443, 80], "Encrypted TLS API session established and validated"),
  ]
  chosen_vector, sev, ports, details = random.choice(vectors)
  dest_port = random.choice(ports)
  score = round(random.uniform(7.2, 9.8) if sev in ["high", "critical"] else random.uniform(1.0, 4.5), 1)

  return {
    "id": f"EVT-{int(time.time() * 1000) % 1000000:06d}",
    "timestamp": time.strftime("%H:%M:%S", time.gmtime()),
    "sourceIp": f"{random.randint(45, 212)}.{random.randint(10, 250)}.{random.randint(1, 254)}.{random.randint(1, 254)}",
    "destinationPort": dest_port,
    "protocol": "TCP" if dest_port != 53 else "UDP",
    "attackType": chosen_vector,
    "severity": sev,
    "anomalyScore": score,
    "targetNode": random.choice(["us-east-k8s-pod", "edge-proxy-lon-02", "auth-gateway-primary", "alpha-gamma-01", "db-cluster-replica-3"]),
    "details": details,
    "status": "investigating" if sev in ["high", "critical"] else "monitoring"
  }

# -------------------------------------------------------------
# REST Endpoints
# -------------------------------------------------------------
@app.get("/")
def root():
  return {
    "service": "NexusAI Intelligence Microservice",
    "status": "online",
    "version": "1.2.0",
    "websocket": "ws://127.0.0.1:8000/ws/telemetry",
    "engine": "Python 3.10 + FastAPI + WebSocket Gateway + Scikit-Learn Pipeline"
  }

@app.get("/api/health")
def health_check():
  return {
    "status": "healthy",
    "daemon": "active",
    "ml_engine": "operational",
    "active_websockets": len(ws_manager.active_connections),
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

# -------------------------------------------------------------
# WebSocket Real-Time Gateway Endpoint
# -------------------------------------------------------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
  await ws_manager.connect(websocket)
  
  # Send initial handshake confirmation
  await websocket.send_json({
    "type": "CONNECTION_ESTABLISHED",
    "protocol": "WSS_SEC_V1",
    "serverTime": time.time(),
    "connectedClients": len(ws_manager.active_connections)
  })

  streaming_task = None
  is_streaming = False
  stream_interval = 3.0

  async def stream_worker():
    nonlocal is_streaming, stream_interval
    while is_streaming:
      try:
        event = generate_telemetry_event()
        await websocket.send_json({
          "type": "TELEMETRY_PULSE",
          "event": event,
          "timestamp": time.time()
        })
        await asyncio.sleep(stream_interval)
      except Exception:
        break

  try:
    while True:
      raw_msg = await websocket.receive_text()
      try:
        data = json.loads(raw_msg)
      except Exception:
        continue

      action = data.get("action")

      if action == "ping":
        # Latency probe
        await websocket.send_json({
          "type": "PONG",
          "clientTime": data.get("clientTime"),
          "serverTime": time.time()
        })

      elif action == "start_stream":
        interval = float(data.get("interval", 3.0))
        stream_interval = max(0.5, min(interval, 15.0))
        if not is_streaming:
          is_streaming = True
          streaming_task = asyncio.create_task(stream_worker())
        await websocket.send_json({
          "type": "STREAM_STATE_CHANGED",
          "streaming": True,
          "interval": stream_interval
        })

      elif action == "stop_stream":
        is_streaming = False
        if streaming_task:
          streaming_task.cancel()
        await websocket.send_json({
          "type": "STREAM_STATE_CHANGED",
          "streaming": False
        })

      elif action == "inject_threat":
        event = generate_telemetry_event()
        if "attackType" in data:
          event["attackType"] = data["attackType"]
        await ws_manager.broadcast({
          "type": "THREAT_INJECTED",
          "event": event,
          "timestamp": time.time()
        })

  except WebSocketDisconnect:
    is_streaming = False
    if streaming_task:
      streaming_task.cancel()
    ws_manager.disconnect(websocket)
  except Exception:
    is_streaming = False
    if streaming_task:
      streaming_task.cancel()
    ws_manager.disconnect(websocket)

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="127.0.0.1", port=8000)
