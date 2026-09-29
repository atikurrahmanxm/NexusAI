import React, { useState, useEffect, useRef } from 'react';
import { 
  Command,
  ArrowRight,
  CornerDownLeft,
  X
} from 'lucide-react';
import { audioFx } from '../services/audioFxEngine';

export interface CommandItem {
  id: string;
  category: 'ACTIONS' | 'DEFCON' | 'MONITORING' | 'INTEL' | 'AUTOMATION' | 'APPSEC';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  onExecute: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  commands
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands by search query
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.badge && cmd.badge.toLowerCase().includes(q))
    );
  }, [commands, query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      audioFx.playSonarPing();
    }
  }, [isOpen]);

  // Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
        audioFx.playKeyClick();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        audioFx.playKeyClick();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].onExecute();
          audioFx.playKeyClick();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      const activeItem = listElement.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-3 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-[#0B1020] border border-surface-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans border-slate-700/60 shadow-indigo-500/10 flex flex-col">
        {/* Search Bar Header */}
        <div className="p-4 border-b border-surface-border flex items-center gap-3 bg-surface-card/60">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Command className="w-4 h-4 text-accent-cyan" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search 18 modules (e.g., Attack, CVE, STIX, ITDR)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
            >
              &times;
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-1 divide-y divide-surface-border/40"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              <p>No matching commands or modules found for "{query}".</p>
              <p className="mt-1 text-[11px] text-slate-600">Try searching for "DEFCON", "Audit", "Scan", or "Playbook".</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={() => {
                    cmd.onExecute();
                    audioFx.playKeyClick();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-primary/20 border border-primary/50 text-white shadow-sm' 
                      : 'hover:bg-surface-card/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl bg-surface border border-surface-border transition-transform ${
                      isSelected ? 'scale-105 border-primary/50' : ''
                    } ${cmd.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-accent-cyan font-bold">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/40">
                        <span>SELECT</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Keyboard Hints */}
        <div className="p-3 border-t border-surface-border bg-surface/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-slate-300 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-slate-300 text-[10px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-slate-300 text-[10px]">↵</kbd>
              <span>Execute</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-slate-300 text-[10px]">ESC</kbd>
              <span>Exit</span>
            </span>
          </div>

          <div className="text-[10px] text-accent-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            <span>NEXUS PALANTIR COMMAND PALETTE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
