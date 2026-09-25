import { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Layers, 
  GitBranch,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { 
  INITIAL_SECURITY_EVENTS, 
  INITIAL_TIMESERIES_DATA,
  calculateSystemMetrics, 
  generateSyntheticSecurityEvent,
  getThreatDistribution
} from './services/telemetryEngine';
import { SecurityEvent, TimeSeriesDataPoint } from './types/telemetry';
import { MetricCards } from './components/MetricCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { LiveEventFeed } from './components/LiveEventFeed';

export default function App() {
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_EVENTS);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>(INITIAL_TIMESERIES_DATA);

  const metrics = calculateSystemMetrics(events);
  const distribution = getThreatDistribution(events);

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handler for simulating real-time attack event
  const handleSimulateAttack = () => {
    const newEvent = generateSyntheticSecurityEvent();
    setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep latest 20 events

    // Dynamically update the latest point on the time-series chart
    const nowTime = new Date().toTimeString().substring(0, 5);
    setTimeSeries(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        time: nowTime,
        threatActivity: Math.min(100, updated[lastIndex].threatActivity + Math.floor(Math.random() * 12 + 5)),
        anomalyScore: parseFloat(Math.min(10, updated[lastIndex].anomalyScore + (newEvent.anomalyScore > 6 ? 0.8 : 0.2)).toFixed(1)),
        isSpike: newEvent.anomalyScore > 7
      };
      return updated;
    });
  };

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
                v0.3.0 Visuals Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Threat &amp; Anomaly Intelligence</p>
          </div>
        </div>

        {/* Live System Indicators */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border">
            <Radio className="w-3.5 h-3.5 text-accent-emerald animate-pulse" />
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-accent-emerald font-semibold">ONLINE</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border">
            <span className="text-slate-400">SYS_TIME:</span>
            <span className="text-accent-cyan">{systemTime}</span>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
            <button className="relative p-2 rounded-lg bg-surface-card border border-surface-border hover:border-slate-500 text-slate-300">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              AR
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200">Atik Rahman</p>
              <p className="text-[10px] text-accent-emerald">SecOps Commander</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Real-time KPI Metric Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Overview Dashboard</h2>
              <p className="text-xs text-slate-400">Autonomous telemetry feed &amp; threat assessment</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
              <span>Real-Time Stream Active</span>
            </div>
          </div>

          <MetricCards metrics={metrics} />
        </section>

        {/* Real-time Data Analytics Charts */}
        <section>
          <AnalyticsCharts timeSeriesData={timeSeries} distributionData={distribution} />
        </section>

        {/* Live Security Event Stream Feed */}
        <section>
          <LiveEventFeed events={events} onTriggerSimulation={handleSimulateAttack} />
        </section>

        {/* Architecture & Milestone Progress */}
        <section className="space-y-4 pt-4 border-t border-surface-border/60">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Roadmap Status &amp; Execution Pipeline
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-accent-cyan">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Milestone 3 Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span>Step 1: Core Shell</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Vite, React, TypeScript, Tailwind and dark design architecture.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span>Step 2: Threat Metrics</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Real-time telemetry engine, 4 KPI cards &amp; interactive attack simulator.</p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5">
              <div className="flex items-center justify-between text-indigo-400 font-semibold mb-1">
                <span>Step 3: ML Analytics Charts</span>
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-slate-400 text-[11px]">Time-series anomaly chart &amp; attack severity distribution graphs.</p>
            </div>

            <div className="p-4 rounded-xl border border-surface-border bg-surface-card/60 opacity-80">
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Step 4: ML Anomaly Detector</span>
                <span className="text-[10px] text-accent-amber font-mono">NEXT UP</span>
              </div>
              <p className="text-slate-400 text-[11px]">Statistical Z-score &amp; IQR outlier detection scoring engine.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-4 px-6 text-center text-xs text-slate-500 font-mono">
        NexusAI &bull; Autonomous Cybersecurity &amp; ML Threat Intelligence Platform &bull; Built by Atik Rahman
      </footer>
    </div>
  );
}
