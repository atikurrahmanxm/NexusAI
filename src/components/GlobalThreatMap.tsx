import React, { useState } from 'react';
import { Globe, Shield, Radio, Crosshair } from 'lucide-react';
import { SecurityEvent } from '../types/telemetry';
import { 
  PROTECTED_CLUSTERS, 
  extractAttackVectors, 
  computeCountryMetrics 
} from '../services/geoIpEngine';
import { ActiveAttackVector } from '../types/geomap';

interface GlobalThreatMapProps {
  events: SecurityEvent[];
}

export const GlobalThreatMap: React.FC<GlobalThreatMapProps> = ({ events }) => {
  const [selectedVector, setSelectedVector] = useState<ActiveAttackVector | null>(null);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  const vectors = extractAttackVectors(events);
  const countryMetrics = computeCountryMetrics(events);
  const targetClusters = Object.values(PROTECTED_CLUSTERS);

  return (
    <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 overflow-hidden shadow-card-subtle font-sans">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-surface-border bg-surface/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white tracking-wide uppercase">
              Global Cyber Threat Radar &amp; Attack Map
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Real-time geospatial trajectory projection of inbound attack vectors
          </p>
        </div>

        {/* Live Radar Toggle */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => setIsAnimationActive(!isAnimationActive)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all shadow-sm ${
              isAnimationActive 
                ? 'bg-emerald-500/10 text-accent-emerald border-emerald-500/30 shadow-glow-emerald' 
                : 'bg-surface text-slate-400 border-surface-border'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isAnimationActive ? 'animate-pulse text-accent-emerald' : 'text-slate-500'}`} />
            <span>{isAnimationActive ? 'RADAR: LIVE SWEEP' : 'RADAR: PAUSED'}</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-slate-300">
            <span className="text-slate-400">Active Vectors: </span>
            <span className="text-accent-rose font-bold font-mono ml-1">{vectors.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map Canvas + Country Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-surface-border">
        {/* World Map SVG Projection (3 Cols on lg) */}
        <div className="lg:col-span-3 p-4 sm:p-6 relative bg-background/50 flex flex-col justify-between min-h-[380px]">
          {/* SVG Map Container */}
          <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[#070B14] border border-surface-border/50">
            {/* Grid Matrix Background Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* World Continents Stylized Silhouette */}
            <svg 
              viewBox="0 0 1000 500" 
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            >
              {/* North America */}
              <path d="M120,80 Q200,60 280,110 Q320,180 260,240 Q190,260 140,200 Z" fill="#1F2E45" />
              {/* South America */}
              <path d="M250,260 Q340,280 320,400 Q270,460 220,380 Z" fill="#1F2E45" />
              {/* Europe */}
              <path d="M450,80 Q560,70 540,160 Q480,180 430,130 Z" fill="#1F2E45" />
              {/* Africa */}
              <path d="M460,190 Q580,200 560,350 Q480,390 440,270 Z" fill="#1F2E45" />
              {/* Asia */}
              <path d="M570,70 Q820,60 840,220 Q700,280 580,170 Z" fill="#1F2E45" />
              {/* Australia */}
              <path d="M750,330 Q860,340 840,430 Q740,420 730,360 Z" fill="#1F2E45" />
            </svg>

            {/* Attack Vector Laser Trajectory Arcs */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {vectors.map((vec) => {
                const x1 = vec.sourceLocation.xPercent * 10;
                const y1 = vec.sourceLocation.yPercent * 5;
                const x2 = vec.targetLocation.xPercent * 10;
                const y2 = vec.targetLocation.yPercent * 5;
                // Control curve midpoint
                const mx = (x1 + x2) / 2;
                const my = Math.min(y1, y2) - 40;

                const isCrit = vec.severity === 'critical';
                const strokeColor = isCrit ? '#F43F5E' : '#8B5CF6';

                return (
                  <g key={vec.id} className="cursor-pointer pointer-events-auto" onClick={() => setSelectedVector(vec)}>
                    {/* Background faint arc */}
                    <path
                      d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      strokeOpacity="0.35"
                    />

                    {/* Animated moving trajectory dash */}
                    {isAnimationActive && (
                      <path
                        d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        strokeDasharray="8 24"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Protected Cluster Hubs (Targets) */}
            {targetClusters.map((cluster) => (
              <div
                key={cluster.id}
                style={{ left: `${cluster.xPercent}%`, top: `${cluster.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-accent-cyan opacity-40" />
                  <div className="w-5 h-5 rounded-full bg-surface border-2 border-accent-cyan flex items-center justify-center text-accent-cyan shadow-lg shadow-cyan-500/50">
                    <Shield className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Hub Label */}
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-card border border-surface-border text-[10px] font-mono px-2 py-0.5 rounded text-white shadow-xl z-20">
                  {cluster.name} ({cluster.countryCode})
                </div>
              </div>
            ))}

            {/* Active Attacking Origin Nodes (Sources) */}
            {vectors.map((vec) => (
              <div
                key={vec.id}
                onClick={() => setSelectedVector(vec)}
                style={{ left: `${vec.sourceLocation.xPercent}%`, top: `${vec.sourceLocation.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-500 opacity-75" />
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white flex items-center justify-center shadow-lg shadow-rose-500/50" />
                </div>

                {/* Source IP Tooltip */}
                <div className="hidden group-hover:block absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-card border border-rose-500/40 text-[10px] font-mono px-2 py-0.5 rounded text-white shadow-xl z-30">
                  {vec.sourceIp} &bull; {vec.attackType}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Vector Details Bar */}
          {selectedVector ? (
            <div className="mt-3 p-3.5 rounded-xl bg-surface/90 border border-rose-500/40 flex items-center justify-between text-xs font-sans shadow-glow-rose">
              <div className="flex items-center gap-2.5">
                <Crosshair className="w-4 h-4 text-accent-rose animate-spin" />
                <span className="text-slate-200">
                  <strong className="text-white">Target Lock:</strong> <span className="font-mono text-rose-300">{selectedVector.sourceIp}</span> ({selectedVector.sourceLocation.country}) &rarr; <span className="text-indigo-300 font-semibold">{selectedVector.targetLocation.name}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-accent-rose font-bold text-[10px] uppercase tracking-wide border border-rose-500/30">
                  {selectedVector.attackType} ({selectedVector.severity})
                </span>
              </div>
              <button 
                onClick={() => setSelectedVector(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg hover:bg-surface transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="mt-3 text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Hover or click on any attack trajectory to inspect remote origin telemetry.</span>
              <span className="text-accent-emerald font-semibold">&bull; Global Edge Defense Synced</span>
            </div>
          )}
        </div>

        {/* Top Attacking Nations Leaderboard (1 Col on lg) */}
        <div className="p-5 bg-surface/30 flex flex-col justify-between font-sans text-xs space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Top Attack Origins</span>
              <span className="text-slate-500 text-xs font-medium">By Volume</span>
            </div>

            <div className="divide-y divide-surface-border/40 mt-1">
              {countryMetrics.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-slate-500 font-bold text-xs">{idx + 1}.</span>
                    <div>
                      <p className="text-slate-100 font-bold text-xs">{item.country}</p>
                      <p className="text-[11px] text-slate-400">Vector: <span className="font-medium text-slate-300">{item.topVector}</span></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-accent-rose font-bold font-mono">{item.count} attacks</span>
                    <p className="text-[11px] text-slate-400">{item.percentage}% fleet load</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-surface-border text-xs text-slate-400 leading-relaxed shadow-sm">
            <span className="text-indigo-300 font-bold block mb-1">Geofencing Advisory</span>
            Automated BGP rate-limiting recommended on highest attack origin subnets.
          </div>
        </div>
      </div>
    </div>
  );
};
