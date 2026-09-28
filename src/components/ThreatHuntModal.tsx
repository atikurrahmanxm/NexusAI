import React, { useState } from 'react';
import { 
  Crosshair, 
  Globe, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search, 
  Copy, 
  Check, 
  Ban, 
  Mail, 
  Zap, 
  Radar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  AttackerAttribution, 
  HoneypotSensor 
} from '../types/threatHunt';
import { 
  quarantineAttacker, 
  triggerHoneypot, 
  generateIspAbuseNotice,
  calculateThreatHuntSummary,
  INITIAL_TARGET_ASSETS
} from '../services/threatHuntEngine';

interface ThreatHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  attackers: AttackerAttribution[];
  onUpdateAttackers: (attackers: AttackerAttribution[]) => void;
  honeypots: HoneypotSensor[];
  onUpdateHoneypots: (honeypots: HoneypotSensor[]) => void;
}

export const ThreatHuntModal: React.FC<ThreatHuntModalProps> = ({
  isOpen,
  onClose,
  attackers,
  onUpdateAttackers,
  honeypots,
  onUpdateHoneypots
}) => {
  const [targetAssetFilter, setTargetAssetFilter] = useState<string>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttackerForAbuse, setSelectedAttackerForAbuse] = useState<AttackerAttribution | null>(null);
  const [copiedAbuseId, setCopiedAbuseId] = useState<boolean>(false);
  const [expandedAttackerId, setExpandedAttackerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = calculateThreatHuntSummary(attackers, honeypots, INITIAL_TARGET_ASSETS);

  // Extract unique countries
  const countries = Array.from(new Set(attackers.map(a => a.country)));

  // Filter attackers
  const filteredAttackers = attackers.filter(att => {
    if (targetAssetFilter !== 'ALL' && att.targetDomain !== targetAssetFilter) return false;
    if (countryFilter !== 'ALL' && att.country !== countryFilter) return false;
    if (statusFilter !== 'ALL' && att.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = att.ip.includes(q) ||
                    att.asn.toLowerCase().includes(q) ||
                    att.isp.toLowerCase().includes(q) ||
                    att.city.toLowerCase().includes(q) ||
                    att.country.toLowerCase().includes(q) ||
                    att.attackTechnique.toLowerCase().includes(q) ||
                    att.targetDomain.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleQuarantine = (id: string) => {
    const updated = quarantineAttacker(attackers, id);
    onUpdateAttackers(updated);
  };

  const handleTriggerTestTrap = (id: string) => {
    const updated = triggerHoneypot(honeypots, id);
    onUpdateHoneypots(updated);
  };

  const handleCopyAbuseNotice = (notice: string) => {
    navigator.clipboard.writeText(notice);
    setCopiedAbuseId(true);
    setTimeout(() => setCopiedAbuseId(false), 2000);
  };

  const getFlagEmoji = (code: string) => {
    switch (code) {
      case 'BD': return '🇧🇩';
      case 'NL': return '🇳🇱';
      case 'RU': return '🇷🇺';
      case 'US': return '🇺🇸';
      case 'DE': return '🇩🇪';
      default: return '🌐';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/80 bg-surface-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-accent-rose shadow-glow-rose">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Threat Hunting &amp; Deception Grid</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Target Asset Attribution &amp; Honeypots
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Attacker origin attribution (IP, ASN, ISP, City), targeted asset forensics &amp; decoy honeypot sensor mesh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-border text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Total Attributed Threat Actors</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-white">{summary.totalAttributedAttackers}</span>
                <span className="text-[11px] text-accent-rose font-sans">Active Probes</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Identified via deep packet forensics</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-surface-border/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Armed Honeypot Sensors</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-cyan">{summary.activeHoneypots}</span>
                <span className="text-[11px] text-slate-400 font-sans">Decoys Online</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">SSH, WordPress, AWS &amp; SQL baits</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-purple-500/20 bg-purple-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-purple-300">Total Decoy Traps Fired</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-purple">{summary.honeypotTrapsFired}</span>
                <span className="text-[11px] text-purple-400/80 font-sans">Attackers Trapped</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Automated canary alerts triggered</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300">Quarantined Adversary IPs</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-emerald">{summary.quarantinedIps}</span>
                <span className="text-[11px] text-emerald-400/80 font-sans">Neutralized</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Banned at network boundary</p>
            </div>
          </div>

          {/* Protected Target Assets Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-accent-rose" />
                Target Protected Assets &amp; Threat Vectors
              </h3>
              <span className="text-[11px] text-slate-500">Click an asset to filter targeted attacks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {INITIAL_TARGET_ASSETS.map(asset => {
                const isSelected = targetAssetFilter === asset.domain;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setTargetAssetFilter(isSelected ? 'ALL' : asset.domain)}
                    className={`p-3.5 rounded-xl bg-surface-card border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-rose-500 ring-1 ring-rose-500/50 shadow-glow-rose' 
                        : 'border-surface-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white font-mono truncate">{asset.domain}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        asset.protectionStatus === 'UNDER_ATTACK'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {asset.protectionStatus === 'UNDER_ATTACK' ? 'UNDER ATTACK' : 'ARMORED'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Type: {asset.assetType}</span>
                      <span className="font-mono text-rose-400 font-bold">{asset.activeThreatsCount} Inbound Hits</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Deception Honeypot Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radar className="w-3.5 h-3.5 text-accent-cyan" />
                Active Deception Honeypot Sensor Grid
              </h3>
              <span className="text-[11px] text-slate-500">Live synthetic decoys catching zero-day and botnet scanners</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {honeypots.map(hp => (
                <div key={hp.id} className="p-3.5 rounded-xl bg-surface-card border border-surface-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                        Port {hp.virtualPort}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        hp.status === 'ARMED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/30 animate-pulse'
                      }`}>
                        {hp.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mb-1">{hp.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{hp.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/60">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Trapped: <strong className="text-purple-300">{hp.trappedAttackersCount}</strong>
                    </span>

                    <button
                      onClick={() => handleTriggerTestTrap(hp.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-base hover:bg-purple-500/20 text-purple-300 hover:text-white border border-surface-border text-[10px] font-semibold transition-all active:scale-95 cursor-pointer"
                      title="Simulate an adversary hitting this canary decoy"
                    >
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span>Test Trap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Country Filter */}
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                aria-label="Filter by Country"
                className="bg-surface-card border border-surface-border rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="bg-surface-card border border-surface-border rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE_PROBE">Active Probe</option>
                <option value="INTERCEPTED">Intercepted</option>
                <option value="QUARANTINED">Quarantined</option>
              </select>

              {targetAssetFilter !== 'ALL' && (
                <button
                  onClick={() => setTargetAssetFilter('ALL')}
                  className="text-xs text-cyan-400 hover:underline px-1"
                >
                  Clear asset ({targetAssetFilter})
                </button>
              )}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search IP, ISP, ASN, City, payload..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-surface-card border border-surface-border rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 w-48 sm:w-64"
              />
            </div>
          </div>

          {/* Attacker Attribution Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing {filteredAttackers.length} of {attackers.length} Attributed Threat Actors</span>
              <span className="text-[11px] text-slate-500">Attribution grounded in IP Whois &amp; BGP ASN routing</span>
            </div>

            {filteredAttackers.length === 0 ? (
              <div className="p-8 text-center bg-surface-card rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-10 h-10 text-accent-emerald mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-white">No active threat actors matching current filter</p>
                <p className="text-xs text-slate-400 mt-1">All traffic to selected target assets is currently benign.</p>
              </div>
            ) : (
              filteredAttackers.map(attacker => {
                const isExpanded = expandedAttackerId === attacker.id;

                return (
                  <div
                    key={attacker.id}
                    className={`rounded-xl border transition-all ${
                      attacker.status === 'ACTIVE_PROBE'
                        ? 'border-rose-500/30 bg-surface-card hover:border-rose-500/50'
                        : attacker.status === 'INTERCEPTED'
                        ? 'border-cyan-500/30 bg-surface-card/60'
                        : 'border-emerald-500/30 bg-surface-card/40'
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedAttackerId(isExpanded ? null : attacker.id)}
                      className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-[320px] flex-1">
                        <span className="text-xl" title={attacker.country}>
                          {getFlagEmoji(attacker.countryCode)}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">
                              {attacker.ip}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              {attacker.asn}
                            </span>
                            {attacker.isHoneypotTriggered && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                🪤 HONEYPOT TRIGGERED
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {attacker.city}, {attacker.country} &bull; <span className="text-slate-300 font-medium">{attacker.isp}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Target Domain</span>
                          <span className="text-xs font-mono text-rose-300 font-bold">
                            {attacker.targetDomain}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Status</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            attacker.status === 'ACTIVE_PROBE'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : attacker.status === 'INTERCEPTED'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {attacker.status}
                          </span>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Attacker Drawer */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-surface-border/60 space-y-4 bg-black/20 rounded-b-xl">
                        {/* Deep Attribution Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2 bg-surface-base/80 p-3.5 rounded-xl border border-surface-border">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                              Attacker Geolocation &amp; ISP Routing
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>
                                <span className="text-slate-500 block">Origin Location:</span>
                                <span className="text-slate-200 font-medium">{attacker.city}, {attacker.country}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Coordinates:</span>
                                <span className="font-mono text-cyan-400">{attacker.latitude.toFixed(4)}, {attacker.longitude.toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Internet Provider (ISP):</span>
                                <span className="text-slate-200 font-medium">{attacker.isp}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Reverse DNS Host:</span>
                                <span className="font-mono text-slate-300 text-[10px] truncate block">{attacker.reverseDns}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 bg-surface-base/80 p-3.5 rounded-xl border border-surface-border">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-accent-rose" />
                              Hostile Cyber Technique &amp; Fingerprint
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>
                                <span className="text-slate-500 block">Target Endpoint:</span>
                                <span className="font-mono text-rose-300 font-semibold">{attacker.targetEndpoint}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">MITRE ATT&amp;CK ID:</span>
                                <span className="font-mono text-indigo-400 font-semibold">{attacker.mitreId}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-500 block">Attack Signature:</span>
                                <span className="text-slate-200 font-medium">{attacker.attackTechnique}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-500 block">Client Fingerprint:</span>
                                <span className="font-mono text-[10px] text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded truncate block">
                                  {attacker.userFingerprint}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Counter-Measures Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAttackerForAbuse(attacker)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-accent-cyan" />
                              <span>Draft RFC 2142 ISP Abuse Notice</span>
                            </button>
                          </div>

                          {attacker.status !== 'QUARANTINED' ? (
                            <button
                              onClick={() => handleQuarantine(attacker.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>1-Click Quarantine IP ({attacker.ip})</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-emerald bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>IP Quarantined at Border Router</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RFC 2142 Abuse Notice Preview Modal */}
        {selectedAttackerForAbuse && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-surface-base border border-surface-border rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-accent-cyan" />
                  <h3 className="text-sm font-bold text-white">Automated RFC 2142 ISP Abuse Complaint</h3>
                </div>
                <button
                  onClick={() => setSelectedAttackerForAbuse(null)}
                  className="p-1 rounded-lg hover:bg-surface-border text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-surface-border font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto shadow-inner">
                {generateIspAbuseNotice(selectedAttackerForAbuse)}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">Ready to dispatch to upstream ISP abuse desks &amp; CERT.</span>
                <button
                  onClick={() => handleCopyAbuseNotice(generateIspAbuseNotice(selectedAttackerForAbuse))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-glow-cyan active:scale-95 cursor-pointer"
                >
                  {copiedAbuseId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAbuseId ? 'Copied to Clipboard!' : 'Copy Abuse Notice'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-surface-border bg-surface-card/40 text-xs text-slate-400">
          <span>NexusAI Threat Hunting &amp; Deception Grid &bull; BGP ASN &amp; Canary Sensor Network</span>
          <span className="font-mono text-rose-400">Status: Active Threat Interception</span>
        </div>
      </div>
    </div>
  );
};
