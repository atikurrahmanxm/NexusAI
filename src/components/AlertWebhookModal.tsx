import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  X, 
  Plus, 
  Trash2, 
  Terminal, 
  Clock, 
  Activity, 
  Check, 
  Layers
} from 'lucide-react';
import { WebhookConfig, DispatchedAlertRecord, WebhookChannel, AlertTriggerLevel } from '../types/alertWebhook';
import { SecurityEvent } from '../types/telemetry';
import { 
  loadWebhooks, 
  saveWebhooks, 
  loadDispatchedLogs, 
  saveDispatchedLogs, 
  toggleWebhookActive, 
  deleteWebhook, 
  addCustomWebhook, 
  calculateWebhookSummary, 
  simulateDispatchAlert 
} from '../services/webhookAlertEngine';

interface AlertWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestEvent?: SecurityEvent;
}

export const AlertWebhookModal: React.FC<AlertWebhookModalProps> = ({
  isOpen,
  onClose,
  latestEvent
}) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(loadWebhooks);
  const [logs, setLogs] = useState<DispatchedAlertRecord[]>(loadDispatchedLogs);
  const [isAdding, setIsAdding] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [previewPayload, setPreviewPayload] = useState<{ channel: string; payload: object } | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'history'>('endpoints');

  // Form State
  const [formName, setFormName] = useState('');
  const [formChannel, setFormChannel] = useState<WebhookChannel>('SLACK');
  const [formUrl, setFormUrl] = useState('');
  const [formTrigger, setFormTrigger] = useState<AlertTriggerLevel>('HIGH_AND_CRITICAL');

  if (!isOpen) return null;

  const summary = calculateWebhookSummary(webhooks);

  const handleToggle = (id: string) => {
    const updated = toggleWebhookActive(webhooks, id);
    setWebhooks(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this webhook notification endpoint?')) {
      const updated = deleteWebhook(webhooks, id);
      setWebhooks(updated);
    }
  };

  const handleSendTest = (webhook: WebhookConfig) => {
    setDispatchingId(webhook.id);
    setTimeout(() => {
      const { updatedWebhook, record, mockPreviewPayload } = simulateDispatchAlert(webhook, latestEvent);
      
      const newWebhooks = webhooks.map(w => w.id === webhook.id ? updatedWebhook : w);
      setWebhooks(newWebhooks);
      saveWebhooks(newWebhooks);

      const newLogs = [record, ...logs];
      setLogs(newLogs);
      saveDispatchedLogs(newLogs);

      setPreviewPayload({ channel: webhook.channel, payload: mockPreviewPayload });
      setDispatchingId(null);
    }, 450);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;

    const updated = addCustomWebhook(webhooks, {
      name: formName.trim(),
      channel: formChannel,
      endpointUrl: formUrl.trim(),
      triggerLevel: formTrigger,
      isEnabled: true
    });

    setWebhooks(updated);
    setIsAdding(false);
    setFormName('');
    setFormUrl('');
  };

  const getChannelColor = (channel: WebhookChannel) => {
    switch (channel) {
      case 'SLACK': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'DISCORD': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'TELEGRAM': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'PAGERDUTY': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl bg-surface-base border border-surface-border shadow-2xl shadow-indigo-950/20 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 border-b border-surface-border bg-surface-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-glow-primary">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  Real-Time Alert &amp; Webhook Escalation Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  ACTIVE DISPATCHER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Multi-channel security broadcasts &bull; Slack, Discord, Telegram, PagerDuty &amp; Custom HTTP Webhooks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-glow-primary active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'View Endpoints' : 'Add Webhook'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-card border border-surface-border hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 md:px-7 bg-surface-base/80 border-b border-surface-border text-xs">
          <div className="p-3 rounded-xl bg-surface-card/50 border border-surface-border">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Endpoints Registered
            </span>
            <p className="text-lg font-extrabold text-white mt-0.5">{summary.totalEndpoints} Configured</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Broadcasts
            </span>
            <p className="text-lg font-extrabold text-accent-emerald mt-0.5">{summary.activeEndpoints} Online</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Total Dispatched
            </span>
            <p className="text-lg font-extrabold text-purple-300 font-mono mt-0.5">{summary.totalAlertsDispatched.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Delivery Latency
            </span>
            <p className="text-lg font-extrabold text-cyan-300 font-mono mt-0.5">{summary.averageDispatchLatencyMs}ms</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Reliability SLA
            </span>
            <p className="text-lg font-extrabold text-indigo-300 font-mono mt-0.5">{summary.deliverySuccessRate}%</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between gap-4 p-4 md:px-7 border-b border-surface-border bg-surface-card/30 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'endpoints'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-primary'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              Webhook Channels ({webhooks.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-primary'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              Live Dispatch Audit Log ({logs.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Auto-Escalates: High Severity, Critical Anomaly &amp; Zero-Trust Breaches
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 md:px-7 space-y-6">
          {isAdding ? (
            /* Add Webhook Form */
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5 animate-fade-in">
              <div className="border-b border-surface-border pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-accent-cyan" />
                  Register New Alert Webhook
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect Slack, Discord, Telegram, or an internal SIEM HTTP endpoint to receive instantaneous notifications.
                </p>
              </div>

              <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Integration Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Slack Incident War-Room #secops"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-indigo-500 text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Channel Platform</label>
                    <select
                      value={formChannel}
                      onChange={e => setFormChannel(e.target.value as WebhookChannel)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-indigo-500 text-white outline-none"
                    >
                      <option value="SLACK">Slack Incoming Webhook</option>
                      <option value="DISCORD">Discord Webhook</option>
                      <option value="TELEGRAM">Telegram Bot API</option>
                      <option value="PAGERDUTY">PagerDuty Events API v2</option>
                      <option value="CUSTOM_HTTP">Custom HTTP POST / SIEM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Trigger Threshold</label>
                    <select
                      value={formTrigger}
                      onChange={e => setFormTrigger(e.target.value as AlertTriggerLevel)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-indigo-500 text-white outline-none"
                    >
                      <option value="CRITICAL_ONLY">Critical Anomaly Only (Score &ge; 8.0)</option>
                      <option value="HIGH_AND_CRITICAL">High &amp; Critical (Score &ge; 6.5)</option>
                      <option value="MEDIUM_AND_ABOVE">Medium and Above (Score &ge; 4.0)</option>
                      <option value="ALL">All Security Events (Audit Stream)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Webhook Target URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-surface-border focus:border-indigo-500 text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 rounded-xl bg-surface-base border border-surface-border hover:border-slate-500 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-glow-primary active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save &amp; Activate Endpoint</span>
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'endpoints' ? (
            /* Channels Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {webhooks.map(wh => {
                const isDispatching = dispatchingId === wh.id;

                return (
                  <div
                    key={wh.id}
                    className={`p-5 rounded-2xl bg-surface-card border transition-all ${
                      wh.isEnabled 
                        ? 'border-surface-border hover:border-slate-500 hover:shadow-lg' 
                        : 'border-surface-border/50 opacity-60'
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getChannelColor(wh.channel)}`}>
                          {wh.channel}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight">{wh.name}</h4>
                          <p className="text-[11px] text-slate-400 font-mono truncate max-w-[240px]" title={wh.endpointUrl}>
                            {wh.endpointUrl}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wh.isEnabled 
                          ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/30' 
                          : 'bg-surface-base text-slate-400 border border-surface-border'
                      }`}>
                        {wh.isEnabled ? 'ENABLED' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Metadata Box */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-base/80 border border-surface-border text-[11px] font-mono my-3.5">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Trigger Level</span>
                        <span className="text-slate-200 font-bold truncate block">{wh.triggerLevel.replace(/_/g, ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Delivered</span>
                        <span className="text-cyan-300 font-bold">{wh.totalDelivered.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Avg Latency</span>
                        <span className="text-indigo-300 font-bold">{wh.averageLatencyMs}ms</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleToggle(wh.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all border ${
                          wh.isEnabled
                            ? 'bg-surface-base text-slate-300 border-surface-border hover:border-slate-500'
                            : 'bg-emerald-500/15 text-accent-emerald border-emerald-500/30'
                        }`}
                      >
                        {wh.isEnabled ? 'Pause Channel' : 'Enable Channel'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={isDispatching || !wh.isEnabled}
                          onClick={() => handleSendTest(wh)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-[11px] transition-all shadow-glow-primary active:scale-95"
                        >
                          {isDispatching ? (
                            <>
                              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>Test Alert</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(wh.id)}
                          className="p-1.5 rounded-xl bg-surface-base border border-surface-border hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* History Audit Log */
            <div className="space-y-3">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-card border border-surface-border text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface-base border border-surface-border text-indigo-300 text-[10px]">
                      {log.timestamp}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'critical' ? 'text-accent-rose bg-rose-500/10 border border-rose-500/30' : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                    <span className="text-slate-200 font-sans font-medium">{log.payloadSummary}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-accent-emerald flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> HTTP {log.httpStatus} OK
                    </span>
                    <span className="text-slate-400 font-mono">{log.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Test Payload Preview Modal / Drawer */}
          {previewPayload && (
            <div className="p-5 rounded-2xl bg-black/80 border border-indigo-500/40 shadow-glow-primary space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white">
                    Live Payload Simulation: <span className="font-mono text-cyan-300">[{previewPayload.channel} RFC Format]</span>
                  </h4>
                </div>
                <button
                  onClick={() => setPreviewPayload(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss Preview
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-base/90 border border-surface-border font-mono text-[11px] text-cyan-300 max-h-56 overflow-y-auto">
                <pre>{JSON.stringify(previewPayload.payload, null, 2)}</pre>
              </div>
              <p className="text-[11px] text-slate-400">
                Dispatched successfully via HTTP POST with HMAC-SHA256 signature header. Ready for 24/7 autonomous production alerting.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-7 border-t border-surface-border bg-surface-card/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span>Webhook Dispatcher: TLS 1.3 End-to-End Encrypted</span>
          </div>
          <p className="font-mono text-[11px]">NexusAI Notification Gateway v2.4</p>
        </div>
      </div>
    </div>
  );
};
