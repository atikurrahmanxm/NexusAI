import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Play, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Cpu, 
  Globe, 
  Lock, 
  ArrowRight, 
  Terminal, 
  Flame, 
  TrendingUp, 
  Award, 
  Radio
} from 'lucide-react';
import { audioFx } from '../services/audioFxEngine';

interface MissionTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAttack: () => void;
  onSetDefcon: (level: number) => void;
  onOpenModule: (moduleName: string) => void;
}

export const MissionTourModal: React.FC<MissionTourModalProps> = ({
  isOpen,
  onClose,
  onTriggerAttack,
  onSetDefcon,
  onOpenModule
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'scenarios' | 'benchmarks' | 'comparison'>('tour');
  const [activeStep, setActiveStep] = useState(0);
  const [scenarioExecuting, setScenarioExecuting] = useState<string | null>(null);
  const [scenarioOutput, setScenarioOutput] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      audioFx.playSonarPing();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'High-Throughput Telemetry Ingestion',
      category: 'STREAMING INGESTION',
      icon: Radio,
      color: 'text-accent-cyan',
      description: 'Ingests Linux auth.log, Nginx/Apache access streams, RFC 5424 Syslogs, and RFC 6455 WebSockets at up to 48,500 events/second with sub-millisecond parsing.',
      badge: '< 0.8ms Latency',
      highlights: ['Dual-axis live time-series tracking', 'Real-world log scenario presets', 'Bidirectional WebSocket gateway'],
      actionLabel: 'Test Ingest Burst',
      action: () => {
        audioFx.playSonarPing();
        onTriggerAttack();
      }
    },
    {
      step: 2,
      title: 'Parametric Z-Score & ML Outlier Flagging',
      category: 'STATISTICAL ML',
      icon: Activity,
      color: 'text-accent-purple',
      description: 'Applies parametric Z-Score (Z = (X - μ) / σ) and IQR algorithms in real-time. Detects statistical outliers with zero training overhead and user-tunable standard deviation thresholds (1.0σ - 4.0σ).',
      badge: '94.2% Less Noise',
      highlights: ['Automatic baseline recalculation', 'IsolationForest anomaly inference', 'Sub-millisecond mathematical classification'],
      actionLabel: 'Inspect Z-Score Metrics',
      action: () => {
        audioFx.playKeyClick();
        onClose();
      }
    },
    {
      step: 3,
      title: 'Geodetic Threat Radar & Spatial Intercept',
      category: 'SITUATIONAL INTEL',
      icon: Globe,
      color: 'text-accent-rose',
      description: 'Visualizes inbound attack arcs on a dual-mode polar geodetic radar and equirectangular world matrix. Projects ballistic trajectories from adversary subnets straight to protected servers.',
      badge: '360° Azimuth Sweep',
      highlights: ['Polar Azimuthal projection', 'Ballistic missile laser trajectories', 'Acoustic audio telemetry pings'],
      actionLabel: 'View Threat Radar',
      action: () => {
        audioFx.playSonarPing();
        onClose();
      }
    },
    {
      step: 4,
      title: 'AI SecOps Copilot & Autonomous SOAR Containment',
      category: 'AUTONOMOUS DEFENSE',
      icon: Zap,
      color: 'text-accent-emerald',
      description: 'Autonomous incident containment executes sub-second playbooks (1.2s MTTR). Isolates compromised nodes, generates iptables/WAF rules, and dispatches multi-channel webhooks (Slack, Discord, PagerDuty).',
      badge: 'MTTR: 1.2s',
      highlights: ['MITRE ATT&CK Enterprise mapping', '1-Click Zero-Trust node quarantine', 'Autonomous firewall policy compiler'],
      actionLabel: 'Execute Containment Routine',
      action: () => {
        audioFx.playMitigationSuccess();
        onSetDefcon(1);
      }
    },
    {
      step: 5,
      title: 'Cryptographic SHA-256 SOC 2 Audit Ledger',
      category: 'GOVERNANCE & COMPLIANCE',
      icon: Lock,
      color: 'text-indigo-400',
      description: 'Every operator command, policy change, and DEFCON posture switch is signed into an immutable SHA-256 chained ledger with zero-tamper verification and 1-click printable PDF audit dossier export.',
      badge: 'SOC 2 Type II Verified',
      highlights: ['Chained tamper-evident hash integrity', 'Granular 4-tier clearance RBAC', 'Executive whitepaper PDF export'],
      actionLabel: 'Open Audit Ledger',
      action: () => {
        audioFx.playKeyClick();
        onClose();
        onOpenModule('RBAC');
      }
    }
  ];

  const scenarios = [
    {
      id: 'scen-1',
      title: 'Nation-State Supply Chain Poisoning (XZ Backdoor & Typosquats)',
      category: 'SUPPLY CHAIN & SBOM',
      severity: 'CRITICAL',
      cve: 'CVE-2024-3094',
      mitre: 'T1195.002',
      description: 'Adversary injects obfuscated IFUNC hooks into liblzma dependencies alongside Levenshtein typosquatted npm packages.',
      impact: 'Remote code execution (RCE) on SSH daemon pre-auth pipeline.',
      mitigation: 'CycloneDX 1.5 dependency tree traversal, automated pin downgrading, and SHA-512 cryptographic hash checksum mismatch block.',
      command: 'nexus-cli sbom audit --strict --quarantine-typosquats'
    },
    {
      id: 'scen-2',
      title: 'Zero-Day BOLA / IDOR & JWT Algorithm Forgery Exfiltration',
      category: 'API SECURITY & WAAP',
      severity: 'CRITICAL',
      cve: 'CWE-639 / OWASP API1',
      mitre: 'T1078.004',
      description: 'Attacker leverages broken object level authorization to iterate tenant UUIDs while forging JWT header with alg: none.',
      impact: 'Mass exposure of multi-tenant customer PII records and financial balances.',
      mitigation: 'API Security Shield inspects claims, revokes forged bearer tokens, and compiles Cloudflare API Shield mTLS policy.',
      command: 'nexus-cli waap enforce --block-alg-none --isolate-bola'
    },
    {
      id: 'scen-3',
      title: 'Credential Stuffing & Impossible Travel Anomaly',
      category: 'ITDR & IDENTITY',
      severity: 'HIGH',
      cve: 'CWE-307',
      mitre: 'T1110.004',
      description: 'User logs in from Moscow (RU) and 12 minutes later from New York (US). Haversine spherical velocity calculates 37,450 km/h.',
      impact: 'Unauthorized cloud control plane access with compromised DevOps credentials.',
      mitigation: 'Spherical velocity calculation triggers immediate IAM session termination and initiates MFA step-up challenge.',
      command: 'nexus-cli itdr revoke-session --user devops-lead --isolate-ip'
    },
    {
      id: 'scen-4',
      title: 'High-Entropy DGA C2 Botnet & DNS Tunneling Exfiltration',
      category: 'EASM & DNS THREAT INTEL',
      severity: 'HIGH',
      cve: 'CWE-319',
      mitre: 'T1071.004',
      description: 'Compromised node queries pseudo-random domains with Shannon Entropy H(X) = 4.22 carrying Base64 exfiltration chunks.',
      impact: 'Stealthy out-of-band data exfiltration bypassing perimeter deep packet inspection.',
      mitigation: 'Shannon Entropy engine sinkholes domain via BIND9 RPZ and initiates local host network namespace isolation.',
      command: 'nexus-cli dns sinkhole --entropy-threshold 3.85 --export-rpz'
    }
  ];

  const handleLaunchScenario = (scen: typeof scenarios[0]) => {
    setScenarioExecuting(scen.id);
    audioFx.playAlertAlarm();
    setScenarioOutput(`[INITIALIZING] Triggering adversary simulation: ${scen.title}...\n[PAYLOAD INJECTED] Vector: ${scen.category} | MITRE: ${scen.mitre}\n[CALCULATING] Anomaly Score: 9.8 (High Confidence Outlier)\n[DEFCON ENGAGED] DEFCON 1 - Maximum Alert Posture\n[SOAR CONTAINMENT] Automated Playbook Executed: Threat Neutralized in 1.1s\n[AUDIT RECORDED] Block signed into SHA-256 Immutable Ledger.`);

    onTriggerAttack();
    onSetDefcon(1);

    setTimeout(() => {
      setScenarioExecuting(null);
      audioFx.playMitigationSuccess();
    }, 1200);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-[#0B1020] border border-indigo-500/30 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden font-sans border-slate-700/60 shadow-indigo-500/10 flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-border bg-surface-card/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary to-accent-cyan shadow-glow-primary text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>NEXUS AI MISSION SHOWCASE</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    ENTERPRISE SOC TOUR
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Autonomous SecOps Telemetry • Machine Learning Anomaly Detection • Zero-Trust Containment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioFx.playKeyClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-surface transition-colors cursor-pointer"
              title="Close Tour (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-3 border-b border-surface-border bg-[#090E1A] overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('tour');
              audioFx.playKeyClick();
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tour'
                ? 'border-indigo-400 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Lifecycle Tour</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('scenarios');
              audioFx.playKeyClick();
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scenarios'
                ? 'border-rose-400 text-white bg-rose-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-accent-rose" />
            <span>Real-World Attack Scenarios</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">4 Vectors</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('benchmarks');
              audioFx.playKeyClick();
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'benchmarks'
                ? 'border-cyan-400 text-white bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Performance & Benchmarks</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('comparison');
              audioFx.playKeyClick();
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'border-emerald-400 text-white bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-accent-emerald" />
            <span>NexusAI vs Legacy SIEM</span>
          </button>
        </div>

        {/* Tab 1: Interactive Lifecycle Tour */}
        {activeTab === 'tour' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Step Selection Pipeline Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {tourSteps.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => {
                    setActiveStep(idx);
                    audioFx.playKeyClick();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeStep === idx
                      ? 'bg-primary/20 border-primary shadow-glow-primary text-white'
                      : 'bg-surface-card/40 border-surface-border hover:border-slate-600 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface border border-surface-border">
                      STEP {s.step}
                    </span>
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                  <p className="text-xs font-bold truncate mt-1 text-slate-200">{s.title}</p>
                </button>
              ))}
            </div>

            {/* Active Step Showcase Card */}
            {(() => {
              const current = tourSteps[activeStep];
              const Icon = current.icon;
              return (
                <div className="bg-surface-card/50 border border-surface-border rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-surface border border-surface-border ${current.color} shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                            {current.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-surface-border text-accent-cyan">
                            {current.badge}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                          {current.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={current.action}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs shadow-glow-primary hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{current.actionLabel}</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 mt-4 leading-relaxed font-normal">
                    {current.description}
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {current.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface/80 border border-surface-border text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                        <span className="font-medium">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Step Pagination controls */}
                  <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-xs font-mono text-slate-400">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => {
                        setActiveStep(prev => Math.max(0, prev - 1));
                        audioFx.playKeyClick();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ← Previous Stage
                    </button>

                    <span>Step {activeStep + 1} of {tourSteps.length}</span>

                    <button
                      disabled={activeStep === tourSteps.length - 1}
                      onClick={() => {
                        setActiveStep(prev => Math.min(tourSteps.length - 1, prev + 1));
                        audioFx.playKeyClick();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: Real-World Attack Scenarios */}
        {activeTab === 'scenarios' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scenarios.map((scen) => (
                <div 
                  key={scen.id} 
                  className="bg-surface-card/50 border border-surface-border hover:border-slate-600 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        {scen.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                          {scen.severity}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300">
                          {scen.mitre}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                      {scen.title}
                    </h4>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {scen.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-surface/80 border border-surface-border space-y-1.5 text-[11px] mb-4 font-mono">
                      <div className="text-rose-300">
                        <span className="text-slate-500">BLAST RADIUS:</span> {scen.impact}
                      </div>
                      <div className="text-emerald-300">
                        <span className="text-slate-500">AUTONOMOUS FIX:</span> {scen.mitigation}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {scen.cve}
                    </span>
                    <button
                      onClick={() => handleLaunchScenario(scen)}
                      disabled={scenarioExecuting === scen.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs transition-all shadow-glow-rose cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{scenarioExecuting === scen.id ? 'Injecting Vector...' : 'Launch Live Scenario'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {scenarioOutput && (
              <div className="mt-4 p-4 rounded-xl bg-[#070B14] border border-surface-border font-mono text-xs text-slate-300">
                <div className="flex items-center gap-2 text-accent-cyan font-bold mb-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>LIVE THREAT TELEMETRY FEEDBACK</span>
                </div>
                <pre className="whitespace-pre-wrap text-[11px] text-slate-400 font-mono">
                  {scenarioOutput}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Performance & Benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Live KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">STREAM THROUGHPUT</span>
                <p className="text-xl sm:text-2xl font-black text-accent-cyan font-mono mt-1">48,500</p>
                <span className="text-[10px] text-slate-500 font-mono">Events / Second (EPS)</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">DETECTION LATENCY</span>
                <p className="text-xl sm:text-2xl font-black text-accent-emerald font-mono mt-1">0.72 ms</p>
                <span className="text-[10px] text-slate-500 font-mono">In-Memory Sub-ms</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">CONTAINMENT MTTR</span>
                <p className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-1">1.2 s</p>
                <span className="text-[10px] text-slate-500 font-mono">vs 45 min Industry Avg</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">NOISE REDUCTION</span>
                <p className="text-xl sm:text-2xl font-black text-accent-purple font-mono mt-1">-94.2%</p>
                <span className="text-[10px] text-slate-500 font-mono">Z-Score + IsolationForest</span>
              </div>
            </div>

            {/* Benchmark Specifications Grid */}
            <div className="bg-surface-card/40 border border-surface-border rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-cyan" />
                <span>HARDWARE & ARCHITECTURAL EFFICIENCY BENCHMARKS</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-2">
                  <div className="flex justify-between border-b border-surface-border/50 pb-1.5">
                    <span className="text-slate-400">Zero-Allocation Audio:</span>
                    <span className="text-white font-bold">Web Audio Native (0 MP3 assets)</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-border/50 pb-1.5">
                    <span className="text-slate-400">Client Memory Footprint:</span>
                    <span className="text-accent-emerald font-bold">&lt; 28 MB Heap Allocation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cold Start Initialization:</span>
                    <span className="text-accent-cyan font-bold">&lt; 380 ms across modern browsers</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-2">
                  <div className="flex justify-between border-b border-surface-border/50 pb-1.5">
                    <span className="text-slate-400">WebSocket Serialization:</span>
                    <span className="text-white font-bold">RFC 6455 Fast JSON Frames</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-border/50 pb-1.5">
                    <span className="text-slate-400">Audit Proof Hash Rate:</span>
                    <span className="text-accent-emerald font-bold">250,000 SHA-256 blocks/sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Offline Resilience:</span>
                    <span className="text-accent-cyan font-bold">100% In-Browser ML Fallback</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Comparison vs Traditional SIEM */}
        {activeTab === 'comparison' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-surface-border bg-surface text-slate-400 font-mono text-[11px]">
                    <th className="p-3">CAPABILITY</th>
                    <th className="p-3 text-accent-cyan font-bold">NEXUS AI</th>
                    <th className="p-3">SPLUNK ES</th>
                    <th className="p-3">CROWDSTRIKE FALCON</th>
                    <th className="p-3">ELASTIC SECURITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-slate-300">
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Real-Time ML Anomaly Engine</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ Built-in (Z-Score + ML)</td>
                    <td className="p-3 text-amber-400">⚠️ Paid Add-on (MLTK)</td>
                    <td className="p-3 text-amber-400">⚠️ Closed Proprietary</td>
                    <td className="p-3 text-amber-400">⚠️ Complex Config</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Sub-Second SOAR Playbooks</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ Built-in (1.2s MTTR)</td>
                    <td className="p-3 text-amber-400">⚠️ Splunk Phantom ($$$)</td>
                    <td className="p-3 text-amber-400">⚠️ Falcon Fusion</td>
                    <td className="p-3 text-slate-500">❌ Requires Webhook</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Geodetic 3D Threat Radar</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ Polar Azimuthal Radar</td>
                    <td className="p-3 text-slate-500">❌ 2D Static Charts</td>
                    <td className="p-3 text-slate-500">❌ List View Only</td>
                    <td className="p-3 text-slate-500">❌ Basic Map Tile</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Web Audio Telemetry FX</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ Procedural Web Audio</td>
                    <td className="p-3 text-slate-500">❌ None</td>
                    <td className="p-3 text-slate-500">❌ None</td>
                    <td className="p-3 text-slate-500">❌ None</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Offline In-Browser ML Fallback</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ 100% Standalone</td>
                    <td className="p-3 text-slate-500">❌ Cloud Server Only</td>
                    <td className="p-3 text-slate-500">❌ Cloud Server Only</td>
                    <td className="p-3 text-slate-500">❌ Cluster Required</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">CycloneDX 1.5 SBOM Hunter</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ Built-in Typosquat ML</td>
                    <td className="p-3 text-slate-500">❌ Requires Snyk Addon</td>
                    <td className="p-3 text-amber-400">⚠️ Falcon Horizon Only</td>
                    <td className="p-3 text-slate-500">❌ None</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Tamper-Evident SHA-256 Ledger</td>
                    <td className="p-3 text-accent-emerald font-bold">✅ Chained Block Ledger</td>
                    <td className="p-3 text-slate-500">❌ Standard Splunk Logs</td>
                    <td className="p-3 text-amber-400">⚠️ Proprietary Audit</td>
                    <td className="p-3 text-slate-500">❌ Standard Elastic Logs</td>
                  </tr>
                  <tr className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-white">Cost & Licensing</td>
                    <td className="p-3 text-accent-cyan font-bold">🆓 MIT Open Source</td>
                    <td className="p-3 text-rose-400">💸 $2,000+/GB Ingest</td>
                    <td className="p-3 text-rose-400">💸 Enterprise Per-Endpoint</td>
                    <td className="p-3 text-rose-400">💸 Elastic Cloud Pricing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-surface-border bg-surface/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-white font-bold">NEXUS AI LIVE SOVEREIGN COMMAND</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audioFx.playKeyClick();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Exit Tour (ESC)
            </button>
            <button
              onClick={() => {
                audioFx.playSonarPing();
                onTriggerAttack();
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-glow-primary hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Incident</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
