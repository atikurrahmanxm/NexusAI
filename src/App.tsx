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
  Crosshair,
  Code2,
  Network,
  Globe,
  Key,
  Compass,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  RefreshCw,
  TrendingUp
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
import { SigmaDetectionRule } from './types/detectionRule';
import { loadDetectionRules, saveDetectionRules } from './services/detectionEngine';
import { DetectionStudioModal } from './components/DetectionStudioModal';
import { IncidentCase } from './types/forensicRca';
import { loadIncidentCases, saveIncidentCases } from './services/forensicRcaEngine';
import { ForensicRcaModal } from './components/ForensicRcaModal';
import { EasmAsset, DnsQueryLog } from './types/dnsThreatIntel';
import { loadEasmAssets, saveEasmAssets, loadDnsQueries, saveDnsQueries } from './services/dnsThreatIntelEngine';
import { DnsThreatIntelModal } from './components/DnsThreatIntelModal';
import { ApiEndpoint, ApiSecurityEvent } from './types/apiSecurity';
import { loadApiEndpoints, saveApiEndpoints, loadApiSecurityEvents, saveApiSecurityEvents } from './services/apiSecurityEngine';
import { ApiSecurityModal } from './components/ApiSecurityModal';
import { IdentityUser, AuthSessionEvent } from './types/itdr';
import { loadItdrUsers, saveItdrUsers, loadItdrSessions, saveItdrSessions } from './services/itdrEngine';
import { ItdrModal } from './components/ItdrModal';
import { SbomComponent } from './types/supplyChain';
import { loadSbomComponents, saveSbomComponents } from './services/supplyChainEngine';
import { SupplyChainModal } from './components/SupplyChainModal';
import { telemetryGateway, StreamMetrics } from './services/websocketService';

export default function App() {
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().slice(17, 25) + ' UTC');
  
  // Design #5 State Management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'wall' | 'radar' | 'forensics'>('wall');

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
  const [detectionRules, setDetectionRules] = useState<SigmaDetectionRule[]>(loadDetectionRules);
  const [isDetectionStudioOpen, setIsDetectionStudioOpen] = useState(false);
  const [incidentCases, setIncidentCases] = useState<IncidentCase[]>(loadIncidentCases);
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);
  const [easmAssets, setEasmAssets] = useState<EasmAsset[]>(loadEasmAssets);
  const [dnsQueries, setDnsQueries] = useState<DnsQueryLog[]>(loadDnsQueries);
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>(loadApiEndpoints);
  const [apiSecurityEvents, setApiSecurityEvents] = useState<ApiSecurityEvent[]>(loadApiSecurityEvents);
  const [isApiSecurityOpen, setIsApiSecurityOpen] = useState(false);
  const [identityUsers, setIdentityUsers] = useState<IdentityUser[]>(loadItdrUsers);
  const [authSessions, setAuthSessions] = useState<AuthSessionEvent[]>(loadItdrSessions);
  const [isItdrOpen, setIsItdrOpen] = useState(false);
  const [sbomComponents, setSbomComponents] = useState<SbomComponent[]>(loadSbomComponents);
  const [isSbomModalOpen, setIsSbomModalOpen] = useState(false);
  
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
      const now = new Date();
      setSystemTime(now.toLocaleTimeString());
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
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

  // Enterprise Sidebar Categories (Design #5 Architecture)
  const sidebarNavSections = [
    {
      category: 'MONITORING & CORE',
      items: [
        {
          name: 'Command Wall',
          icon: Shield,
          color: 'text-indigo-400',
          badge: 'LIVE',
          onClick: () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveTab('wall');
          }
        },
        {
          name: 'Server Fleet Mesh',
          icon: Server,
          color: 'text-accent-cyan',
          badge: `${fleetNodes.length} Nodes`,
          onClick: () => setIsFleetModalOpen(true)
        },
        {
          name: 'Incident RCA Graph',
          icon: Network,
          color: 'text-accent-rose',
          badge: 'Blast Radius',
          onClick: () => setIsRcaModalOpen(true)
        },
        {
          name: 'Audit & RBAC Ledger',
          icon: UserCheck,
          color: 'text-indigo-400',
          badge: activeUser.roleTitle.slice(0, 10),
          onClick: () => setIsRbacModalOpen(true)
        }
      ]
    },
    {
      category: 'THREAT INTELLIGENCE',
      items: [
        {
          name: 'STIX 2.1 Intel Hub',
          icon: Database,
          color: 'text-accent-purple',
          badge: 'TAXII',
          onClick: () => setIsThreatIntelOpen(true)
        },
        {
          name: 'Threat Hunter & Decoys',
          icon: Crosshair,
          color: 'text-accent-rose',
          badge: 'BGP Decoy',
          onClick: () => setIsThreatHuntOpen(true)
        },
        {
          name: 'Detection Studio',
          icon: Code2,
          color: 'text-accent-purple',
          badge: `${detectionRules.length} Sigma`,
          onClick: () => setIsDetectionStudioOpen(true)
        },
        {
          name: 'EASM & DNS Intel',
          icon: Globe,
          color: 'text-accent-cyan',
          badge: 'H(X) Entropy',
          onClick: () => setIsDnsModalOpen(true)
        }
      ]
    },
    {
      category: 'SECOPS & AUTOMATION',
      items: [
        {
          name: 'SOAR Playbooks',
          icon: Zap,
          color: 'text-accent-purple',
          badge: 'Sub-sec',
          onClick: () => setIsSoarModalOpen(true)
        },
        {
          name: 'Chaos Attack Lab',
          icon: Flame,
          color: 'text-accent-rose',
          badge: 'Range',
          onClick: () => setIsSimLabOpen(true)
        },
        {
          name: 'Stream Gateway',
          icon: Radio,
          color: 'text-accent-cyan',
          badge: streamMetrics.isStreaming ? 'WSS' : 'Bus',
          onClick: () => setIsStreamModalOpen(true)
        },
        {
          name: 'Alert Webhooks',
          icon: BellRing,
          color: 'text-indigo-400',
          badge: 'Escalate',
          onClick: () => setIsWebhookModalOpen(true)
        },
        {
          name: 'Executive Audit (PDF)',
          icon: FileText,
          color: 'text-accent-emerald',
          badge: 'SOC 2',
          onClick: () => setIsReportModalOpen(true)
        },
        {
          name: 'Ingest Raw Logs',
          icon: UploadCloud,
          color: 'text-accent-cyan',
          badge: 'JSON/Syslog',
          onClick: () => setIsLogModalOpen(true)
        }
      ]
    },
    {
      category: 'APPSEC & ZERO TRUST',
      items: [
        {
          name: 'API Security & WAAP',
          icon: Key,
          color: 'text-accent-purple',
          badge: 'OWASP 10',
          onClick: () => setIsApiSecurityOpen(true)
        },
        {
          name: 'ITDR Identity Shield',
          icon: Compass,
          color: 'text-indigo-400',
          badge: 'Travel ML',
          onClick: () => setIsItdrOpen(true)
        },
        {
          name: 'SBOM Supply Chain',
          icon: Package,
          color: 'text-teal-400',
          badge: 'CycloneDX',
          onClick: () => setIsSbomModalOpen(true)
        },
        {
          name: 'CVE Patch Scanner',
          icon: Bug,
          color: 'text-accent-rose',
          badge: 'CVSS v3.1',
          onClick: () => setIsVulnModalOpen(true)
        },
        {
          name: 'Cloud Posture (CSPM)',
          icon: ShieldCheck,
          color: 'text-accent-cyan',
          badge: 'CIS v8',
          onClick: () => setIsCspmModalOpen(true)
        }
      ]
    }
  ];

  // Filtered sidebar items based on quick query
  const filteredSidebarSections = sidebarNavSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !toolSearchQuery || 
      item.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) || 
      item.badge.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      section.category.toLowerCase().includes(toolSearchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  // Flat list of all tools for quick search dropdown
  const allModules = sidebarNavSections.flatMap(section => section.items);
  const searchResults = toolSearchQuery.trim()
    ? allModules.filter(item =>
        item.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(toolSearchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* 1. Top Executive Bloomberg Cyber Ticker Strip */}
      <div className="h-8 bg-[#090E1A] border-b border-surface-border/70 px-4 md:px-6 flex items-center justify-between text-[11px] font-mono select-none overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-5 shrink-0">
          {/* DEFCON Status */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-accent-rose font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-ping" />
            <span>DEFCON 2: ELEVATED</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">THREAT-INDEX:</span>
            <span className="text-white font-bold">{metrics.threatScore * 7.85}</span>
            <span className="text-accent-rose font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 inline mr-0.5" />
              +4.2%
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">ANOMALY ML:</span>
            <span className="text-accent-cyan font-bold">0.8ms (Z-Score 3.2σ)</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">STREAM BUS:</span>
            <span className={streamMetrics.isStreaming ? 'text-accent-emerald font-bold' : 'text-slate-400'}>
              {streamMetrics.mode} ({streamMetrics.framesIngested} frames)
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">ZERO-TRUST:</span>
            <span className="text-accent-emerald font-bold">99.98% HEALTH</span>
          </div>

          <div className="hidden xl:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">OWASP WAAP:</span>
            <span className="text-accent-purple font-bold">0 BYPASS DETECTED</span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-4 text-slate-400">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
            <TerminalIcon className={`w-3 h-3 ${backendHealth.connected ? 'text-accent-emerald' : 'text-accent-cyan'}`} />
            <span className="text-slate-500">ENGINE:</span>
            <span className={`font-semibold ${backendHealth.connected ? 'text-accent-emerald' : 'text-accent-cyan'}`}>
              {backendHealth.connected ? 'FASTAPI' : 'HYBRID ML'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">UTC:</span>
            <span className="text-slate-300 font-mono">{utcTime}</span>
            <span className="text-accent-cyan font-mono font-bold pl-1.5 border-l border-surface-border">
              {systemTime}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Enterprise Command & Navigation Header */}
      <header className="h-16 border-b border-surface-border bg-[#0D1322]/95 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-300 transition-colors"
            title={isSidebarCollapsed ? "Expand Navigation Rail" : "Collapse Navigation Rail"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-accent-cyan" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-accent-cyan flex items-center justify-center shadow-glow-primary">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  NEXUS AI
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-indigo-300 border border-primary/40 tracking-wider">
                  PALANTIR &bull; BLOOMBERG SOC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Autonomous Threat Intelligence</p>
            </div>
          </div>
        </div>

        {/* Palantir Command Center Quick Launch Bar */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xl mx-6 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search 18 modules (e.g., CVE, ITDR, WAAP, STIX, SOAR)..."
              value={toolSearchQuery}
              onChange={(e) => setToolSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
            {toolSearchQuery && (
              <button
                onClick={() => setToolSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
              >
                &times;
              </button>
            )}

            {/* Instant Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D1322] border border-surface-border rounded-xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto space-y-1 font-sans">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 flex items-center justify-between border-b border-surface-border/60 pb-1 mb-1">
                  <span>MATCHING MODULES</span>
                  <span className="text-accent-cyan font-mono">{searchResults.length} FOUND</span>
                </div>
                {searchResults.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        item.onClick();
                        setToolSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-card text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-surface border border-surface-border group-hover:scale-105 transition-transform ${item.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-border text-accent-cyan">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Executive Action Buttons & Persona Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600/30 to-rose-700/20 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95 cursor-pointer"
            title="Inject Synthetic Neural Attack Vector"
          >
            <Flame className="w-3.5 h-3.5 text-accent-rose animate-pulse" />
            <span className="hidden sm:inline">Simulate Attack</span>
          </button>

          <button
            onClick={() => setIsSimLabOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95 cursor-pointer"
            title="Chaos Lab & Adversary Range"
          >
            <Flame className="w-3.5 h-3.5 text-accent-rose" />
            <span>Chaos Lab</span>
          </button>

          <button
            onClick={() => setIsStreamModalOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-cyan-500/40 hover:border-accent-cyan text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-glow-cyan active:scale-95 cursor-pointer"
            title="Real-Time WebSocket Telemetry Gateway"
          >
            <Radio className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
            <span>Gateway</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-emerald-500/40 hover:border-accent-emerald text-accent-emerald hover:text-white text-xs font-bold transition-all shadow-glow-emerald active:scale-95 cursor-pointer"
            title="Export SOC 2 Compliant Executive PDF Audit"
          >
            <FileText className="w-3.5 h-3.5 text-accent-emerald" />
            <span>Executive Audit</span>
          </button>

          {/* Notification Alerts */}
          <button 
            onClick={() => setIsWebhookModalOpen(true)}
            className="relative p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-300 transition-colors"
            title="Active Incident Alerts & Webhooks"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose animate-ping" />
          </button>

          {/* Persona Switcher Pill */}
          <button
            onClick={() => setIsRbacModalOpen(true)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-card border border-surface-border hover:border-indigo-500/40 transition-all text-left group cursor-pointer"
            title="Switch Operator Persona & Review Audit Ledger"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md group-hover:ring-2 group-hover:ring-indigo-400/50 transition-all">
              {activeUser.avatarInitials}
            </div>
            <div className="hidden xl:block text-left pr-2">
              <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors leading-tight">{activeUser.name}</p>
              <p className="text-[10px] text-accent-emerald font-semibold uppercase">{activeUser.roleTitle}</p>
            </div>
          </button>
        </div>
      </header>

      {/* 3. Main Workspace: Enterprise Sidebar + Intelligence Multi-Pane Wall */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Collapsible Enterprise Navigation Rail (Design #5 Palantir Style) */}
        <aside 
          className={`border-r border-surface-border bg-[#0B1020]/95 backdrop-blur-md flex flex-col justify-between shrink-0 transition-all duration-300 z-30 select-none ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Scrollable Navigation Items */}
          <div className="overflow-y-auto flex-1 p-3 space-y-5">
            {/* Quick search input in sidebar if collapsed/expanded */}
            {!isSidebarCollapsed && (
              <div className="px-1 pt-1 pb-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2 flex items-center justify-between">
                  <span>ENTERPRISE NAVIGATOR</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-indigo-400">
                    18 TOOLS
                  </span>
                </div>
              </div>
            )}

            {filteredSidebarSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                    {section.category}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={iIdx}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all group ${
                          isSidebarCollapsed 
                            ? 'justify-center hover:bg-surface-card hover:border-slate-700' 
                            : 'hover:bg-surface-card/80 hover:border-slate-700/60'
                        } border border-transparent`}
                        title={isSidebarCollapsed ? item.name : undefined}
                      >
                        <div className={`p-1.5 rounded-lg bg-surface-card/60 border border-surface-border group-hover:scale-105 transition-transform ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">
                              {item.name}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-border text-slate-400 group-hover:text-slate-200">
                              {item.badge}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer - System Health & Collapse Button */}
          <div className="p-3 border-t border-surface-border bg-surface-card/30">
            {!isSidebarCollapsed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    Fleet Grid
                  </span>
                  <span className="font-mono text-accent-cyan font-bold">{fleetNodes.length} Online</span>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-surface-card border border-surface-border hover:border-slate-600 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  <span>Collapse Rail</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-full flex items-center justify-center p-2 rounded-lg bg-surface-card border border-surface-border hover:border-slate-600 text-slate-400 hover:text-white transition-colors"
                title="Expand Navigation Rail"
              >
                <PanelLeftOpen className="w-4 h-4 text-accent-cyan" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Intelligence Wall (Right Multi-Pane Content) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-[1750px] mx-auto w-full">
          {/* Executive Command Banner & Multi-Pane Tab Selector */}
          <section className="rounded-2xl border border-surface-border bg-gradient-to-r from-surface-card via-surface/90 to-[#0A1020] p-5 shadow-card-subtle flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                  EXECUTIVE MULTI-PANE WALL
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-xs text-accent-emerald font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Zero-Trust Continuous Verification Active
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                Enterprise Cyber Intelligence &amp; Multi-Vector Threat Wall
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Multi-layer real-time telemetry, STIX 2.1 IOC correlation, Haversine travel velocity &amp; sub-second MITRE ATT&CK mitigation
              </p>
            </div>

            {/* Quick Multi-Pane View Switches & Action Hub */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-background border border-surface-border text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('wall')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'wall'
                      ? 'bg-primary text-white shadow-glow-primary'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Multi-Pane
                </button>
                <button
                  onClick={() => setActiveTab('radar')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'radar'
                      ? 'bg-primary text-white shadow-glow-primary'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Geospatial Radar
                </button>
                <button
                  onClick={() => setActiveTab('forensics')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'forensics'
                      ? 'bg-primary text-white shadow-glow-primary'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Deep Forensics
                </button>
              </div>

              <button
                onClick={() => setIsLogModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-glow-primary active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Ingest Logs</span>
              </button>

              <button
                onClick={handleResetBaseline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                title="Reset In-Memory & LocalStorage Telemetry Baseline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Baseline</span>
              </button>
            </div>
          </section>

          {/* High-Density KPI Metric Cards (with Micro-Sparklines) */}
          <section>
            <MetricCards metrics={metrics} />
          </section>

          {/* Conditional Multi-Pane Rendering based on View Tab */}
          {activeTab === 'wall' && (
            <>
              {/* Dual-axis Real-time Analytics Area & Distribution Charts */}
              <section>
                <AnalyticsCharts timeSeriesData={timeSeries} distributionData={distribution} />
              </section>

              {/* Global Threat Geo-Map & Attack Vector Radar */}
              <section>
                <GlobalThreatMap events={events} />
              </section>

              {/* Multi-Pane Split: ML Anomaly Inspector & Live Event Feed + AI Copilot */}
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
            </>
          )}

          {activeTab === 'radar' && (
            <div className="space-y-6">
              <GlobalThreatMap events={events} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AnalyticsCharts timeSeriesData={timeSeries} distributionData={distribution} />
                </div>
                <div className="lg:col-span-1">
                  <AiCopilotSidebar events={events} onMitigateThreat={handleMitigateThreat} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forensics' && (
            <div className="space-y-6">
              <AnomalyInspector events={events} />
              <ForensicTable 
                events={events} 
                onUpdateEventStatus={handleUpdateEventStatus} 
              />
              <FirewallPolicyGenerator events={events} />
            </div>
          )}

          {/* Complete 30-Milestone Accomplishment Wall */}
          <section className="space-y-4 pt-4 border-t border-surface-border/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Enterprise Architecture Pipeline (All 30 Milestones Active &amp; Verified)</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-accent-emerald font-mono">
                <GitBranch className="w-3.5 h-3.5 text-accent-cyan" />
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                <span>100% OPERATIONAL &bull; 0 BUILD ERRORS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span>1. Core &amp; Metrics</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Vite, React 18, TypeScript, Tailwind, and real-time metric cards.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span>2. ML &amp; Copilot</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Z-Score outlier inspector and autonomous AI MITRE copilot.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span>3. Docker &amp; Chaos Lab</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Multi-stage Dockerfiles, SecOps chaos range &amp; localStorage persistence.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <CloudLightning className="w-3.5 h-3.5 text-accent-cyan" />
                    4. Stream Gateway
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Bi-directional WebSocket streaming, latency probe &amp; gateway controller.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-accent-purple" />
                    5. STIX 2.1 Intel
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">STIX/TAXII 2.1 IOC feeds, real-time IP reputation &amp; MITRE matrix.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-accent-cyan" />
                    6. Server Fleet
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Multi-cloud asset registry, live resource metrics &amp; 1-click node isolation.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-accent-purple" />
                    7. SOAR Playbooks
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Sub-second automated threat containment pipelines &amp; MTTR analytics.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-indigo-400" />
                    8. Alert Webhooks
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[11px]">Multi-channel incident escalations (Slack, Discord, Telegram, PagerDuty).</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-accent-rose" />
                    9. CVE Patch Manager
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Continuous package audits, CVSS v3.1 scoring &amp; 1-click remediation.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    10. RBAC &amp; Audit Ledger
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">SOC 2 cryptographically chained SHA-256 audit ledger &amp; 4 operator personas.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                    11. Cloud Posture (CSPM)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Multi-cloud CIS v8, PCI-DSS, SOC 2 compliance auditor &amp; 1-click auto-remediation.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-accent-rose" />
                    12. Threat Hunting &amp; Honeypots
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">BGP ASN geolocation attribution, decoy canary honeypots &amp; abuse dispatcher.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-accent-purple" />
                    13. Sigma Detection Studio
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Multi-SIEM transpiler (Splunk, Elastic, Sentinel) &amp; sub-microsecond matcher.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-accent-rose" />
                    14. Incident RCA Graph
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Attack path reconstruction, blast radius perimeter &amp; SHA-256 evidence vault.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                    15. EASM &amp; DNS Threat Intel
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Subdomain takeover auditor, Shannon entropy ($H(X)$) ML &amp; sinkhole RPZ.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-accent-purple" />
                    16. API Security &amp; WAAP
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Shadow API discovery, JWT signature &amp; BOLA/IDOR inspector, and OpenAPI 3.1 exporter.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between text-accent-emerald font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    17. ITDR &amp; Impossible Travel
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">Haversine geovelocity anomaly detection, MFA push fatigue &amp; session containment.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-500/40 bg-teal-500/10 shadow-lg shadow-teal-500/5">
                <div className="flex items-center justify-between text-teal-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-teal-400" />
                    18. SBOM &amp; Supply Chain (Capstone)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-slate-400 text-[11px]">CycloneDX 1.5 SBOM, Levenshtein typosquatting ML hunter, XZ backdoor sentinel.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 4. All 18 Interactive Modals (100% Maintained & Active) */}
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

      <CspmModal
        isOpen={isCspmModalOpen}
        onClose={() => setIsCspmModalOpen(false)}
        findings={cspmFindings}
        onUpdateFindings={(updated) => {
          setCspmFindings(updated);
          saveCspmFindings(updated);
        }}
      />

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

      <DetectionStudioModal
        isOpen={isDetectionStudioOpen}
        onClose={() => setIsDetectionStudioOpen(false)}
        rules={detectionRules}
        onUpdateRules={(updated) => {
          setDetectionRules(updated);
          saveDetectionRules(updated);
        }}
      />

      <ForensicRcaModal
        isOpen={isRcaModalOpen}
        onClose={() => setIsRcaModalOpen(false)}
        cases={incidentCases}
        onUpdateCases={(updated) => {
          setIncidentCases(updated);
          saveIncidentCases(updated);
        }}
      />

      <DnsThreatIntelModal
        isOpen={isDnsModalOpen}
        onClose={() => setIsDnsModalOpen(false)}
        easmAssets={easmAssets}
        onUpdateEasmAssets={(updated) => {
          setEasmAssets(updated);
          saveEasmAssets(updated);
        }}
        dnsQueries={dnsQueries}
        onUpdateDnsQueries={(updated) => {
          setDnsQueries(updated);
          saveDnsQueries(updated);
        }}
      />

      <ApiSecurityModal
        isOpen={isApiSecurityOpen}
        onClose={() => setIsApiSecurityOpen(false)}
        endpoints={apiEndpoints}
        onUpdateEndpoints={(updated) => {
          setApiEndpoints(updated);
          saveApiEndpoints(updated);
        }}
        securityEvents={apiSecurityEvents}
        onUpdateSecurityEvents={(updated) => {
          setApiSecurityEvents(updated);
          saveApiSecurityEvents(updated);
        }}
      />

      <ItdrModal
        isOpen={isItdrOpen}
        onClose={() => setIsItdrOpen(false)}
        users={identityUsers}
        onUpdateUsers={(updated) => {
          setIdentityUsers(updated);
          saveItdrUsers(updated);
        }}
        sessions={authSessions}
        onUpdateSessions={(updated) => {
          setAuthSessions(updated);
          saveItdrSessions(updated);
        }}
      />

      <SupplyChainModal
        isOpen={isSbomModalOpen}
        onClose={() => setIsSbomModalOpen(false)}
        components={sbomComponents}
        onUpdateComponents={(updated) => {
          setSbomComponents(updated);
          saveSbomComponents(updated);
        }}
      />

      <VulnerabilityScannerModal
        isOpen={isVulnModalOpen}
        onClose={() => setIsVulnModalOpen(false)}
      />

      <AlertWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        latestEvent={events[0]}
      />

      <SoarPlaybookModal
        isOpen={isSoarModalOpen}
        onClose={() => setIsSoarModalOpen(false)}
        activeAttackerIp="185.220.101.5"
      />

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

      <ThreatIntelHubModal
        isOpen={isThreatIntelOpen}
        onClose={() => setIsThreatIntelOpen(false)}
        events={events}
      />

      <LiveStreamControllerModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
      />

      <LogIngestionModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onIngestEvents={handleIngestEvents} 
      />

      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        events={events}
        metrics={metrics}
      />

      <SimulationLabModal
        isOpen={isSimLabOpen}
        onClose={() => setIsSimLabOpen(false)}
        onInjectCampaign={handleInjectCampaign}
        onResetBaseline={handleResetBaseline}
      />

      {/* 5. Enterprise Palantir & Bloomberg SOC Footer */}
      <footer className="border-t border-surface-border/80 bg-[#090E1A] py-3.5 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <span>NexusAI Enterprise Cyber Intelligence Wall &bull; Built by Atikur Rahman</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>SHA-256 AUDIT LEDGER: VERIFIED</span>
          <span>STIX/TAXII 2.1: CONNECTED</span>
          <span>MITRE ATT&CK: 14 TTPs ACTIVE</span>
          <span className="text-slate-400 font-bold">RELEASE 1.2.0</span>
        </div>
      </footer>
    </div>
  );
}
