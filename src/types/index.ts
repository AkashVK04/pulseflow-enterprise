export type UserRole = 
  | 'Super Admin'
  | 'Workspace Admin'
  | 'Project Manager'
  | 'Senior Engineer'
  | 'Staff Contributor'
  | 'Guest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  accountLocked?: boolean;
  failedLoginAttempts?: number;
  permissions?: string[];
}

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedHours?: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  key: string; // e.g. "PULSE-101"
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  sprintId?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  reporterId: string;
  estimatedHours: number;
  loggedHours: number;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  category: 'Engineering' | 'Product' | 'Marketing' | 'Operations';
  leadId: string;
  leadName: string;
  startDate: string;
  targetEndDate: string;
  budgetHours: number;
  loggedHours: number;
  membersCount: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  status: 'Planned' | 'Active' | 'Closed';
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  hours: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'Task' | 'Project' | 'Sprint' | 'User' | 'AI';
  entityName: string;
  details: string;
  timestamp: string;
}

export interface WorkspaceMetrics {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalLoggedHours: number;
  budgetHours: number;
  teamMembersCount: number;
}

export interface AIDecomposeResult {
  title: string;
  summary: string;
  estimatedHours: number;
  recommendedPriority: TaskPriority;
  recommendedRole: string;
  subtasks: { title: string; estimatedHours: number }[];
  riskFactors: string[];
}

export interface AISummaryResult {
  headline: string;
  statusOverview: string;
  keyAchievements: string[];
  blockersAndRisks: string[];
  recommendedActions: string[];
}

export interface AIRiskAnalysisResult {
  overallRiskScore: number; // 0-100
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  capacityWarning: string;
  timelineDelayEstimateDays: number;
  keyVulnerabilities: string[];
  mitigationPlan: string[];
}

export interface PermissionDefinition {
  code: string;
  name: string;
  category: 'Projects' | 'Tasks' | 'AI' | 'Admin' | 'Audit';
  description: string;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'AI' | 'Security' | 'UI' | 'Performance';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  durationMs: number;
  recordsProcessed: number;
}

export interface GlobalSearchResult {
  type: 'project' | 'task' | 'sprint' | 'user' | 'audit';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
}

