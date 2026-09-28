import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Zap, 
  Search, 
  Sliders, 
  Compass, 
  BellRing,
  PlaneTakeoff
} from 'lucide-react';
import { AuthSessionEvent, IdentityUser, HaversineResult } from '../types/itdr';
import { 
  PRESET_LOCATIONS, 
  evaluateTravelVelocity 
} from '../services/itdrEngine';

interface ItdrModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: IdentityUser[];
  onUpdateUsers: (users: IdentityUser[]) => void;
  sessions: AuthSessionEvent[];
  onUpdateSessions: (sessions: AuthSessionEvent[]) => void;
}

type TabType = 'travel' | 'directory' | 'sandbox' | 'mfa';

export const ItdrModal: React.FC<ItdrModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUsers,
  sessions,
  onUpdateSessions
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('travel');
  const [searchQuery, setSearchQuery] = useState('');

  // Sandbox state
  const [cityAKey, setCityAKey] = useState<string>('dhaka');
  const [cityBKey, setCityBKey] = useState<string>('frankfurt');
  const [timeDeltaMinutes, setTimeDeltaMinutes] = useState<number>(15);

  // Compute sandbox velocity
  const sandboxResult: HaversineResult = useMemo(() => {
    const locA = PRESET_LOCATIONS[cityAKey] || PRESET_LOCATIONS.dhaka;
    const locB = PRESET_LOCATIONS[cityBKey] || PRESET_LOCATIONS.frankfurt;
    const now = Date.now();
    const timeA = now - timeDeltaMinutes * 60 * 1000;
    const timeB = now;
    return evaluateTravelVelocity(locA, timeA, locB, timeB);
  }, [cityAKey, cityBKey, timeDeltaMinutes]);

  if (!isOpen) return null;

  // Stats calculation
  const totalIdentities = users.length;
  const impossibleTravelCount = sessions.filter(s => s.isImpossibleTravel && s.status === 'active').length;
  const mfaFatigueCount = sessions.filter(s => s.isMfaFatigue && s.status === 'active').length;
  const revokedCount = sessions.filter(s => s.status === 'revoked').length;

  // Revoke session handler
  const handleRevokeSession = (sessionId: string) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'revoked' as const };
      }
      return s;
    });
    onUpdateSessions(updated);
  };

  // Toggle user lock handler
  const handleToggleLockUser = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          isLocked: !u.isLocked,
          riskLevel: u.isLocked ? ('medium' as const) : ('low' as const),
          riskScore: u.isLocked ? 45 : 10
        };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Filtered users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-card border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-surface-ground/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-glow-primary">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Identity Threat Detection &amp; Response (ITDR)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Haversine Velocity Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Impossible Travel Velocity Anomalies, MFA Push Bombing Fatigue &amp; Compromised Session Containment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3.5 bg-slate-900/60 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-slate-800">
            <Users className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-slate-400 text-[11px]">Monitored Identities</div>
              <div className="text-white font-mono font-bold text-sm">{totalIdentities} Corporate Users</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-rose-500/30">
            <PlaneTakeoff className="w-4 h-4 text-accent-rose animate-bounce" />
            <div>
              <div className="text-rose-400 text-[11px]">Impossible Travel Alerts</div>
              <div className="text-accent-rose font-mono font-bold text-sm">{impossibleTravelCount} Critical Violations</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-amber-500/30">
            <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <div className="text-amber-400 text-[11px]">MFA Push Bombing</div>
              <div className="text-amber-300 font-mono font-bold text-sm">{mfaFatigueCount} Fatigue Attacks</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-card/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            <div>
              <div className="text-emerald-400 text-[11px]">Revoked Rogue Sessions</div>
              <div className="text-accent-emerald font-mono font-bold text-sm">{revokedCount} Terminated</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('travel')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'travel'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>Impossible Travel Incidents ({sessions.filter(s => s.isImpossibleTravel).length})</span>
            {impossibleTravelCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {impossibleTravelCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'directory'
                ? 'border-accent-cyan text-accent-cyan bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Identity Directory &amp; Risk ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'sandbox'
                ? 'border-accent-purple text-accent-purple bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Haversine Velocity Sandbox v = d/Δt</span>
          </button>

          <button
            onClick={() => setActiveTab('mfa')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'mfa'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>MFA Fatigue &amp; Push Bombing</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: Impossible Travel Events */}
          {activeTab === 'travel' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User &amp; Timestamp</th>
                      <th className="py-3 px-4">Client Geolocation &amp; IP</th>
                      <th className="py-3 px-4">Device &amp; User Agent</th>
                      <th className="py-3 px-4">Haversine Velocity v = d/Δt</th>
                      <th className="py-3 px-4">Threat Verdict</th>
                      <th className="py-3 px-4 text-right">Containment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {sessions.map((ses) => (
                      <tr 
                        key={ses.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          ses.isImpossibleTravel && ses.status === 'active'
                            ? 'bg-rose-950/25'
                            : ses.status === 'revoked'
                            ? 'opacity-50 bg-slate-950/40'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs font-sans">{ses.userName}</div>
                          <div className="text-[10px] text-slate-400">{ses.email}</div>
                          <div className="text-[10px] text-indigo-300 mt-0.5">{ses.timestamp}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                            <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                            {ses.geo.city}, {ses.geo.country}
                          </div>
                          <div className="text-[10px] text-slate-400">{ses.geo.ip}</div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="text-slate-200 text-xs font-medium">{ses.device}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={ses.userAgent}>
                            {ses.userAgent}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {ses.calculatedVelocityKmh ? (
                            <div>
                              <span className={`font-bold ${
                                ses.calculatedVelocityKmh > 5000 
                                  ? 'text-accent-rose text-sm animate-pulse' 
                                  : 'text-amber-400'
                              }`}>
                                {ses.calculatedVelocityKmh.toLocaleString()} km/h
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {ses.travelDistanceKm?.toLocaleString()} km in {(ses.timeDeltaHours! * 60).toFixed(0)}m
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-sans">Baseline Location</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {ses.status === 'revoked' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Session Revoked
                            </span>
                          ) : ses.isImpossibleTravel ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-accent-rose border border-rose-500/40">
                              <ShieldAlert className="w-3 h-3" />
                              Critical Impossible Travel
                            </span>
                          ) : ses.isMfaFatigue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              MFA Push Bombing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
                              <ShieldCheck className="w-3 h-3" />
                              Normal Feasibility
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          {ses.status === 'active' && ses.isImpossibleTravel ? (
                            <button
                              onClick={() => handleRevokeSession(ses.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-glow-rose transition-all active:scale-95"
                            >
                              <Zap className="w-3 h-3" />
                              Revoke &amp; Force Reset
                            </button>
                          ) : ses.status === 'active' ? (
                            <button
                              onClick={() => handleRevokeSession(ses.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px]"
                            >
                              Terminate
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Contained</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Informational Banner */}
              <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-slate-300 flex items-start gap-2.5">
                <PlaneTakeoff className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-indigo-300">Physics-Based Identity Defense:</span> Impossible travel calculates the great-circle distance between consecutive logins for an account using the Haversine formula. When velocity exceeds 900 km/h (commercial aircraft cruising velocity), it indicates stolen session cookies, VPN relay compromises, or credential theft across geographically separated adversaries.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Corporate Directory & Risk */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, or department..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User Identity</th>
                      <th className="py-3 px-4">Department &amp; Role</th>
                      <th className="py-3 px-4">Last Active Location</th>
                      <th className="py-3 px-4">Identity Risk Score</th>
                      <th className="py-3 px-4 text-right">Account Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs font-sans flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            {user.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="text-slate-200 text-xs font-medium">{user.role}</div>
                          <div className="text-[10px] text-slate-400">{user.department}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-cyan-300 font-bold text-xs">{user.lastActiveCity}</div>
                          <div className="text-[10px] text-slate-400">{user.lastActiveIp}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              user.riskScore >= 75 
                                ? 'text-accent-rose' 
                                : user.riskScore >= 40 
                                ? 'text-amber-400' 
                                : 'text-accent-emerald'
                            }`}>
                              {user.riskScore}/100
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  user.riskScore >= 75 
                                    ? 'bg-rose-500 shadow-glow-rose' 
                                    : user.riskScore >= 40 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${user.riskScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => handleToggleLockUser(user.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              user.isLocked
                                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50'
                                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                            }`}
                          >
                            {user.isLocked ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Unlock Account</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Lock Account</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Haversine Sandbox */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              
              {/* City Selection and Time Delta Slider */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* City A */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-semibold block">
                    Origin Point A (Initial Login)
                  </label>
                  <select
                    value={cityAKey}
                    onChange={(e) => setCityAKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="dhaka">Dhaka, Bangladesh (23.81° N, 90.41° E)</option>
                    <option value="frankfurt">Frankfurt, Germany (50.11° N, 8.68° E)</option>
                    <option value="newyork">New York, USA (40.71° N, -74.00° W)</option>
                    <option value="tokyo">Tokyo, Japan (35.67° N, 139.65° E)</option>
                    <option value="london">London, UK (51.50° N, -0.12° W)</option>
                    <option value="sydney">Sydney, Australia (-33.86° S, 151.20° E)</option>
                  </select>
                </div>

                {/* City B */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-semibold block">
                    Destination Point B (Subsequent Login)
                  </label>
                  <select
                    value={cityBKey}
                    onChange={(e) => setCityBKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="frankfurt">Frankfurt, Germany (50.11° N, 8.68° E)</option>
                    <option value="dhaka">Dhaka, Bangladesh (23.81° N, 90.41° E)</option>
                    <option value="newyork">New York, USA (40.71° N, -74.00° W)</option>
                    <option value="tokyo">Tokyo, Japan (35.67° N, 139.65° E)</option>
                    <option value="london">London, UK (51.50° N, -0.12° W)</option>
                    <option value="sydney">Sydney, Australia (-33.86° S, 151.20° E)</option>
                  </select>
                </div>

                {/* Elapsed Time Delta */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 uppercase font-semibold">Elapsed Time (Δt)</span>
                    <span className="font-mono font-bold text-accent-cyan">{timeDeltaMinutes} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="180"
                    value={timeDeltaMinutes}
                    onChange={(e) => setTimeDeltaMinutes(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-3"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 min (Tor Relay)</span>
                    <span>60 min</span>
                    <span>180 min (3 hrs)</span>
                  </div>
                </div>

              </div>

              {/* Sandbox Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Distance Card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Haversine Great-Circle Distance</div>
                    <div className="mt-2 text-3xl font-extrabold font-mono text-cyan-300">
                      {sandboxResult.distanceKm.toLocaleString()} <span className="text-xs text-slate-400 font-sans">km</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Calculated using Earth mean radius R = 6,371 km across spherical arc coordinates.
                  </div>
                </div>

                {/* Velocity Card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Calculated Velocity (v = d/Δt)</div>
                    <div className={`mt-2 text-3xl font-extrabold font-mono ${
                      sandboxResult.isImpossible ? 'text-accent-rose animate-pulse' : 'text-accent-emerald'
                    }`}>
                      {sandboxResult.velocityKmh.toLocaleString()} <span className="text-xs text-slate-400 font-sans">km/h</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Aviation threshold: Commercial flight cruising limit = 900 km/h.
                  </div>
                </div>

                {/* Decision Verdict */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  sandboxResult.isImpossible
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : 'border-emerald-500/40 bg-emerald-500/10'
                }`}>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">ITDR Algorithm Decision</div>
                    <div className="mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        sandboxResult.isImpossible ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {sandboxResult.isImpossible ? 'IMPOSSIBLE TRAVEL ANOMALY' : 'NORMAL FEASIBLE TRAVEL'}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-200 leading-relaxed">
                      {sandboxResult.explanation}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 text-[10px] text-slate-400">
                    Automated Action: {sandboxResult.isImpossible ? 'Trigger Session Revoke + Password Reset' : 'Permit Session'}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: MFA Fatigue & Push Bombing */}
          {activeTab === 'mfa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-slate-200 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <div className="font-bold text-amber-300 text-sm mb-0.5">Active MFA Push Bombing Attack Intercepted</div>
                  <p className="leading-relaxed text-slate-300">
                    Adversary from IP <code className="font-mono text-white">45.33.32.88</code> has generated 18 consecutive MFA push prompts in 4 minutes targeting <span className="text-white font-bold">Marcus Vance</span> (Finance &amp; Billing Manager) hoping for prompt fatigue acceptance.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Target Identity</th>
                      <th className="py-3 px-4">MFA Prompts in 5m</th>
                      <th className="py-3 px-4">Attacker IP &amp; Geolocation</th>
                      <th className="py-3 px-4">Fatigue Anomaly Status</th>
                      <th className="py-3 px-4 text-right">Defense Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="bg-amber-950/20">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs font-sans">Marcus Vance</div>
                        <div className="text-[10px] text-slate-400">m.vance@nexus-security.io</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-accent-rose text-sm">18 prompts</span>
                        <div className="text-[10px] text-slate-400 font-sans">Threshold: &gt; 3 prompts / 5m</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white text-xs">45.33.32.88</div>
                        <div className="text-[10px] text-slate-400 font-sans">London, United Kingdom (TOR)</div>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          MFA Fatigue in Progress
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => alert('FIDO2 WebAuthn Hardware Key enforced for Marcus Vance. Push notifications suppressed.')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all active:scale-95 shadow-glow-amber"
                        >
                          Enforce FIDO2 Hardware Key
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-surface-ground/70 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>NexusAI ITDR &amp; Identity Mesh — Zero-Trust Continuous Geovelocity Verification</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
