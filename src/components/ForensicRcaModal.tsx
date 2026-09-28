import React, { useState } from 'react';
import { 
  Network, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  FileText, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { 
  IncidentCase, 
  KillChainPhase 
} from '../types/forensicRca';
import { 
  calculateRcaSummary, 
  markCaseResolved, 
  generateRcaMarkdownReport 
} from '../services/forensicRcaEngine';

interface ForensicRcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: IncidentCase[];
  onUpdateCases: (cases: IncidentCase[]) => void;
}

export const ForensicRcaModal: React.FC<ForensicRcaModalProps> = ({
  isOpen,
  onClose,
  cases,
  onUpdateCases
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'case-01');
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  if (!isOpen) return null;

  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const summary = calculateRcaSummary(cases);

  const handleResolve = (id: string) => {
    const updated = markCaseResolved(cases, id);
    onUpdateCases(updated);
  };

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedArtifactId(id);
    setTimeout(() => setCopiedArtifactId(null), 2000);
  };

  const handleExportReport = () => {
    if (!currentCase) return;
    const reportMd = generateRcaMarkdownReport(currentCase);
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(reportMd);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentCase.caseNumber.toLowerCase()}_rca_dossier.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyReport = () => {
    if (!currentCase) return;
    navigator.clipboard.writeText(generateRcaMarkdownReport(currentCase));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const getPhaseColor = (phase: KillChainPhase) => {
    switch (phase) {
      case 'RECONNAISSANCE': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'INITIAL_ACCESS': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'EXECUTION': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'LATERAL_MOVEMENT': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'CONTAINMENT': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/80 bg-surface-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-accent-rose shadow-glow-rose">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Incident Forensics &amp; Root Cause Analysis (RCA)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
                  Kill-Chain Graph
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reconstructed intrusion path, blast radius containment perimeter &amp; cryptographic forensic evidence vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export RCA (MD)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-surface-border text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">Investigated Incident Cases</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-white">{summary.totalCases}</span>
                <span className="text-[11px] text-accent-emerald font-sans">({summary.containedCases} Contained)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">100% boundary isolation</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-300">Mean Time to Remediation</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-emerald">{summary.avgMttrSeconds}s</span>
                <span className="text-[11px] text-emerald-400/80 font-sans">Autonomous SOAR</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">vs 45 min manual MTTR</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-cyan-500/20 bg-cyan-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-cyan-300">Average Blast Radius</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-cyan">{summary.avgBlastRadiusScore}%</span>
                <span className="text-[11px] text-cyan-400/80 font-sans">Controlled</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">Zero-trust containment mesh</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-purple-500/20 bg-purple-500/5 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-purple-300">Cryptographic Artifacts</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-accent-purple">{summary.totalArtifactsSecured}</span>
                <span className="text-[11px] text-purple-400/80 font-sans">Evidence Files</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">SHA-256 chained digests</p>
            </div>
          </div>

          {/* Incident Case Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-accent-rose" />
                Active Forensic Incident Dossiers
              </h3>
              <span className="text-[11px] text-slate-500">Select an incident to reconstruct attack timeline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {cases.map(c => {
                const isSelected = selectedCaseId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 rounded-xl bg-surface-card border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-rose-500 ring-1 ring-rose-500/50 shadow-glow-rose' 
                        : 'border-surface-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-surface-border">
                        {c.caseNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        c.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                        c.severity === 'HIGH' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {c.severity}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-2 hover:text-rose-300">
                      {c.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-surface-border/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-accent-cyan" />
                        MTTR: {c.mttrSeconds}s
                      </span>
                      <span className={`font-semibold ${c.status === 'RESOLVED' ? 'text-accent-emerald' : 'text-accent-cyan'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentCase && (
            <>
              {/* Blast Radius & Root Cause Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-accent-rose" />
                      Blast Radius &amp; Impact Assessment
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      Score: {currentCase.blastRadiusScore} / 100
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentCase.blastRadiusScore}%` }}
                    />
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">Impacted Boundary Assets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCase.impactedAssets.map(asset => (
                        <span key={asset} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-rose-300 border border-rose-500/20">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed pt-2 border-t border-surface-border/60">
                    <strong className="text-slate-200">Root Cause Analysis:</strong> {currentCase.rootCauseDescription}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-2">Incident Metadata</span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Case ID:</span>
                        <span className="font-mono text-white font-semibold">{currentCase.caseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Investigator:</span>
                        <span className="text-slate-200">{currentCase.leadInvestigator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Detected:</span>
                        <span className="font-mono text-slate-300">{currentCase.detectedAt} UTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contained:</span>
                        <span className="font-mono text-accent-emerald">{currentCase.containedAt} UTC</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                    {currentCase.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleResolve(currentCase.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-emerald active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign Off &amp; Mark Resolved</span>
                      </button>
                    ) : (
                      <div className="w-full text-center py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-accent-emerald text-xs font-bold">
                        Incident Resolved &amp; Archived
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reconstructed Cyber Kill-Chain Graph Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-accent-cyan" />
                    Reconstructed Cyber Kill-Chain Timeline
                  </h3>
                  <span className="text-[11px] text-slate-500">Sequential adversary execution and mitigation progression</span>
                </div>

                <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                  {currentCase.timelineEvents.map((event, idx) => (
                    <div key={event.id} className="relative pl-10">
                      {/* Step Circle */}
                      <div className="absolute left-2.5 top-3.5 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-[9px] font-mono text-cyan-300 font-bold z-10">
                        {idx + 1}
                      </div>

                      <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-slate-600 transition-all space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getPhaseColor(event.phase)}`}>
                              {event.phase}
                            </span>
                            <span className="font-mono text-xs font-bold text-white">
                              {event.action}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-mono text-[11px] text-slate-400">
                              {event.timestamp}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              event.status === 'NEUTRALIZED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              event.status === 'BLOCKED' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1 text-slate-400">
                          <div>
                            <span className="text-slate-500 block">Threat Actor / Trigger:</span>
                            <span className="font-mono text-slate-200">{event.actor}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Target Resource:</span>
                            <span className="font-mono text-rose-300">{event.targetResource}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">MITRE Technique:</span>
                            <span className="font-mono text-indigo-400 font-semibold">{event.mitreTechnique}</span>
                          </div>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed pt-1.5 border-t border-surface-border/50">
                          {event.technicalDetails}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Forensic Artifacts Vault */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent-purple" />
                    Cryptographic Forensic Artifacts Vault
                  </h3>
                  <button
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReport ? 'Copied Full Report!' : 'Copy RCA Dossier'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentCase.artifacts.map(art => (
                    <div key={art.id} className="p-3.5 rounded-xl bg-surface-card border border-surface-border space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                            {art.type}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{art.sizeBytes}</span>
                        </div>

                        <h4 className="text-xs font-bold text-white font-mono truncate mb-1">
                          {art.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {art.details}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-surface-border/60">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>SHA-256 Digest:</span>
                          <button
                            onClick={() => handleCopyHash(art.id, art.hashSha256)}
                            className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                          >
                            {copiedArtifactId === art.id ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedArtifactId === art.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-1.5 rounded bg-slate-950 font-mono text-[10px] text-slate-400 truncate">
                          {art.hashSha256}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-surface-border bg-surface-card/40 text-xs text-slate-400">
          <span>NexusAI Forensic RCA Engine &bull; Incident Post-Mortem &bull; Lead Investigator: Atikur Rahman</span>
          <span className="font-mono text-accent-cyan">Status: Incident Concluded</span>
        </div>
      </div>
    </div>
  );
};
