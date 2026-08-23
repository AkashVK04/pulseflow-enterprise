import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { api } from '../../lib/api.js';
import { GlobalSearchResult } from '../../types/index.js';
import {
  Search,
  X,
  FolderKanban,
  CheckSquare,
  Zap,
  User,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Plus,
  LayoutDashboard,
  History,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'action';
  icon: React.ReactNode;
  perform: () => void;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    setSelectedTaskId,
    setActiveTab,
    setIsCreateTaskModalOpen,
    setIsCreateProjectModalOpen,
    setIsAiDrawerOpen
  } = useProjects();

  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(['authentication', 'sprint 14', 'sarah']);

  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Action Items
  const quickActions: ActionItem[] = [
    {
      id: 'act-new-task',
      title: 'CREATE NEW TASK',
      subtitle: 'Open task creation modal',
      type: 'action',
      icon: <Plus className="h-4 w-4 text-[var(--brand-primary)]" />,
      perform: () => {
        setIsCreateTaskModalOpen(true);
      }
    },
    {
      id: 'act-new-proj',
      title: 'CREATE NEW PROJECT',
      subtitle: 'Provision a new enterprise project',
      type: 'action',
      icon: <FolderKanban className="h-4 w-4 text-[var(--brand-primary)]" />,
      perform: () => {
        setIsCreateProjectModalOpen(true);
      }
    },
    {
      id: 'act-ai-copilot',
      title: 'OPEN AI COPILOT',
      subtitle: 'Chat with Gemini 3.6 Flash assistant',
      type: 'action',
      icon: <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />,
      perform: () => {
        setIsAiDrawerOpen(true);
      }
    },
    {
      id: 'act-dash',
      title: 'GO TO EXECUTIVE DASHBOARD',
      subtitle: 'View real-time workspace telemetry',
      type: 'action',
      icon: <LayoutDashboard className="h-4 w-4 text-[var(--status-success)]" />,
      perform: () => {
        setActiveTab('dashboard');
      }
    },
    {
      id: 'act-kanban',
      title: 'GO TO KANBAN BOARD',
      subtitle: 'Manage task columns and status transitions',
      type: 'action',
      icon: <CheckSquare className="h-4 w-4 text-[var(--status-warning)]" />,
      perform: () => {
        setActiveTab('kanban');
      }
    },
    {
      id: 'act-audit',
      title: 'GO TO SECURITY & AUDIT LOG',
      subtitle: 'Inspect RBAC activity trail',
      type: 'action',
      icon: <History className="h-4 w-4 text-[var(--status-info)]" />,
      perform: () => {
        setActiveTab('audit');
      }
    },
    {
      id: 'act-admin',
      title: 'GO TO ADMIN PORTAL & RBAC',
      subtitle: 'Manage users, feature flags & jobs',
      type: 'action',
      icon: <ShieldCheck className="h-4 w-4 text-[var(--status-danger)]" />,
      perform: () => {
        setActiveTab('admin');
      }
    }
  ];

  // Shortcut key listener (Cmd+K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  // Debounced API Search
  useEffect(() => {
    if (!query.trim()) {
      setApiResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchGlobal(query);
        setApiResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter actions based on query
  const filteredActions = quickActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const combinedResults: (GlobalSearchResult | ActionItem)[] = query.trim()
    ? [...filteredActions, ...apiResults]
    : quickActions;

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation for command list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < combinedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : combinedResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedResults[selectedIndex]) {
        handleExecute(combinedResults[selectedIndex]);
      }
    }
  };

  const handleExecute = (item: GlobalSearchResult | ActionItem) => {
    if (query.trim()) {
      setRecentSearches(prev => [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 5));
    }
    setIsGlobalSearchOpen(false);
    setQuery('');

    if ('perform' in item) {
      item.perform();
    } else {
      if (item.type === 'task') {
        setSelectedTaskId(item.id);
        setActiveTab('tasks');
      } else if (item.type === 'project') {
        setActiveTab('projects');
      } else if (item.type === 'sprint') {
        setActiveTab('sprints');
      } else if (item.type === 'user') {
        setActiveTab('admin');
      } else if (item.type === 'audit') {
        setActiveTab('audit');
      }
    }
  };

  const getResultIcon = (item: GlobalSearchResult | ActionItem) => {
    if ('perform' in item) {
      return item.icon;
    }
    switch (item.type) {
      case 'project': return <FolderKanban className="h-4 w-4 text-[var(--brand-primary)]" />;
      case 'task': return <CheckSquare className="h-4 w-4 text-[var(--status-success)]" />;
      case 'sprint': return <Zap className="h-4 w-4 text-[var(--status-warning)]" />;
      case 'user': return <User className="h-4 w-4 text-[var(--status-info)]" />;
      default: return <ShieldAlert className="h-4 w-4 text-[var(--status-danger)]" />;
    }
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsGlobalSearchOpen(false);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] w-full max-w-2xl shadow-2xl flex flex-col font-mono text-[var(--text-primary)] overflow-hidden"
        onKeyDown={handleListKeyDown}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3 bg-[var(--bg-surface)]">
          <Search className="h-5 w-5 text-[var(--brand-primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            placeholder="SEARCH PROJECTS, TASKS, USERS, COMMANDS... (ESC TO CLOSE)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs font-bold placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none uppercase tracking-wider"
            aria-label="Command palette query input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Recent Search Chips */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center gap-2 text-[10px] text-[var(--text-muted)] uppercase">
            <Clock className="h-3 w-3 shrink-0" />
            <span>RECENT:</span>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] px-2 py-0.5 cursor-pointer font-bold"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results / Command Action Items */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {loading && (
            <div className="p-6 text-center text-xs text-[var(--brand-primary)] font-bold uppercase animate-pulse">
              SEARCHING ENTERPRISE INDEX...
            </div>
          )}

          {!loading && combinedResults.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] uppercase font-bold">
              NO MATCHING COMMANDS OR RECORDS FOUND
            </div>
          )}

          {!loading && combinedResults.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isAction = 'perform' in item;
            const itemId = isAction ? item.id : `${item.type}-${item.id}`;
            const badge = 'badge' in item ? item.badge : undefined;

            return (
              <div
                key={itemId}
                onClick={() => handleExecute(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`p-3 transition-all flex items-center justify-between cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 border shrink-0 ${isSelected ? 'bg-black/20 border-white/20' : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)]'}`}>
                    {getResultIcon(item)}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold uppercase tracking-wider truncate ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className={`text-[10px] uppercase truncate ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 uppercase ${isSelected ? 'bg-black/40 text-white' : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}>
                      {badge}
                    </span>
                  )}
                  <ArrowRight className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Keyboard Instructions */}
        <div className="p-3 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold uppercase">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-1.5 py-0.5 border">↑↓</kbd> NAVIGATE</span>
            <span><kbd className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-1.5 py-0.5 border">↵</kbd> SELECT</span>
            <span><kbd className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-1.5 py-0.5 border">ESC</kbd> CLOSE</span>
          </div>
          <span className="hidden sm:inline">PULSEFLOW COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};
