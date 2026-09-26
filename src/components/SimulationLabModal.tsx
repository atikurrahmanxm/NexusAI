import React, { useState } from 'react';
import { 
  Flame, 
  X, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Terminal, 
  Sliders, 
  Cpu
} from 'lucide-react';
import { AttackType, SecurityEvent } from '../types/telemetry';
import { runAttackSimulationCampaign, AttackCampaignConfig } from '../services/simulationLab';

interface SimulationLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectCampaign: (newEvents: SecurityEvent[]) => void;
  onResetBaseline: () => void;
}

export const SimulationLabModal: React.FC<SimulationLabModalProps> = ({
  isOpen,
  onClose,
  onInjectCampaign,
  onResetBaseline
}) => {
  const [selectedType, setSelectedType] = useState<AttackType>('DDoS');
  const [selectedNode, setSelectedNode] = useState('us-east-k8s-pod');
  const [selectedRegion, setSelectedRegion] = useState<AttackCampaignConfig['originRegion']>('Eastern Europe');
  const [intensity, setIntensity] = useState<number>(24000);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[STANDBY] Chaos Lab initialized. Select vector parameters and launch synthetic threat campaign.'
  ]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    setIsRunning(true);
    setLogs(['[INITIALIZING] Provisioning distributed attack botnet telemetry...']);

    setTimeout(() => {
      const result = runAttackSimulationCampaign({
        attackType: selectedType,
        targetNode: selectedNode,
        intensityRate: intensity,
        originRegion: selectedRegion
      });

      setLogs(result.consoleLogs);
      onInjectCampaign(result.generatedEvents);
      setIsRunning(false);
    }, 600);
  };

  const vectorTypes: { type: AttackType; label: string; desc: string }[] = [
    { type: 'DDoS', label: 'Volumetric SYN Flood', desc: 'Targeting Layer 4/7 with high packet volume' },
    { type: 'SQLi', label: 'SQL Injection Exploitation', desc: 'Injecting UNION SELECT & boolean payloads' },
    { type: 'BruteForce', label: 'SSH Credential Stuffing', desc: 'Rapid dictionary brute-force against port 22' },
    { type: 'PortScan', label: 'Reconnaissance Port Sweep', desc: 'Scanning exposed subnets for vulnerability' },
    { type: 'Malware', label: 'C2 Encrypted Beaconing', desc: 'Outbound command-and-control communication' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-surface-card border border-surface-border rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col my-6 text-xs">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-surface-border bg-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-accent-rose border border-rose-500/20 shadow-glow-rose">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  SecOps Chaos Lab &amp; Attack Simulator
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-accent-rose border border-rose-500/30 text-[10px] font-bold tracking-wide">
                  ACTIVE RANGE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Simulate targeted adversary campaigns to benchmark real-time ML anomaly detection
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
          {/* 1. Vector Selection Grid */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2 font-bold">
              1. Select Adversary Attack Vector
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {vectorTypes.map((vec) => {
                const isSelected = selectedType === vec.type;
                return (
                  <button
                    key={vec.type}
                    onClick={() => setSelectedType(vec.type)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-glow-rose'
                        : 'bg-surface/50 border-surface-border text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{vec.label}</span>
                      {isSelected && <ShieldAlert className="w-3.5 h-3.5 text-accent-rose" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight font-normal">{vec.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target & Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface/40 border border-surface-border">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1.5 font-bold">
                Target Node / Cluster
              </label>
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="w-full bg-surface border border-surface-border text-slate-200 rounded-lg p-2 focus:outline-none focus:border-primary text-xs"
              >
                <option value="us-east-k8s-pod">us-east-k8s-pod (US East)</option>
                <option value="edge-proxy-lon-02">edge-proxy-lon-02 (London Proxy)</option>
                <option value="auth-gateway-primary">auth-gateway-primary (AP-South)</option>
                <option value="alpha-gamma-01">alpha-gamma-01 (Mesh Gateway)</option>
                <option value="db-cluster-replica-3">db-cluster-replica-3 (EU Database)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1.5 font-bold">
                Simulated Origin Subnet
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="w-full bg-surface border border-surface-border text-slate-200 rounded-lg p-2 focus:outline-none focus:border-primary text-xs"
              >
                <option value="Eastern Europe">Eastern Europe (Botnet Relay)</option>
                <option value="Tor Network">Tor Network (Onion Exit Nodes)</option>
                <option value="Asia Pacific">Asia Pacific (Distributed Scanning Hub)</option>
                <option value="North America">North America (Proxy Subnets)</option>
              </select>
            </div>

            {/* Intensity Slider */}
            <div className="sm:col-span-2 pt-2 border-t border-surface-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
                  Traffic Ingestion Burst Rate
                </span>
                <span className="text-accent-rose font-bold">{intensity.toLocaleString()} req/sec</span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Live Simulation Console */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-slate-400">
              <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Chaos Execution Daemon
              </span>
              <span className="text-[10px] text-accent-emerald flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Live Kernel Hook
              </span>
            </div>

            <div className="rounded-xl border border-surface-border bg-[#070B14] p-3.5 space-y-1 text-[11px] font-mono max-h-36 overflow-y-auto">
              {logs.map((log, index) => (
                <p 
                  key={index}
                  className={
                    log.includes('[ANOMALY]') || log.includes('[FAILURE]') || log.includes('[ML_DETECTION]')
                      ? 'text-accent-rose'
                      : log.includes('[WAF') || log.includes('[AUTO_DEFENSE]')
                      ? 'text-accent-cyan'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-border bg-surface/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onResetBaseline();
              setLogs(['[RESET_COMPLETE] Telemetry restored to pristine baseline state.']);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-slate-400 hover:text-white transition-all text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:bg-surface-card text-slate-400 hover:text-white transition-colors text-xs"
            >
              Close
            </button>

            <button
              disabled={isRunning}
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Executing Campaign...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Threat Campaign</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
