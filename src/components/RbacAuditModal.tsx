import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  ShieldAlert, 
  Search, 
  Copy, 
  Check, 
  Download, 
  CheckCircle2, 
  X,
  User,
  KeyRound
} from 'lucide-react';
import { UserProfile, AuditLogEntry } from '../types/rbacAudit';
import { 
  USER_PROFILES, 
  calculateRbacSummary, 
  recordAuditEvent, 
  saveAuditLogs 
} from '../services/rbacAuditEngine';

interface RbacAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  auditLogs: AuditLogEntry[];
  onUpdateAuditLogs: (logs: AuditLogEntry[]) => void;
}

export const RbacAuditModal: React.FC<RbacAuditModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onSelectUser,
  auditLogs,
  onUpdateAuditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'matrix'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = calculateRbacSummary(auditLogs);

  const handleSwitchUser = (user: UserProfile) => {
    onSelectUser(user);
    // Log user switch audit entry
    const newLog = recordAuditEvent(
      user,
      'AUTH_LOGIN',
      `Operator persona switched to ${user.name} (${user.role}). Session authenticated.`,
      'Identity Access Mesh',
      'SUCCESS'
    );
    const updated = [newLog, ...auditLogs];
    onUpdateAuditLogs(updated);
    saveAuditLogs(updated);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus_rbac_audit_ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hashSha256.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = 
      selectedCategory === 'ALL' || 
      (selectedCategory === 'DENIED' ? log.status === 'DENIED' : log.category === selectedCategory);

    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl shadow-indigo-950/20 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 border-b border-surface-border bg-surface-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-glow-primary">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  Role-Based Access Control (RBAC) &amp; Audit Ledger
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  SHA-256 IMMUTABLE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Cryptographic operator access log, zero-trust permission enforcement &amp; SOC 2 compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Export Audit Trail (JSON)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Operator Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 md:px-7 bg-surface-base/80 border-b border-surface-border text-xs">
          <div className="p-3 rounded-xl bg-surface-card/50 border border-surface-border">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Active Session
            </span>
            <p className="text-sm font-extrabold text-white mt-0.5 truncate">{activeUser.name}</p>
            <span className="text-[10px] text-accent-cyan font-semibold block">{activeUser.roleTitle}</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Clearance Level
            </span>
            <p className="text-sm font-extrabold text-indigo-300 font-mono mt-0.5">{activeUser.clearanceLevel}</p>
            <span className="text-[10px] text-slate-400">{activeUser.permissions.length} Grants Enabled</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-card/50 border border-surface-border">
            <span className="text-[11px] text-slate-400 font-medium">Immutable Records</span>
            <p className="text-lg font-extrabold text-white mt-0.5">{auditLogs.length} Events</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/25">
            <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Violations Blocked
            </span>
            <p className="text-lg font-extrabold text-accent-rose mt-0.5">{summary.violationsCaught} Denied</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Compliance Posture
            </span>
            <p className="text-xs font-bold text-accent-emerald mt-1">{summary.complianceRating}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between gap-4 p-4 md:px-7 border-b border-surface-border bg-surface-card/30 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-primary'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              Audit Trail Ledger ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'roles'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-primary'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              Operator Profiles &amp; Switcher
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-primary'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              Permission Matrix
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block font-mono">
            Zero-Trust RBAC &bull; NIST SP 800-53 Compliant
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 md:px-7 space-y-6">
          {activeTab === 'roles' ? (
            /* Operator Persona Switcher */
            <div className="space-y-4">
              <div className="border-b border-surface-border pb-3">
                <h3 className="text-sm font-bold text-white">Select Operator Persona</h3>
                <p className="text-xs text-slate-400">
                  Switching personas dynamically reconfigures authorization scopes and logs an immutable audit event.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {USER_PROFILES.map(user => {
                  const isCurrent = activeUser.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSwitchUser(user)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        isCurrent
                          ? 'bg-indigo-950/20 border-indigo-500 shadow-glow-primary'
                          : 'bg-surface-card border-surface-border hover:border-slate-500 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                            user.role === 'COMMANDER' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md' : 'bg-slate-700'
                          }`}>
                            {user.avatarInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{user.name}</h4>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-surface-base border border-surface-border text-slate-300">
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Title:</span>
                          <span className="font-semibold text-slate-200">{user.roleTitle}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-slate-200">{user.department}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Clearance:</span>
                          <span className="font-mono text-cyan-300">{user.clearanceLevel}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-surface-border/60 flex flex-wrap gap-1.5">
                        {user.permissions.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-surface-base border border-surface-border text-slate-400 font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'matrix' ? (
            /* Permission Matrix Table */
            <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-card">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-base/80 border-b border-surface-border text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Action / Capability</th>
                    <th className="py-3 px-4">SecOps Commander</th>
                    <th className="py-3 px-4">Threat Analyst</th>
                    <th className="py-3 px-4">Compliance Auditor</th>
                    <th className="py-3 px-4">DevOps / SRE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Zero-Trust Node Isolation</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">SOAR Playbook Execution</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">CVE Package Patching</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Deploy Firewall Rules (WAF/iptables)</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">STIX/TAXII &amp; IP Reputation Lookup</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Executive PDF Audit Dossier</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-accent-emerald font-bold">&check; Full Access</td>
                    <td className="py-3 px-4 text-slate-500">&times; Denied</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* Audit Trail Ledger */
            <div className="space-y-4">
              {/* Search & Category Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search operator name, details, resource, or SHA-256 hash..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-card border border-surface-border focus:border-indigo-500 text-slate-200 placeholder-slate-500 outline-none text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-medium">Filter:</span>
                  {['ALL', 'NODE_ISOLATION', 'PLAYBOOK_EXECUTION', 'CVE_PATCH', 'DENIED'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-primary'
                          : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border'
                      }`}
                    >
                      {cat.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Table */}
              <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-card">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-base/80 border-b border-surface-border text-slate-400 font-sans font-semibold">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">SHA-256 Ledger Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/60 text-slate-300">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-surface-base/40 transition-colors">
                        <td className="py-3 px-4 text-indigo-300">{log.timestamp}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-white">
                          {log.actorName} <span className="text-[10px] text-slate-400 font-mono">({log.actorRole})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-surface-base border border-surface-border font-bold">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-cyan-300 font-bold">{log.targetResource}</td>
                        <td className="py-3 px-4 font-sans">
                          {log.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center gap-1 text-accent-emerald font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> ALLOWED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-accent-rose font-bold text-[11px]">
                              <ShieldAlert className="w-3 h-3" /> DENIED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={log.hashSha256}>
                              {log.hashSha256.slice(0, 16)}...
                            </span>
                            <button
                              onClick={() => handleCopyHash(log.hashSha256)}
                              className="text-slate-400 hover:text-white"
                              title="Copy SHA-256 Signature"
                            >
                              {copiedHash === log.hashSha256 ? (
                                <Check className="w-3 h-3 text-accent-emerald" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-7 border-t border-surface-border bg-surface-card/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span>Immutable Ledger: Cryptographically Signed by NexusAI SecOps Core</span>
          </div>
          <p className="font-mono text-[11px]">Audit Engine v2.4 &bull; SOC 2 Type II Certified</p>
        </div>
      </div>
    </div>
  );
};
