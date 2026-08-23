import {
  User,
  Project,
  Task,
  Sprint,
  TimeEntry,
  AuditLog,
  TaskComment,
  WorkspaceMetrics,
  FeatureFlag,
  BackgroundJob,
  NotificationItem
} from '../types/index.js';

// Pre-seeded Enterprise Data
export const initialUsers: User[] = [
  {
    id: 'usr_1',
    name: 'Sarah Connor',
    email: 'sarah.connor@pulseflow.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'Super Admin',
    department: 'Executive Leadership'
  },
  {
    id: 'usr_2',
    name: 'Alex Mercer',
    email: 'alex.mercer@pulseflow.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Project Manager',
    department: 'Product Strategy'
  },
  {
    id: 'usr_3',
    name: 'Elena Rostova',
    email: 'elena.rostova@pulseflow.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Senior Engineer',
    department: 'Backend Platform'
  },
  {
    id: 'usr_4',
    name: 'Marcus Vance',
    email: 'marcus.vance@pulseflow.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'Staff Contributor',
    department: 'Frontend Engineering'
  },
  {
    id: 'usr_5',
    name: 'Chloe Bennett',
    email: 'chloe.bennett@pulseflow.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'Guest',
    department: 'Client Representative'
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj_1',
    key: 'CORE',
    name: 'Enterprise Core Platform Modernization',
    description: 'Migration to event-driven microservices architecture with cloud auto-scaling & real-time telemetry.',
    status: 'Active',
    category: 'Engineering',
    leadId: 'usr_2',
    leadName: 'Alex Mercer',
    startDate: '2026-06-01',
    targetEndDate: '2026-10-31',
    budgetHours: 1200,
    loggedHours: 480,
    membersCount: 8,
    riskLevel: 'Low'
  },
  {
    id: 'proj_2',
    key: 'AI',
    name: 'Autonomous AI Insights Engine',
    description: 'Generative AI pipeline powered by Gemini 3.6 for automated anomaly detection and workflow optimization.',
    status: 'Active',
    category: 'Product',
    leadId: 'usr_3',
    leadName: 'Elena Rostova',
    startDate: '2026-07-15',
    targetEndDate: '2026-11-15',
    budgetHours: 850,
    loggedHours: 320,
    membersCount: 5,
    riskLevel: 'Moderate'
  },
  {
    id: 'proj_3',
    key: 'SEC',
    name: 'SOC2 & Zero-Trust Security Compliance',
    description: 'Comprehensive audit, role-based access control fortification, and end-to-end telemetry encryption.',
    status: 'Active',
    category: 'Operations',
    leadId: 'usr_1',
    leadName: 'Sarah Connor',
    startDate: '2026-05-10',
    targetEndDate: '2026-09-01',
    budgetHours: 600,
    loggedHours: 510,
    membersCount: 4,
    riskLevel: 'High'
  }
];

export const initialSprints: Sprint[] = [
  {
    id: 'sprint_101',
    projectId: 'proj_1',
    name: 'Sprint 24 - Event Bus Refactoring',
    goal: 'Complete Kafka topic partitioning and establish circuit breaker resiliency pattern.',
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-08-14',
    totalPoints: 42,
    completedPoints: 28
  },
  {
    id: 'sprint_102',
    projectId: 'proj_2',
    name: 'Sprint 12 - Gemini AI Pipeline Integration',
    goal: 'Deploy server-side Gemini 3.6 Flash streaming routes for automated task decomposition.',
    status: 'Active',
    startDate: '2026-08-03',
    endDate: '2026-08-17',
    totalPoints: 35,
    completedPoints: 19
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task_1',
    key: 'CORE-101',
    title: 'Implement Resilient Circuit Breaker Middleware',
    description: 'Design and deploy exponential backoff circuit breaker for outbound REST services to prevent cascade failures.',
    status: 'In Progress',
    priority: 'Critical',
    projectId: 'proj_1',
    sprintId: 'sprint_101',
    assigneeId: 'usr_3',
    assigneeName: 'Elena Rostova',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    reporterId: 'usr_2',
    estimatedHours: 24,
    loggedHours: 18,
    dueDate: '2026-08-10',
    tags: ['Backend', 'Resiliency', 'Microservices'],
    subtasks: [
      { id: 'sub_1', title: 'Define failure threshold metrics', completed: true, estimatedHours: 4 },
      { id: 'sub_2', title: 'Implement Redis state persistence', completed: true, estimatedHours: 8 },
      { id: 'sub_3', title: 'Write integration fallback handlers', completed: false, estimatedHours: 12 }
    ],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-05T14:30:00Z'
  },
  {
    id: 'task_2',
    key: 'CORE-102',
    title: 'Refactor Authentication Payload & JWT Rotation',
    description: 'Enforce silent refresh token rotation and multi-tenant claim validation on API gateway level.',
    status: 'In Review',
    priority: 'High',
    projectId: 'proj_1',
    sprintId: 'sprint_101',
    assigneeId: 'usr_4',
    assigneeName: 'Marcus Vance',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    reporterId: 'usr_1',
    estimatedHours: 16,
    loggedHours: 15,
    dueDate: '2026-08-09',
    tags: ['Security', 'Auth', 'JWT'],
    subtasks: [
      { id: 'sub_4', title: 'Add refresh token blacklisting store', completed: true, estimatedHours: 6 },
      { id: 'sub_5', title: 'Update client-side auto-interceptor', completed: true, estimatedHours: 10 }
    ],
    createdAt: '2026-08-02T10:15:00Z',
    updatedAt: '2026-08-06T11:20:00Z'
  },
  {
    id: 'task_3',
    key: 'AI-201',
    title: 'Build Server-Side Gemini 3.6 Task Decomposition Endpoint',
    description: 'Create Express service endpoint using @google/genai SDK to automatically generate subtasks and time estimates.',
    status: 'In Progress',
    priority: 'High',
    projectId: 'proj_2',
    sprintId: 'sprint_102',
    assigneeId: 'usr_3',
    assigneeName: 'Elena Rostova',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    reporterId: 'usr_2',
    estimatedHours: 20,
    loggedHours: 12,
    dueDate: '2026-08-12',
    tags: ['AI', 'Gemini', 'Backend'],
    subtasks: [
      { id: 'sub_6', title: 'Construct strict JSON response schema', completed: true, estimatedHours: 4 },
      { id: 'sub_7', title: 'Wire streaming fallback handlers', completed: false, estimatedHours: 8 }
    ],
    createdAt: '2026-08-03T08:30:00Z',
    updatedAt: '2026-08-06T16:45:00Z'
  },
  {
    id: 'task_4',
    key: 'AI-202',
    title: 'Design Interactive AI Copilot Drawer UI',
    description: 'Develop responsive Framer Motion drawer with conversation stream, prompt presets, and task insertion hooks.',
    status: 'To Do',
    priority: 'Medium',
    projectId: 'proj_2',
    sprintId: 'sprint_102',
    assigneeId: 'usr_4',
    assigneeName: 'Marcus Vance',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    reporterId: 'usr_2',
    estimatedHours: 16,
    loggedHours: 4,
    dueDate: '2026-08-14',
    tags: ['UI/UX', 'Frontend', 'Framer Motion'],
    subtasks: [
      { id: 'sub_8', title: 'Build Chat bubble component', completed: true, estimatedHours: 4 },
      { id: 'sub_9', title: 'Connect auto-scroll on stream receive', completed: false, estimatedHours: 4 }
    ],
    createdAt: '2026-08-04T11:00:00Z',
    updatedAt: '2026-08-06T10:00:00Z'
  },
  {
    id: 'task_5',
    key: 'SEC-301',
    title: 'Audit User Permission RBAC Matrix & Telemetry Logs',
    description: 'Verify strict role privilege boundaries across Super Admin, PM, Engineer, Staff, and Guest views.',
    status: 'Completed',
    priority: 'High',
    projectId: 'proj_3',
    assigneeId: 'usr_1',
    assigneeName: 'Sarah Connor',
    assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    reporterId: 'usr_1',
    estimatedHours: 12,
    loggedHours: 12,
    dueDate: '2026-08-05',
    tags: ['Security', 'RBAC', 'Compliance'],
    subtasks: [
      { id: 'sub_10', title: 'Validate API authorization guards', completed: true, estimatedHours: 6 },
      { id: 'sub_11', title: 'Generate security audit evidence log', completed: true, estimatedHours: 6 }
    ],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-05T17:00:00Z'
  },
  {
    id: 'task_6',
    key: 'CORE-103',
    title: 'Configure Real-time Recharts KPI Analytics Dashboard',
    description: 'Integrate dynamic burn-down curves, team workload heatmaps, and sprint velocity charts.',
    status: 'Completed',
    priority: 'Medium',
    projectId: 'proj_1',
    sprintId: 'sprint_101',
    assigneeId: 'usr_4',
    assigneeName: 'Marcus Vance',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    reporterId: 'usr_2',
    estimatedHours: 18,
    loggedHours: 18,
    dueDate: '2026-08-06',
    tags: ['Analytics', 'Recharts', 'Dashboard'],
    subtasks: [
      { id: 'sub_12', title: 'Hook data transformers for sprint points', completed: true, estimatedHours: 8 },
      { id: 'sub_13', title: 'Add responsive container resize handling', completed: true, estimatedHours: 10 }
    ],
    createdAt: '2026-08-02T14:00:00Z',
    updatedAt: '2026-08-06T18:00:00Z'
  }
];

export const initialTimeEntries: TimeEntry[] = [
  {
    id: 'time_1',
    taskId: 'task_1',
    taskTitle: 'Implement Resilient Circuit Breaker Middleware',
    userId: 'usr_3',
    userName: 'Elena Rostova',
    hours: 6,
    description: 'Developed Redis state management for open/closed circuit status.',
    date: '2026-08-05',
    createdAt: '2026-08-05T17:30:00Z'
  },
  {
    id: 'time_2',
    taskId: 'task_3',
    taskTitle: 'Build Server-Side Gemini 3.6 Task Decomposition Endpoint',
    userId: 'usr_3',
    userName: 'Elena Rostova',
    hours: 4,
    description: 'Structured @google/genai JSON schema and error handler.',
    date: '2026-08-06',
    createdAt: '2026-08-06T12:00:00Z'
  },
  {
    id: 'time_3',
    taskId: 'task_2',
    taskTitle: 'Refactor Authentication Payload & JWT Rotation',
    userId: 'usr_4',
    userName: 'Marcus Vance',
    hours: 8,
    description: 'Updated client auth context interceptor and silent refresh loop.',
    date: '2026-08-06',
    createdAt: '2026-08-06T16:00:00Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    actorId: 'usr_1',
    actorName: 'Sarah Connor',
    actorRole: 'Super Admin',
    action: 'Task Completed',
    entityType: 'Task',
    entityName: 'Audit User Permission RBAC Matrix & Telemetry Logs',
    details: 'Verified strict RBAC privilege boundaries across all user roles.',
    timestamp: '2026-08-05T17:00:00Z'
  },
  {
    id: 'log_2',
    actorId: 'usr_3',
    actorName: 'Elena Rostova',
    actorRole: 'Senior Engineer',
    action: 'Time Logged',
    entityType: 'Task',
    entityName: 'Build Server-Side Gemini 3.6 Task Decomposition Endpoint',
    details: 'Logged 4.0 hours with notes: "Structured @google/genai JSON schema".',
    timestamp: '2026-08-06T12:00:00Z'
  },
  {
    id: 'log_3',
    actorId: 'usr_2',
    actorName: 'Alex Mercer',
    actorRole: 'Project Manager',
    action: 'AI Task Decomposition Executed',
    entityType: 'AI',
    entityName: 'Gemini 3.6 Flash Copilot',
    details: 'Generated 3 subtasks and estimated 20.0 hours for AI-201.',
    timestamp: '2026-08-06T14:15:00Z'
  }
];

export const initialComments: TaskComment[] = [
  {
    id: 'cmt_1',
    taskId: 'task_1',
    authorId: 'usr_2',
    authorName: 'Alex Mercer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'Ensure we test the Redis fallback when the primary node is unreachable.',
    createdAt: '2026-08-04T10:30:00Z'
  },
  {
    id: 'cmt_2',
    taskId: 'task_1',
    authorId: 'usr_3',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content: 'Added full retry logic with exponential backoff. Testing with unit suite now.',
    createdAt: '2026-08-05T14:20:00Z'
  }
];

export const initialFeatureFlags: FeatureFlag[] = [
  { key: 'enableGeminiDecompose', name: 'Gemini AI Task Decomposition', description: 'Allow AI auto-decomposition of backlog items', enabled: true, category: 'AI' },
  { key: 'enableRealtimeSSE', name: 'Real-time Telemetry Notifications', description: 'Stream live notifications and task updates', enabled: true, category: 'Performance' },
  { key: 'enableSprintRiskAudit', name: 'Automated Sprint Risk Scanner', description: 'Background AI risk detection on active sprints', enabled: true, category: 'AI' },
  { key: 'enableAuditPersistence', name: 'Immutable System Audit Logging', description: 'Persist security events and RBAC mutations', enabled: true, category: 'Security' },
  { key: 'enableNeoBrutalistTheme', name: 'High-Contrast Enterprise UI Theme', description: 'Enable stark high-contrast visual layout', enabled: true, category: 'UI' }
];

export const initialBackgroundJobs: BackgroundJob[] = [
  { id: 'job_1', name: 'Daily Sprint Burndown Aggregator', schedule: '0 0 * * *', lastRun: new Date().toISOString(), status: 'COMPLETED', durationMs: 1420, recordsProcessed: 48 },
  { id: 'job_2', name: 'Automated AI Risk Assessment Engine', schedule: '0 */6 * * *', lastRun: new Date().toISOString(), status: 'IDLE', durationMs: 3850, recordsProcessed: 12 },
  { id: 'job_3', name: 'Security Audit Log Archiver & Vacuum', schedule: '0 1 * * 0', lastRun: new Date(Date.now() - 86400000).toISOString(), status: 'COMPLETED', durationMs: 820, recordsProcessed: 156 },
  { id: 'job_4', name: 'Email Telemetry & Weekly Standup Dispatcher', schedule: '0 8 * * 1', lastRun: new Date().toISOString(), status: 'IDLE', durationMs: 2100, recordsProcessed: 5 }
];

export const initialNotifications: NotificationItem[] = [
  { id: 'notif_1', title: 'SECURITY AUDIT COMPLETE', message: 'SOC2 RBAC matrix verified across all active user roles.', type: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), read: false },
  { id: 'notif_2', title: 'CRITICAL TASK ASSIGNED', message: 'You have been assigned to CORE-101 (Resilient Circuit Breaker).', type: 'warning', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: false },
  { id: 'notif_3', title: 'SPRINT 24 MILESTONE REACHED', message: 'Sprint 24 velocity achieved 66% completion benchmark.', type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), read: true }
];

// In-Memory Database Class
class DatabaseStore {
  private users: User[] = initialUsers.map(u => ({
    ...u,
    accountLocked: false,
    failedLoginAttempts: 0,
    permissions: u.role === 'Super Admin' ? ['ALL'] : ['TASK_READ', 'TASK_WRITE', 'TIME_LOG', 'AI_EXECUTE']
  }));
  private projects: Project[] = [...initialProjects];
  private sprints: Sprint[] = [...initialSprints];
  private tasks: Task[] = [...initialTasks];
  private timeEntries: TimeEntry[] = [...initialTimeEntries];
  private auditLogs: AuditLog[] = [...initialAuditLogs];
  private comments: TaskComment[] = [...initialComments];
  private featureFlags: FeatureFlag[] = [...initialFeatureFlags];
  private backgroundJobs: BackgroundJob[] = [...initialBackgroundJobs];
  private notifications: NotificationItem[] = [...initialNotifications];

  // Feature Flags & Config
  getFeatureFlags(): FeatureFlag[] {
    return this.featureFlags;
  }

  toggleFeatureFlag(key: string): FeatureFlag | undefined {
    const flag = this.featureFlags.find(f => f.key === key);
    if (flag) {
      flag.enabled = !flag.enabled;
    }
    return flag;
  }

  // Background Jobs
  getBackgroundJobs(): BackgroundJob[] {
    return this.backgroundJobs;
  }

  triggerBackgroundJob(id: string): BackgroundJob | undefined {
    const job = this.backgroundJobs.find(j => j.id === id);
    if (job) {
      job.status = 'RUNNING';
      setTimeout(() => {
        job.status = 'COMPLETED';
        job.lastRun = new Date().toISOString();
        job.recordsProcessed += Math.floor(Math.random() * 20) + 5;
      }, 1500);
    }
    return job;
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  pushNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  // Global Search Across Platform
  globalSearch(query: string) {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: any[] = [];

    // Search Projects
    this.projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        results.push({
          type: 'project',
          id: p.id,
          title: `[${p.key}] ${p.name}`,
          subtitle: `Project • ${p.category} • ${p.status}`,
          badge: p.riskLevel
        });
      }
    });

    // Search Tasks
    this.tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        results.push({
          type: 'task',
          id: t.id,
          title: `[${t.key}] ${t.title}`,
          subtitle: `Task • Status: ${t.status} • Assignee: ${t.assigneeName || 'Unassigned'}`,
          badge: t.priority
        });
      }
    });

    // Search Sprints
    this.sprints.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.goal.toLowerCase().includes(q)) {
        results.push({
          type: 'sprint',
          id: s.id,
          title: s.name,
          subtitle: `Sprint • Points: ${s.completedPoints}/${s.totalPoints} • Status: ${s.status}`,
          badge: s.status
        });
      }
    });

    // Search Users
    this.users.forEach(u => {
      if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
        results.push({
          type: 'user',
          id: u.id,
          title: u.name,
          subtitle: `Team Member • ${u.role} • ${u.department}`,
          badge: u.role
        });
      }
    });

    return results.slice(0, 15);
  }

  // User Management
  updateUserRole(id: string, newRole: any, permissions?: string[]): User | undefined {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.role = newRole;
      if (permissions) user.permissions = permissions;
    }
    return user;
  }

  toggleUserLock(id: string): User | undefined {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.accountLocked = !user.accountLocked;
      if (!user.accountLocked) user.failedLoginAttempts = 0;
    }
    return user;
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name || 'New Member',
      email: userData.email || 'member@pulseflow.io',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: userData.role || 'Staff Contributor',
      department: userData.department || 'Engineering',
      accountLocked: false,
      failedLoginAttempts: 0,
      permissions: ['TASK_READ', 'TASK_WRITE', 'TIME_LOG']
    };
    this.users.push(newUser);
    return newUser;
  }


  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // Projects
  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  createProject(projectData: Omit<Project, 'id' | 'loggedHours' | 'membersCount'>): Project {
    const newProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      loggedHours: 0,
      membersCount: 1
    };
    this.projects.push(newProject);
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.projects[index] = { ...this.projects[index], ...updates };
    return this.projects[index];
  }

  // Tasks
  getTasks(filters?: {
    projectId?: string;
    sprintId?: string;
    assigneeId?: string;
    status?: string;
    search?: string;
  }): Task[] {
    let result = [...this.tasks];

    if (filters?.projectId) {
      result = result.filter(t => t.projectId === filters.projectId);
    }
    if (filters?.sprintId) {
      result = result.filter(t => t.sprintId === filters.sprintId);
    }
    if (filters?.assigneeId) {
      result = result.filter(t => t.assigneeId === filters.assigneeId);
    }
    if (filters?.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.key.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  createTask(taskData: Omit<Task, 'id' | 'key' | 'loggedHours' | 'createdAt' | 'updatedAt'>): Task {
    const proj = this.getProjectById(taskData.projectId);
    const keyPrefix = proj ? proj.key : 'PULSE';
    const num = this.tasks.length + 101;
    
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      key: `${keyPrefix}-${num}`,
      loggedHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.tasks[index];
  }

  deleteTask(id: string): boolean {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    return this.tasks.length < initialLen;
  }

  // Comments
  getCommentsByTaskId(taskId: string): TaskComment[] {
    return this.comments.filter(c => c.taskId === taskId);
  }

  addComment(commentData: Omit<TaskComment, 'id' | 'createdAt'>): TaskComment {
    const newComment: TaskComment = {
      ...commentData,
      id: `cmt_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.comments.push(newComment);
    return newComment;
  }

  // Sprints
  getSprints(projectId?: string): Sprint[] {
    if (projectId) {
      return this.sprints.filter(s => s.projectId === projectId);
    }
    return this.sprints;
  }

  createSprint(sprintData: Omit<Sprint, 'id'>): Sprint {
    const newSprint: Sprint = {
      ...sprintData,
      id: `sprint_${Date.now()}`
    };
    this.sprints.push(newSprint);
    return newSprint;
  }

  // Time Entries
  getTimeEntries(taskId?: string): TimeEntry[] {
    if (taskId) {
      return this.timeEntries.filter(t => t.taskId === taskId);
    }
    return this.timeEntries;
  }

  addTimeEntry(entryData: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `time_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.timeEntries.push(newEntry);

    // Also update logged hours on task and project
    const task = this.getTaskById(entryData.taskId);
    if (task) {
      this.updateTask(task.id, { loggedHours: task.loggedHours + entryData.hours });
      const proj = this.getProjectById(task.projectId);
      if (proj) {
        this.updateProject(proj.id, { loggedHours: proj.loggedHours + entryData.hours });
      }
    }

    return newEntry;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  logAudit(audit: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...audit,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  // Metrics
  getMetrics(): WorkspaceMetrics {
    const totalProjects = this.projects.length;
    const activeProjects = this.projects.filter(p => p.status === 'Active').length;
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'In Progress').length;
    
    const now = new Date();
    const overdueTasks = this.tasks.filter(t => {
      if (t.status === 'Completed') return false;
      return new Date(t.dueDate) < now;
    }).length;

    const totalLoggedHours = this.timeEntries.reduce((acc, curr) => acc + curr.hours, 0);
    const budgetHours = this.projects.reduce((acc, curr) => acc + curr.budgetHours, 0);

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalLoggedHours,
      budgetHours,
      teamMembersCount: this.users.length
    };
  }
}

export const db = new DatabaseStore();
