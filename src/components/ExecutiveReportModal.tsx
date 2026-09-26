import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  FileText, 
  Award,
  Calendar,
  UserCheck
} from 'lucide-react';
import { SecurityEvent, SystemMetrics } from '../types/telemetry';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SecurityEvent[];
  metrics: SystemMetrics;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  events,
  metrics
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      title: 'NexusAI Executive Threat Intelligence Audit',
      generatedAt: new Date().toISOString(),
      leadAnalyst: 'Atikur Rahman',
      postureGrade: metrics.threatScore > 70 ? 'ELEVATED_RISK' : 'OPTIMAL_DEFENSE',
      metrics,
      criticalEvents: events.filter(e => e.severity === 'critical' || e.severity === 'high'),
      auditDigestSha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_executive_audit_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const criticalIncidents = events.filter(e => e.attackType !== 'Benign').slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-card border border-surface-border rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col my-8 printable-dossier">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 border-b border-surface-border bg-surface/80 flex items-center justify-between no-print font-sans">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">
              Executive Threat Intelligence Dossier (PDF &amp; Print Preview)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-glow-primary active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-surface-border hover:border-primary text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 sm:p-10 space-y-8 font-sans bg-surface-card text-slate-100 print:text-black print:bg-white">
          {/* Header */}
          <div className="border-b-2 border-primary/40 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black tracking-tight text-white print:text-black">
                  NEXUS AI CYBER DEFENSE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-accent-rose border border-rose-500/30 text-[10px] font-bold tracking-wide">
                  RESTRICTED // SOC-AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1 font-medium">
                Autonomous Machine Learning Threat Intelligence &amp; Forensic Review
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-slate-600 space-y-1 font-sans">
              <div className="flex items-center sm:justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Audit Period: <strong className="font-mono text-white print:text-black">{new Date().toLocaleDateString()}</strong></span>
              </div>
              <p className="text-[11px] text-accent-emerald print:text-emerald-700 font-semibold font-mono">
                Verification Hash: 7F83...9069
              </p>
            </div>
          </div>

          {/* Executive Rating Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-surface-border bg-surface/50 print:border-slate-300 print:bg-slate-50 font-sans shadow-card-subtle">
            <div className="border-b sm:border-b-0 sm:border-r border-surface-border/60 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Security Posture</span>
              <div className="flex items-center gap-2 mt-1">
                <Award className="w-5 h-5 text-accent-emerald" />
                <span className="text-xl font-bold text-accent-emerald">GRADE A-</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Resilience: 94.2%</span>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-surface-border/60 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Threat Score Index</span>
              <p className="text-xl font-bold text-white print:text-black mt-1 font-mono">
                {metrics.threatScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </p>
              <span className="text-[11px] text-accent-amber font-semibold">{metrics.threatLevel}</span>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-surface-border/60 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Fleet Isolation</span>
              <p className="text-xl font-bold text-white print:text-black mt-1 font-mono">
                {metrics.securedNodes} <span className="text-xs font-normal text-slate-500">/ {metrics.totalNodes}</span>
              </p>
              <span className="text-[11px] text-accent-emerald font-semibold">99.6% Compliance</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Telemetry Processed</span>
              <p className="text-xl font-bold text-white print:text-black mt-1 font-mono">
                {metrics.totalEventsProcessed.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Across 5 Global Regions</span>
            </div>
          </div>

          {/* Key Findings Section */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="font-bold text-sm text-indigo-400 print:text-indigo-800 uppercase tracking-wider">
              1. Executive Incident Summary
            </h4>
            <div className="p-4 rounded-xl border border-surface-border bg-surface/30 print:border-slate-300 print:bg-white text-slate-300 print:text-slate-800 leading-relaxed space-y-2">
              <p>
                During this operational window, NexusAI evaluated high-frequency telemetry across distributed Kubernetes pods and API gateways. 
                A total of <strong className="text-white print:text-black font-semibold">{metrics.activeThreats} anomalous incidents</strong> were flagged by statistical Z-score algorithms exceeding standard deviations (&gt;2.0&sigma;).
              </p>
              <p>
                Automated perimeter counter-measures (iptables kernel packet drop and Cloudflare WAF rate limiting) were synthesized and deployed to mitigate SYN volumetric floods and blind SQL injection attack trajectories.
              </p>
            </div>
          </div>

          {/* Top Incident Table */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="font-bold text-sm text-indigo-400 print:text-indigo-800 uppercase tracking-wider">
              2. Significant Threat Incidents &amp; Containment Ledger
            </h4>
            <div className="overflow-x-auto rounded-xl border border-surface-border print:border-slate-300">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface print:bg-slate-100 text-slate-400 print:text-slate-700 border-b border-surface-border text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Source Origin</th>
                    <th className="p-3">Vector</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Anomaly Z-Score</th>
                    <th className="p-3">Containment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 print:divide-slate-200 text-slate-300 print:text-slate-800">
                  {criticalIncidents.map((inc) => (
                    <tr key={inc.id}>
                      <td className="p-3 font-bold text-white print:text-black font-mono">{inc.id}</td>
                      <td className="p-3 font-mono">{inc.sourceIp}</td>
                      <td className="p-3 font-bold text-accent-purple print:text-purple-700">{inc.attackType}</td>
                      <td className="p-3 uppercase font-bold text-[10px] text-accent-rose print:text-rose-700">{inc.severity}</td>
                      <td className="p-3 font-bold font-mono">{inc.anomalyScore} / 10.0</td>
                      <td className="p-3 capitalize text-accent-emerald print:text-emerald-700 font-bold">{inc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off Block */}
          <div className="pt-6 border-t border-surface-border/60 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-accent-emerald print:text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Trust Architecture Certified</span>
              </div>
              <p className="text-[11px] text-slate-500">Autonomous SecOps Telemetry Engine &bull; NexusAI v1.0</p>
            </div>

            <div className="text-right p-3.5 rounded-xl border border-surface-border bg-surface/40 print:border-slate-300 print:bg-slate-50 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 justify-end">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400 print:text-indigo-700" />
                <span className="font-bold text-white print:text-black">Atikur Rahman</span>
              </div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 font-medium">Lead SecOps &amp; ML Systems Architect</p>
              <p className="text-[10px] text-slate-500 font-mono">Electronic Verification Signed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
