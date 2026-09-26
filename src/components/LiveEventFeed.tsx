import React from 'react';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { SecurityEvent } from '../types/telemetry';

interface LiveEventFeedProps {
  events: SecurityEvent[];
  onTriggerSimulation: () => void;
}

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ events, onTriggerSimulation }) => {
  return (
    <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 overflow-hidden shadow-card-subtle font-sans">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-rose"></span>
          </span>
          <h3 className="font-bold text-sm text-slate-100 tracking-wide">Live Security Event Stream</h3>
          <span className="text-xs font-semibold text-slate-400 px-2.5 py-0.5 rounded-full bg-surface border border-surface-border">
            <strong className="font-mono text-white mr-1">{events.length}</strong> Events Logged
          </span>
        </div>

        <button
          onClick={onTriggerSimulation}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-glow-primary active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Simulate Attack Vector</span>
        </button>
      </div>

      {/* Events Table / List */}
      <div className="divide-y divide-surface-border/50 max-h-96 overflow-y-auto">
        {events.map((event) => {
          const isCritical = event.severity === 'critical';
          const isHigh = event.severity === 'high';

          return (
            <div 
              key={event.id}
              className="px-5 py-3.5 hover:bg-surface/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  isCritical 
                    ? 'bg-rose-500/10 text-accent-rose border border-rose-500/20' 
                    : isHigh 
                    ? 'bg-amber-500/10 text-accent-amber border border-amber-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {event.attackType === 'Benign' ? (
                    <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">{event.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      event.attackType === 'DDoS'
                        ? 'bg-purple-500/10 text-accent-purple border border-purple-500/20'
                        : event.attackType === 'SQLi'
                        ? 'bg-rose-500/10 text-accent-rose border border-rose-500/20'
                        : event.attackType === 'BruteForce'
                        ? 'bg-amber-500/10 text-accent-amber border border-amber-500/20'
                        : event.attackType === 'Malware'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}>
                      {event.attackType}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">&bull; <span className="font-mono">{event.protocol}:{event.destinationPort}</span></span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1 font-normal">{event.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto text-xs font-sans">
                <div className="text-right">
                  <span className="text-slate-200 font-mono font-semibold">{event.sourceIp}</span>
                  <p className="text-slate-400 text-[11px] font-medium">&rarr; {event.targetNode}</p>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wide ${
                    isCritical 
                      ? 'bg-rose-500/15 text-accent-rose border border-rose-500/30' 
                      : isHigh 
                      ? 'bg-amber-500/15 text-accent-amber border border-amber-500/30' 
                      : 'bg-emerald-500/15 text-accent-emerald border border-emerald-500/30'
                  }`}>
                    {event.severity}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Anomaly: <span className="font-mono font-bold text-slate-300">{event.anomalyScore}</span></p>
                </div>

                <span className="text-slate-500 text-xs font-mono min-w-[50px] text-right">
                  {event.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
