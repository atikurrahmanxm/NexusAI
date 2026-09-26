import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  Terminal, 
  Cpu
} from 'lucide-react';
import { CopilotMessage, INITIAL_COPILOT_MESSAGES, generateCopilotResponse } from '../services/aiCopilotEngine';
import { SecurityEvent } from '../types/telemetry';

interface AiCopilotSidebarProps {
  events: SecurityEvent[];
  onMitigateThreat: (target: string) => void;
}

export const AiCopilotSidebar: React.FC<AiCopilotSidebarProps> = ({ events, onMitigateThreat }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_COPILOT_MESSAGES);
  const [input, setInput] = useState('');
  const [mitigatedTargets, setMitigatedTargets] = useState<string[]>([]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const now = new Date().toTimeString().split(' ')[0];
    const analystMsg: CopilotMessage = {
      id: `analyst-${Date.now()}`,
      sender: 'analyst',
      timestamp: now,
      text: query
    };

    setMessages(prev => [...prev, analystMsg]);
    setInput('');

    // Generate AI response
    setTimeout(() => {
      const response = generateCopilotResponse(query, events);
      setMessages(prev => [...prev, response]);
    }, 400);
  };

  const handleExecuteAction = (action: NonNullable<CopilotMessage['suggestedAction']>) => {
    onMitigateThreat(action.target);
    setMitigatedTargets(prev => [...prev, action.target]);

    const now = new Date().toTimeString().split(' ')[0];
    const confirmationMsg: CopilotMessage = {
      id: `ai-action-${Date.now()}`,
      sender: 'ai',
      timestamp: now,
      text: `Defensive mitigation executed successfully on target "${action.target}". Network perimeter policy updated.`,
      mitreTechnique: 'Remediation Applied: Countermeasure Verified'
    };

    setMessages(prev => [...prev, confirmationMsg]);
  };

  const quickPrompts = [
    'Analyze DDoS Traffic',
    'Inspect SQL Injection Payload',
    'Summarize MITRE Attack Vectors',
    'Generate SecOps Brief'
  ];

  return (
    <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 overflow-hidden flex flex-col h-[520px] shadow-card-subtle font-sans">
      {/* Header */}
      <div className="p-4 border-b border-surface-border bg-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-purple to-primary flex items-center justify-center text-white shadow-glow-primary">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Nexus AI Copilot
              </h3>
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Autonomous SecOps Incident Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-surface border border-surface-border text-indigo-300">
          <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
          <span>LLM SecOps v2.4</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 mb-1">
                <span>{isAi ? 'COPILOT' : 'ANALYST'}</span>
                <span>&bull;</span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-sm ${
                  isAi
                    ? 'bg-surface/90 border border-surface-border text-slate-200'
                    : 'bg-primary text-white ml-auto shadow-primary/20'
                }`}
              >
                <p className="text-xs font-normal whitespace-pre-line leading-relaxed">{msg.text}</p>

                {msg.mitreTechnique && (
                  <div className="pt-2 border-t border-surface-border/50 flex items-center gap-1.5 text-[11px] text-indigo-300 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" />
                    <span>{msg.mitreTechnique}</span>
                  </div>
                )}

                {msg.suggestedAction && (
                  <div className="pt-2">
                    {mitigatedTargets.includes(msg.suggestedAction.target) ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-accent-emerald font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Action Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleExecuteAction(msg.suggestedAction!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-gradient-to-r from-accent-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg shadow-md transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{msg.suggestedAction.label}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2.5 bg-surface/50 border-t border-surface-border flex items-center gap-2 overflow-x-auto text-[11px]">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border hover:border-primary/50 text-slate-300 hover:text-white transition-all font-medium text-xs shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-surface border-t border-surface-border flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Terminal className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot: mitigate DDoS, analyze IP, check MITRE tactics..."
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary font-sans transition-colors"
          />
        </div>

        <button
          type="submit"
          className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white transition-colors shadow-sm shadow-primary/30 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
