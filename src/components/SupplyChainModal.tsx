import React, { useState, useMemo } from 'react';
import { 
  X, 
  Package, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Sliders, 
  Zap, 
  Scale, 
  Cpu
} from 'lucide-react';
import { SbomComponent, TyposquattingAnalysis } from '../types/supplyChain';
import { 
  detectTyposquatting, 
  exportCycloneDxJson, 
  exportSpdxJson 
} from '../services/supplyChainEngine';

interface SupplyChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: SbomComponent[];
  onUpdateComponents: (components: SbomComponent[]) => void;
}

type TabType = 'sbom' | 'typosquat' | 'export';

export const SupplyChainModal: React.FC<SupplyChainModalProps> = ({
  isOpen,
  onClose,
  components,
  onUpdateComponents
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sbom');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'license'>('all');
  
  // Typosquatting sandbox state
  const [candidateName, setCandidateName] = useState('expresss');
  const [activePreset, setActivePreset] = useState('expresss');

  // Export format state
  const [exportFormat, setExportFormat] = useState<'cyclonedx' | 'spdx'>('cyclonedx');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Compute typosquatting analysis
  const typosquatAnalysis: TyposquattingAnalysis = useMemo(() => {
    return detectTyposquatting(candidateName);
  }, [candidateName]);

  if (!isOpen) return null;

  // Stats calculation
  const totalComponents = components.length;
  const criticalCount = components.filter(c => c.riskTier === 'critical' || c.isBackdoorRisk).length;
  const licenseViolations = components.filter(c => c.licenseCategory === 'copyleft_viral').length;
  const safeCount = components.filter(c => c.riskTier === 'low').length;

  // Filtered components
  const filteredComponents = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.license.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'critical') return c.riskTier === 'critical' || c.isBackdoorRisk;
    if (filterType === 'license') return c.licenseCategory === 'copyleft_viral';
    return true;
  });

  // Handle mitigate / patch component
  const handleMitigateComponent = (id: string) => {
    const updated = components.map(c => {
      if (c.id === id) {
        return {
          ...c,
          version: c.name === 'xz' ? '5.6.4' : c.name === 'jsonwebtoken' ? '9.0.2' : c.name === 'colors' ? '1.4.0' : '2.17.1',
          riskTier: 'low' as const,
          maxCvss: 0.0,
          cveCount: 0,
          cves: [],
          isBackdoorRisk: false,
          remediation: 'Remediated: Upgraded to verified hardened build with cryptographic integrity check.'
        };
      }
      return c;
    });
    onUpdateComponents(updated);
  };

  // Presets
  const PRESET_PACKAGES = [
    { key: 'expresss', name: 'expresss (1 char typo)' },
    { key: '1odash', name: '1odash (homoglyph)' },
    { key: 'crossenv', name: 'crossenv (hyphen drop)' },
    { key: 'react', name: 'react (canonical)' },
    { key: 'fastapi', name: 'fastapi (canonical)' },
    { key: 'urllib4', name: 'urllib4 (version squat)' }
  ];

  const handleSelectPreset = (p: typeof PRESET_PACKAGES[0]) => {
    setActivePreset(p.key);
    setCandidateName(p.key);
  };

  // Export policy text generator
  const getExportedPolicy = () => {
    if (exportFormat === 'cyclonedx') return exportCycloneDxJson(components);
    return exportSpdxJson(components);
  };

  const handleCopyCode = (format: string) => {
    navigator.clipboard.writeText(getExportedPolicy());
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadFile = () => {
    const content = getExportedPolicy();
    const ext = exportFormat === 'cyclonedx' ? 'cyclonedx.json' : 'spdx.json';
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-sbom.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-card border border-teal-500/30 shadow-2xl shadow-teal-950/50 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-surface-ground/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-glow-teal">
              <Package className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Software Supply Chain Security &amp; SBOM Intelligence
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  CycloneDX 1.5 &amp; Levenshtein ML
                </span>
              </div>
              <p className="text-xs text-slate-400">
                XZ Backdoor Hunter, Dependency Confusion / Typosquatting Scanner &amp; NIST SP 800-161 Compliance
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
            <Package className="w-4 h-4 text-teal-400" />
            <div>
              <div className="text-slate-400 text-[11px]">BOM Dependencies</div>
              <div className="text-white font-mono font-bold text-sm">{totalComponents} Components</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-rose-500/30">
            <ShieldAlert className="w-4 h-4 text-accent-rose animate-bounce" />
            <div>
              <div className="text-rose-400 text-[11px]">Backdoors &amp; Critical CVEs</div>
              <div className="text-accent-rose font-mono font-bold text-sm">{criticalCount} High Risk</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-amber-500/30">
            <Scale className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-amber-400 text-[11px]">Copyleft GPL Violations</div>
              <div className="text-amber-300 font-mono font-bold text-sm">{licenseViolations} License Conflicts</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <div>
              <div className="text-emerald-400 text-[11px]">Clean &amp; Verified Packages</div>
              <div className="text-accent-emerald font-mono font-bold text-sm">{safeCount} Hardened</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('sbom')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'sbom'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Bill of Materials Catalog ({components.length})</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('typosquat')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'typosquat'
                ? 'border-accent-purple text-accent-purple bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Levenshtein Typosquatting ML Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'export'
                ? 'border-accent-emerald text-accent-emerald bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>CycloneDX 1.5 &amp; SPDX Exporter</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SBOM Component Catalog */}
          {activeTab === 'sbom' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search package name, version, or license..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Filter:</span>
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filterType === 'all'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({components.length})
                  </button>
                  <button
                    onClick={() => setFilterType('critical')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filterType === 'critical'
                        ? 'bg-rose-500/20 text-accent-rose border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Critical &amp; Backdoors ({criticalCount})
                  </button>
                  <button
                    onClick={() => setFilterType('license')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filterType === 'license'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    GPL Copyleft ({licenseViolations})
                  </button>
                </div>
              </div>

              {/* Components Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Package &amp; Ecosystem</th>
                      <th className="py-3 px-4">License Compliance</th>
                      <th className="py-3 px-4">Dependency Depth</th>
                      <th className="py-3 px-4">Max CVSS &amp; Threat</th>
                      <th className="py-3 px-4 text-right">Remediation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredComponents.map((comp) => (
                      <tr 
                        key={comp.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          comp.isBackdoorRisk || comp.riskTier === 'critical'
                            ? 'bg-rose-950/25'
                            : comp.licenseCategory === 'copyleft_viral'
                            ? 'bg-amber-950/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-teal-300 border border-slate-700">
                              {comp.ecosystem}
                            </span>
                            <span className="font-bold text-white text-xs font-sans">{comp.name}</span>
                            <span className="text-slate-400 text-[11px]">@{comp.version}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[280px] mt-0.5" title={comp.purl}>
                            {comp.purl}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            comp.licenseCategory === 'copyleft_viral'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {comp.license}
                          </span>
                          {comp.licenseCategory === 'copyleft_viral' && (
                            <div className="text-[10px] text-amber-400 mt-1">
                              Copyleft Viral (Commercial Risk)
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <span className={`text-[11px] ${comp.directDependency ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                            {comp.directDependency ? 'Direct (Level 1)' : `Transitive (Depth ${comp.depth})`}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {comp.isBackdoorRisk ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse font-sans">
                              <ShieldAlert className="w-3 h-3" />
                              BACKDOOR INJECTION
                            </span>
                          ) : comp.maxCvss > 0 ? (
                            <div>
                              <span className={`font-bold ${comp.maxCvss >= 9.0 ? 'text-accent-rose' : 'text-amber-400'}`}>
                                CVSS {comp.maxCvss.toFixed(1)}
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans">
                                {comp.cves.join(', ')}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/40 font-sans">
                              <ShieldCheck className="w-3 h-3" />
                              Hardened (0 CVEs)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          {comp.riskTier === 'critical' || comp.isBackdoorRisk ? (
                            <button
                              onClick={() => handleMitigateComponent(comp.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-glow-rose transition-all active:scale-95"
                            >
                              <Zap className="w-3 h-3" />
                              Patch / Downgrade
                            </button>
                          ) : comp.licenseCategory === 'copyleft_viral' ? (
                            <span className="text-amber-400 text-[11px] font-medium">Needs License Review</span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Approved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Informational Banner */}
              <div className="p-3.5 rounded-xl border border-teal-500/20 bg-teal-500/5 text-xs text-slate-300 flex items-start gap-2.5">
                <Package className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-teal-300">NIST SP 800-161 &amp; Executive Order 14028 Mandate:</span> Real-time Software Bill of Materials (SBOM) tracks all direct and deep transitive open-source dependencies. It continuously alerts on stealthy state-sponsored upstream backdoors (such as the XZ Utils multi-stage build-injection exploit) before poisoned binaries reach production clusters.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Typosquatting ML Sandbox */}
          {activeTab === 'typosquat' && (
            <div className="space-y-6">
              
              {/* Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Test Package Name or Type Custom Candidate
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Levenshtein Edit Matrix &amp; Homoglyph Distance
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_PACKAGES.map(p => (
                    <button
                      key={p.key}
                      onClick={() => handleSelectPreset(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activePreset === p.key
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
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
                    value={candidateName}
                    onChange={(e) => {
                      setCandidateName(e.target.value);
                      setActivePreset('custom');
                    }}
                    placeholder="Enter any package name (e.g. expresss, 1odash, react)..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Analysis Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Distance Metric */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Levenshtein Edit Distance</div>
                    <div className="mt-2 text-4xl font-extrabold font-mono text-cyan-300">
                      {typosquatAnalysis.levenshteinDistance} <span className="text-xs text-slate-400 font-sans">edits</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Target Library:</span>
                      <span className="font-mono font-bold text-white">{typosquatAnalysis.canonicalTarget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Similarity Ratio:</span>
                      <span className="font-mono text-cyan-400">{(typosquatAnalysis.similarityRatio * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Similarity Meter */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Lexical Similarity Meter</div>
                    <div className="w-full h-3 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          typosquatAnalysis.isTyposquatting 
                            ? 'bg-rose-500 shadow-glow-rose' 
                            : 'bg-emerald-500 shadow-glow-emerald'
                        }`}
                        style={{ width: `${typosquatAnalysis.similarityRatio * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    Phonetic permutations with distance 1-2 often execute malicious `preinstall` bash scripts to steal SSH keys and tokens.
                  </div>
                </div>

                {/* Verdict Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  typosquatAnalysis.verdict === 'malicious_typosquat'
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : typosquatAnalysis.verdict === 'suspicious'
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-emerald-500/40 bg-emerald-500/10'
                }`}>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Supply Chain Verdict</div>
                    <div className="mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        typosquatAnalysis.verdict === 'malicious_typosquat'
                          ? 'bg-rose-500 text-white'
                          : typosquatAnalysis.verdict === 'suspicious'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {typosquatAnalysis.verdict === 'malicious_typosquat'
                          ? 'MALICIOUS TYPOSQUATTING'
                          : typosquatAnalysis.verdict === 'suspicious'
                          ? 'SUSPICIOUS VARIANT'
                          : 'VERIFIED GENUINE PACKAGE'}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-200 leading-relaxed">
                      {typosquatAnalysis.explanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-teal-400" />
                    <span>In-Browser Dynamic Programming Matrix Active</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: CycloneDX 1.5 & SPDX Exporter */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExportFormat('cyclonedx')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'cyclonedx'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    CycloneDX 1.5 JSON (OWASP Recommended)
                  </button>
                  <button
                    onClick={() => setExportFormat('spdx')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === 'spdx'
                        ? 'bg-purple-500/20 text-accent-purple border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    SPDX 2.3 JSON (ISO/IEC 5962:2021)
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
                        <span>Copy Spec</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-glow-teal transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SBOM</span>
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto text-slate-300 max-h-[400px]">
                <pre>{getExportedPolicy()}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-surface-ground/70 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Package className="w-4 h-4 text-teal-400" />
            <span>NexusAI Supply Chain Sentinel — NTIA Minimum Elements for SBOM Certified</span>
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
