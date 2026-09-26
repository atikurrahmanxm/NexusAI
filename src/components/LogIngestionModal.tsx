import React, { useState } from 'react';
import { 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  Terminal
} from 'lucide-react';
import { parseRawLogText, PRESET_ATTACK_SCENARIOS, ParseResult } from '../services/logParser';
import { SecurityEvent } from '../types/telemetry';

interface LogIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestEvents: (newEvents: SecurityEvent[]) => void;
}

export const LogIngestionModal: React.FC<LogIngestionModalProps> = ({
  isOpen,
  onClose,
  onIngestEvents
}) => {
  const [rawText, setRawText] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParseResult(null);
      return;
    }
    const result = parseRawLogText(text);
    setParseResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const loadScenario = (scenarioKey: keyof typeof PRESET_ATTACK_SCENARIOS, name: string) => {
    setFileName(name);
    const text = PRESET_ATTACK_SCENARIOS[scenarioKey];
    handleParse(text);
  };

  const handleConfirmIngest = () => {
    if (!parseResult || parseResult.events.length === 0) return;
    onIngestEvents(parseResult.events);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-card border border-surface-border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-border bg-surface/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide">
                Log Ingestion &amp; Real Dataset Ingestion Engine
              </h3>
              <p className="text-xs text-slate-400">Upload or paste raw Nginx, SSH Auth, or JSON telemetry logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-mono text-xs">
          {/* Quick Scenario Chips */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2">
              Preset Cyber Attack Scenarios (Instant Load)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadScenario('ddosWave', 'ddos_syn_flood.log')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-purple text-slate-300 hover:text-white transition-all text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-accent-purple" />
                <span>Scenario: DDoS SYN Wave</span>
              </button>

              <button
                onClick={() => loadScenario('sqlInjectionBurst', 'sqli_exploit_audit.log')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-rose text-slate-300 hover:text-white transition-all text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-accent-rose" />
                <span>Scenario: SQL Injection Attack</span>
              </button>

              <button
                onClick={() => loadScenario('sshBruteForce', 'auth_sshd_failed.log')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-accent-amber text-slate-300 hover:text-white transition-all text-xs"
              >
                <Zap className="w-3.5 h-3.5 text-accent-amber" />
                <span>Scenario: SSH Brute Force</span>
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="relative border-2 border-dashed border-surface-border hover:border-primary/50 rounded-xl p-5 text-center bg-surface/30 transition-colors">
            <input
              type="file"
              accept=".log,.txt,.json,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-1.5">
              <UploadCloud className="w-8 h-8 text-indigo-400" />
              <p className="text-xs text-slate-200 font-semibold">
                {fileName ? `Loaded: ${fileName}` : 'Click to browse or drop log file here'}
              </p>
              <p className="text-[10px] text-slate-500">Supports .log, .txt, .json, and .csv formats</p>
            </div>
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400 uppercase">Or Paste Raw Log Stream</span>
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Paste raw Apache/Nginx logs, auth.log lines, or JSON objects..."
              className="w-full p-3 bg-surface border border-surface-border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Parsing Results Summary */}
          {parseResult && (
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
              <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
                <span className="text-slate-400 font-bold">PARSER TELEMETRY DIAGNOSTICS</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase text-[10px]">
                  Format: {parseResult.formatDetected}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  <span>Total Log Records: <strong>{parseResult.totalParsed}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-rose" />
                  <span>ML Anomalies Flagged: <strong className="text-accent-rose">{parseResult.anomaliesDetected}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-border bg-surface/50 flex items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface border border-surface-border hover:bg-surface-card text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={!parseResult || parseResult.events.length === 0}
            onClick={handleConfirmIngest}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-md shadow-primary/20 transition-all"
          >
            <span>Ingest Into Telemetry Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
