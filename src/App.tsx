import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { ProjectProvider, useProjects } from './context/ProjectContext.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard.js';
import { ProjectList } from './components/projects/ProjectList.js';
import { KanbanBoard } from './components/kanban/KanbanBoard.js';
import { TaskList } from './components/tasks/TaskList.js';
import { SprintManager } from './components/sprints/SprintManager.js';
import { TimeTracker } from './components/time/TimeTracker.js';
import { AuditLogView } from './components/audit/AuditLogView.js';
import { AdminPortal } from './components/admin/AdminPortal.js';
import { TaskDetailModal } from './components/tasks/TaskDetailModal.js';
import { CreateTaskModal } from './components/tasks/CreateTaskModal.js';
import { AICopilotDrawer } from './components/ai/AICopilotDrawer.js';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.js';

const AppContent: React.FC = () => {
  const { activeTab } = useProjects();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'projects':
        return <ProjectList />;
      case 'kanban':
        return <KanbanBoard />;
      case 'tasks':
        return <TaskList />;
      case 'sprints':
        return <SprintManager />;
      case 'time':
        return <TimeTracker />;
      case 'audit':
        return <AuditLogView />;
      case 'admin':
        return <AdminPortal />;
      case 'ai-copilot':
        return <OverviewDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans antialiased selection:bg-[var(--brand-primary)] selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Sticky Header */}
      <Header
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 md:p-6 gap-6 relative">
        
        {/* Desktop Navigation Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Navigation Drawer Backdrop & Container */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer Content */}
            <div className="relative z-50 h-full max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-200">
              <Sidebar
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Active Page View */}
        <main className="flex-1 min-w-0">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Modals & Overlay Drawers */}
      <TaskDetailModal />
      <CreateTaskModal />
      <AICopilotDrawer />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
