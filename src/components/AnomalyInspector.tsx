import React, { useState } from 'react';
import { Cpu, Sliders, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { SecurityEvent } from '../types/telemetry';
import { analyzeEventsForAnomalies } from '../services/anomalyDetection';

interface AnomalyInspectorProps {
  events: SecurityEvent[];
}

export const AnomalyInspector: React.FC<AnomalyInspectorProps> = ({ events }) => {
  const [sensitivityThreshold, setSensitivityThreshold] = useState<number>(2.0);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { reports, baseline } = analyzeEventsForAnomalies(events, sensitivityThreshold);
  const anomaliesOnly = reports.filter(r => r.isAnomaly);
  const selectedReport = reports.find(r => r.eventId === selectedReportId) || anomaliesOnly[0] || reports[0];

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-surface-border bg-surface/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-white tracking-wide uppercase font-mono">
              Machine Learning Outlier &amp; Anomaly Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time parametric Z-Score detection algorithm: <span className="font-mono text-indigo-300">Z = (X - &mu;) / &sigma;</span>
          </p>
        </div>

        {/* Statistical Baseline Chips */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border">
            <span className="text-slate-500">Mean (&mu;): </span>
            <span className="text-accent-cyan font-bold">{baseline.mean}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border">
            <span className="text-slate-500">StdDev (&sigma;): </span>
            <span className="text-accent-purple font-bold">{baseline.stdDev}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border">
            <span className="text-slate-500">Outliers: </span>
            <span className="text-accent-rose font-bold">{anomaliesOnly.length} / {events.length}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Sensitivity Slider */}
      <div className="px-5 py-3.5 bg-surface/70 border-b border-surface-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-300">Detection Sensitivity Threshold:</span>
          <input
            type="range"
            min="1.0"
            max="3.5"
            step="0.1"
            value={sensitivityThreshold}
            onChange={(e) => setSensitivityThreshold(parseFloat(e.target.value))}
            className="w-40 accent-indigo-500 cursor-pointer"
          />
          <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
            {sensitivityThreshold.toFixed(1)}&sigma;
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Events exceeding {sensitivityThreshold}&sigma; standard deviations are flagged as anomalies.</span>
        </div>
      </div>

      {/* Main Grid: Outlier Table + Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-surface-border">
        {/* Outlier Events List (2 Cols) */}
        <div className="lg:col-span-2 max-h-80 overflow-y-auto divide-y divide-surface-border/40">
          {reports.map((report) => {
            const isSelected = selectedReport?.eventId === report.eventId;

            return (
              <div
                key={report.eventId}
                onClick={() => setSelectedReportId(report.eventId)}
                className={`px-5 py-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                  isSelected 
                    ? 'bg-indigo-500/15 border-l-2 border-primary' 
                    : 'hover:bg-surface/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${
                    report.isAnomaly 
                      ? 'bg-rose-500/10 text-accent-rose' 
                      : 'bg-emerald-500/10 text-accent-emerald'
                  }`}>
                    {report.isAnomaly ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{report.eventId}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{report.sourceIp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{report.recommendedAction}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <div className="text-right">
                    <span className="text-slate-400">Score: </span>
                    <span className="font-bold text-slate-200">{report.observedValue}</span>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      report.isAnomaly
                        ? 'bg-rose-500/15 text-accent-rose border border-rose-500/20'
                        : 'bg-emerald-500/15 text-accent-emerald border border-emerald-500/20'
                    }`}>
                      {report.zScore > 0 ? `+${report.zScore}` : report.zScore}&sigma;
                    </span>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSelected ? 'translate-x-1 text-primary' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic Inspector Sidebar (1 Col) */}
        {selectedReport ? (
          <div className="p-5 bg-surface/30 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
              <span className="text-slate-400">ML INSPECTION</span>
              <span className="px-2 py-0.5 rounded bg-surface border border-surface-border text-indigo-400 font-bold">
                {selectedReport.eventId}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Calculated Z-Score:</span>
                <span className={`font-bold ${selectedReport.isAnomaly ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                  {selectedReport.zScore > 0 ? `+${selectedReport.zScore}` : selectedReport.zScore}&sigma;
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline Mean (&mu;):</span>
                <span className="text-slate-200">{selectedReport.mean}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Std Deviation (&sigma;):</span>
                <span className="text-slate-200">{selectedReport.standardDeviation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="text-accent-cyan font-bold">{selectedReport.confidencePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Classification:</span>
                <span className={`font-bold ${selectedReport.isAnomaly ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                  {selectedReport.isAnomaly ? 'ANOMALOUS OUTLIER' : 'NORMAL TRAFFIC'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border/60">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Recommended Response</p>
              <div className="p-2.5 rounded-lg bg-surface border border-surface-border text-slate-200 text-[11px] leading-relaxed">
                {selectedReport.recommendedAction}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-accent-emerald">
              <CheckCircle2 className="w-3 h-3" />
              <span>Model verification certified against threshold</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
