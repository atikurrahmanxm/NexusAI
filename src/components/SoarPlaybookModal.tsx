import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  X, 
  Shield, 
  Terminal, 
  ArrowRight, 
  Lock, 
  AlertTriangle, 
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import { Playbook, PlaybookExecutionResult } from '../types/soarPlaybook';
import { 
  loadPlaybooks, 
  savePlaybooks, 
  togglePlaybookActive, 
  togglePlaybookMode, 
  calculateSoarMetrics, 
  simulateExecutePlaybook 
} from '../services/soarEngine';

interface SoarPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAttackerIp?: string;
}

export const SoarPlaybookModal: React.FC<SoarPlaybookModalProps> = ({
  isOpen,
  onClose,
  activeAttackerIp = '185.220.101.5'
}) => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(loadPlaybooks);
  const [executingPlaybookId, setExecutingPlaybookId] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<PlaybookExecutionResult | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const metrics = calculateSoarMetrics(playbooks);

  const handleToggleActive = (id: string) => {
    const updated = togglePlaybookActive(playbooks, id);
    setPlaybooks(updated);
  };

  const handleToggleMode = (id: string) => {
    const updated = togglePlaybookMode(playbooks, id);
    setPlaybooks(updated);
  };

  const handleRunPlaybook = (playbook: Playbook) => {
    setExecutingPlaybookId(playbook.id);
    setLatestResult(null);

    // Simulate animated execution pipeline
    setTimeout(() => {
      const { updatedPlaybook, result } = simulateExecutePlaybook(playbook, activeAttackerIp);
      
      const newPlaybooks = playbooks.map(p => p.id === playbook.id ? updatedPlaybook : p);
      setPlaybooks(newPlaybooks);
      savePlaybooks(newPlaybooks);

      setLatestResult(result);
      setExecutingPlaybookId(null);
    }, 900);
  };

  const filteredPlaybooks = playbooks.filter(p => {
    if (filterType === 'ALL') return true;
    if (filterType === 'AUTONOMOUS') return p.mode === 'FULL_AUTONOMOUS';
    if (filterType === 'ACTIVE') return p.isActive;
    return p.trigger.attackType === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl shadow-indigo-950/20 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 border-b border-surface-border bg-surface-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-accent-purple shadow-glow-purple">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  SOAR Autonomous Incident Playbook Orchestrator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  ACTIVE ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Security Orchestration, Automation and Response &bull; Sub-second containment pipelines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SOAR Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 md:px-7 bg-surface-base/80 border-b border-surface-border text-xs">
          <div className="p-3 rounded-xl bg-surface-card/50 border border-surface-border">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Total Playbooks
            </span>
            <p className="text-lg font-extrabold text-white mt-0.5">{metrics.totalPlaybooks} Defined</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Full Autonomous
            </span>
            <p className="text-lg font-extrabold text-accent-cyan mt-0.5">{metrics.activeAutonomous} Pipelines</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/25">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Remediations Run
            </span>
            <p className="text-lg font-extrabold text-accent-emerald mt-0.5">{metrics.totalRemediations.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Mean Time to Respond (MTTR)
            </span>
            <p className="text-lg font-extrabold text-indigo-300 font-mono mt-0.5">
              {metrics.meanTimeToRespondSeconds}s <span className="text-[10px] text-slate-400 font-sans">(vs manual 45m)</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Success Rate
            </span>
            <p className="text-lg font-extrabold text-purple-300 font-mono mt-0.5">{metrics.successRatePercentage}%</p>
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:px-7 border-b border-surface-border bg-surface-card/30 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Filter Playbooks:</span>
            {['ALL', 'AUTONOMOUS', 'ACTIVE', 'DDoS', 'SQLi', 'BruteForce', 'Malware'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === f
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                    : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Simulate Target IP:</span>
            <span className="px-2 py-0.5 rounded bg-surface-base border border-surface-border font-mono text-cyan-300">
              {activeAttackerIp}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:px-7 space-y-6">
          {/* Playbook List */}
          <div className="space-y-5">
            {filteredPlaybooks.map(playbook => {
              const isExecuting = executingPlaybookId === playbook.id;

              return (
                <div
                  key={playbook.id}
                  className={`p-5 rounded-2xl bg-surface-card border transition-all ${
                    playbook.isActive 
                      ? 'border-purple-500/30 hover:border-purple-500/50 shadow-lg' 
                      : 'border-surface-border opacity-70'
                  }`}
                >
                  {/* Top Bar of Playbook */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border mt-0.5 ${
                        playbook.isActive
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : 'bg-surface-base border-surface-border text-slate-500'
                      }`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-300">{playbook.id}</span>
                          <h3 className="text-base font-bold text-white tracking-tight">{playbook.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-base border border-surface-border text-slate-300">
                            {playbook.trigger.attackType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{playbook.tagline}</p>
                      </div>
                    </div>

                    {/* Mode & Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Mode Toggle Button */}
                      <button
                        onClick={() => handleToggleMode(playbook.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all text-[11px] ${
                          playbook.mode === 'FULL_AUTONOMOUS'
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-accent-cyan shadow-glow-cyan'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {playbook.mode === 'FULL_AUTONOMOUS' ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                            <span>Full Autonomous</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Manual Approval</span>
                          </>
                        )}
                      </button>

                      {/* Active / Inactive Toggle */}
                      <button
                        onClick={() => handleToggleActive(playbook.id)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] transition-all ${
                          playbook.isActive
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-accent-emerald'
                            : 'bg-surface-base border-surface-border text-slate-400'
                        }`}
                      >
                        {playbook.isActive ? 'Active Pipeline' : 'Standby'}
                      </button>

                      {/* Test Execute Button */}
                      <button
                        disabled={isExecuting || !playbook.isActive}
                        onClick={() => handleRunPlaybook(playbook)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-[11px] transition-all shadow-glow-purple active:scale-95"
                      >
                        {isExecuting ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Orchestrating...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Test Execute</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Trigger Condition Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-base border border-surface-border text-xs mb-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-slate-400">Trigger Threshold:</span>
                      <span className="font-mono text-amber-300">{playbook.trigger.conditionDescription}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Executions: <strong className="text-white font-mono">{playbook.executionCount}</strong></span>
                      <span>Avg Latency: <strong className="text-cyan-300 font-mono">{playbook.meanExecutionTimeMs}ms</strong></span>
                      {playbook.lastExecutedTimestamp && (
                        <span>Last Run: <strong className="text-slate-300">{playbook.lastExecutedTimestamp}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Sequential Orchestration Steps */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Automated Containment Pipeline (Sequence)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {playbook.steps.map((step) => (
                        <div
                          key={step.id}
                          className="relative p-3.5 rounded-xl bg-surface-base/80 border border-surface-border flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                                STEP {step.order}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]" title={step.targetService}>
                                {step.targetService}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mb-1">{step.name}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{step.description}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-surface-border/60">
                            <span className="font-mono text-[10px] text-cyan-300 truncate block bg-black/40 px-2 py-1 rounded border border-surface-border">
                              {step.commandSnippet}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Time Execution Console Output */}
          {latestResult && (
            <div className="p-5 rounded-2xl bg-black/80 border border-purple-500/40 shadow-glow-purple space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">
                    Live SOAR Execution Audit Log: <span className="font-mono text-purple-300">[{latestResult.executionId}]</span>
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-accent-emerald font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Success in {latestResult.totalDurationMs}ms
                  </span>
                  <button
                    onClick={() => setLatestResult(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    Clear Log
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-base/90 border border-surface-border font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                {latestResult.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-7 border-t border-surface-border bg-surface-card/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
            <span>Autonomous Playbook Orchestrator v3.0 &bull; RFC-8610 Compliant</span>
          </div>
          <p className="font-mono text-[11px]">Zero-Intervention Threat Response Engine</p>
        </div>
      </div>
    </div>
  );
};
