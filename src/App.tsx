import { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Layers, 
  GitBranch,
  CheckCircle2,
  Bell,
  UploadCloud,
  FileText,
  Flame,
  CloudLightning,
  Terminal as TerminalIcon,
  Database,
  Server,
  Zap,
  BellRing,
  Bug,
  UserCheck,
  ShieldCheck,
  Crosshair
} from 'lucide-react';
import { 
  INITIAL_SECURITY_EVENTS, 
  INITIAL_TIMESERIES_DATA,
  calculateSystemMetrics, 
  generateSyntheticSecurityEvent,
  getThreatDistribution
} from './services/telemetryEngine';
import { checkBackendHealth, BackendHealthStatus } from './services/apiBridge';
import { SecurityEvent, TimeSeriesDataPoint, IncidentStatus } from './types/telemetry';
import { ServerNode } from './types/serverFleet';
import { loadServerFleet, saveServerFleet } from './services/serverFleetEngine';
import { MetricCards } from './components/MetricCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { GlobalThreatMap } from './components/GlobalThreatMap';
import { AnomalyInspector } from './components/AnomalyInspector';
import { LiveEventFeed } from './components/LiveEventFeed';
import { AiCopilotSidebar } from './components/AiCopilotSidebar';
import { FirewallPolicyGenerator } from './components/FirewallPolicyGenerator';
import { ForensicTable } from './components/ForensicTable';
import { LogIngestionModal } from './components/LogIngestionModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { SimulationLabModal } from './components/SimulationLabModal';
import { LiveStreamControllerModal } from './components/LiveStreamControllerModal';
import { ThreatIntelHubModal } from './components/ThreatIntelHubModal';
import { ServerFleetModal } from './components/ServerFleetModal';
import { SoarPlaybookModal } from './components/SoarPlaybookModal';
import { AlertWebhookModal } from './components/AlertWebhookModal';
import { VulnerabilityScannerModal } from './components/VulnerabilityScannerModal';
import { UserProfile, AuditLogEntry } from './types/rbacAudit';
import { loadActiveUser, saveActiveUser, loadAuditLogs, saveAuditLogs } from './services/rbacAuditEngine';
import { RbacAuditModal } from './components/RbacAuditModal';
import { PostureFinding } from './types/cspm';
import { loadCspmFindings, saveCspmFindings } from './services/cspmEngine';
import { CspmModal } from './components/CspmModal';
import { AttackerAttribution, HoneypotSensor } from './types/threatHunt';
import { loadAttackers, saveAttackers, loadHoneypots, saveHoneypots } from './services/threatHuntEngine';
import { ThreatHuntModal } from './components/ThreatHuntModal';
import { telemetryGateway, StreamMetrics } from './services/websocketService';

export default function App() {
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  
  // Persistent telemetry state from localStorage
  const [events, setEvents] = useState<SecurityEvent[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_secops_events');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SECURITY_EVENTS;
  });

  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>(INITIAL_TIMESERIES_DATA);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimLabOpen, setIsSimLabOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isThreatIntelOpen, setIsThreatIntelOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [fleetNodes, setFleetNodes] = useState<ServerNode[]>(loadServerFleet);
  const [isSoarModalOpen, setIsSoarModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isVulnModalOpen, setIsVulnModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserProfile>(loadActiveUser);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(loadAuditLogs);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);
  const [cspmFindings, setCspmFindings] = useState<PostureFinding[]>(loadCspmFindings);
  const [isCspmModalOpen, setIsCspmModalOpen] = useState(false);
  const [attackers, setAttackers] = useState<AttackerAttribution[]>(loadAttackers);
  const [honeypots, setHoneypots] = useState<HoneypotSensor[]>(loadHoneypots);
  const [isThreatHuntOpen, setIsThreatHuntOpen] = useState(false);
  
  const [streamMetrics, setStreamMetrics] = useState<StreamMetrics>(telemetryGateway.getMetrics());

  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus>({
    connected: false,
    status: 'standby',
    engine: 'In-Browser ML Runtime'
  });

  const metrics = calculateSystemMetrics(events);
  const distribution = getThreatDistribution(events);

  // Sync events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexus_secops_events', JSON.stringify(events));
    } catch {
      // Storage quota or error
    }
  }, [events]);

  // Live real-time clock, backend probe & WebSocket gateway telemetry subscription
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);

    const probeBackend = async () => {
      const health = await checkBackendHealth();
      setBackendHealth(health);
    };

    probeBackend();
    const healthInterval = setInterval(probeBackend, 10000);

    // Subscribe to real-time WebSocket / Gateway telemetry stream
    const unsubEvents = telemetryGateway.subscribeEvents((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 29)]);

      const nowTime = new Date().toTimeString().substring(0, 5);
      setTimeSeries((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          time: nowTime,
          threatActivity: Math.min(100, updated[lastIndex].threatActivity + (newEvent.severity === 'critical' ? 8 : 2)),
          anomalyScore: parseFloat(Math.min(10, Math.max(updated[lastIndex].anomalyScore, newEvent.anomalyScore)).toFixed(1)),
          isSpike: newEvent.anomalyScore > 7.0
        };
        return updated;
      });
    });

    const unsubStatus = telemetryGateway.subscribeStatus((newMetrics) => {
      setStreamMetrics(newMetrics);
    });

    return () => {
      clearInterval(timer);
      clearInterval(healthInterval);
      unsubEvents();
      unsubStatus();
    };
  }, []);

  // Handler for simulating real-time attack event
  const handleSimulateAttack = () => {
    const newEvent = generateSyntheticSecurityEvent();
    setEvents(prev => [newEvent, ...prev.slice(0, 24)]); // Keep latest 25 events

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

  // Handler for custom log ingestion batch
  const handleIngestEvents = (newEvents: SecurityEvent[]) => {
    setEvents(prev => [...newEvents, ...prev.slice(0, Math.max(10, 30 - newEvents.length))]);

    const maxAnomaly = Math.max(...newEvents.map(e => e.anomalyScore), 1.0);
    const nowTime = new Date().toTimeString().substring(0, 5);
    setTimeSeries(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        time: nowTime,
        threatActivity: Math.min(100, updated[lastIndex].threatActivity + newEvents.length * 4),
        anomalyScore: parseFloat(Math.min(10, maxAnomaly).toFixed(1)),
        isSpike: maxAnomaly > 7.0
      };
      return updated;
    });
  };

  // Handler for campaign injection from Chaos Lab
  const handleInjectCampaign = (campaignEvents: SecurityEvent[]) => {
    setEvents(prev => [...campaignEvents, ...prev.slice(0, Math.max(10, 35 - campaignEvents.length))]);

    const nowTime = new Date().toTimeString().substring(0, 5);
    setTimeSeries(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        time: nowTime,
        threatActivity: 92,
        anomalyScore: 9.4,
        isSpike: true
      };
      return updated;
    });
  };

  // Reset baseline telemetry
  const handleResetBaseline = () => {
    setEvents(INITIAL_SECURITY_EVENTS);
    setTimeSeries(INITIAL_TIMESERIES_DATA);
    localStorage.removeItem('nexus_secops_events');
  };

  // Handler for AI Copilot threat mitigation execution
  const handleMitigateThreat = (target: string) => {
    setEvents(prev =>
      prev.map(event => {
        if (event.targetNode.includes(target) || event.sourceIp.includes(target) || event.id.includes(target)) {
          return {
            ...event,
            status: 'mitigated',
            anomalyScore: Math.max(1.0, parseFloat((event.anomalyScore * 0.4).toFixed(1))),
            details: `[CONTAINED BY AI COPILOT] ${event.details}`
          };
        }
        return event;
      })
    );
  };

  // Handler for manual status changes in the forensic table
  const handleUpdateEventStatus = (eventId: string, newStatus: IncidentStatus) => {
    setEvents(prev =>
      prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e)
    );
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-surface-border bg-surface/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center shadow-glow-primary">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                NEXUS AI
              </span>
              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/15 text-primary-light border border-primary/30 tracking-wider">
                v1.2.0 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight">Threat &amp; Anomaly Intelligence Platform</p>
          </div>
        </div>

        {/* Live System Indicators */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Backend Status Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border font-medium">
            <TerminalIcon className={`w-3.5 h-3.5 ${backendHealth.connected ? 'text-accent-emerald' : 'text-accent-cyan'}`} />
            <span className="text-slate-400">Engine:</span>
            <span className={`font-semibold ${backendHealth.connected ? 'text-accent-emerald' : 'text-accent-cyan'}`}>
              {backendHealth.connected ? 'Python FastAPI' : 'Hybrid ML Ready'}
            </span>
          </div>

          {/* Interactive WebSocket Telemetry Gateway Badge */}
          <button
            onClick={() => setIsStreamModalOpen(true)}
            className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-primary/50 text-slate-200 transition-all font-medium active:scale-95 shadow-sm"
            title="Configure Real-Time WebSocket Gateway"
          >
            <Radio className={`w-3.5 h-3.5 ${streamMetrics.isStreaming ? 'text-accent-emerald animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-400">Stream:</span>
            <span className={`font-semibold ${streamMetrics.mode === 'WEBSOCKET' ? 'text-accent-emerald' : 'text-accent-cyan'}`}>
              {streamMetrics.mode === 'WEBSOCKET' ? `WSS (${streamMetrics.latencyMs}ms)` : `Bus (${streamMetrics.latencyMs}ms)`}
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border font-medium">
            <span className="text-slate-400">Time:</span>
            <span className="text-accent-cyan font-semibold font-mono">{systemTime}</span>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
            <button className="relative p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose animate-ping" />
            </button>
            <button
              onClick={() => setIsRbacModalOpen(true)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-card/70 border border-transparent hover:border-indigo-500/30 transition-all text-left group cursor-pointer"
              title="Switch Persona & View Audit Ledger"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md group-hover:ring-2 group-hover:ring-indigo-400/50 transition-all">
                {activeUser.avatarInitials}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{activeUser.name}</p>
                <p className="text-[10px] text-accent-emerald font-semibold">{activeUser.roleTitle}</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Real-time KPI Metric Cards & Ingestion Action Bar */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Overview Dashboard</h2>
              <p className="text-xs text-slate-400 font-medium">Autonomous threat assessment, real-time ML anomaly detection &amp; telemetry</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsStreamModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-glow-cyan active:scale-95"
              >
                <Radio className="w-4 h-4 text-accent-cyan animate-pulse" />
                <span>Stream Gateway</span>
              </button>

              <button
                onClick={() => setIsSimLabOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600/25 via-rose-600/15 to-transparent border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95"
              >
                <Flame className="w-4 h-4 text-accent-rose" />
                <span>Chaos Lab</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-accent-emerald/40 hover:border-accent-emerald text-accent-emerald hover:text-white text-xs font-bold transition-all shadow-glow-emerald active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>Executive Audit (PDF)</span>
              </button>

              <button
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-glow-primary active:scale-95"
              >
                <UploadCloud className="w-4 h-4 text-accent-cyan" />
                <span>Ingest Raw Logs</span>
              </button>

              <button
                onClick={() => setIsThreatIntelOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-purple-500/40 hover:border-purple-500 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-glow-purple active:scale-95"
              >
                <Database className="w-4 h-4 text-accent-purple" />
                <span>Threat Intel (STIX 2.1)</span>
              </button>

              <button
                onClick={() => setIsFleetModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-glow-cyan active:scale-95"
              >
                <Server className="w-4 h-4 text-accent-cyan" />
                <span>Server Fleet ({fleetNodes.length})</span>
              </button>

              <button
                onClick={() => setIsSoarModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-purple-500/40 hover:border-purple-500 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-glow-purple active:scale-95"
              >
                <Zap className="w-4 h-4 text-accent-purple" />
                <span>SOAR Playbooks</span>
              </button>

              <button
                onClick={() => setIsWebhookModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-glow-primary active:scale-95"
              >
                <BellRing className="w-4 h-4 text-indigo-400" />
                <span>Webhooks &amp; Alerts</span>
              </button>

              <button
                onClick={() => setIsVulnModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95"
              >
                <Bug className="w-4 h-4 text-accent-rose" />
                <span>CVE Scanner</span>
              </button>

              <button
                onClick={() => setIsRbacModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-glow-primary active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Audit &amp; RBAC</span>
              </button>

              <button
                onClick={() => setIsCspmModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-glow-cyan active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                <span>Cloud Posture (CSPM)</span>
              </button>

              <button
                onClick={() => setIsThreatHuntOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600/25 via-rose-600/15 to-transparent border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95"
              >
                <Crosshair className="w-4 h-4 text-accent-rose" />
                <span>Threat Hunter &amp; Decoys</span>
              </button>
            </div>
          </div>

          <MetricCards metrics={metrics} />
        </section>

        {/* Real-time Data Analytics Charts */}
        <section>
          <AnalyticsCharts timeSeriesData={timeSeries} distributionData={distribution} />
        </section>

        {/* Global Threat Geo-Map & Attack Vector Radar */}
        <section>
          <GlobalThreatMap events={events} />
        </section>

        {/* Intelligence Split: ML Inspector & AI Copilot */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AnomalyInspector events={events} />
            <LiveEventFeed events={events} onTriggerSimulation={handleSimulateAttack} />
          </div>

          <div className="lg:col-span-1">
            <AiCopilotSidebar events={events} onMitigateThreat={handleMitigateThreat} />
          </div>
        </section>

        {/* Automated Firewall & WAF Security Policy Compiler */}
        <section>
          <FirewallPolicyGenerator events={events} />
        </section>

        {/* Forensic Deep Packet Investigation & Filterable Audit Table */}
        <section>
          <ForensicTable 
            events={events} 
            onUpdateEventStatus={handleUpdateEventStatus} 
          />
        </section>

        {/* Architecture & Milestone Progress */}
        <section className="space-y-4 pt-4 border-t border-surface-border/60">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Roadmap Status &amp; Execution Pipeline
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-accent-cyan">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Milestone 24 Completed (Threat Hunting &amp; Deception Grid - Attacker Attribution &amp; Honeypots)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span>Core &amp; Metrics</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Vite, React 18, TypeScript, Tailwind, and real-time metric cards.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span>ML &amp; Copilot</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Z-Score outlier inspector and autonomous AI MITRE copilot.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span>Docker &amp; Chaos Lab</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Multi-stage Dockerfiles, SecOps chaos range &amp; localStorage persistence.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <CloudLightning className="w-3.5 h-3.5 text-accent-cyan" />
                  Stream Gateway
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Bi-directional WebSocket streaming, latency probe &amp; reactive gateway controller.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-accent-purple" />
                  STIX 2.1 Intel
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">STIX/TAXII 2.1 IOC feeds, real-time IP reputation &amp; MITRE matrix.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-accent-cyan" />
                  Server Fleet
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Multi-cloud asset registry, live resource metrics &amp; 1-click node isolation.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-accent-purple" />
                  SOAR Playbooks
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Sub-second automated threat containment pipelines &amp; MTTR analytics.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-indigo-400" />
                  Alert Webhooks
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-[11px]">Multi-channel incident escalations (Slack, Discord, Telegram, PagerDuty).</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-accent-rose" />
                  CVE Patch Manager
                </span>
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-slate-400 text-[11px]">Continuous package audits, CVSS v3.1 scoring &amp; 1-click remediation.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  RBAC &amp; Audit Ledger
                </span>
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-slate-400 text-[11px]">SOC 2 cryptographically chained SHA-256 audit ledger &amp; 4 operator personas.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between text-accent-emerald font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                  Cloud Posture (CSPM)
                </span>
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-slate-400 text-[11px]">Multi-cloud CIS v8, PCI-DSS, SOC 2 compliance auditor &amp; 1-click auto-remediation.</p>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 shadow-lg shadow-rose-500/5">
              <div className="flex items-center justify-between text-rose-300 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-accent-rose" />
                  Threat Hunting &amp; Honeypots
                </span>
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-slate-400 text-[11px]">BGP ASN geolocation attribution, decoy canary honeypots &amp; RFC 2142 abuse dispatcher.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Role-Based Access Control & Immutable Cryptographic Audit Ledger Modal */}
      <RbacAuditModal
        isOpen={isRbacModalOpen}
        onClose={() => setIsRbacModalOpen(false)}
        activeUser={activeUser}
        onSelectUser={(u) => {
          setActiveUser(u);
          saveActiveUser(u);
        }}
        auditLogs={auditLogs}
        onUpdateAuditLogs={(logs) => {
          setAuditLogs(logs);
          saveAuditLogs(logs);
        }}
      />

      {/* Cloud Security Posture Management (CSPM) & Multi-Compliance Auditor Modal */}
      <CspmModal
        isOpen={isCspmModalOpen}
        onClose={() => setIsCspmModalOpen(false)}
        findings={cspmFindings}
        onUpdateFindings={(updated) => {
          setCspmFindings(updated);
          saveCspmFindings(updated);
        }}
      />

      {/* Threat Hunting, Target Asset Attribution & Deception Honeypot Grid Modal */}
      <ThreatHuntModal
        isOpen={isThreatHuntOpen}
        onClose={() => setIsThreatHuntOpen(false)}
        attackers={attackers}
        onUpdateAttackers={(updated) => {
          setAttackers(updated);
          saveAttackers(updated);
        }}
        honeypots={honeypots}
        onUpdateHoneypots={(updated) => {
          setHoneypots(updated);
          saveHoneypots(updated);
        }}
      />

      {/* Vulnerability Assessment & CVE Patch Manager Modal */}
      <VulnerabilityScannerModal
        isOpen={isVulnModalOpen}
        onClose={() => setIsVulnModalOpen(false)}
      />

      {/* Real-Time Alert & Webhook Modal */}
      <AlertWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        latestEvent={events[0]}
      />

      {/* SOAR Automated Incident Playbook Orchestrator Modal */}
      <SoarPlaybookModal
        isOpen={isSoarModalOpen}
        onClose={() => setIsSoarModalOpen(false)}
        activeAttackerIp="185.220.101.5"
      />

      {/* Central Server Fleet & Cloud Asset Registry Modal */}
      <ServerFleetModal
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
        events={events}
        fleetNodes={fleetNodes}
        onUpdateFleet={(updated) => {
          setFleetNodes(updated);
          saveServerFleet(updated);
        }}
      />

      {/* STIX/TAXII 2.1 Threat Intelligence Hub Modal */}
      <ThreatIntelHubModal
        isOpen={isThreatIntelOpen}
        onClose={() => setIsThreatIntelOpen(false)}
        events={events}
      />

      {/* Real-Time WebSocket Telemetry Gateway Modal */}
      <LiveStreamControllerModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
      />

      {/* Log Ingestion Modal */}
      <LogIngestionModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onIngestEvents={handleIngestEvents} 
      />

      {/* Executive Threat Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        events={events}
        metrics={metrics}
      />

      {/* Simulation Lab Modal */}
      <SimulationLabModal
        isOpen={isSimLabOpen}
        onClose={() => setIsSimLabOpen(false)}
        onInjectCampaign={handleInjectCampaign}
        onResetBaseline={handleResetBaseline}
      />

      {/* Footer */}
      <footer className="border-t border-surface-border py-4 px-6 text-center text-xs text-slate-400 font-sans">
        NexusAI &bull; Autonomous Cybersecurity &amp; ML Threat Intelligence Platform &bull; Built by Atikur Rahman
      </footer>
    </div>
  );
}
