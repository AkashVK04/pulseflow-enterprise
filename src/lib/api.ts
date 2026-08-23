import {
  User,
  Project,
  Task,
  Sprint,
  TimeEntry,
  AuditLog,
  TaskComment,
  WorkspaceMetrics,
  AIDecomposeResult,
  AISummaryResult,
  AIRiskAnalysisResult
} from '../types/index.js';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth & Workspace Context
  getAuthMe: () => fetchJSON<{ user: User; allUsers: User[] }>('/auth/me'),
  getUsers: () => fetchJSON<User[]>('/users'),
  getWorkspaceMetrics: () => fetchJSON<WorkspaceMetrics>('/workspaces/metrics'),

  // Projects
  getProjects: () => fetchJSON<Project[]>('/projects'),
  getProjectById: (id: string) => fetchJSON<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) => fetchJSON<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProject: (id: string, data: Partial<Project>) => fetchJSON<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Tasks
  getTasks: (params?: { projectId?: string; sprintId?: string; assigneeId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.append('projectId', params.projectId);
    if (params?.sprintId) query.append('sprintId', params.sprintId);
    if (params?.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    
    const qs = query.toString();
    return fetchJSON<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getTaskById: (id: string) => fetchJSON<Task>(`/tasks/${id}`),
  createTask: (data: Partial<Task>) => fetchJSON<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTask: (id: string, data: Partial<Task>) => fetchJSON<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTask: (id: string) => fetchJSON<{ message: string }>(`/tasks/${id}`, {
    method: 'DELETE'
  }),

  // Comments
  getComments: (taskId: string) => fetchJSON<TaskComment[]>(`/tasks/${taskId}/comments`),
  addComment: (taskId: string, content: string, authorId?: string) => fetchJSON<TaskComment>(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, authorId })
  }),

  // Sprints
  getSprints: (projectId?: string) => fetchJSON<Sprint[]>(`/sprints${projectId ? `?projectId=${projectId}` : ''}`),
  createSprint: (data: Partial<Sprint>) => fetchJSON<Sprint>('/sprints', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Time Entries
  getTimeEntries: (taskId?: string) => fetchJSON<TimeEntry[]>(`/time-entries${taskId ? `?taskId=${taskId}` : ''}`),
  addTimeEntry: (data: { taskId: string; userId?: string; hours: number; description?: string; date?: string }) => 
    fetchJSON<TimeEntry>('/time-entries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Audit Logs
  getAuditLogs: () => fetchJSON<AuditLog[]>('/audit-logs'),

  // AI Features
  aiDecompose: (title: string, description?: string) => fetchJSON<AIDecomposeResult>('/ai/decompose', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  }),
  aiStandup: (projectId?: string) => fetchJSON<AISummaryResult>('/ai/standup', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }),
  aiRiskAudit: (projectId?: string) => fetchJSON<AIRiskAnalysisResult>('/ai/risk-audit', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }),
  aiChat: (query: string, context?: string) => fetchJSON<{ response: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, context })
  }),

  // Global Search
  searchGlobal: (query: string) => fetchJSON<import('../types/index.js').GlobalSearchResult[]>(`/search?q=${encodeURIComponent(query)}`),

  // Feature Flags & Admin
  getFeatureFlags: () => fetchJSON<import('../types/index.js').FeatureFlag[]>('/admin/feature-flags'),
  toggleFeatureFlag: (key: string) => fetchJSON<import('../types/index.js').FeatureFlag>(`/admin/feature-flags/${key}`, { method: 'PUT' }),

  // Background Jobs
  getBackgroundJobs: () => fetchJSON<import('../types/index.js').BackgroundJob[]>('/admin/background-jobs'),
  triggerBackgroundJob: (id: string) => fetchJSON<import('../types/index.js').BackgroundJob>(`/admin/background-jobs/${id}/trigger`, { method: 'POST' }),

  // Notifications
  getNotifications: () => fetchJSON<import('../types/index.js').NotificationItem[]>('/notifications'),
  markAllNotificationsRead: () => fetchJSON<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  // User Management
  createUser: (data: Partial<User>) => fetchJSON<User>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUserRole: (id: string, role: string, permissions?: string[]) => fetchJSON<User>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role, permissions }) }),
  toggleUserLock: (id: string) => fetchJSON<User>(`/admin/users/${id}/lock`, { method: 'PUT' }),

  // Auth Security
  loginWithJWT: (email: string, password?: string) => fetchJSON<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginWithGoogleOAuth2: () => fetchJSON<{ user: User; accessToken: string; provider: string }>('/auth/google', { method: 'POST' })
};

