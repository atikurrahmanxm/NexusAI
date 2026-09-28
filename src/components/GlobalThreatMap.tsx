import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Radio, 
  Crosshair, 
  Zap, 
  Compass, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
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

type MapProjectionView = 'GEOSPATIAL' | 'POLAR_RADAR';

export const GlobalThreatMap: React.FC<GlobalThreatMapProps> = ({ events }) => {
  const [selectedVector, setSelectedVector] = useState<ActiveAttackVector | null>(null);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [projectionView, setProjectionView] = useState<MapProjectionView>('GEOSPATIAL');
  const [mitigatedVectors, setMitigatedVectors] = useState<Set<string>>(new Set());

  const vectors = extractAttackVectors(events);
  const countryMetrics = computeCountryMetrics(events);
  const targetClusters = Object.values(PROTECTED_CLUSTERS);

  // Auto-select latest critical vector if none selected
  useEffect(() => {
    if (!selectedVector && vectors.length > 0) {
      const crit = vectors.find(v => v.severity === 'critical') || vectors[0];
      setSelectedVector(crit);
    }
  }, [vectors, selectedVector]);

  const handleMitigate = (vectorId: string) => {
    setMitigatedVectors(prev => new Set(prev).add(vectorId));
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 overflow-hidden shadow-card-subtle font-sans">
      {/* 1. Header & Live Radar Controls */}
      <div className="p-4 sm:p-5 border-b border-surface-border bg-surface/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-glow-primary">
            <Globe className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-wide uppercase">
                Global Cyber Threat Radar &amp; Attack Map
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-accent-rose border border-rose-500/30 text-[10px] font-mono font-bold">
                DEFCON 2 // WAR ROOM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Real-time ballistic trajectory projection of inbound distributed attack vectors
            </p>
          </div>
        </div>

        {/* View Controls & Sweep Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
          {/* Projection Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-background border border-surface-border text-xs font-mono">
            <button
              onClick={() => setProjectionView('GEOSPATIAL')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
                projectionView === 'GEOSPATIAL'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Geospatial Grid
            </button>
            <button
              onClick={() => setProjectionView('POLAR_RADAR')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
                projectionView === 'POLAR_RADAR'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Polar Scope
            </button>
          </div>

          {/* Radar Sweep Toggle */}
          <button
            onClick={() => setIsAnimationActive(!isAnimationActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shadow-sm font-mono text-[11px] ${
              isAnimationActive 
                ? 'bg-emerald-500/15 text-accent-emerald border-emerald-500/40 shadow-glow-emerald' 
                : 'bg-surface text-slate-400 border-surface-border'
            }`}
            title="Toggle Live 360° Radar Sweep Scanner"
          >
            <Radio className={`w-3.5 h-3.5 ${isAnimationActive ? 'animate-pulse text-accent-emerald' : 'text-slate-500'}`} />
            <span>{isAnimationActive ? 'RADAR: SWEEP ACTIVE' : 'RADAR: PAUSED'}</span>
          </button>

          {/* Active Vectors Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-slate-300 font-mono text-[11px]">
            <span className="text-slate-400">Threat Ingress: </span>
            <span className="text-accent-rose font-bold">{vectors.length} Vectors</span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Realistic Map Projection Canvas + Country Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-surface-border">
        {/* Realistic World Map Canvas (3 Columns on lg) */}
        <div className="lg:col-span-3 p-3 sm:p-5 relative bg-[#070B14] flex flex-col justify-between min-h-[460px]">
          {/* SVG Map Container */}
          <div className="relative w-full h-[380px] rounded-xl overflow-hidden bg-[#050811] border border-surface-border/70 shadow-inner">
            {/* Background High-Tech Tactical Dot Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* REALISTIC HIGH-PRECISION WORLD CONTINENTS SVG */}
            <svg 
              viewBox="0 0 1000 500" 
              className="absolute inset-0 w-full h-full object-fill select-none"
            >
              <defs>
                {/* Laser Arc Gradients */}
                <linearGradient id="critLaserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#FB7185" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="warnLaserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#A78BFA" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                </linearGradient>

                {/* Radar Sweep Radial Gradient */}
                <radialGradient id="radarSonarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.15" />
                  <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Geographic Coordinate Lines (Equator, Prime Meridian, Tropics) */}
              <g className="opacity-25 stroke-cyan-500/40" strokeWidth="0.75" strokeDasharray="4 4">
                {/* Equator (0° Latitude) */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#06B6D4" strokeWidth="1" />
                {/* Prime Meridian (0° Longitude) */}
                <line x1="500" y1="0" x2="500" y2="500" stroke="#06B6D4" strokeWidth="1" />
                {/* Tropic of Cancer (23.5° N) */}
                <line x1="0" y1="185" x2="1000" y2="185" stroke="#6366F1" />
                {/* Tropic of Capricorn (23.5° S) */}
                <line x1="0" y1="315" x2="1000" y2="315" stroke="#6366F1" />
                {/* Arctic / Antarctic Circles */}
                <line x1="0" y1="65" x2="1000" y2="65" />
                <line x1="0" y1="435" x2="1000" y2="435" />
                {/* Longitudinal Meridiens every 60 degrees */}
                <line x1="166" y1="0" x2="166" y2="500" />
                <line x1="333" y1="0" x2="333" y2="500" />
                <line x1="666" y1="0" x2="666" y2="500" />
                <line x1="833" y1="0" x2="833" y2="500" />
              </g>

              {/* Coordinate Labels */}
              <g className="fill-slate-500 font-mono text-[8px] select-none opacity-50">
                <text x="8" y="246">0° EQUATOR</text>
                <text x="504" y="16">0° MERIDIAN (UTC)</text>
                <text x="8" y="181">23.5°N TROPIC</text>
                <text x="8" y="311">23.5°S TROPIC</text>
                <text x="170" y="492">120°W</text>
                <text x="337" y="492">60°W</text>
                <text x="670" y="492">60°E</text>
                <text x="837" y="492">120°E</text>
              </g>

              {/* REALISTIC CONTINENTS (Authentic Coastlines & Geography) */}
              <g 
                fill="#111B2C" 
                stroke="#243859" 
                strokeWidth="1.2" 
                className="transition-colors duration-300"
              >
                {/* 1. NORTH AMERICA (Alaska, Canada, Hudson Bay, Contiguous US, Mexico, Central America) */}
                <path d="M 75,95 L 90,80 L 115,70 L 135,65 L 160,55 L 185,55 L 200,75 L 215,95 L 225,100 L 240,90 L 255,105 L 250,135 L 265,145 L 275,130 L 290,145 L 310,135 L 330,125 L 345,145 L 335,160 L 315,180 L 305,200 L 300,240 L 305,270 L 285,270 L 275,255 L 250,260 L 235,245 L 220,265 L 210,295 L 230,310 L 255,330 L 270,360 L 290,370 L 300,375 L 285,380 L 265,365 L 240,335 L 215,315 L 195,290 L 180,250 L 170,210 L 155,175 L 140,150 L 110,125 L 85,115 Z" />

                {/* 2. GREENLAND */}
                <path d="M 360,40 L 390,30 L 430,35 L 440,65 L 420,95 L 390,110 L 365,100 L 355,70 Z" />

                {/* 3. CARIBBEAN (Cuba & Hispaniola) */}
                <path d="M 280,285 L 305,280 L 315,285 L 290,290 Z M 320,290 L 340,295 L 335,302 Z" />

                {/* 4. SOUTH AMERICA (Andes, Brazil Bulge, Amazon, Patagonia, Tierra del Fuego) */}
                <path d="M 300,380 L 335,370 L 370,375 L 405,395 L 445,415 L 440,445 L 415,480 L 385,505 L 360,520 L 335,510 L 315,490 L 305,450 L 310,410 L 295,365 L 285,340 L 295,320 Z" />

                {/* 5. EUROPE (UK, Ireland, Scandinavia, France, Iberia, Italy Boot, Greece, Black Sea) */}
                <path d="M 450,190 L 460,180 L 490,175 L 515,170 L 530,160 L 550,140 L 565,130 L 585,120 L 610,115 L 615,145 L 600,170 L 615,185 L 635,180 L 635,210 L 610,215 L 590,225 L 565,230 L 545,215 L 535,230 L 525,200 L 505,195 L 485,190 L 465,225 L 450,220 Z" />
                {/* British Isles (Great Britain & Ireland) */}
                <path d="M 485,125 L 500,120 L 505,145 L 495,160 L 480,155 Z" />
                <path d="M 465,135 L 475,130 L 475,150 L 465,145 Z" />
                {/* Scandinavia (Norway, Sweden, Finland) */}
                <path d="M 525,60 L 550,55 L 575,65 L 565,95 L 545,125 L 525,120 L 515,90 Z" />

                {/* 6. AFRICA (Morocco, Egypt, Horn of Africa, Cape of Good Hope, Gulf of Guinea) */}
                <path d="M 455,235 L 490,225 L 530,230 L 575,230 L 605,245 L 630,285 L 665,305 L 645,340 L 630,385 L 605,435 L 570,470 L 540,475 L 515,435 L 510,380 L 485,340 L 440,325 L 420,295 L 435,260 Z" />
                {/* Madagascar */}
                <path d="M 650,395 L 665,390 L 670,440 L 655,445 Z" />

                {/* 7. ASIA & MIDDLE EAST (Arabia, India Subcontinent, Indochina, China, Siberia) */}
                <path d="M 615,115 L 650,110 L 700,90 L 750,75 L 820,70 L 890,75 L 945,85 L 975,70 L 960,110 L 935,135 L 905,145 L 870,165 L 845,185 L 850,215 L 830,225 L 805,255 L 775,260 L 780,315 L 755,255 L 735,280 L 710,330 L 690,265 L 665,250 L 640,260 L 635,310 L 605,245 L 615,215 L 635,210 L 635,180 L 615,145 Z" />
                {/* Sri Lanka */}
                <circle cx="720" cy="342" r="6" />
                {/* Japan Archipelago (Honshu, Hokkaido, Kyushu) */}
                <path d="M 890,165 L 915,160 L 905,195 L 880,220 L 868,210 L 880,185 Z" />
                {/* Maritime Southeast Asia (Indonesia, Borneo, Philippines) */}
                <path d="M 770,340 L 810,345 L 815,365 L 775,360 Z" />
                <path d="M 825,325 L 845,330 L 840,355 L 825,345 Z" />
                <path d="M 845,275 L 860,285 L 850,320 L 840,305 Z" />

                {/* 8. AUSTRALIA & OCEANIA */}
                <path d="M 785,405 L 820,370 L 855,370 L 875,395 L 885,430 L 865,465 L 825,465 L 785,440 Z" />
                {/* Tasmania */}
                <path d="M 860,480 L 875,480 L 870,495 L 860,490 Z" />
                {/* New Zealand */}
                <path d="M 930,440 L 945,455 L 935,470 Z" />
                <path d="M 920,470 L 935,490 L 915,500 Z" />
              </g>

              {/* Concentric Distance Sonar Rings (Polar Scope / Radar Range Rings) */}
              <g className="stroke-cyan-500/20 fill-none" strokeWidth="0.8">
                <circle cx="500" cy="250" r="90" strokeDasharray="3 3" />
                <circle cx="500" cy="250" r="180" strokeDasharray="3 3" />
                <circle cx="500" cy="250" r="270" strokeDasharray="4 4" />
                <circle cx="500" cy="250" r="360" strokeDasharray="4 4" />
                <line x1="480" y1="250" x2="520" y2="250" stroke="#06B6D4" strokeWidth="1.5" />
                <line x1="500" y1="230" x2="500" y2="270" stroke="#06B6D4" strokeWidth="1.5" />
              </g>

              {/* 360-DEGREE ROTATING RADAR SWEEP CONE */}
              {isAnimationActive && (
                <g className="origin-center" style={{ transformOrigin: '500px 250px' }}>
                  <path
                    d="M 500,250 L 900,100 A 400 400 0 0 1 900,400 Z"
                    fill="url(#radarSonarGlow)"
                    className="origin-center animate-[spin_8s_linear_infinite]"
                    style={{ transformOrigin: '500px 250px' }}
                  />
                  <line
                    x1="500"
                    y1="250"
                    x2="900"
                    y2="250"
                    stroke="#06B6D4"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    className="origin-center animate-[spin_8s_linear_infinite]"
                    style={{ transformOrigin: '500px 250px' }}
                  />
                </g>
              )}

              {/* BALLISTIC ATTACK TRAJECTORY ARCS & PHOTON MISSILES */}
              {vectors.map((vec, idx) => {
                const x1 = vec.sourceLocation.xPercent * 10;
                const y1 = vec.sourceLocation.yPercent * 5;
                const x2 = vec.targetLocation.xPercent * 10;
                const y2 = vec.targetLocation.yPercent * 5;

                // High arc ballistic curve
                const mx = (x1 + x2) / 2;
                const dist = Math.hypot(x2 - x1, y2 - y1);
                const my = Math.min(y1, y2) - Math.min(90, Math.max(30, dist * 0.22));

                const isCrit = vec.severity === 'critical';
                const strokeColor = isCrit ? '#F43F5E' : '#8B5CF6';
                const isSelected = selectedVector?.id === vec.id;
                const isMitigated = mitigatedVectors.has(vec.id);
                const pathId = `arc-${vec.id}-${idx}`;
                const pathData = `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`;

                return (
                  <g 
                    key={vec.id} 
                    className="cursor-pointer group" 
                    onClick={() => setSelectedVector(vec)}
                  >
                    {/* Trajectory Definition for Motion Animation */}
                    <path
                      id={pathId}
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2.5' : isMitigated ? '1' : '1.5'}
                      strokeOpacity={isSelected ? 0.9 : isMitigated ? 0.2 : 0.45}
                      strokeDasharray={isMitigated ? '4 4' : undefined}
                    />

                    {/* Animated Moving Laser Pulse / Ballistic Photon Missile */}
                    {isAnimationActive && !isMitigated && (
                      <>
                        {/* Trailing Energy Pulse */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={isCrit ? '#FDA4AF' : '#C4B5FD'}
                          strokeWidth="2.5"
                          strokeDasharray="16 48"
                          className="opacity-75"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="64;0"
                            dur={`${Math.max(1.4, 2.6 - idx * 0.15)}s`}
                            repeatCount="indefinite"
                          />
                        </path>

                        {/* Photon Missile Head */}
                        <circle r={isCrit ? 4 : 3} fill={isCrit ? '#F43F5E' : '#06B6D4'}>
                          <animateMotion
                            path={pathData}
                            dur={`${Math.max(1.4, 2.6 - idx * 0.15)}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}

              {/* TARGET CLUSTER INTERCEPT HUBS (Protected Nodes) */}
              {targetClusters.map((cluster) => {
                const cx = cluster.xPercent * 10;
                const cy = cluster.yPercent * 5;
                return (
                  <g key={cluster.id} className="cursor-pointer group">
                    {/* Intercept Shockwave Pulse */}
                    <circle cx={cx} cy={cy} r="18" fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.3">
                      <animate attributeName="r" values="8;24" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0" dur="2.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Center Protected Beacon */}
                    <circle cx={cx} cy={cy} r="6" fill="#0D1322" stroke="#06B6D4" strokeWidth="2" />
                    <circle cx={cx} cy={cy} r="2.5" fill="#06B6D4" />
                  </g>
                );
              })}

              {/* ATTACKING ADVERSARY ORIGIN BEACONS */}
              {vectors.map((vec) => {
                const sx = vec.sourceLocation.xPercent * 10;
                const sy = vec.sourceLocation.yPercent * 5;
                const isCrit = vec.severity === 'critical';
                const isSelected = selectedVector?.id === vec.id;

                return (
                  <g 
                    key={`source-${vec.id}`} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedVector(vec)}
                  >
                    {/* Danger Pulsing Ring */}
                    <circle cx={sx} cy={sy} r="12" fill="none" stroke={isCrit ? '#F43F5E' : '#8B5CF6'} strokeWidth="1" opacity="0.4">
                      <animate attributeName="r" values="4;16" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
                    </circle>

                    {/* Center Core Node */}
                    <circle 
                      cx={sx} 
                      cy={sy} 
                      r={isSelected ? 5.5 : 4} 
                      fill={isCrit ? '#F43F5E' : '#8B5CF6'} 
                      stroke="#FFFFFF" 
                      strokeWidth="1.2" 
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tactical Compass Rose (Top Right HUD) */}
            <div className="absolute top-3 right-3 p-2 rounded-xl bg-surface/80 border border-surface-border text-[10px] font-mono text-slate-400 flex items-center gap-2 select-none shadow-md backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-accent-cyan animate-spin" style={{ animationDuration: '24s' }} />
              <span>RADAR 360° // N 52° 22'</span>
            </div>

            {/* Intercept Defense Status (Top Left HUD) */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-surface/85 border border-surface-border text-[10px] font-mono text-slate-300 flex items-center gap-2 select-none shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>PERIMETER ZERO-TRUST ACTIVE</span>
            </div>
          </div>

          {/* 3. Interactive Target Lock / Forensic HUD Card */}
          {selectedVector ? (
            <div className="mt-3 p-4 rounded-xl bg-surface/90 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-sans shadow-glow-rose backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-accent-rose">
                  <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold tracking-wide">TARGET LOCK:</span>
                    <span className="font-mono text-rose-300 font-bold">{selectedVector.sourceIp}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-border text-slate-300">
                      {selectedVector.sourceLocation.country} ({selectedVector.sourceLocation.countryCode})
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-indigo-300 font-semibold">{selectedVector.targetLocation.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>Vector: <strong className="text-white">{selectedVector.attackType}</strong></span>
                    <span>&bull;</span>
                    <span>Severity: <strong className="text-accent-rose uppercase">{selectedVector.severity}</strong></span>
                    <span>&bull;</span>
                    <span>Trajectory Coordinates: <strong>{selectedVector.sourceLocation.xPercent * 3.6 - 180}°E, {90 - selectedVector.sourceLocation.yPercent * 1.8}°N</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {mitigatedVectors.has(selectedVector.id) ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-accent-emerald border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Null-Routed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleMitigate(selectedVector.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-rose transition-all cursor-pointer active:scale-95"
                    title="Deploy automated BGP blackhole drop rule"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Drop Vector</span>
                  </button>
                )}

                <button 
                  onClick={() => setSelectedVector(null)}
                  className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface border border-surface-border transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-xl bg-surface/50 border border-surface-border/60 text-xs font-medium text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                Click on any ballistic trajectory or adversary node to inspect tactical forensics.
              </span>
              <span className="text-accent-emerald font-semibold">&bull; Global Edge Defense Synced (0.8ms)</span>
            </div>
          )}

          {/* 4. Live Attack Interception Ticker (War Room Log) */}
          <div className="mt-2.5 p-2 rounded-lg bg-[#040711] border border-surface-border/60 flex items-center gap-2.5 overflow-hidden text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-accent-rose font-bold shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-ping" />
              LIVE INTERCEPTS:
            </span>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-400">
              {vectors.slice(0, 4).map((v, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{v.sourceIp}</span>
                  <span className="text-slate-500">({v.sourceLocation.countryCode})</span>
                  <span className="text-accent-rose">&rarr;</span>
                  <span className="text-indigo-300 font-semibold">{v.targetLocation.name}</span>
                  <span className="text-accent-cyan">[{v.attackType}]</span>
                  <span className="text-accent-emerald font-bold">CONTAINED</span>
                  {i < 3 && <span className="text-slate-700">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Attacking Nations Leaderboard (1 Column on lg) */}
        <div className="p-4 sm:p-5 bg-surface/30 flex flex-col justify-between font-sans text-xs space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">Top Attack Origins</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-accent-rose font-bold">
                  LIVE
                </span>
              </div>
              <span className="text-slate-500 text-[11px] font-medium font-mono">By Volume</span>
            </div>

            <div className="divide-y divide-surface-border/40 mt-1">
              {countryMetrics.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between group hover:bg-surface/40 px-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-slate-500 font-bold text-xs font-mono">{idx + 1}.</span>
                    <div>
                      <p className="text-slate-100 font-bold text-xs flex items-center gap-1.5">
                        <span>{item.country}</span>
                        <span className="text-[10px] font-mono text-slate-400">({item.countryCode})</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Top: <span className="font-medium text-accent-purple">{item.topVector}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-accent-rose font-bold text-xs">{item.count} hits</span>
                    <p className="text-[10px] text-slate-400">{item.percentage}% load</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous BGP Advisory Card */}
          <div className="p-3.5 rounded-xl bg-surface/70 border border-surface-border text-xs text-slate-400 leading-relaxed shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                BGP Autonomous Shield
              </span>
              <span className="text-[9px] font-mono text-accent-emerald font-bold">AUTO-ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Layer 3/4 flowspec filters deployed across Tier-1 transit providers to blackhole malicious volumetric prefixes automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
