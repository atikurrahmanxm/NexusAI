import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  X, 
  Globe, 
  Lock, 
  Layers
} from 'lucide-react';
import { SecurityEvent } from '../types/telemetry';
import { 
  INITIAL_IOC_FEEDS, 
  computeMitreCoverage, 
  lookupIpReputation, 
  exportStixBundle 
} from '../services/threatIntelEngine';
import { IpReputationResult } from '../types/threatIntel';

interface ThreatIntelHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SecurityEvent[];
  initialSearchIp?: string;
  onQuarantineIp?: (ip: string) => void;
}

export const ThreatIntelHubModal: React.FC<ThreatIntelHubModalProps> = ({
  isOpen,
  onClose,
  events,
  initialSearchIp = '185.220.101.5',
  onQuarantineIp
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'mitre' | 'reputation'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [lookupQuery, setLookupQuery] = useState(initialSearchIp);
  const [reputationResult, setReputationResult] = useState<IpReputationResult>(() => 
    lookupIpReputation(initialSearchIp, events)
  );
  const [quarantinedIps, setQuarantinedIps] = useState<string[]>([]);

  if (!isOpen) return null;

  const mitreCoverage = computeMitreCoverage(events);

  const filteredIocs = INITIAL_IOC_FEEDS.filter((ioc) => {
    const matchesSearch = 
      ioc.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ioc.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ioc.mitreTechnique.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ioc.mitreId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = selectedSource === 'all' || ioc.feedSource === selectedSource;
    return matchesSearch && matchesSource;
  });

  const handleSearchIp = () => {
    if (!lookupQuery.trim()) return;
    const res = lookupIpReputation(lookupQuery.trim(), events);
    setReputationResult(res);
  };

  const handleExportStix = () => {
    const jsonStr = exportStixBundle(filteredIocs);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_stix_2.1_bundle_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuarantine = (ip: string) => {
    setQuarantinedIps((prev) => [...prev, ip]);
    if (onQuarantineIp) {
      onQuarantineIp(ip);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-surface-card border border-surface-border rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col my-6 text-xs">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-surface-border bg-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-primary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white tracking-tight">
                  Global Threat Intelligence Hub &amp; STIX/TAXII 2.1
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold text-[10px] tracking-wide border border-indigo-500/30">
                  OASIS STIX 2.1 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Multi-feed IOC correlation, IP reputation analyzer &amp; MITRE ATT&amp;CK Enterprise matrix
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-surface/40 border-b border-surface-border flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('feed')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'feed'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>STIX/TAXII IOC Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('mitre')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'mitre'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>MITRE ATT&amp;CK Matrix Coverage</span>
          </button>

          <button
            onClick={() => setActiveTab('reputation')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-all ${
              activeTab === 'reputation'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>IP Reputation &amp; Abuse Lookup</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* TAB 1: STIX/TAXII 2.1 FEED EXPLORER */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search IOC by indicator, threat actor, or MITRE ID..."
                    className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary font-sans"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="bg-surface-card border border-surface-border text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="all">Feed: All Sources</option>
                    <option value="CISA-KEV">CISA-KEV</option>
                    <option value="AbuseIPDB">AbuseIPDB</option>
                    <option value="AlienVault-OTX">AlienVault-OTX</option>
                    <option value="STIX-TAXII-2.1">STIX-TAXII 2.1</option>
                  </select>

                  <button
                    onClick={handleExportStix}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-surface-border hover:border-primary text-slate-200 hover:text-white transition-all text-xs font-semibold shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Export STIX 2.1 Bundle</span>
                  </button>
                </div>
              </div>

              {/* IOC Table */}
              <div className="overflow-x-auto rounded-xl border border-surface-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/80 text-slate-400 border-b border-surface-border text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Indicator</th>
                      <th className="px-4 py-3">Attributed Actor</th>
                      <th className="px-4 py-3">Feed Source</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">MITRE Technique</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50 text-slate-300">
                    {filteredIocs.map((ioc) => {
                      const isQuarantined = quarantinedIps.includes(ioc.indicator) || ioc.status === 'quarantined';

                      return (
                        <tr key={ioc.id} className="hover:bg-surface/40 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-white block">{ioc.indicator}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Type: {ioc.type.toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-200">
                            {ioc.threatActor}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-surface-border text-indigo-300">
                              {ioc.feedSource}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-accent-cyan">{ioc.confidenceScore}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-accent-purple text-[11px] block">{ioc.mitreId}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{ioc.mitreTechnique}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isQuarantined ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-rose bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                <Lock className="w-3 h-3" /> Quarantined
                              </span>
                            ) : (
                              <button
                                onClick={() => handleQuarantine(ioc.indicator)}
                                className="px-2.5 py-1 rounded-lg bg-surface border border-rose-500/40 text-accent-rose hover:bg-rose-500/10 text-[11px] font-bold transition-all active:scale-95"
                              >
                                Quarantine
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MITRE ATT&CK MATRIX COVERAGE */}
          {activeTab === 'mitre' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <div>
                  <h4 className="font-bold text-sm text-white">MITRE ATT&amp;CK Enterprise Tactics &amp; Observed Vectors</h4>
                  <p className="text-slate-400 text-xs mt-0.5 font-medium">Real-time correlation against telemetry stream</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-rose" />
                    <span>Active Telemetry Hit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <span>Monitored Baseline</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {mitreCoverage.map((tactic) => (
                  <div key={tactic.id} className="rounded-xl border border-surface-border bg-surface/50 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">{tactic.id}</span>
                        <h5 className="font-bold text-xs text-white">{tactic.name}</h5>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {tactic.techniques.filter((t) => t.observedInTelemetry).length} / {tactic.techniques.length} Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tactic.techniques.map((tech) => (
                        <div
                          key={tech.id}
                          className={`p-2.5 rounded-lg border transition-all ${
                            tech.observedInTelemetry
                              ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-sm'
                              : 'bg-surface/40 border-surface-border/50 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-indigo-300">{tech.id}</span>
                            {tech.observedInTelemetry ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-500/20 text-accent-rose border border-rose-500/30">
                                {tech.hits} Hits Ingested
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Zero Hits</span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium mt-1 line-clamp-1">{tech.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: IP REPUTATION & ABUSE LOOKUP */}
          {activeTab === 'reputation' && (
            <div className="space-y-5">
              {/* Lookup Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchIp()}
                    placeholder="Enter IP to lookup reputation (e.g. 185.220.101.5, 45.154.255.89)..."
                    className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <button
                  onClick={handleSearchIp}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-glow-primary active:scale-95 transition-all"
                >
                  Analyze IP
                </button>
              </div>

              {/* Reputation Dossier Card */}
              {reputationResult && (
                <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 p-5 md:p-6 space-y-5 shadow-card-subtle">
                  {/* Top Stats */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-border/60">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-lg font-black text-white">{reputationResult.ip}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                          reputationResult.reputationScore >= 75
                            ? 'bg-rose-500/15 text-accent-rose border-rose-500/30'
                            : reputationResult.reputationScore >= 40
                            ? 'bg-amber-500/15 text-accent-amber border-amber-500/30'
                            : 'bg-emerald-500/15 text-accent-emerald border-emerald-500/30'
                        }`}>
                          {reputationResult.reputationScore >= 75 ? 'HIGH RISK MALICIOUS' : reputationResult.reputationScore >= 40 ? 'SUSPICIOUS' : 'CLEAN / BENIGN'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Autonomous System: <span className="text-slate-200">{reputationResult.asn}</span> &bull; {reputationResult.country} ({reputationResult.countryCode})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Threat Score</span>
                        <span className={`font-mono text-2xl font-black ${
                          reputationResult.reputationScore >= 75 ? 'text-accent-rose' : 'text-accent-cyan'
                        }`}>
                          {reputationResult.reputationScore} / 100
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuarantine(reputationResult.ip)}
                        disabled={quarantinedIps.includes(reputationResult.ip)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs shadow-glow-rose transition-all active:scale-95"
                      >
                        {quarantinedIps.includes(reputationResult.ip) ? 'Quarantined at WAF' : 'Quarantine at Edge'}
                      </button>
                    </div>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Abuse Confidence</span>
                      <p className="font-mono text-base font-bold text-accent-rose mt-1">
                        {reputationResult.abuseConfidencePercentage}%
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Crowdsourced consensus</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tor Exit Node</span>
                      <p className={`font-bold text-sm mt-1 ${reputationResult.isTorExitNode ? 'text-accent-rose' : 'text-emerald-400'}`}>
                        {reputationResult.isTorExitNode ? 'YES (Confirmed)' : 'NO (Direct IP)'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Anonymity proxy check</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Known Botnet Relay</span>
                      <p className={`font-bold text-sm mt-1 ${reputationResult.isKnownBotnet ? 'text-accent-rose' : 'text-emerald-400'}`}>
                        {reputationResult.isKnownBotnet ? 'YES (C2 Active)' : 'NO (Unlisted)'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">C2 infrastructure scan</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-surface-border bg-surface/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Observed Incidents</span>
                      <p className="font-mono text-base font-bold text-accent-cyan mt-1">
                        {reputationResult.associatedIncidents.length} Events
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">In local telemetry state</p>
                    </div>
                  </div>

                  {/* Recommendation Box */}
                  <div className="p-4 rounded-xl border border-surface-border bg-surface/40 space-y-1.5">
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block">
                      Autonomous Defense Advisory
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {reputationResult.recommendedAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-surface/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-xs font-medium">
            Feed Synchronization: <strong className="text-accent-emerald font-semibold">&bull; Online &amp; Auto-Refreshing</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-glow-primary transition-all active:scale-95"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
