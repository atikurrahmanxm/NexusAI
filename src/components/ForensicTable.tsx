import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  X,
  Globe,
  Hash
} from 'lucide-react';
import { SecurityEvent, IncidentStatus } from '../types/telemetry';

interface ForensicTableProps {
  events: SecurityEvent[];
  onUpdateEventStatus: (eventId: string, newStatus: IncidentStatus) => void;
}

export const ForensicTable: React.FC<ForensicTableProps> = ({ events, onUpdateEventStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedAttackType, setSelectedAttackType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // Filter and Search logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.sourceIp.includes(searchQuery) ||
        event.targetNode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity;
      const matchesType = selectedAttackType === 'all' || event.attackType === selectedAttackType;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [events, searchQuery, selectedSeverity, selectedAttackType]);

  // Export to CSV Functionality
  const handleExportCsv = () => {
    const headers = ['Incident ID', 'Timestamp', 'Source IP', 'Port', 'Protocol', 'Attack Type', 'Severity', 'Anomaly Score', 'Target Node', 'Status', 'Details'];
    const rows = filteredEvents.map(e => [
      e.id,
      e.timestamp,
      e.sourceIp,
      e.destinationPort,
      e.protocol,
      e.attackType,
      e.severity,
      e.anomalyScore,
      e.targetNode,
      e.status,
      `"${e.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexus_secops_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
      {/* Header and Controls */}
      <div className="p-5 border-b border-surface-border bg-surface/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white tracking-wide uppercase font-mono">
              Dataset Insights &amp; Forensic Investigation Table
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Query, filter, and audit deep packet inspection logs across distributed nodes
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-surface border border-surface-border hover:border-primary/50 text-slate-200 transition-all self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Export Audit (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3.5 bg-surface/60 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IP, Incident ID, node, or payload..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface-card border border-surface-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-surface-card border border-surface-border text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary text-xs"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <select
              value={selectedAttackType}
              onChange={(e) => setSelectedAttackType(e.target.value)}
              className="bg-surface-card border border-surface-border text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary text-xs"
            >
              <option value="all">Vector: All</option>
              <option value="DDoS">DDoS</option>
              <option value="SQLi">SQLi</option>
              <option value="BruteForce">BruteForce</option>
              <option value="Malware">Malware</option>
              <option value="PortScan">PortScan</option>
              <option value="Benign">Benign</option>
            </select>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Showing {filteredEvents.length} of {events.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-surface/80 text-slate-400 border-b border-surface-border text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">Incident ID</th>
              <th className="px-5 py-3 font-semibold">Source IP</th>
              <th className="px-5 py-3 font-semibold">Target Node</th>
              <th className="px-5 py-3 font-semibold">Attack Vector</th>
              <th className="px-5 py-3 font-semibold">Severity</th>
              <th className="px-5 py-3 font-semibold">Anomaly Score</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50 text-slate-300">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                  No forensic events match the active search or filter query.
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const isCritical = event.severity === 'critical';
                const isHigh = event.severity === 'high';

                return (
                  <tr key={event.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      {event.id}
                      <span className="block text-[10px] text-slate-500 font-normal">{event.timestamp}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-200">
                      {event.sourceIp}
                      <span className="block text-[10px] text-slate-500">{event.protocol}:{event.destinationPort}</span>
                    </td>
                    <td className="px-5 py-3.5 text-indigo-300">
                      {event.targetNode}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
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
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        isCritical 
                          ? 'bg-rose-500/15 text-accent-rose' 
                          : isHigh 
                          ? 'bg-amber-500/15 text-accent-amber' 
                          : 'bg-emerald-500/15 text-accent-emerald'
                      }`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      <span className={event.anomalyScore >= 7.0 ? 'text-accent-rose' : 'text-slate-300'}>
                        {event.anomalyScore}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] capitalize font-medium ${
                        event.status === 'mitigated' || event.status === 'resolved'
                          ? 'bg-emerald-500/10 text-accent-emerald border border-emerald-500/20'
                          : event.status === 'investigating'
                          ? 'bg-amber-500/10 text-accent-amber border border-amber-500/20'
                          : 'bg-rose-500/10 text-accent-rose border border-rose-500/20'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface border border-surface-border hover:border-primary text-indigo-300 hover:text-white transition-colors"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Forensic Modal / Investigation Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-mono">
                    Forensic Dossier: {selectedEvent.id}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">Ingested at {selectedEvent.timestamp} UTC</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface border border-transparent hover:border-surface-border transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface border border-surface-border">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Remote Origin</span>
                  <p className="text-white font-bold">{selectedEvent.sourceIp}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Target Cluster</span>
                  <p className="text-indigo-400 font-bold">{selectedEvent.targetNode}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Protocol &amp; Port</span>
                  <p className="text-slate-300 font-bold">{selectedEvent.protocol} on :{selectedEvent.destinationPort}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Anomaly Score</span>
                  <p className="text-accent-rose font-bold">{selectedEvent.anomalyScore} / 10.0</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Heuristic Telemetry Diagnosis
                </span>
                <div className="p-3 rounded-lg bg-surface border border-surface-border text-slate-300 leading-relaxed">
                  {selectedEvent.details}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Raw Packet Payload Signature Dump
                </span>
                <div className="p-3 rounded-lg bg-black/60 border border-surface-border text-[11px] text-accent-cyan font-mono overflow-x-auto">
                  <code>
                    0000  45 00 00 3c 1c 46 40 00  40 06 b1 e6 c0 a8 01 69   E..&lt;.F@.@......i<br/>
                    0010  c0 a8 01 01 04 00 00 50  00 00 00 00 a0 02 72 10   .......P......r.<br/>
                    0020  7a 6b 00 00 02 04 05 b4  01 03 03 08 01 01 04 02   zk..............
                  </code>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">Current Status: <strong className="text-white">{selectedEvent.status}</strong></span>
                <div className="flex items-center gap-2">
                  {selectedEvent.status !== 'mitigated' && (
                    <button
                      onClick={() => {
                        onUpdateEventStatus(selectedEvent.id, 'mitigated');
                        setSelectedEvent(prev => prev ? { ...prev, status: 'mitigated' } : null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                    >
                      Mark Mitigated
                    </button>
                  )}
                  {selectedEvent.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        onUpdateEventStatus(selectedEvent.id, 'resolved');
                        setSelectedEvent(prev => prev ? { ...prev, status: 'resolved' } : null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-xs transition-colors"
                    >
                      Resolve &amp; Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
