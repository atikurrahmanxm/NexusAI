import React, { useState } from 'react';
import { 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Terminal, 
  Cpu, 
  HardDrive, 
  Wifi, 
  X, 
  AlertTriangle
} from 'lucide-react';
import { ServerNode, CloudProvider, NewServerPayload } from '../types/serverFleet';
import { SecurityEvent } from '../types/telemetry';
import { 
  computeFleetSummary, 
  toggleNodeIsolation, 
  registerNewServer, 
  removeServer, 
  generateAgentInstallScript 
} from '../services/serverFleetEngine';

interface ServerFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SecurityEvent[];
  fleetNodes: ServerNode[];
  onUpdateFleet: (nodes: ServerNode[]) => void;
}

export const ServerFleetModal: React.FC<ServerFleetModalProps> = ({
  isOpen,
  onClose,
  events,
  fleetNodes,
  onUpdateFleet
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [activeInstallNode, setActiveInstallNode] = useState<ServerNode | null>(null);
  const [copiedNodeId, setCopiedNodeId] = useState<string | null>(null);

  // New Server Form State
  const [formName, setFormName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [formProvider, setFormProvider] = useState<CloudProvider>('AWS');
  const [formRegion, setFormRegion] = useState('us-east-1 (N. Virginia)');
  const [formOs, setFormOs] = useState('Ubuntu 22.04 LTS');
  const [formTags, setFormTags] = useState('production, web-frontend');

  if (!isOpen) return null;

  const summary = computeFleetSummary(fleetNodes, events);

  // Targeted nodes by active events
  const activeAttackedNodeNames = new Set(
    events
      .filter(e => e.status === 'flagged' || e.status === 'investigating')
      .map(e => e.targetNode)
  );

  const filteredNodes = fleetNodes.filter(node => {
    const matchesSearch = 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvider = selectedProvider === 'ALL' || node.provider === selectedProvider;

    const isAttacked = activeAttackedNodeNames.has(node.targetNodeKey) || node.status === 'UNDER_ATTACK';
    const computedStatus = node.isIsolated ? 'ISOLATED' : isAttacked ? 'UNDER_ATTACK' : 'ONLINE';
    const matchesStatus = selectedStatus === 'ALL' || computedStatus === selectedStatus;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const handleToggleIsolation = (nodeId: string) => {
    const updated = toggleNodeIsolation(fleetNodes, nodeId);
    onUpdateFleet(updated);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (window.confirm('Are you sure you want to remove this node from the fleet registry?')) {
      const updated = removeServer(fleetNodes, nodeId);
      onUpdateFleet(updated);
    }
  };

  const handleCopyInstallScript = (node: ServerNode) => {
    const script = generateAgentInstallScript(node);
    navigator.clipboard.writeText(script);
    setCopiedNodeId(node.id);
    setTimeout(() => setCopiedNodeId(null), 2500);
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formIp.trim()) return;

    const payload: NewServerPayload = {
      name: formName.trim().toLowerCase().replace(/\s+/g, '-'),
      ipAddress: formIp.trim(),
      provider: formProvider,
      region: formRegion,
      os: formOs,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    const { updatedNodes, newServer } = registerNewServer(fleetNodes, payload);
    onUpdateFleet(updatedNodes);
    setIsAddingServer(false);
    setActiveInstallNode(newServer);

    // Reset Form
    setFormName('');
    setFormIp('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl shadow-cyan-950/20 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 border-b border-surface-border bg-surface-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-accent-cyan shadow-glow-cyan">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  Server Fleet &amp; Cloud Asset Registry
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-accent-cyan border border-cyan-500/30 font-mono">
                  {fleetNodes.length} NODES
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Autonomous node discovery, edge resource utilization &amp; Zero-Trust isolation mesh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingServer(!isAddingServer)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-glow-cyan active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingServer ? 'View Fleet Nodes' : 'Add New Server'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fleet KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 md:px-7 bg-surface-base/80 border-b border-surface-border text-xs">
          <div className="p-3 rounded-xl bg-surface-card/50 border border-surface-border">
            <span className="text-[11px] text-slate-400 font-medium">Total Registered Nodes</span>
            <p className="text-lg font-extrabold text-white mt-0.5">{summary.totalNodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Healthy / Online
            </span>
            <p className="text-lg font-extrabold text-accent-emerald mt-0.5">{summary.onlineNodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/25">
            <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Under Attack
            </span>
            <p className="text-lg font-extrabold text-accent-rose mt-0.5">{summary.underAttackNodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/25">
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Zero-Trust Isolated
            </span>
            <p className="text-lg font-extrabold text-amber-300 mt-0.5">{summary.isolatedNodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" /> Fleet Bandwidth
            </span>
            <p className="text-lg font-extrabold text-indigo-300 font-mono mt-0.5">{summary.totalNetworkMbps} <span className="text-xs font-normal">Mbps</span></p>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:px-7 space-y-6">
          {isAddingServer ? (
            /* Register New Server Form */
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5 animate-fade-in">
              <div className="border-b border-surface-border pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-accent-cyan" />
                  Register New Cloud / On-Prem Server
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add an asset to the cluster fleet registry to monitor telemetry and enforce automated isolation policies.
                </p>
              </div>

              <form onSubmit={handleCreateServer} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Server / Hostname</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. payment-worker-02"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-cyan-500 text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Private / Public IP</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10.0.5.12 or 142.250.190.46"
                      value={formIp}
                      onChange={e => setFormIp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-cyan-500 text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cloud Provider</label>
                    <select
                      value={formProvider}
                      onChange={e => setFormProvider(e.target.value as CloudProvider)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-cyan-500 text-white outline-none"
                    >
                      <option value="AWS">Amazon Web Services (AWS)</option>
                      <option value="GCP">Google Cloud Platform (GCP)</option>
                      <option value="DigitalOcean">DigitalOcean Droplet</option>
                      <option value="Azure">Microsoft Azure</option>
                      <option value="Bare-Metal">Bare-Metal / Dedicated</option>
                      <option value="On-Premise">On-Premise Datacenter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Datacenter Region</label>
                    <input
                      type="text"
                      required
                      value={formRegion}
                      onChange={e => setFormRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-cyan-500 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Operating System</label>
                    <select
                      value={formOs}
                      onChange={e => setFormOs(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-cyan-500 text-white outline-none"
                    >
                      <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS (Jammy)</option>
                      <option value="Debian 12 Bookworm">Debian 12 Bookworm</option>
                      <option value="Amazon Linux 2023">Amazon Linux 2023</option>
                      <option value="Alpine Linux 3.19">Alpine Linux 3.19</option>
                      <option value="Container-Optimized OS">GCP Container-Optimized OS</option>
                      <option value="RHEL 9.3">Red Hat Enterprise Linux 9</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. dmz, microservices, k8s"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-cyan-500 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setIsAddingServer(false)}
                    className="px-4 py-2 rounded-xl bg-surface-base border border-surface-border hover:border-slate-500 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition-all shadow-glow-cyan active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Node &amp; Generate Agent Script</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Fleet Explorer View */
            <>
              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search node name, IP, region, or tags..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-card border border-surface-border focus:border-cyan-500 text-slate-200 placeholder-slate-500 outline-none text-xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-medium">Provider:</span>
                  {(['ALL', 'AWS', 'GCP', 'DigitalOcean', 'Azure', 'Bare-Metal'] as const).map(provider => (
                    <button
                      key={provider}
                      onClick={() => setSelectedProvider(provider)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        selectedProvider === provider
                          ? 'bg-cyan-500/20 text-accent-cyan border border-cyan-500/40 shadow-glow-cyan'
                          : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-medium">Status:</span>
                  {(['ALL', 'ONLINE', 'UNDER_ATTACK', 'ISOLATED'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        selectedStatus === status
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border'
                      }`}
                    >
                      {status === 'ALL' ? 'All Status' : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Server Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredNodes.map(node => {
                  const isAttacked = activeAttackedNodeNames.has(node.targetNodeKey) || node.status === 'UNDER_ATTACK';
                  const isIsolated = node.isIsolated;

                  return (
                    <div
                      key={node.id}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl bg-surface-card border transition-all duration-300 hover:border-slate-500 ${
                        isIsolated
                          ? 'border-amber-500/50 bg-amber-500/5 shadow-glow-amber'
                          : isAttacked
                          ? 'border-rose-500/50 bg-rose-500/5 shadow-glow-rose'
                          : 'border-surface-border hover:shadow-lg'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl border ${
                              isIsolated 
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                                : isAttacked
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                                : 'bg-surface-base border-surface-border text-slate-300'
                            }`}>
                              <Server className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white tracking-tight">{node.name}</h4>
                              <p className="text-[11px] text-slate-400 font-mono">{node.hostname}</p>
                            </div>
                          </div>

                          {/* Status Pill */}
                          {isIsolated ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Lock className="w-3 h-3" />
                              ISOLATED
                            </span>
                          ) : isAttacked ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              UNDER ATTACK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
                              ONLINE
                            </span>
                          )}
                        </div>

                        {/* Node Specs Row */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 my-3">
                          <span className="px-2 py-0.5 rounded-md bg-surface-base border border-surface-border font-semibold text-slate-300">
                            {node.provider}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-surface-base border border-surface-border font-mono text-cyan-300">
                            {node.ipAddress}
                          </span>
                          <span className="text-slate-400 truncate max-w-[140px]" title={node.region}>
                            {node.region}
                          </span>
                        </div>

                        {/* Performance Bars */}
                        <div className="space-y-2.5 my-3.5 text-xs">
                          {/* CPU Bar */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span className="flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load
                              </span>
                              <span className={`font-mono font-bold ${node.cpuUsage > 80 ? 'text-accent-rose' : 'text-slate-200'}`}>
                                {node.cpuUsage}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-base rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  node.cpuUsage > 80 ? 'bg-accent-rose' : node.cpuUsage > 60 ? 'bg-amber-400' : 'bg-accent-cyan'
                                }`}
                                style={{ width: `${Math.min(100, node.cpuUsage)}%` }}
                              />
                            </div>
                          </div>

                          {/* Memory Bar */}
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Memory
                              </span>
                              <span className="font-mono font-bold text-slate-200">{node.memoryUsage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-base rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                                style={{ width: `${Math.min(100, node.memoryUsage)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Throughput & Conns */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-surface-base/80 border border-surface-border font-mono my-3">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Bandwidth</span>
                            <span className="text-cyan-300 font-bold">{node.networkThroughputMbps} Mbps</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Connections</span>
                            <span className="text-slate-200 font-bold">{node.activeConnections.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {node.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-surface-base border border-surface-border text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Bottom Action Bar */}
                      <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => handleToggleIsolation(node.id)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold transition-all text-[11px] ${
                            isIsolated
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-accent-emerald border border-emerald-500/40'
                              : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isIsolated ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Reconnect Node</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Zero-Trust Isolate</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyInstallScript(node)}
                          title="Copy Telemetry Agent Install Command"
                          className="p-2 rounded-xl bg-surface-base border border-surface-border hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
                        >
                          {copiedNodeId === node.id ? (
                            <Check className="w-3.5 h-3.5 text-accent-emerald" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          title="Delete Node from Fleet"
                          className="p-2 rounded-xl bg-surface-base border border-surface-border hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Active Agent Setup Modal / Banner */}
          {activeInstallNode && (
            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 shadow-glow-cyan space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent-cyan" />
                  <h4 className="text-xs font-bold text-white">
                    Agent Setup Command for: <span className="text-cyan-300">{activeInstallNode.name}</span>
                  </h4>
                </div>
                <button
                  onClick={() => setActiveInstallNode(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>

              <div className="relative p-3 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                <pre>{generateAgentInstallScript(activeInstallNode)}</pre>
                <button
                  onClick={() => handleCopyInstallScript(activeInstallNode)}
                  className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border hover:border-cyan-500 text-white text-[11px] font-sans flex items-center gap-1.5 transition-all"
                >
                  {copiedNodeId === activeInstallNode.id ? (
                    <>
                      <Check className="w-3 h-3 text-accent-emerald" />
                      <span className="text-accent-emerald">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Bash Script</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Run this command on your server with root privileges. The node will automatically register its cryptographic certificate and stream bidirectional telemetry via WebSocket.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-7 border-t border-surface-border bg-surface-card/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span>Agent Sync: Real-time RFC-6455 WebSocket Link</span>
          </div>
          <p className="font-mono text-[11px]">NexusAI Fleet Core v2.4.1 &bull; Zero-Trust Mesh Protocol</p>
        </div>
      </div>
    </div>
  );
};
