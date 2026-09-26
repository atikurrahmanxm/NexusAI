/**
 * NexusAI - Real-Time Telemetry WebSocket Client & Reactive Gateway
 * Supports bi-directional streaming over ws://127.0.0.1:8000/ws/telemetry
 * with automatic zero-failure fallback to in-browser synthetic generator.
 */

import { SecurityEvent } from '../types/telemetry';
import { generateSyntheticSecurityEvent } from './telemetryEngine';

export type GatewayMode = 'WEBSOCKET' | 'SIMULATION_FALLBACK';
export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'SIMULATION_ACTIVE';

export interface StreamMetrics {
  status: ConnectionStatus;
  mode: GatewayMode;
  latencyMs: number;
  framesIngested: number;
  isStreaming: boolean;
  intervalSec: number;
}

type EventListener = (event: SecurityEvent) => void;
type StatusListener = (metrics: StreamMetrics) => void;
type LogListener = (log: string) => void;

class TelemetryWebSocketService {
  private socket: WebSocket | null = null;
  private wsUrl: string = 'ws://127.0.0.1:8000/ws/telemetry';
  private eventListeners: Set<EventListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private logListeners: Set<LogListener> = new Set();

  private status: ConnectionStatus = 'DISCONNECTED';
  private mode: GatewayMode = 'SIMULATION_FALLBACK';
  private latencyMs: number = 0;
  private framesIngested: number = 0;
  private isStreaming: boolean = true;
  private intervalSec: number = 3.0;

  private pingTimer: any = null;
  private simulationTimer: any = null;
  private reconnectTimer: any = null;
  private lastPingSent: number = 0;

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.status = 'CONNECTING';
    this.emitLog(`[WS_INIT] Initiating secure WebSocket handshake with ${this.wsUrl}...`);
    this.notifyStatus();

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.status = 'CONNECTED';
        this.mode = 'WEBSOCKET';
        this.emitLog(`[WS_CONNECTED] Telemetry stream synchronized via Python FastAPI gateway.`);
        this.stopSimulation();
        this.startPing();

        if (this.isStreaming) {
          this.socket?.send(JSON.stringify({ action: 'start_stream', interval: this.intervalSec }));
        }

        this.notifyStatus();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'CONNECTION_ESTABLISHED') {
            this.emitLog(`[WS_READY] Handshake verified. Connected clients: ${data.connectedClients}`);
          } else if (data.type === 'PONG') {
            const now = Date.now();
            this.latencyMs = Math.max(1, now - (data.clientTime || this.lastPingSent));
            this.notifyStatus();
          } else if (data.type === 'TELEMETRY_PULSE' || data.type === 'THREAT_INJECTED') {
            this.framesIngested++;
            this.emitEvent(data.event);
            this.notifyStatus();
          }
        } catch {
          // Parse error
        }
      };

      this.socket.onerror = () => {
        this.emitLog(`[WS_STANDBY] Python backend socket offline. Seamlessly activating In-Browser Reactive Gateway.`);
        this.fallbackToSimulation();
      };

      this.socket.onclose = () => {
        if (this.status !== 'SIMULATION_ACTIVE') {
          this.status = 'DISCONNECTED';
          this.emitLog(`[WS_CLOSED] Connection closed. Falling back to local high-frequency generator.`);
          this.fallbackToSimulation();
        }
      };
    } catch {
      this.fallbackToSimulation();
    }
  }

  private fallbackToSimulation() {
    this.status = 'SIMULATION_ACTIVE';
    this.mode = 'SIMULATION_FALLBACK';
    this.latencyMs = Math.floor(Math.random() * 4 + 2); // Ultra-fast virtual bus (2-5ms)
    this.notifyStatus();

    if (this.isStreaming) {
      this.startSimulation();
    }

    // Schedule background reconnect retry
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        if (this.mode === 'SIMULATION_FALLBACK') {
          this.connect();
        }
      }, 12000);
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.lastPingSent = Date.now();
        this.socket.send(JSON.stringify({ action: 'ping', clientTime: this.lastPingSent }));
      }
    }, 4000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private startSimulation() {
    this.stopSimulation();
    this.simulationTimer = setInterval(() => {
      if (this.isStreaming) {
        const syntheticEvent = generateSyntheticSecurityEvent();
        this.framesIngested++;
        this.emitEvent(syntheticEvent);
        this.notifyStatus();
      }
    }, this.intervalSec * 1000);
  }

  private stopSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  public setStreaming(enabled: boolean) {
    this.isStreaming = enabled;
    this.emitLog(`[STREAM_CONTROL] Telemetry streaming ${enabled ? 'RESUMED' : 'PAUSED'}.`);

    if (this.mode === 'WEBSOCKET' && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: enabled ? 'start_stream' : 'stop_stream',
        interval: this.intervalSec
      }));
    } else {
      if (enabled) {
        this.startSimulation();
      } else {
        this.stopSimulation();
      }
    }

    this.notifyStatus();
  }

  public setInterval(seconds: number) {
    this.intervalSec = Math.max(0.5, Math.min(seconds, 15.0));
    this.emitLog(`[STREAM_CONFIG] Ingestion window interval set to ${this.intervalSec}s.`);

    if (this.mode === 'WEBSOCKET' && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'start_stream', interval: this.intervalSec }));
    } else if (this.isStreaming) {
      this.startSimulation();
    }

    this.notifyStatus();
  }

  public injectThreat(vectorType?: string) {
    this.emitLog(`[GATEWAY_INJECT] Dispatched instant threat injection frame: ${vectorType || 'Dynamic'}`);

    if (this.mode === 'WEBSOCKET' && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: 'inject_threat',
        attackType: vectorType
      }));
    } else {
      const event = generateSyntheticSecurityEvent();
      if (vectorType) event.attackType = vectorType as any;
      this.framesIngested++;
      this.emitEvent(event);
      this.notifyStatus();
    }
  }

  public subscribeEvents(listener: EventListener) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.getMetrics());
    return () => this.statusListeners.delete(listener);
  }

  public subscribeLogs(listener: LogListener) {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public getMetrics(): StreamMetrics {
    return {
      status: this.status,
      mode: this.mode,
      latencyMs: this.latencyMs,
      framesIngested: this.framesIngested,
      isStreaming: this.isStreaming,
      intervalSec: this.intervalSec
    };
  }

  private emitEvent(event: SecurityEvent) {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch {
        // Listener error safety
      }
    });
  }

  private notifyStatus() {
    const metrics = this.getMetrics();
    this.statusListeners.forEach(listener => {
      try {
        listener(metrics);
      } catch {
        // Listener error safety
      }
    });
  }

  private emitLog(log: string) {
    const timestampedLog = `[${new Date().toLocaleTimeString()}] ${log}`;
    this.logListeners.forEach(listener => {
      try {
        listener(timestampedLog);
      } catch {
        // Listener error safety
      }
    });
  }
}

export const telemetryGateway = new TelemetryWebSocketService();
