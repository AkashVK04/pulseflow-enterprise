import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useProjects } from '../../context/ProjectContext.js';
import { ThemeToggle } from '../common/ThemeToggle.js';
import { Toast } from '../ui/Toast.js';
import {
  Search,
  Sparkles,
  Plus,
  Shield,
  FolderKanban,
  Bell,
  CheckCheck,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Keyboard,
  ChevronDown,
  Inbox
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  isMobileMenuOpen = false
}) => {
  const { currentUser, allUsers, switchUserRole } = useAuth();
  const {
    projects,
    selectedProject,
    setSelectedProject,
    setIsAiDrawerOpen,
    setIsCreateTaskModalOpen,
    setIsGlobalSearchOpen,
    notifications,
    markNotificationsRead,
    toastMessage,
    showToast
  } = useProjects();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Group notifications into Today, Yesterday, Earlier
  const groupNotifications = () => {
    const today: typeof notifications = [];
    const yesterday: typeof notifications = [];
    const earlier: typeof notifications = [];

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterdayObj = new Date(now);
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toDateString();

    notifications.forEach(n => {
      const nDate = new Date(n.timestamp).toDateString();
      if (nDate === todayStr) {
        today.push(n);
      } else if (nDate === yesterdayStr) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  };

  const grouped = groupNotifications();

  return (
    <header
      className={`h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[var(--text-primary)] sticky top-0 z-30 px-4 transition-all duration-200 ${
        isScrolled ? 'shadow-md border-b-[var(--border-default)]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-3">
        
        {/* Left Section: Mobile Drawer Toggle, Brand Logo & Project Selector */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Drawer Button */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-[var(--brand-primary)] flex items-center justify-center font-black text-white shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-baseline">
                <span className="font-black text-lg tracking-tighter uppercase leading-none text-[var(--text-primary)]">
                  PULSE<span className="text-[var(--brand-primary)]">FLOW</span>
                </span>
                <span className="ml-1.5 text-[9px] font-mono tracking-widest text-[var(--brand-primary)] uppercase font-bold">
                  v4.0
                </span>
              </div>
            </div>
          </div>

          {/* Project / Workspace Selector */}
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-2.5 py-1 text-xs text-[var(--text-secondary)] font-mono">
            <FolderKanban className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0" />
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const proj = projects.find(p => p.id === e.target.value) || null;
                setSelectedProject(proj);
              }}
              className="bg-transparent text-[var(--text-primary)] focus:outline-none cursor-pointer pr-1 uppercase text-[11px] font-bold tracking-wider"
              aria-label="Filter by project"
            >
              <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">ALL PROJECTS</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Global Search Trigger Button */}
        <div className="flex-1 max-w-sm mx-2">
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] px-3 py-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center justify-between cursor-pointer uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            aria-label="Open search command palette"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="hidden sm:inline">SEARCH PLATFORM...</span>
              <span className="sm:hidden">SEARCH...</span>
            </div>
            <kbd className="bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] px-1.5 py-0.5 text-[10px] font-bold border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Actions, Notifications Bell, AI Copilot, User Profile Menu */}
        <div className="flex items-center gap-2">
          
          {/* Quick Create Task */}
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>NEW TASK</span>
          </button>

          {/* AI Copilot Drawer Button */}
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-[var(--bg-canvas)] hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] hover:text-white border border-[var(--brand-primary)]/40 text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 transition-all cursor-pointer"
            title="Open AI Copilot"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">AI COPILOT</span>
          </button>

          {/* Notifications Dropdown Panel */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--brand-primary)] text-white text-[9px] font-mono font-black h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl z-50 p-4 text-xs font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)] uppercase text-[11px]">TELEMETRY NOTIFICATIONS</span>
                    {unreadCount > 0 && (
                      <span className="bg-[var(--brand-primary)] text-white text-[9px] font-bold px-1.5 py-0.2">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsRead}
                      className="text-[10px] text-[var(--brand-primary)] hover:underline uppercase flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <CheckCheck className="h-3 w-3" /> MARK ALL READ
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-3">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-[var(--text-muted)] uppercase flex flex-col items-center gap-2">
                      <Inbox className="h-6 w-6 text-[var(--text-muted)]" />
                      <span>NO NOTIFICATIONS RECORDED</span>
                    </div>
                  ) : (
                    <>
                      {grouped.today.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">TODAY</div>
                          <div className="space-y-1.5">
                            {grouped.today.map(n => (
                              <NotificationCard key={n.id} item={n} formatTime={formatRelativeTime} />
                            ))}
                          </div>
                        </div>
                      )}

                      {grouped.yesterday.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">YESTERDAY</div>
                          <div className="space-y-1.5">
                            {grouped.yesterday.map(n => (
                              <NotificationCard key={n.id} item={n} formatTime={formatRelativeTime} />
                            ))}
                          </div>
                        </div>
                      )}

                      {grouped.earlier.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">EARLIER</div>
                          <div className="space-y-1.5">
                            {grouped.earlier.map(n => (
                              <NotificationCard key={n.id} item={n} formatTime={formatRelativeTime} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 pl-1.5 border-l border-[var(--border-subtle)] cursor-pointer group"
              aria-label="User profile menu"
              aria-expanded={isProfileOpen}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 object-cover border border-[var(--border-default)] group-hover:border-[var(--brand-primary)] transition-colors"
                />
              ) : (
                <div className="h-8 w-8 bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] flex items-center justify-center text-xs font-mono font-bold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl z-50 p-4 text-xs font-mono space-y-4">
                
                {/* User Identity Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  {currentUser?.avatar && (
                    <img src={currentUser.avatar} alt="" className="h-10 w-10 object-cover border border-[var(--brand-primary)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[var(--text-primary)] uppercase truncate text-xs">{currentUser?.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{currentUser?.email}</div>
                    <span className="inline-block mt-1 text-[9px] font-bold bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)] px-1.5 py-0.2 uppercase">
                      {currentUser?.role}
                    </span>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Shield className="h-3 w-3 text-[var(--status-success)]" />
                    <span>SWITCH ACTIVE ROLE</span>
                  </label>
                  <select
                    value={currentUser?.id || ''}
                    onChange={(e) => {
                      switchUserRole(e.target.value);
                      showToast(`Switched user context to ${allUsers.find(u => u.id === e.target.value)?.name}`);
                    }}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold uppercase p-2 cursor-pointer focus:border-[var(--brand-primary)]"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme Switcher Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">THEME MODE</span>
                  <ThemeToggle />
                </div>

                {/* Keyboard Shortcuts Trigger */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsGlobalSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase transition-colors cursor-pointer text-[11px]"
                >
                  <span className="flex items-center gap-2">
                    <Keyboard className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    <span>KEYBOARD SHORTCUTS</span>
                  </span>
                  <kbd className="text-[9px] bg-[var(--bg-surface)] border px-1 font-bold">⌘K</kbd>
                </button>

                {/* Logout Placeholder */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    showToast('Enterprise Session Logged Out (Demo Mode)');
                  }}
                  className="w-full flex items-center gap-2 p-2 bg-[var(--status-danger-bg)] text-[var(--status-danger)] hover:bg-[var(--status-danger)] hover:text-white border border-[var(--status-danger-border)] uppercase font-bold transition-colors cursor-pointer text-[11px]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>LOG OUT SESSION</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Container */}
      <Toast message={toastMessage} />
    </header>
  );
};

const NotificationCard: React.FC<{
  item: import('../../types/index.js').NotificationItem;
  formatTime: (ts: string) => string;
}> = ({ item, formatTime }) => (
  <div className={`p-2 border transition-all ${!item.read ? 'bg-[var(--bg-canvas)] border-[var(--brand-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}`}>
    <div className="flex items-center justify-between">
      <span className="font-bold text-[var(--text-primary)] uppercase text-[10px]">{item.title}</span>
      <span className="text-[9px] text-[var(--text-muted)]">{formatTime(item.timestamp)}</span>
    </div>
    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 uppercase">{item.message}</p>
  </div>
);
