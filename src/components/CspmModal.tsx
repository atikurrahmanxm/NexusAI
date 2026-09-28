import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search, 
  Copy, 
  Check, 
  Wrench, 
  RefreshCw, 
  Download, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  PostureFinding, 
  CloudProvider, 
  PostureFindingSeverity, 
  PostureFindingStatus,
  ComplianceStandard
} from '../types/cspm';
import { 
  calculateCspmSummary, 
  remediateFinding 
} from '../services/cspmEngine';

interface CspmModalProps {
  isOpen: boolean;
  onClose: () => void;
  findings: PostureFinding[];
  onUpdateFindings: (findings: PostureFinding[]) => void;
}

export const CspmModal: React.FC<CspmModalProps> = ({
  isOpen,
  onClose,
  findings,
  onUpdateFindings
}) => {
  const [providerFilter, setProviderFilter] = useState<'ALL' | CloudProvider>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | PostureFindingSeverity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PostureFindingStatus>('ALL');
  const [standardFilter, setStandardFilter] = useState<'ALL' | ComplianceStandard>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'CLI' | 'TERRAFORM'>('CLI');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  if (!isOpen) return null;

  const summary = calculateCspmSummary(findings);

  // Filtered findings
  const filteredFindings = findings.filter(f => {
    if (providerFilter !== 'ALL' && f.cloudProvider !== providerFilter) return false;
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (standardFilter !== 'ALL' && !f.standards.includes(standardFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = f.title.toLowerCase().includes(q) ||
                    f.resourceId.toLowerCase().includes(q) ||
                    f.controlId.toLowerCase().includes(q) ||
                    f.cloudProvider.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleRemediate = (id: string) => {
    const updated = remediateFinding(findings, id);
    onUpdateFindings(updated);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleTriggerFullScan = () => {
    setIsScanning(true);
    setScanMessage('Connecting to AWS, GCP, Azure & Kubernetes control planes...');
    setTimeout(() => {
      setScanMessage('Auditing S3, IAM, CloudTrail, VPC firewalls & K8s pod specs...');
    }, 1000);
    setTimeout(() => {
      setScanMessage('Cross-evaluating CIS Benchmarks v8 & PCI-DSS 4.0 controls...');
    }, 2000);
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('');
    }, 2800);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      auditPlatform: 'NexusAI CSPM Engine',
      scanTimestamp: new Date().toISOString(),
      summary,
      findings
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus_cspm_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getProviderBadge = (provider: CloudProvider) => {
    switch (provider) {
      case 'AWS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">AWS</span>;
      case 'GCP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">GCP</span>;
      case 'AZURE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">AZURE</span>;
      case 'KUBERNETES':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">K8S</span>;
    }
  };

  const getSeverityBadge = (severity: PostureFindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (status: PostureFindingStatus) => {
    switch (status) {
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30"><AlertTriangle className="w-3 h-3" /> FAILED</span>;
      case 'REMEDIATED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><Check className="w-3 h-3" /> REMEDIATED</span>;
      case 'PASSED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"><CheckCircle2 className="w-3 h-3" /> PASSED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/80 bg-surface-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-accent-cyan shadow-glow-cyan">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Cloud Security Posture Management (CSPM)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Multi-Cloud Guardrails
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated infrastructure posture auditing, CIS/PCI/SOC 2 compliance scoring &amp; 1-click remediation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTriggerFullScan}
              disabled={isScanning}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-accent-cyan text-xs font-bold transition-all ${isScanning ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Run Cloud Audit'}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-border/80 border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-surface-border text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live scanning notification banner */}
        {isScanning && (
          <div className="px-6 py-2 bg-cyan-500/15 border-b border-cyan-500/30 flex items-center gap-2.5 text-xs text-cyan-300 font-medium animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{scanMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Posture Health Score</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-cyan">{summary.overallHealthScore}%</span>
                <span className="text-[11px] text-slate-500 font-sans">Compliant</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${summary.overallHealthScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-surface-border/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Total Cloud Assets Audited</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-white">{summary.totalAssetsAudited}</span>
                <span className="text-[11px] text-slate-400 font-sans">AWS, GCP, Az, K8s</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Real-time resource evaluation</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-rose-300">Critical Misconfigurations</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-rose">{summary.criticalMisconfigs}</span>
                <span className="text-[11px] text-rose-400/80 font-sans">Action Required</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Exposing internet attack surfaces</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300">Auto-Remediated Findings</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-emerald">{summary.remediatedCount}</span>
                <span className="text-[11px] text-emerald-400/80 font-sans">Resolved</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Hardened via CLI/Terraform</p>
            </div>
          </div>

          {/* Compliance Standards Radar Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                Regulatory Compliance Guardrails
              </h3>
              <span className="text-[11px] text-slate-500">Live automated compliance cross-walk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {summary.complianceScores.map((cs) => (
                <div 
                  key={cs.standard}
                  onClick={() => setStandardFilter(standardFilter === cs.standard ? 'ALL' : cs.standard)}
                  className={`p-3 rounded-xl bg-surface-card border transition-all cursor-pointer ${standardFilter === cs.standard ? 'border-cyan-500 ring-1 ring-cyan-500/50 shadow-glow-cyan' : 'border-surface-border hover:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{cs.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cs.badgeColor}`}>
                      {cs.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cs.score > 80 ? 'bg-accent-emerald' : cs.score > 60 ? 'bg-accent-cyan' : 'bg-accent-rose'}`}
                      style={{ width: `${cs.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Passed: {cs.passedControls}</span>
                    <span>Failed: {cs.failedControls}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Cloud Provider Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-card p-1 rounded-xl border border-surface-border">
              {(['ALL', 'AWS', 'GCP', 'AZURE', 'KUBERNETES'] as const).map(provider => (
                <button
                  key={provider}
                  onClick={() => setProviderFilter(provider)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${providerFilter === provider ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  {provider}
                </button>
              ))}
            </div>

            {/* Severity, Status & Standard Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                aria-label="Filter by Severity"
                className="bg-surface-card border border-surface-border rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filter by Status"
                className="bg-surface-card border border-surface-border rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="FAILED">Failed</option>
                <option value="REMEDIATED">Remediated</option>
                <option value="PASSED">Passed</option>
              </select>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resource, ARN, control..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-surface-card border border-surface-border rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing {filteredFindings.length} of {findings.length} Infrastructure Checks</span>
              {standardFilter !== 'ALL' && (
                <button
                  onClick={() => setStandardFilter('ALL')}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  Clear standard filter ({standardFilter})
                </button>
              )}
            </div>

            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center bg-surface-card rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-10 h-10 text-accent-emerald mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-white">No misconfigurations found for active filters</p>
                <p className="text-xs text-slate-400 mt-1">All filtered cloud assets meet security compliance baselines.</p>
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const isExpanded = expandedFindingId === finding.id;

                return (
                  <div
                    key={finding.id}
                    className={`rounded-xl border transition-all ${
                      finding.status === 'FAILED'
                        ? 'border-rose-500/30 bg-surface-card hover:border-rose-500/50'
                        : finding.status === 'REMEDIATED'
                        ? 'border-emerald-500/30 bg-surface-card/60'
                        : 'border-surface-border bg-surface-card/40'
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-[280px] flex-1">
                        {getProviderBadge(finding.cloudProvider)}
                        {getSeverityBadge(finding.severity)}
                        {getStatusBadge(finding.status)}

                        <div>
                          <h4 className="text-xs font-bold text-white tracking-tight hover:text-cyan-300 transition-colors">
                            {finding.title}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                            {finding.resourceId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="hidden md:flex flex-wrap items-center gap-1.5">
                          {finding.standards.map(std => (
                            <span key={std} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {std}
                            </span>
                          ))}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Impact Score</span>
                          <span className={`text-xs font-bold font-mono ${finding.impactScore >= 9.0 ? 'text-accent-rose' : 'text-accent-cyan'}`}>
                            {finding.impactScore.toFixed(1)} / 10
                          </span>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Drawer */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-surface-border/60 space-y-4 bg-black/20 rounded-b-xl">
                        {/* Description & Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="md:col-span-2 space-y-1">
                            <span className="text-slate-400 font-medium">Issue Description &amp; Threat Surface:</span>
                            <p className="text-slate-300 leading-relaxed">{finding.description}</p>
                          </div>
                          <div className="space-y-1 bg-surface-base/80 p-3 rounded-xl border border-surface-border">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Control ID:</span>
                              <span className="font-mono text-cyan-300">{finding.controlId}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Region:</span>
                              <span className="font-mono text-slate-200">{finding.region}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Detected:</span>
                              <span className="font-mono text-slate-200">{finding.detectedAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Remediation Code Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-300">Automated Infrastructure Remediation:</span>
                              <div className="inline-flex rounded-lg bg-surface-card p-0.5 border border-surface-border">
                                <button
                                  onClick={() => setActiveCodeTab('CLI')}
                                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${activeCodeTab === 'CLI' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                                >
                                  Cloud CLI
                                </button>
                                <button
                                  onClick={() => setActiveCodeTab('TERRAFORM')}
                                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${activeCodeTab === 'TERRAFORM' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'}`}
                                >
                                  Terraform HCL
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => handleCopyCode(finding.id, activeCodeTab === 'CLI' ? finding.remediationCli : finding.remediationTerraform)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                            >
                              {copiedCodeId === finding.id ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCodeId === finding.id ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950 border border-surface-border/80 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                            {activeCodeTab === 'CLI' ? finding.remediationCli : finding.remediationTerraform}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-slate-500">
                            Auto-remediation enforces zero-trust encryption and private ingress policies.
                          </span>

                          {finding.status === 'FAILED' ? (
                            <button
                              onClick={() => handleRemediate(finding.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-emerald active:scale-95 cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>1-Click Auto-Remediate</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-emerald bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Compliance Policy Enforced</span>
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-surface-border bg-surface-card/40 text-xs text-slate-400">
          <span>NexusAI CSPM Engine &bull; SOC 2 Type II, CIS Benchmarks v8 &amp; PCI-DSS 4.0 Verified</span>
          <span className="font-mono text-cyan-400">Status: Enforcing Cloud Guardrails</span>
        </div>
      </div>
    </div>
  );
};
