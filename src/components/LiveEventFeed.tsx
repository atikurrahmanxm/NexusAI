import React from 'react';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { SecurityEvent } from '../types/telemetry';

interface LiveEventFeedProps {
  events: SecurityEvent[];
  onTriggerSimulation: () => void;
}

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ events, onTriggerSimulation }) => {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-rose"></span>
          </span>
          <h3 className="font-semibold text-sm text-slate-100">Live Security Event Stream</h3>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-surface border border-surface-border">
            {events.length} Events Logged
          </span>
        </div>

        <button
          onClick={onTriggerSimulation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-md shadow-primary/20 active:scale-95"
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
                <div className={`p-2 rounded-lg ${
                  isCritical 
                    ? 'bg-rose-500/10 text-accent-rose' 
                    : isHigh 
                    ? 'bg-amber-500/10 text-accent-amber' 
                    : 'bg-indigo-500/10 text-indigo-400'
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
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
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
                    <span className="text-slate-400 text-[11px]">&bull; {event.protocol}:{event.destinationPort}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{event.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto font-mono text-[11px]">
                <div className="text-right">
                  <span className="text-slate-300 font-semibold">{event.sourceIp}</span>
                  <p className="text-slate-500 text-[10px]">&rarr; {event.targetNode}</p>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    isCritical 
                      ? 'bg-rose-500/15 text-accent-rose' 
                      : isHigh 
                      ? 'bg-amber-500/15 text-accent-amber' 
                      : 'bg-emerald-500/15 text-accent-emerald'
                  }`}>
                    {event.severity}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Anomaly: {event.anomalyScore}</p>
                </div>

                <span className="text-slate-500 text-[10px] min-w-[50px] text-right">
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
