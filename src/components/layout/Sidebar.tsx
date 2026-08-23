import React, { useState, useEffect } from 'react';
import { useProjects, ViewTab } from '../../context/ProjectContext.js';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  ListTodo,
  Zap,
  Clock,
  History,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface NavSection {
  title: string;
  items: {
    id: ViewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

interface SidebarProps {
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

const STORAGE_KEY = 'pulseflow-sidebar-collapsed';

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  const { activeTab, setActiveTab, tasks, projects } = useProjects();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && !isMobileDrawer) {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!isMobileDrawer) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed, isMobileDrawer]);

  const navSections: NavSection[] = [
    {
      title: 'CORE WORKSPACE',
      items: [
        { id: 'dashboard', label: 'EXECUTIVE DASHBOARD', icon: LayoutDashboard },
        { id: 'projects', label: 'PROJECTS OVERVIEW', icon: FolderKanban, badge: `${projects.length}` },
        { id: 'kanban', label: 'KANBAN BOARD', icon: Kanban },
        { id: 'tasks', label: 'TASK INVENTORY', icon: ListTodo, badge: `${tasks.length}` }
      ]
    },
    {
      title: 'LOGISTICS & OPERATIONS',
      items: [
        { id: 'sprints', label: 'SPRINT PLANNER', icon: Zap },
        { id: 'time', label: 'TIME TRACKING', icon: Clock },
        { id: 'ai-copilot', label: 'AI INSIGHTS & CHAT', icon: Sparkles }
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'audit', label: 'SECURITY & AUDIT LOG', icon: History },
        { id: 'admin', label: 'ADMIN PORTAL & RBAC', icon: ShieldCheck }
      ]
    }
  ];

  const handleNavClick = (tab: ViewTab) => {
    setActiveTab(tab);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const effectiveCollapsed = isMobileDrawer ? false : isCollapsed;

  return (
    <aside
      className={`bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] text-[var(--text-primary)] flex flex-col p-3 shrink-0 transition-all duration-300 ${
        isMobileDrawer
          ? 'w-64 h-full'
          : effectiveCollapsed
          ? 'w-16 items-center'
          : 'w-64'
      }`}
    >
      {/* Sidebar Header Toggle (Desktop Only) */}
      {!isMobileDrawer && (
        <div className={`flex items-center pb-3 mb-2 border-b border-[var(--border-subtle)] w-full ${effectiveCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!effectiveCollapsed && (
            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
              NAVIGATION
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {effectiveCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4 w-full overflow-y-auto overflow-x-hidden">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1 w-full">
            {!effectiveCollapsed && (
              <div className="px-2 py-1 text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group w-full">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center transition-all cursor-pointer font-mono text-xs font-bold uppercase tracking-wider ${
                      effectiveCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm border-l-2 border-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                      {!effectiveCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!effectiveCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 shrink-0 ${
                          isActive
                            ? 'bg-black/40 text-white'
                            : 'bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Floating Tooltip for Collapsed Mode */}
                  {effectiveCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:flex items-center gap-2 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs font-mono font-bold uppercase px-3 py-1.5 shadow-xl border border-[var(--border-default)] whitespace-nowrap">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-[var(--brand-primary)] text-white px-1.5 py-0.2">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Telemetry Footer */}
      <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] w-full">
        {effectiveCollapsed ? (
          <div className="flex justify-center p-2" title="System Telemetry Operational">
            <Activity className="h-4 w-4 text-[var(--status-success)] animate-pulse" />
          </div>
        ) : (
          <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">SYSTEM TELEMETRY</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-success)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-success)]"></span>
              </span>
            </div>
            <div className="text-[10px] text-[var(--status-success)] font-bold">NODE: US-EAST-01</div>
            <p className="text-[9px] text-[var(--text-muted)] uppercase leading-snug">
              Gemini 3.6 Flash telemetry active. Express port 3000 online.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
