import React, { useState } from 'react';
import { 
  Code2, 
  CheckCircle2, 
  X, 
  Search, 
  Copy, 
  Check, 
  Download, 
  Zap, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { 
  SigmaDetectionRule, 
  SigmaRuleCategory, 
  SigmaRuleSeverity 
} from '../types/detectionRule';
import { 
  calculateDetectionSummary, 
  toggleRuleStatus, 
  triggerRuleTest 
} from '../services/detectionEngine';

interface DetectionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: SigmaDetectionRule[];
  onUpdateRules: (rules: SigmaDetectionRule[]) => void;
}

export const DetectionStudioModal: React.FC<DetectionStudioModalProps> = ({
  isOpen,
  onClose,
  rules,
  onUpdateRules
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | SigmaRuleCategory>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | SigmaRuleSeverity>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [activeQueryEngine, setActiveQueryEngine] = useState<Record<string, 'SPLUNK' | 'ELASTIC' | 'SENTINEL' | 'CROWDSTRIKE'>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TRANSPILED' | 'SIGMA_YAML'>('TRANSPILED');

  if (!isOpen) return null;

  const summary = calculateDetectionSummary(rules);

  const filteredRules = rules.filter(r => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = r.title.toLowerCase().includes(q) ||
                    r.ruleCode.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q) ||
                    r.mitreTechniques.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleToggle = (id: string) => {
    const updated = toggleRuleStatus(rules, id);
    onUpdateRules(updated);
  };

  const handleTestMatch = (id: string) => {
    const updated = triggerRuleTest(rules, id);
    onUpdateRules(updated);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportYaml = (rule: SigmaDetectionRule) => {
    const dataStr = 'data:text/yaml;charset=utf-8,' + encodeURIComponent(rule.yamlDefinition);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${rule.ruleCode.toLowerCase()}_sigma.yaml`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (sev: SigmaRuleSeverity) => {
    switch (sev) {
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

  const getCategoryBadge = (cat: SigmaRuleCategory) => {
    switch (cat) {
      case 'WEB_APPLICATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">WEB APP</span>;
      case 'CLOUD_INFRA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">CLOUD IAM</span>;
      case 'ENDPOINT_LINUX':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">LINUX OS</span>;
      case 'IDENTITY_AUTH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">IDENTITY</span>;
      case 'NETWORK_TRAFFIC':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">NETFLOW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/80 bg-surface-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-accent-purple shadow-glow-purple">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Detection Engineering Studio &amp; Sigma Compiler</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                  Multi-SIEM Transpiler
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Author open Sigma detection logic, transpile to Splunk SPL, Elastic DSL, Sentinel KQL &amp; evaluate against live telemetry
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
              <span className="text-[11px] font-medium text-slate-400">Compiled Detection Rules</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-white">{summary.totalRules}</span>
                <span className="text-[11px] text-accent-emerald font-sans">({summary.activeRules} Active)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Open Sigma format compliance</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-surface-border/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Total Detections Fired</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-purple">{summary.totalDetectionsFired}</span>
                <span className="text-[11px] text-slate-400 font-sans">Alerts</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Pattern matches across event stream</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-cyan-500/20 bg-cyan-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-cyan-300">Rule Evaluation Latency</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-cyan">{summary.avgEvaluationLatencyUs} µs</span>
                <span className="text-[11px] text-cyan-400/80 font-sans">Sub-microsecond</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Optimized AST regex compiler</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300">Supported SIEM Engines</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-emerald">4</span>
                <span className="text-[11px] text-emerald-400/80 font-sans">Transpilers</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Splunk, Elastic, Sentinel, Falcon</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-card p-1 rounded-xl border border-surface-border">
              {(['ALL', 'WEB_APPLICATION', 'CLOUD_INFRA', 'ENDPOINT_LINUX', 'IDENTITY_AUTH', 'NETWORK_TRAFFIC'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${categoryFilter === cat ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                aria-label="Filter by Severity"
                className="bg-surface-card border border-surface-border rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rule, MITRE, query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-surface-card border border-surface-border rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing {filteredRules.length} of {rules.length} Detection Rules</span>
              <span className="text-[11px] text-slate-500">Live evaluation hooked into packet pipeline</span>
            </div>

            {filteredRules.length === 0 ? (
              <div className="p-8 text-center bg-surface-card rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-10 h-10 text-accent-emerald mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-white">No detection rules found for active filter</p>
              </div>
            ) : (
              filteredRules.map(rule => {
                const isExpanded = expandedRuleId === rule.id;
                const engine = activeQueryEngine[rule.id] || 'SPLUNK';

                return (
                  <div
                    key={rule.id}
                    className={`rounded-xl border transition-all ${
                      rule.status === 'ENABLED'
                        ? 'border-purple-500/30 bg-surface-card hover:border-purple-500/50'
                        : 'border-surface-border bg-surface-card/40 opacity-70'
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                      className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-[320px] flex-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-purple-500/30">
                          {rule.ruleCode}
                        </span>
                        {getSeverityBadge(rule.severity)}
                        {getCategoryBadge(rule.category)}

                        <div>
                          <h4 className="text-xs font-bold text-white tracking-tight hover:text-purple-300 transition-colors">
                            {rule.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate max-w-lg">
                            {rule.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Detections Fired</span>
                          <span className="text-xs font-mono text-purple-400 font-bold">
                            {rule.matchesCount} Hits
                          </span>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggle(rule.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                              rule.status === 'ENABLED'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            {rule.status}
                          </button>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Drawer */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-surface-border/60 space-y-4 bg-black/20 rounded-b-xl">
                        {/* Metadata & Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="md:col-span-2 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium">MITRE ATT&amp;CK Mapping:</span>
                              {rule.mitreTechniques.map(tech => (
                                <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{rule.description}</p>
                          </div>

                          <div className="space-y-1 bg-surface-base/80 p-3 rounded-xl border border-surface-border text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Author:</span>
                              <span className="font-semibold text-slate-200">{rule.author}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">False Positive:</span>
                              <span className="font-mono text-emerald-400">{rule.falsePositiveRate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Last Matched:</span>
                              <span className="font-mono text-slate-200">{rule.lastMatchedAt || 'Never'}</span>
                            </div>
                          </div>
                        </div>

                        {/* View Mode Tabs: Transpiled vs Raw YAML */}
                        <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveTab('TRANSPILED')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'TRANSPILED'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Multi-SIEM Transpiled Queries
                            </button>
                            <button
                              onClick={() => setActiveTab('SIGMA_YAML')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'SIGMA_YAML'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Raw Sigma YAML Specification
                            </button>
                          </div>

                          <button
                            onClick={() => handleExportYaml(rule)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export .yaml</span>
                          </button>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'TRANSPILED' ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              {/* Engine Sub-tabs */}
                              <div className="inline-flex rounded-xl bg-surface-card p-0.5 border border-surface-border">
                                {(['SPLUNK', 'ELASTIC', 'SENTINEL', 'CROWDSTRIKE'] as const).map(eng => (
                                  <button
                                    key={eng}
                                    onClick={() => setActiveQueryEngine(prev => ({ ...prev, [rule.id]: eng }))}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                      engine === eng ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {eng === 'SPLUNK' ? 'Splunk (SPL)' :
                                     eng === 'ELASTIC' ? 'Elasticsearch (DSL)' :
                                     eng === 'SENTINEL' ? 'Azure Sentinel (KQL)' : 'CrowdStrike (CQL)'}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() => {
                                  const text = engine === 'SPLUNK' ? rule.queries.splunkSpl :
                                               engine === 'ELASTIC' ? rule.queries.elasticDsl :
                                               engine === 'SENTINEL' ? rule.queries.sentinelKql : rule.queries.crowdstrikeCql;
                                  handleCopy(`${rule.id}-${engine}`, text);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                              >
                                {copiedKey === `${rule.id}-${engine}` ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === `${rule.id}-${engine}` ? 'Copied Query!' : 'Copy Query'}</span>
                              </button>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-surface-border font-mono text-[11px] text-purple-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                              {engine === 'SPLUNK' && rule.queries.splunkSpl}
                              {engine === 'ELASTIC' && rule.queries.elasticDsl}
                              {engine === 'SENTINEL' && rule.queries.sentinelKql}
                              {engine === 'CROWDSTRIKE' && rule.queries.crowdstrikeCql}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleCopy(`${rule.id}-yaml`, rule.yamlDefinition)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                              >
                                {copiedKey === `${rule.id}-yaml` ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === `${rule.id}-yaml` ? 'Copied YAML!' : 'Copy YAML'}</span>
                              </button>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-surface-border font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                              {rule.yamlDefinition}
                            </div>
                          </div>
                        )}

                        {/* Test Evaluation Action */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-slate-500">
                            Evaluated in real-time by NexusAI AST Regex Rule Engine.
                          </span>

                          <button
                            onClick={() => handleTestMatch(rule.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow-purple active:scale-95 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Simulate Rule Trigger ({rule.ruleCode})</span>
                          </button>
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
          <span>NexusAI Detection Studio &bull; Standard Sigma v2.0 Specification &bull; AST Query Compiler</span>
          <span className="font-mono text-purple-400">Rule Engine: Active Telemetry Hook</span>
        </div>
      </div>
    </div>
  );
};
