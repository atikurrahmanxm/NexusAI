import { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  Radio, 
  Layers, 
  Sparkles,
  GitBranch,
  Server
} from 'lucide-react';

export default function App() {
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-surface-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center shadow-lg shadow-primary/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                NEXUS AI
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/20 text-indigo-400 border border-primary/30 font-semibold">
                v0.1.0 Alpha
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Threat & Anomaly Intelligence</p>
          </div>
        </div>

        {/* Live System Indicators */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border">
            <Radio className="w-3.5 h-3.5 text-accent-emerald animate-pulse" />
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-accent-emerald font-semibold">ACTIVE</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border">
            <span className="text-slate-400">SYS_TIME:</span>
            <span className="text-accent-cyan">{systemTime}</span>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              OP
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200">Security Analyst</p>
              <p className="text-[10px] text-accent-emerald">SecOps Tier-1</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Initialized &bull; Foundation Layer Operational</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Autonomous Cybersecurity &amp; ML Anomaly Intelligence
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              NexusAI combines real-time network log analytics, statistical machine learning anomaly detection,
              and intelligent threat telemetry into a unified modern SecOps intelligence hub.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg bg-surface border border-surface-border text-slate-300">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Commit Milestone: Step 1 / Initial Core Scaffold</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg bg-surface border border-surface-border text-slate-300">
                <Server className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Architecture: Vite + React 18 + TypeScript + Tailwind</span>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Status Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Core Architecture &amp; Milestone Roadmap
            </h2>
            <span className="text-xs font-mono text-accent-emerald flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> System Healthy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface-card hover:border-primary/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-accent-emerald border border-emerald-500/20 font-medium">
                  READY
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100 mb-1">Threat Monitor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log parsing engine for Apache, Nginx, and SSH/Auth security events.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface-card hover:border-accent-cyan/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-accent-cyan group-hover:bg-cyan-500/20 transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-accent-amber border border-amber-500/20 font-medium">
                  STEP 2 QUEUED
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100 mb-1">Data Visuals &amp; Charts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Time-series threat telemetry, severity breakdown, and live event stream.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface-card hover:border-purple-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-accent-purple group-hover:bg-purple-500/20 transition-colors">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30 font-medium">
                  STEP 3 UPCOMING
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100 mb-1">ML Anomaly Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Statistical Z-Score &amp; Isolation Forest algorithms for outlier detection.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface-card hover:border-emerald-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-accent-emerald group-hover:bg-emerald-500/20 transition-colors">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30 font-medium">
                  STEP 4 UPCOMING
                </span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100 mb-1">AI SecOps Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous threat synthesis, incident mitigation suggestions &amp; reports.
              </p>
            </div>
          </div>
        </section>

        {/* Development Terminal Output preview */}
        <section className="rounded-xl border border-surface-border bg-surface p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-surface-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="font-semibold text-slate-200">nexus-telemetry-daemon</span>
            </div>
            <span className="text-[11px] text-accent-emerald">&bull; Live Pipeline Stream</span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <p className="text-slate-400">
              <span className="text-indigo-400">[SYSTEM_BOOT]</span> NexusAI runtime environment initialized successfully.
            </p>
            <p className="text-slate-400">
              <span className="text-accent-cyan">[ENGINE_LOAD]</span> Loaded TypeScript strict type definitions and cyber telemetry schemas.
            </p>
            <p className="text-slate-400">
              <span className="text-accent-emerald">[STATUS_OK]</span> Repository scaffolded with production-ready Vite + React + Tailwind pipeline.
            </p>
            <p className="text-accent-amber">
              <span className="text-accent-amber">[AWAITING_INPUT]</span> Ready for Update #2: Interactive Cyber Threat Metrics &amp; Live Telemetry Feed.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-4 px-6 text-center text-xs text-slate-500 font-mono">
        NexusAI &bull; Autonomous Cybersecurity &amp; ML Threat Intelligence Platform &bull; 2026
      </footer>
    </div>
  );
}
