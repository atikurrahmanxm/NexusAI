import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Sliders, 
  Zap, 
  Lock, 
  AlertTriangle,
  Radio,
  FileCheck
} from 'lucide-react';
import { ApiEndpoint, ApiSecurityEvent } from '../types/apiSecurity';
import { 
  createSampleJwt, 
  inspectJwtToken, 
  exportOpenApiSchema, 
  exportCloudflareApiShield 
} from '../services/apiSecurityEngine';

interface ApiSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  endpoints: ApiEndpoint[];
  onUpdateEndpoints: (endpoints: ApiEndpoint[]) => void;
  securityEvents: ApiSecurityEvent[];
  onUpdateSecurityEvents: (events: ApiSecurityEvent[]) => void;
}

type TabType = 'inventory' | 'attacks' | 'jwt' | 'export';

export const ApiSecurityModal: React.FC<ApiSecurityModalProps> = ({
  isOpen,
  onClose,
  endpoints,
  onUpdateEndpoints,
  securityEvents
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'shadow' | 'pii'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // JWT Sandbox state
  const [jwtPreset, setJwtPreset] = useState<'valid' | 'alg_none' | 'expired' | 'bola'>('alg_none');
  const [rawJwt, setRawJwt] = useState<string>(() => createSampleJwt('alg_none'));
  const [targetResource, setTargetResource] = useState('user_8849');

  // Policy export format
  const [exportFormat, setExportFormat] = useState<'openapi' | 'shield'>('openapi');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Compute JWT inspection
  const jwtInspection = useMemo(() => {
    return inspectJwtToken(rawJwt, targetResource);
  }, [rawJwt, targetResource]);

  if (!isOpen) return null;

  // Stats calculation
  const totalEndpoints = endpoints.length;
  const shadowZombieCount = endpoints.filter(e => e.category === 'shadow' || e.category === 'zombie').length;
  const attacksBlockedCount = securityEvents.filter(e => e.blocked).length;
  const piiExposedCount = endpoints.filter(e => e.piiExposed).length;

  // Filtered endpoints
  const filteredEndpoints = endpoints.filter(ep => {
    const matchesSearch = ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ep.method.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (inventoryFilter === 'shadow') return ep.category === 'shadow' || ep.category === 'zombie';
    if (inventoryFilter === 'pii') return ep.piiExposed;
    return true;
  });

  // Handle protect endpoint
  const handleProtectEndpoint = (id: string) => {
    const updated = endpoints.map(ep => {
      if (ep.id === id) {
        return {
          ...ep,
          category: 'managed' as const,
          authScheme: 'OAuth2_Bearer' as const,
          riskLevel: 'low' as const,
          isProtected: true
        };
      }
      return ep;
    });
    onUpdateEndpoints(updated);
  };

  // Switch JWT sample preset
  const handleSelectPreset = (preset: 'valid' | 'alg_none' | 'expired' | 'bola') => {
    setJwtPreset(preset);
    setRawJwt(createSampleJwt(preset));
  };

  // Policy export text
  const getPolicyText = () => {
    if (exportFormat === 'openapi') return exportOpenApiSchema(endpoints);
    return exportCloudflareApiShield(endpoints);
  };

  const handleCopyCode = (format: string) => {
    navigator.clipboard.writeText(getPolicyText());
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadFile = () => {
    const content = getPolicyText();
    const ext = exportFormat === 'openapi' ? 'yaml' : 'json';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-api-security.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-card border border-purple-500/30 shadow-2xl shadow-purple-950/50 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-surface-ground/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-accent-purple shadow-glow-purple">
              <Key className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  API Security Shield &amp; OWASP API Top 10 Guard
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-accent-purple border border-purple-500/40">
                  WAAP &amp; BOLA Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shadow/Zombie API Discovery, JWT Cryptographic Signature Inspector &amp; Object Authorization Defense
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
            <FileCode className="w-4 h-4 text-accent-cyan" />
            <div>
              <div className="text-slate-400 text-[11px]">Monitored Endpoints</div>
              <div className="text-white font-mono font-bold text-sm">{totalEndpoints} Endpoints</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4 text-accent-rose animate-bounce" />
            <div>
              <div className="text-rose-400 text-[11px]">Shadow &amp; Zombie APIs</div>
              <div className="text-accent-rose font-mono font-bold text-sm">{shadowZombieCount} Exposed</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <div>
              <div className="text-emerald-400 text-[11px]">OWASP Attacks Blocked</div>
              <div className="text-accent-emerald font-mono font-bold text-sm">{attacksBlockedCount} Intercepted</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-purple-500/30">
            <Lock className="w-4 h-4 text-accent-purple" />
            <div>
              <div className="text-purple-400 text-[11px]">Sensitive PII Exposed</div>
              <div className="text-accent-purple font-mono font-bold text-sm">{piiExposedCount} Endpoints</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'border-accent-purple text-accent-purple bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>API Catalog &amp; Shadow Discovery ({endpoints.length})</span>
            {shadowZombieCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {shadowZombieCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('attacks')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'attacks'
                ? 'border-accent-rose text-accent-rose bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>OWASP API Top 10 Feed ({securityEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('jwt')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'jwt'
                ? 'border-accent-cyan text-accent-cyan bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>JWT &amp; BOLA Inspector Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'export'
                ? 'border-accent-emerald text-accent-emerald bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>OpenAPI 3.1 &amp; WAF Exporter</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: API Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search API path or method (e.g. /v1/users)..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Filter:</span>
                  <button
                    onClick={() => setInventoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      inventoryFilter === 'all'
                        ? 'bg-purple-500/20 text-accent-purple border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({endpoints.length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('shadow')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      inventoryFilter === 'shadow'
                        ? 'bg-rose-500/20 text-accent-rose border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Shadow &amp; Zombie ({shadowZombieCount})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('pii')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      inventoryFilter === 'pii'
                        ? 'bg-cyan-500/20 text-accent-cyan border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    PII Exposed ({piiExposedCount})
                  </button>
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Method &amp; Endpoint Path</th>
                      <th className="py-3 px-4">Gateway Status</th>
                      <th className="py-3 px-4">Authentication</th>
                      <th className="py-3 px-4">Exposed PII Fields</th>
                      <th className="py-3 px-4 text-right">Policy Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredEndpoints.map((ep) => (
                      <tr 
                        key={ep.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          ep.category === 'zombie'
                            ? 'bg-rose-950/20'
                            : ep.category === 'shadow'
                            ? 'bg-amber-950/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ep.method === 'GET' 
                                ? 'bg-cyan-500/20 text-accent-cyan border border-cyan-500/40' 
                                : ep.method === 'POST' 
                                ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/40' 
                                : ep.method === 'PUT' || ep.method === 'PATCH'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-accent-rose border border-rose-500/40'
                            }`}>
                              {ep.method}
                            </span>
                            <span className="font-bold text-white text-xs">{ep.path}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-sans">
                            Traffic: {ep.avgRps} rps | Quota: {ep.rateLimitQuota} rps
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {ep.category === 'zombie' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-accent-rose border border-rose-500/40 animate-pulse">
                              <ShieldAlert className="w-3 h-3" />
                              Zombie API (Deprecated)
                            </span>
                          ) : ep.category === 'shadow' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <AlertTriangle className="w-3 h-3" />
                              Shadow API (Unrouted)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
                              <ShieldCheck className="w-3 h-3" />
                              Managed Gateway
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            ep.authScheme === 'Unauthenticated' 
                              ? 'bg-rose-500/20 text-accent-rose font-bold' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {ep.authScheme}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {ep.piiTypes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {ep.piiTypes.map(pii => (
                                <span key={pii} className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                                  {pii}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">None detected</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          {!ep.isProtected ? (
                            <button
                              onClick={() => handleProtectEndpoint(ep.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-glow-purple transition-all active:scale-95"
                            >
                              <Zap className="w-3 h-3" />
                              Enforce Gateway
                            </button>
                          ) : (
                            <span className="text-emerald-400 text-[11px] font-medium flex items-center justify-end gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Informational Banner */}
              <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-accent-purple mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-accent-purple">OWASP API9:2023 Shadow &amp; Zombie Mitigation:</span> Zombie endpoints are outdated API versions left alive after software upgrades. Shadow APIs are internal development or staging routes deployed without passing through enterprise API gateways, often bypassing authentication and exposing customer PII.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OWASP API Top 10 Attack Feed */}
          {activeTab === 'attacks' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Time &amp; Client IP</th>
                      <th className="py-3 px-4">Target Endpoint</th>
                      <th className="py-3 px-4">OWASP Classification</th>
                      <th className="py-3 px-4">Threat Details</th>
                      <th className="py-3 px-4 text-right">Defense Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {securityEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-white text-xs">{evt.timestamp}</div>
                          <div className="text-slate-400 text-[10px]">{evt.clientIp}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                              {evt.method}
                            </span>
                            <span className="font-bold text-white text-xs">{evt.endpoint}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-accent-rose border border-rose-500/40">
                            {evt.owaspCategory}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-300 max-w-[340px]">
                          <div className="text-xs leading-relaxed">{evt.details}</div>
                          {evt.jwtDecoded && (
                            <div className="mt-1 text-[10px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/20 px-1.5 py-0.5 rounded">
                              Caller: {evt.jwtDecoded.sub} | Role: {evt.jwtDecoded.role} | Alg: {evt.jwtDecoded.alg}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
                            <ShieldCheck className="w-3 h-3" />
                            BLOCKED (403/429)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive JWT & BOLA Security Inspector Sandbox */}
          {activeTab === 'jwt' && (
            <div className="space-y-6">
              
              {/* Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select JWT Attack Simulation Preset
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Live RFC 7519 &amp; OWASP API2 / API1 Token Validation
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectPreset('alg_none')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      jwtPreset === 'alg_none'
                        ? 'bg-rose-500/20 text-accent-rose border border-rose-500/40 shadow-glow-rose'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Alg: None Signature Bypass Exploit
                  </button>

                  <button
                    onClick={() => handleSelectPreset('bola')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      jwtPreset === 'bola'
                        ? 'bg-purple-500/20 text-accent-purple border border-purple-500/40 shadow-glow-purple'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    BOLA / IDOR Claim Tamper
                  </button>

                  <button
                    onClick={() => handleSelectPreset('expired')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      jwtPreset === 'expired'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Expired Token Replay
                  </button>

                  <button
                    onClick={() => handleSelectPreset('valid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      jwtPreset === 'valid'
                        ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/40 shadow-glow-emerald'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Valid Enterprise RS256 Token
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3">
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Raw JSON Web Token (JWT) Bearer String
                    </label>
                    <input
                      type="text"
                      value={rawJwt}
                      onChange={(e) => setRawJwt(e.target.value)}
                      placeholder="Paste raw JWT (header.payload.signature)..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Target Resource ID (for BOLA test)
                    </label>
                    <input
                      type="text"
                      value={targetResource}
                      onChange={(e) => setTargetResource(e.target.value)}
                      placeholder="e.g. user_8849"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* JWT Inspection Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Security Score */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">JWT Security Score</div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`text-4xl font-extrabold font-mono ${
                        jwtInspection.securityScore >= 80 
                          ? 'text-accent-emerald' 
                          : jwtInspection.securityScore >= 50 
                          ? 'text-amber-400' 
                          : 'text-accent-rose'
                      }`}>
                        {jwtInspection.securityScore}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          jwtInspection.securityScore >= 80 
                            ? 'bg-emerald-500 shadow-glow-emerald' 
                            : jwtInspection.securityScore >= 50 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500 shadow-glow-rose'
                        }`}
                        style={{ width: `${jwtInspection.securityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-mono font-bold text-white">{jwtInspection.header.alg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Subject (sub):</span>
                      <span className="font-mono text-cyan-300">{jwtInspection.payload.sub}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signature Integrity:</span>
                      <span className={`font-bold ${jwtInspection.isSignatureValid ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {jwtInspection.isSignatureValid ? 'Signed & Valid' : 'Vulnerable / Stripped'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decoded Header & Payload Viewers */}
                <div className="md:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Decoded Token Internals</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-sans mb-1 font-semibold">
                        Header (JOSE)
                      </div>
                      <pre className="text-cyan-300">{JSON.stringify(jwtInspection.header, null, 2)}</pre>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-sans mb-1 font-semibold">
                        Payload (Claims)
                      </div>
                      <pre className="text-purple-300">{JSON.stringify(jwtInspection.payload, null, 2)}</pre>
                    </div>
                  </div>
                </div>

              </div>

              {/* Audit Findings Checklist */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Security Verification Findings &amp; Guardrails
                </div>
                <div className="space-y-1.5">
                  {jwtInspection.auditFindings.map((finding, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                        finding.startsWith('CRITICAL') 
                          ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200' 
                          : finding.startsWith('HIGH') 
                          ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200' 
                          : finding.startsWith('VERIFIED') 
                          ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' 
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {finding.startsWith('CRITICAL') || finding.startsWith('HIGH') ? (
                        <AlertTriangle className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-4 h-4 text-accent-emerald flex-shrink-0 mt-0.5" />
                      )}
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: OpenAPI & Cloudflare API Shield Exporter */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExportFormat('openapi')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'openapi'
                        ? 'bg-purple-500/20 text-accent-purple border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    OpenAPI 3.1 Hardened Schema (YAML)
                  </button>
                  <button
                    onClick={() => setExportFormat('shield')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'shield'
                        ? 'bg-cyan-500/20 text-accent-cyan border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cloudflare API Shield / Envoy (JSON)
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
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Spec</span>
                  </button>
                </div>
              </div>

              {/* Code display */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto text-slate-300 max-h-[400px]">
                <pre>{getPolicyText()}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-surface-ground/70 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Key className="w-4 h-4 text-accent-purple" />
            <span>NexusAI Web Application &amp; API Protection (WAAP) — OWASP API Security Top 10 Compliant</span>
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
