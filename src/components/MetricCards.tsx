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
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface p-5 hover:border-accent-purple/60 hover:shadow-glow-primary transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Active Threats</span>
          <div className="p-2.5 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.activeThreats}
          </span>
          <span className="inline-flex items-center text-xs font-bold text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +{metrics.threatDeltaPercentage}%
          </span>
        </div>

        <div className="mt-3.5 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-accent-purple via-indigo-500 to-accent-rose h-full rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${Math.min(100, metrics.activeThreats * 15)}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-slate-400 font-normal">Real-time unmitigated attack vectors</p>
      </div>

      {/* 2. Data Anomalies */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface p-5 hover:border-accent-cyan/60 hover:shadow-glow-cyan transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Data Anomalies</span>
          <div className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.dataAnomalies}
          </span>
          <span className="text-xs font-bold text-accent-emerald bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            ML Flagged
          </span>
        </div>

        <div className="mt-3.5 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-accent-cyan to-accent-emerald h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, metrics.dataAnomalies * 20)}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-slate-400 font-normal">Statistical outlier spikes detected</p>
      </div>

      {/* 3. Threat Score Gauge */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface p-5 hover:border-primary/60 hover:shadow-glow-primary transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Threat Score</span>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.threatScore}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
          
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-auto tracking-wide ${
            metrics.threatLevel === 'CRITICAL' || metrics.threatLevel === 'HIGH'
              ? 'bg-rose-500/15 text-accent-rose border border-rose-500/30'
              : metrics.threatLevel === 'ELEVATED'
              ? 'bg-amber-500/15 text-accent-amber border border-amber-500/30'
              : 'bg-emerald-500/15 text-accent-emerald border border-emerald-500/30'
          }`}>
            {metrics.threatLevel}
          </span>
        </div>

        <div className="mt-3.5 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.threatScore > 70 
                ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                : 'bg-gradient-to-r from-indigo-500 via-primary to-accent-cyan'
            }`}
            style={{ width: `${metrics.threatScore}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-slate-400 font-normal">Cumulative risk assessment index</p>
      </div>

      {/* 4. Secured Nodes */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface p-5 hover:border-accent-emerald/60 hover:shadow-glow-emerald transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Secured Nodes</span>
          <div className="p-2.5 rounded-xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 group-hover:scale-105 transition-transform">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.securedNodes.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            / {metrics.totalNodes.toLocaleString()}
          </span>
        </div>

        <div className="mt-3.5 w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-accent-emerald h-full rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${(metrics.securedNodes / metrics.totalNodes) * 100}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-slate-400 font-normal">99.6% fleet isolation compliance</p>
      </div>
    </div>
  );
};
