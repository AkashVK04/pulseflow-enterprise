import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Project,
  Task,
  Sprint,
  WorkspaceMetrics,
  TaskStatus,
  TaskPriority,
  AuditLog
} from '../types/index.js';
import { api } from '../lib/api.js';

export type ViewTab = 
  | 'dashboard'
  | 'projects'
  | 'kanban'
  | 'tasks'
  | 'sprints'
  | 'time'
  | 'audit'
  | 'ai-copilot'
  | 'admin';

interface ProjectContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  tasks: Task[];
  sprints: Sprint[];
  metrics: WorkspaceMetrics | null;
  auditLogs: AuditLog[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  notifications: import('../types/index.js').NotificationItem[];
  featureFlags: import('../types/index.js').FeatureFlag[];
  backgroundJobs: import('../types/index.js').BackgroundJob[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  isCreateProjectModalOpen: boolean;
  setIsCreateProjectModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshData: () => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  createProject: (projData: Partial<Project>) => Promise<Project>;
  toggleFeatureFlag: (key: string) => Promise<void>;
  triggerJob: (id: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
}


const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<import('../types/index.js').NotificationItem[]>([]);
  const [featureFlags, setFeatureFlags] = useState<import('../types/index.js').FeatureFlag[]>([]);
  const [backgroundJobs, setBackgroundJobs] = useState<import('../types/index.js').BackgroundJob[]>([]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const refreshData = useCallback(async () => {
    try {
      const [pList, mData, sList, aList, nList, fList, jList] = await Promise.all([
        api.getProjects(),
        api.getWorkspaceMetrics(),
        api.getSprints(),
        api.getAuditLogs(),
        api.getNotifications().catch(() => []),
        api.getFeatureFlags().catch(() => []),
        api.getBackgroundJobs().catch(() => [])
      ]);
      setProjects(pList);
      setMetrics(mData);
      setSprints(sList);
      setAuditLogs(aList);
      setNotifications(nList);
      setFeatureFlags(fList);
      setBackgroundJobs(jList);

      const tList = await api.getTasks({
        projectId: selectedProject?.id,
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setTasks(tList);
    } catch (err) {
      console.error('Failed to refresh project data:', err);
    }
  }, [selectedProject?.id, searchQuery, statusFilter]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toggleFeatureFlag = async (key: string) => {
    try {
      const updated = await api.toggleFeatureFlag(key);
      setFeatureFlags(prev => prev.map(f => f.key === key ? updated : f));
      showToast(`Feature flag "${key}" set to ${updated.enabled ? 'ENABLED' : 'DISABLED'}`);
    } catch (err: any) {
      showToast(`Failed to toggle flag: ${err.message}`);
    }
  };

  const triggerJob = async (id: string) => {
    try {
      const job = await api.triggerBackgroundJob(id);
      showToast(`Job [${job.name}] triggered successfully`);
      await refreshData();
    } catch (err: any) {
      showToast(`Failed to trigger job: ${err.message}`);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read');
    } catch (err: any) {
      console.error(err);
    }
  };


  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic UI update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await api.updateTask(taskId, { status: newStatus });
      showToast(`Task status updated to "${newStatus}"`);
      await refreshData();
    } catch (err: any) {
      showToast(`Failed to update task: ${err.message}`);
      await refreshData();
    }
  };

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    try {
      const newTask = await api.createTask(taskData);
      showToast(`Created task ${newTask.key}: ${newTask.title}`);
      await refreshData();
      return newTask;
    } catch (err: any) {
      showToast(`Failed to create task: ${err.message}`);
      throw err;
    }
  };

  const createProject = async (projData: Partial<Project>): Promise<Project> => {
    try {
      const newProj = await api.createProject(projData);
      showToast(`Created project [${newProj.key}] ${newProj.name}`);
      await refreshData();
      return newProj;
    } catch (err: any) {
      showToast(`Failed to create project: ${err.message}`);
      throw err;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        activeTab,
        setActiveTab,
        projects,
        selectedProject,
        setSelectedProject,
        tasks,
        sprints,
        metrics,
        auditLogs,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        notifications,
        featureFlags,
        backgroundJobs,
        selectedTaskId,
        setSelectedTaskId,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        isCreateProjectModalOpen,
        setIsCreateProjectModalOpen,
        toastMessage,
        showToast,
        refreshData,
        updateTaskStatus,
        createTask,
        createProject,
        toggleFeatureFlag,
        triggerJob,
        markNotificationsRead
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};
