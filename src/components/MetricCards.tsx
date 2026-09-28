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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Active Threats</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-border text-accent-purple font-bold">LIVE</span>
          </div>
          <div className="p-2.5 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {metrics.activeThreats}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded-full font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{metrics.threatDeltaPercentage}%
            </span>
          </div>
          
          {/* Micro Histogram Sparkline */}
          <div className="flex items-end gap-1 h-6 w-20 pb-0.5">
            {[35, 50, 40, 65, 55, 80, 70, 90, 85, 95].map((val, idx) => (
              <div 
                key={idx} 
                className="flex-1 rounded-xs bg-purple-500/30 group-hover:bg-accent-purple transition-all duration-300"
                style={{ height: `${val}%` }}
                title={`Vector ${idx + 1}: ${val}% load`}
              />
            ))}
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Data Anomalies</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-border text-accent-cyan font-bold">Z-SCORE</span>
          </div>
          <div className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {metrics.dataAnomalies}
            </span>
            <span className="text-xs font-bold text-accent-emerald bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              ML 3.2σ
            </span>
          </div>

          {/* Micro Histogram Sparkline */}
          <div className="flex items-end gap-1 h-6 w-20 pb-0.5">
            {[45, 30, 70, 50, 60, 40, 85, 60, 75, 90].map((val, idx) => (
              <div 
                key={idx} 
                className="flex-1 rounded-xs bg-cyan-500/30 group-hover:bg-accent-cyan transition-all duration-300"
                style={{ height: `${val}%` }}
                title={`Residual ${idx + 1}: ${val}%`}
              />
            ))}
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Threat Score</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-border text-primary-light font-bold">INDEX</span>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {metrics.threatScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
            
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ml-1 tracking-wide font-mono ${
              metrics.threatLevel === 'CRITICAL' || metrics.threatLevel === 'HIGH'
                ? 'bg-rose-500/15 text-accent-rose border border-rose-500/30'
                : metrics.threatLevel === 'ELEVATED'
                ? 'bg-amber-500/15 text-accent-amber border border-amber-500/30'
                : 'bg-emerald-500/15 text-accent-emerald border border-emerald-500/30'
            }`}>
              {metrics.threatLevel}
            </span>
          </div>

          {/* Micro Histogram Sparkline */}
          <div className="flex items-end gap-1 h-6 w-20 pb-0.5">
            {[20, 35, 45, 55, 60, 50, 70, 65, 80, metrics.threatScore].map((val, idx) => (
              <div 
                key={idx} 
                className="flex-1 rounded-xs bg-indigo-500/30 group-hover:bg-primary-light transition-all duration-300"
                style={{ height: `${Math.min(100, val)}%` }}
                title={`Risk point ${idx + 1}: ${val}`}
              />
            ))}
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Secured Nodes</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-border text-accent-emerald font-bold">HEALTH</span>
          </div>
          <div className="p-2.5 rounded-xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 group-hover:scale-105 transition-transform">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {metrics.securedNodes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {metrics.totalNodes.toLocaleString()}
            </span>
          </div>

          {/* Micro Histogram Sparkline */}
          <div className="flex items-end gap-1 h-6 w-20 pb-0.5">
            {[90, 95, 92, 98, 97, 96, 99, 98, 100, 99].map((val, idx) => (
              <div 
                key={idx} 
                className="flex-1 rounded-xs bg-emerald-500/30 group-hover:bg-accent-emerald transition-all duration-300"
                style={{ height: `${val}%` }}
                title={`Uptime ${idx + 1}: ${val}%`}
              />
            ))}
          </div>
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
