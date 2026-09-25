import React from 'react';
import { ShieldAlert, Activity, Gauge, Server, ArrowUpRight } from 'lucide-react';
import { SystemMetrics } from '../types/telemetry';

interface MetricCardsProps {
  metrics: SystemMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Threats */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-surface-card p-5 hover:border-accent-purple/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Threats</span>
          <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.activeThreats}
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-accent-rose bg-accent-rose/10 px-1.5 py-0.5 rounded">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            +{metrics.threatDeltaPercentage}%
          </span>
        </div>

        <div className="mt-3 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-accent-purple to-accent-rose h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, metrics.activeThreats * 15)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400 font-mono">Real-time unmitigated attack vectors</p>
      </div>

      {/* 2. Data Anomalies */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-surface-card p-5 hover:border-accent-cyan/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Data Anomalies</span>
          <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.dataAnomalies}
          </span>
          <span className="text-xs font-mono text-accent-emerald bg-emerald-500/10 px-1.5 py-0.5 rounded">
            ML Flagged
          </span>
        </div>

        <div className="mt-3 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-accent-cyan to-accent-emerald h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, metrics.dataAnomalies * 20)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400 font-mono">Statistical outlier spikes detected</p>
      </div>

      {/* 3. Threat Score Gauge */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-surface-card p-5 hover:border-primary/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Threat Score</span>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.threatScore}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ml-auto ${
            metrics.threatLevel === 'CRITICAL' || metrics.threatLevel === 'HIGH'
              ? 'bg-rose-500/10 text-accent-rose border border-rose-500/20'
              : metrics.threatLevel === 'ELEVATED'
              ? 'bg-amber-500/10 text-accent-amber border border-amber-500/20'
              : 'bg-emerald-500/10 text-accent-emerald border border-emerald-500/20'
          }`}>
            {metrics.threatLevel}
          </span>
        </div>

        <div className="mt-3 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.threatScore > 70 
                ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                : 'bg-gradient-to-r from-indigo-500 to-accent-cyan'
            }`}
            style={{ width: `${metrics.threatScore}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400 font-mono">Cumulative risk assessment index</p>
      </div>

      {/* 4. Secured Nodes */}
      <div className="relative overflow-hidden rounded-xl border border-surface-border bg-surface-card p-5 hover:border-accent-emerald/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Secured Nodes</span>
          <div className="p-2 rounded-lg bg-accent-emerald/10 text-accent-emerald">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.securedNodes.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            / {metrics.totalNodes.toLocaleString()}
          </span>
        </div>

        <div className="mt-3 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-accent-emerald h-full rounded-full transition-all duration-500" 
            style={{ width: `${(metrics.securedNodes / metrics.totalNodes) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400 font-mono">99.6% fleet isolation compliance</p>
      </div>
    </div>
  );
};
