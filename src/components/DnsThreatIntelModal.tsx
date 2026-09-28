import React, { useState, useMemo } from 'react';
import { 
  X, 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Sliders, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Server, 
  Lock, 
  Unlock, 
  Zap, 
  Cpu
} from 'lucide-react';
import { DnsQueryLog, EasmAsset, EntropyAnalysis } from '../types/dnsThreatIntel';
import { 
  analyzeDomainEntropy, 
  exportRpzZoneFile, 
  exportCoreDnsBlocklist, 
  exportPiHoleBlocklist 
} from '../services/dnsThreatIntelEngine';

interface DnsThreatIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  easmAssets: EasmAsset[];
  onUpdateEasmAssets: (assets: EasmAsset[]) => void;
  dnsQueries: DnsQueryLog[];
  onUpdateDnsQueries: (queries: DnsQueryLog[]) => void;
}

type TabType = 'easm' | 'traffic' | 'sandbox' | 'sinkhole';

export const DnsThreatIntelModal: React.FC<DnsThreatIntelModalProps> = ({
  isOpen,
  onClose,
  easmAssets,
  onUpdateEasmAssets,
  dnsQueries,
  onUpdateDnsQueries
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('easm');
  const [easmFilter, setEasmFilter] = useState<'all' | 'takeover' | 'dev'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Sandbox state
  const [sandboxDomain, setSandboxDomain] = useState('g89f2xkz-m9q.c2-command.ru');
  const [activePreset, setActivePreset] = useState('emotet');

  // Sinkhole exporter format
  const [exportFormat, setExportFormat] = useState<'bind' | 'coredns' | 'pihole'>('bind');

  // Compute sandbox entropy
  const sandboxAnalysis: EntropyAnalysis = useMemo(() => {
    return analyzeDomainEntropy(sandboxDomain);
  }, [sandboxDomain]);

  if (!isOpen) return null;

  // Stats calculation
  const totalSubdomains = easmAssets.length;
  const takeoverVulnerabilities = easmAssets.filter(a => a.takeoverRisk).length;
  const dgaThreats = dnsQueries.filter(q => q.classification === 'dga_malicious' || q.classification === 'tunneling_exfiltration').length;
  const sinkholedCount = dnsQueries.filter(q => q.isSinkholed).length;

  // Filtered EASM assets
  const filteredAssets = easmAssets.filter(asset => {
    const matchesSearch = asset.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.targetValue.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (easmFilter === 'takeover') return asset.takeoverRisk;
    if (easmFilter === 'dev') return asset.status === 'exposed_dev';
    return true;
  });

  // Handle remediation of dangling CNAME
  const handleRemediateAsset = (id: string) => {
    const updated = easmAssets.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'active' as const,
          takeoverRisk: false,
          riskLevel: 'low' as const,
          targetValue: 'lb-primary.nexus-security.io',
          takeoverRemediation: 'Remediated: Dangling CNAME pointer reassigned to active secure enterprise Load Balancer.'
        };
      }
      return a;
    });
    onUpdateEasmAssets(updated);
  };

  // Toggle sinkhole status
  const handleToggleSinkhole = (id: string) => {
    const updated = dnsQueries.map(q => {
      if (q.id === id) {
        return { ...q, isSinkholed: !q.isSinkholed };
      }
      return q;
    });
    onUpdateDnsQueries(updated);
  };

  // Preset domains for sandbox
  const PRESET_DOMAINS = [
    { key: 'emotet', name: 'Emotet DGA', domain: 'g89f2xkz-m9q.c2-command.ru' },
    { key: 'cobalt', name: 'Cobalt Strike', domain: 'vwnpxztr89-beacon.org' },
    { key: 'tunnel', name: 'DNS Tunnel Exfil', domain: 'dXNlcl9jcmVkczpzZWNyZXRwYXNz.tunnel.exfil-nexus.net' },
    { key: 'conficker', name: 'Conficker DGA', domain: 'kq9482z019mnvz.temp-drop.biz' },
    { key: 'legit', name: 'Legit API (Benign)', domain: 'api.nexus-security.io' },
    { key: 'google', name: 'Google Cloud (Benign)', domain: 'storage.googleapis.com' }
  ];

  const handleSelectPreset = (p: typeof PRESET_DOMAINS[0]) => {
    setActivePreset(p.key);
    setSandboxDomain(p.domain);
  };

  // Export policy text generator
  const getExportedPolicy = () => {
    if (exportFormat === 'bind') return exportRpzZoneFile(dnsQueries);
    if (exportFormat === 'coredns') return exportCoreDnsBlocklist(dnsQueries);
    return exportPiHoleBlocklist(dnsQueries);
  };

  const handleCopyCode = (format: string) => {
    navigator.clipboard.writeText(getExportedPolicy());
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadFile = () => {
    const content = getExportedPolicy();
    const ext = exportFormat === 'bind' ? 'zone' : exportFormat === 'coredns' ? 'hosts' : 'txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-dns-sinkhole.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-card border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-surface-ground/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-accent-cyan shadow-glow-cyan">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  External Attack Surface (EASM) &amp; DNS Threat Intel
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-accent-cyan border border-cyan-500/40">
                  ML Entropy Engine H(X)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Subdomain Takeover Auditor, Shannon Randomness Classifier &amp; DNS Tunneling Exfiltration Defense
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3.5 bg-slate-900/60 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-slate-800">
            <Server className="w-4 h-4 text-accent-cyan" />
            <div>
              <div className="text-slate-400 text-[11px]">Discovered Subdomains</div>
              <div className="text-white font-mono font-bold text-sm">{totalSubdomains} Active Assets</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-rose-500/30">
            <ShieldAlert className="w-4 h-4 text-accent-rose animate-bounce" />
            <div>
              <div className="text-rose-400 text-[11px]">Takeover Risks (Dangling)</div>
              <div className="text-accent-rose font-mono font-bold text-sm">{takeoverVulnerabilities} Critical</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-purple-500/30">
            <Radio className="w-4 h-4 text-accent-purple" />
            <div>
              <div className="text-purple-400 text-[11px]">DGA &amp; Tunneling C2s</div>
              <div className="text-accent-purple font-mono font-bold text-sm">{dgaThreats} Flagged Queries</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <div>
              <div className="text-emerald-400 text-[11px]">Active DNS Sinkholes</div>
              <div className="text-accent-emerald font-mono font-bold text-sm">{sinkholedCount} Null-Routed</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('easm')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'easm'
                ? 'border-accent-cyan text-accent-cyan bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Attack Surface Inventory ({easmAssets.length})</span>
            {takeoverVulnerabilities > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {takeoverVulnerabilities}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('traffic')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'traffic'
                ? 'border-accent-purple text-accent-purple bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>DNS Tunnel &amp; DGA Traffic ({dnsQueries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'sandbox'
                ? 'border-accent-rose text-accent-rose bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Shannon Entropy Sandbox H(X)</span>
          </button>

          <button
            onClick={() => setActiveTab('sinkhole')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'sinkhole'
                ? 'border-accent-emerald text-accent-emerald bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>DNS Sinkhole &amp; RPZ Exporter</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: EASM Attack Surface */}
          {activeTab === 'easm' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subdomain or CNAME target..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Filter:</span>
                  <button
                    onClick={() => setEasmFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      easmFilter === 'all'
                        ? 'bg-cyan-500/20 text-accent-cyan border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All Assets
                  </button>
                  <button
                    onClick={() => setEasmFilter('takeover')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      easmFilter === 'takeover'
                        ? 'bg-rose-500/20 text-accent-rose border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Takeover Risk ({easmAssets.filter(a => a.takeoverRisk).length})
                  </button>
                  <button
                    onClick={() => setEasmFilter('dev')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      easmFilter === 'dev'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Exposed Dev ({easmAssets.filter(a => a.status === 'exposed_dev').length})
                  </button>
                </div>
              </div>

              {/* Subdomain Assets Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Subdomain Asset</th>
                      <th className="py-3 px-4">Record Type &amp; Target</th>
                      <th className="py-3 px-4">Open Ports &amp; TLS</th>
                      <th className="py-3 px-4">Risk Status</th>
                      <th className="py-3 px-4 text-right">Action / Remediation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAssets.map((asset) => (
                      <tr 
                        key={asset.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          asset.takeoverRisk ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                            {asset.subdomain}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Discovered: {asset.lastDiscovered}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {asset.recordType}
                            </span>
                            <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]" title={asset.targetValue}>
                              {asset.targetValue}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {asset.openPorts.map(p => (
                              <span key={p} className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                :{p}
                              </span>
                            ))}
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] flex items-center gap-1 ${
                              asset.tlsStatus === 'valid'
                                ? 'bg-emerald-500/10 text-accent-emerald border border-emerald-500/20'
                                : asset.tlsStatus === 'expiring_soon'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-rose-500/10 text-accent-rose border border-rose-500/20'
                            }`}>
                              {asset.tlsStatus === 'valid' ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                              {asset.tlsStatus}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {asset.takeoverRisk ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-accent-rose border border-rose-500/40 animate-pulse">
                              <ShieldAlert className="w-3 h-3" />
                              Dangling CNAME Takeover
                            </span>
                          ) : asset.status === 'exposed_dev' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Exposed Dev Ingress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
                              <ShieldCheck className="w-3 h-3" />
                              Hardened &amp; Secure
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {asset.takeoverRisk ? (
                            <button
                              onClick={() => handleRemediateAsset(asset.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-glow-rose transition-all active:scale-95"
                            >
                              <Zap className="w-3 h-3" />
                              Remediate Takeover
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-medium">Monitored</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Informational banner */}
              <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs text-slate-300 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-accent-cyan">Subdomain Takeover Defense:</span> When cloud resources (e.g. AWS S3, Azure App Services, GitHub Pages) are deleted without purging associated DNS CNAME records, attackers can re-register the cloud asset and take total control over your domain name, executing phishing and stealing session cookies.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DNS Traffic & DGA Tunneling */}
          {activeTab === 'traffic' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Time &amp; Client</th>
                      <th className="py-3 px-4">Queried Domain</th>
                      <th className="py-3 px-4">Type &amp; Length</th>
                      <th className="py-3 px-4">Shannon Entropy H(X)</th>
                      <th className="py-3 px-4">Threat Classification</th>
                      <th className="py-3 px-4 text-right">Sinkhole Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {dnsQueries.map((query) => (
                      <tr 
                        key={query.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          query.classification === 'tunneling_exfiltration' 
                            ? 'bg-purple-950/20' 
                            : query.classification === 'dga_malicious' 
                            ? 'bg-rose-950/20' 
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="text-white text-xs">{query.timestamp}</div>
                          <div className="text-slate-400 text-[10px]">{query.clientIp}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-cyan-300 font-bold text-xs truncate max-w-[280px]" title={query.domain}>
                            {query.domain}
                          </div>
                          {query.payloadDecoded && (
                            <div className="mt-0.5 text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded font-sans inline-block">
                              Exfil Payload: <code className="font-mono font-bold text-white">{query.payloadDecoded}</code>
                            </div>
                          )}
                          {query.malwareFamily && (
                            <div className="text-[10px] text-slate-400 font-sans">
                              Family: <span className="text-slate-200">{query.malwareFamily}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {query.queryType}
                          </span>
                          <span className="ml-2 text-slate-400 text-[11px]">{query.length} chars</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              query.shannonEntropy >= 3.85 
                                ? 'text-accent-rose' 
                                : query.shannonEntropy >= 3.4 
                                ? 'text-amber-400' 
                                : 'text-accent-emerald'
                            }`}>
                              {query.shannonEntropy.toFixed(2)}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  query.shannonEntropy >= 3.85 
                                    ? 'bg-rose-500' 
                                    : query.shannonEntropy >= 3.4 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${Math.min(100, (query.shannonEntropy / 5) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {query.classification === 'tunneling_exfiltration' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-accent-purple border border-purple-500/40">
                              DNS Exfiltration Tunnel
                            </span>
                          ) : query.classification === 'dga_malicious' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-accent-rose border border-rose-500/40">
                              DGA C2 Beacon
                            </span>
                          ) : query.classification === 'dga_suspicious' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Suspicious Entropy
                            </span>
                          ) : query.classification === 'subdomain_takeover' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Takeover Target
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
                              Benign
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleSinkhole(query.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              query.isSinkholed
                                ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                          >
                            {query.isSinkholed ? 'Sinkholed (0.0.0.0)' : 'Allow'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Shannon Entropy ML Sandbox */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              {/* Presets and Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Malware / Benign Domain Preset
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Calculated via <code className="text-accent-cyan">H(X) = -Σ P(x) log₂(P(x))</code>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_DOMAINS.map(p => (
                    <button
                      key={p.key}
                      onClick={() => handleSelectPreset(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activePreset === p.key
                          ? 'bg-rose-500/20 text-accent-rose border border-rose-500/40 shadow-glow-rose'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={sandboxDomain}
                    onChange={(e) => {
                      setSandboxDomain(e.target.value);
                      setActivePreset('custom');
                    }}
                    placeholder="Enter any domain or DNS label to analyze (e.g. g89f2xkz-m9q.c2-command.ru)..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Entropy Results Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Gauge card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Shannon Entropy H(X)</div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`text-4xl font-extrabold font-mono ${
                        sandboxAnalysis.entropy >= 3.85
                          ? 'text-accent-rose'
                          : sandboxAnalysis.entropy >= 3.4
                          ? 'text-amber-400'
                          : 'text-accent-emerald'
                      }`}>
                        {sandboxAnalysis.entropy.toFixed(3)}
                      </span>
                      <span className="text-xs text-slate-400">/ 5.0 max</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          sandboxAnalysis.entropy >= 3.85
                            ? 'bg-rose-500 shadow-glow-rose'
                            : sandboxAnalysis.entropy >= 3.4
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (sandboxAnalysis.entropy / 5) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Benign baseline:</span>
                      <span className="font-mono text-emerald-400">&lt; 3.40</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suspicious boundary:</span>
                      <span className="font-mono text-amber-400">3.40 - 3.84</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Malicious DGA C2:</span>
                      <span className="font-mono text-rose-400">&gt;= 3.85</span>
                    </div>
                  </div>
                </div>

                {/* Lexical Ratios */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Lexical N-Gram Metrics</div>
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Vowel Ratio:</span>
                        <span className="font-mono font-bold text-white">
                          {(sandboxAnalysis.vowelRatio * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Digit Ratio:</span>
                        <span className="font-mono font-bold text-white">
                          {(sandboxAnalysis.digitRatio * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Label Length:</span>
                        <span className="font-mono font-bold text-white">
                          {sandboxAnalysis.length} characters
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    Human languages typically exhibit 35-50% vowel ratio; DGA algorithms generate consonant clusters (&lt;20%).
                  </div>
                </div>

                {/* Classification Verdict */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  sandboxAnalysis.classification === 'dga_malicious'
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : sandboxAnalysis.classification === 'tunneling_exfiltration'
                    ? 'border-purple-500/40 bg-purple-500/10'
                    : sandboxAnalysis.classification === 'dga_suspicious'
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-emerald-500/40 bg-emerald-500/10'
                }`}>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">ML Classification Verdict</div>
                    <div className="mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-sans inline-block ${
                        sandboxAnalysis.classification === 'dga_malicious'
                          ? 'bg-rose-500 text-white'
                          : sandboxAnalysis.classification === 'tunneling_exfiltration'
                          ? 'bg-purple-500 text-white'
                          : sandboxAnalysis.classification === 'dga_suspicious'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {sandboxAnalysis.classification === 'dga_malicious'
                          ? 'MALICIOUS DGA C2'
                          : sandboxAnalysis.classification === 'tunneling_exfiltration'
                          ? 'DNS TUNNELING EXFIL'
                          : sandboxAnalysis.classification === 'dga_suspicious'
                          ? 'SUSPICIOUS ENTROPY'
                          : 'BENIGN DOMAIN'}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-200 leading-relaxed">
                      {sandboxAnalysis.explanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>In-Browser Heuristic ML Classifier Active</span>
                  </div>
                </div>
              </div>

              {/* Character Frequency Distribution Histogram */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Character Frequency &amp; Probability Distribution P(x)</span>
                  <span className="text-slate-400 text-[11px]">{sandboxAnalysis.charFrequencies.length} Unique Symbols</span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-16 gap-2">
                  {sandboxAnalysis.charFrequencies.slice(0, 16).map((item) => (
                    <div key={item.char} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-center">
                      <div className="font-mono font-bold text-cyan-300 text-sm">{item.char}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.count}x</div>
                      <div className="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400" 
                          style={{ width: `${Math.min(100, item.prob * 100 * 2.5)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Sinkhole & RPZ Exporter */}
          {activeTab === 'sinkhole' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExportFormat('bind')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'bind'
                        ? 'bg-cyan-500/20 text-accent-cyan border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    BIND9 RPZ Zone
                  </button>
                  <button
                    onClick={() => setExportFormat('coredns')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'coredns'
                        ? 'bg-purple-500/20 text-accent-purple border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    CoreDNS Blocklist
                  </button>
                  <button
                    onClick={() => setExportFormat('pihole')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'pihole'
                        ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pi-hole / AdGuard (Hosts)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(exportFormat)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                  >
                    {copiedFormat === exportFormat ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-accent-emerald" />
                        <span className="text-accent-emerald">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Rules</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-cyan transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Policy</span>
                  </button>
                </div>
              </div>

              {/* Code output area */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto text-slate-300 max-h-[400px]">
                <pre>{getExportedPolicy()}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-surface-ground/70 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4 text-accent-cyan" />
            <span>NexusAI EASM &amp; DNS Threat Engine — RFC 1035 &amp; RFC 5936 Standards Compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
