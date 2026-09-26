import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  X,
  Gauge
} from 'lucide-react';
import { telemetryGateway, StreamMetrics } from '../services/websocketService';

interface LiveStreamControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveStreamControllerModal: React.FC<LiveStreamControllerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [metrics, setMetrics] = useState<StreamMetrics>(telemetryGateway.getMetrics());
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [GATEWAY_INIT] Stream Controller initialized. Listening to telemetry bus.`
  ]);

  useEffect(() => {
    const unsubStatus = telemetryGateway.subscribeStatus((newMetrics) => {
      setMetrics(newMetrics);
    });

    const unsubLogs = telemetryGateway.subscribeLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep latest 50 logs
    });

    return () => {
      unsubStatus();
      unsubLogs();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleStream = () => {
    telemetryGateway.setStreaming(!metrics.isStreaming);
  };

  const handleIntervalChange = (val: number) => {
    telemetryGateway.setInterval(val);
  };

  const handleManualInject = (vector: string) => {
    telemetryGateway.injectThreat(vector);
  };

  const handleReconnect = () => {
    telemetryGateway.connect();
  };

  const isConnectedWs = metrics.status === 'CONNECTED';
  const isSimulation = metrics.status === 'SIMULATION_ACTIVE';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-surface-card border border-surface-border rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col my-6 text-xs">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-surface-border bg-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              isConnectedWs 
                ? 'bg-emerald-500/10 text-accent-emerald border-emerald-500/30 shadow-glow-emerald' 
                : 'bg-cyan-500/10 text-accent-cyan border-cyan-500/30 shadow-glow-cyan'
            }`}>
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white tracking-tight">
                  Real-Time Telemetry Gateway &amp; Stream Controller
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide border ${
                  isConnectedWs 
                    ? 'bg-emerald-500/15 text-accent-emerald border-emerald-500/30' 
                    : isSimulation
                    ? 'bg-cyan-500/15 text-accent-cyan border-cyan-500/30'
                    : 'bg-amber-500/15 text-accent-amber border-amber-500/30'
                }`}>
                  {metrics.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Bi-directional WebSocket streaming (ws://127.0.0.1:8000/ws/telemetry) with reactive client fallback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* 1. Gateway Status KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Mode Card */}
            <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Transport Protocol</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Wifi className="w-4 h-4 text-primary-light" />
                <span>{metrics.mode === 'WEBSOCKET' ? 'FastAPI WSS' : 'Reactive Virtual Bus'}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {metrics.mode === 'WEBSOCKET' ? 'Port 8000 Live' : 'Zero-failure in-browser'}
              </p>
            </div>

            {/* Latency Card */}
            <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Round-Trip Latency</span>
              <div className="flex items-center gap-1.5 font-mono text-base font-bold text-accent-emerald">
                <Gauge className="w-4 h-4" />
                <span>{metrics.latencyMs} ms</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Heartbeat telemetry ping</p>
            </div>

            {/* Ingested Frames Card */}
            <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Transferred Frames</span>
              <div className="font-mono text-base font-bold text-accent-cyan">
                {metrics.framesIngested.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Events parsed on bus</p>
            </div>

            {/* Pipeline Status Card */}
            <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Ingestion Engine</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${metrics.isStreaming ? 'bg-accent-emerald animate-ping' : 'bg-slate-500'}`} />
                <span className={metrics.isStreaming ? 'text-accent-emerald' : 'text-slate-400'}>
                  {metrics.isStreaming ? 'STREAMING' : 'PAUSED'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{metrics.intervalSec}s per telemetry pulse</p>
            </div>
          </div>

          {/* 2. Control Deck: Ingestion Rate & Toggle */}
          <div className="p-4 rounded-xl border border-surface-border bg-surface/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                  Real-Time Streaming Controls
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Adjust packet frequency, pause ingestion, or reconnect to the Python server
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleToggleStream}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                    metrics.isStreaming
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 shadow-glow-emerald'
                  }`}
                >
                  {metrics.isStreaming ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Stream</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReconnect}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-surface-border hover:border-primary text-slate-200 hover:text-white transition-all text-xs font-semibold active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Probe Backend</span>
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="pt-2 border-t border-surface-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
                  Stream Ingestion Frequency:
                </span>
                <span className="font-mono text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {metrics.intervalSec.toFixed(1)} seconds / event
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={metrics.intervalSec}
                onChange={(e) => handleIntervalChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.5s (High Velocity)</span>
                <span>3.0s (Recommended)</span>
                <span>10.0s (Low Noise)</span>
              </div>
            </div>
          </div>

          {/* 3. Instant Manual Threat Dispatch */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2 font-bold">
              Dispatch Instant Threat Pulse (Over Active Stream)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { vector: 'DDoS', label: 'DDoS SYN Flood', color: 'hover:border-accent-purple text-purple-300' },
                { vector: 'SQLi', label: 'SQL Injection', color: 'hover:border-accent-rose text-rose-300' },
                { vector: 'BruteForce', label: 'SSH Credential', color: 'hover:border-accent-amber text-amber-300' },
                { vector: 'Malware', label: 'C2 Beacon', color: 'hover:border-red-500 text-red-300' },
                { vector: 'PortScan', label: 'SYN Recon Scan', color: 'hover:border-accent-cyan text-cyan-300' },
              ].map((btn) => (
                <button
                  key={btn.vector}
                  onClick={() => handleManualInject(btn.vector)}
                  className={`p-2.5 rounded-xl bg-surface border border-surface-border text-center transition-all active:scale-95 text-xs font-semibold ${btn.color} shadow-sm`}
                >
                  <Zap className="w-3.5 h-3.5 mx-auto mb-1 opacity-80" />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Live Gateway Handshake & Pulse Log */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-slate-400">
              <span className="text-[11px] uppercase font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                WebSocket Gateway Telemetry Log
              </span>
              <span className="text-[10px] text-accent-emerald flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Live Handshake Log
              </span>
            </div>

            <div className="rounded-xl border border-surface-border bg-[#070B14] p-3.5 space-y-1 font-mono text-[11px] max-h-36 overflow-y-auto">
              {logs.map((log, index) => (
                <p 
                  key={index}
                  className={
                    log.includes('[WS_CONNECTED]') || log.includes('[WS_READY]')
                      ? 'text-accent-emerald font-semibold'
                      : log.includes('[GATEWAY_INJECT]') || log.includes('THREAT')
                      ? 'text-accent-rose'
                      : log.includes('[WS_STANDBY]') || log.includes('[STREAM_CONFIG]')
                      ? 'text-accent-cyan'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-surface/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-xs font-medium">
            Protocol: <strong className="text-slate-200 font-mono">WSS/TLS RFC-6455</strong> &bull; Client buffer verified
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-glow-primary transition-all active:scale-95"
          >
            Close Controller
          </button>
        </div>
      </div>
    </div>
  );
};
