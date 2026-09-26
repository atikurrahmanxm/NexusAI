import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Cloud, 
  Cpu, 
  Server,
  Lock
} from 'lucide-react';
import { SecurityEvent } from '../types/telemetry';
import { compileSecurityPolicies, FirewallSyntax } from '../services/firewallCompiler';

interface FirewallPolicyGeneratorProps {
  events: SecurityEvent[];
}

export const FirewallPolicyGenerator: React.FC<FirewallPolicyGeneratorProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<FirewallSyntax>('iptables');
  const [copied, setCopied] = useState(false);

  const compiled = compileSecurityPolicies(events);
  const currentPolicy = compiled[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPolicy.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let extension = 'sh';
    let mimeType = 'text/x-sh';

    if (activeTab === 'aws_nacl') {
      extension = 'json';
      mimeType = 'application/json';
    } else if (activeTab === 'nginx') {
      extension = 'conf';
      mimeType = 'text/plain';
    } else if (activeTab === 'cloudflare') {
      extension = 'txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([currentPolicy.code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_firewall_${activeTab}_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: FirewallSyntax; label: string; icon: React.ReactNode }[] = [
    { id: 'iptables', label: 'Linux iptables', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'ufw', label: 'Ubuntu UFW', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'cloudflare', label: 'Cloudflare WAF', icon: <Cloud className="w-3.5 h-3.5" /> },
    { id: 'aws_nacl', label: 'AWS NACL (JSON)', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'nginx', label: 'Nginx Blocklist', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-surface-border bg-surface/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-accent-emerald">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-white tracking-wide uppercase font-mono">
              Automated Firewall &amp; WAF Security Policy Compiler
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time rule synthesis from active threat telemetry for instant edge deployment
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-primary text-slate-200 hover:text-white transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-emerald" />
                <span className="text-accent-emerald font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Rule Set</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-md shadow-primary/20 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Download Script</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 bg-surface/40 border-b border-surface-border flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 border-b-2 font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'border-accent-emerald text-accent-emerald bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Code Viewer & Policy Stats */}
      <div className="p-5 space-y-4">
        {/* Stats Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-surface border border-surface-border text-slate-300">
              Generated Rules: <strong className="text-accent-emerald">{currentPolicy.ruleCount}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-surface border border-surface-border text-slate-300">
              Quarantined IPs: <strong className="text-accent-rose">{currentPolicy.blockedIps.length}</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Perimeter Defense: <span className="text-accent-emerald font-semibold">Zero-Trust Kernel Drop</span>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-xl border border-surface-border bg-[#070B14] p-4 overflow-x-auto max-h-72">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
            <code>{currentPolicy.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
