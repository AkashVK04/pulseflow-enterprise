import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import {
  decomposeTaskWithAI,
  generateSprintSummaryWithAI,
  auditProjectRisksWithAI,
  chatWithPulseFlowAI
} from './src/server/geminiService.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Logging & Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // SSE Notifications Clients Array
  const sseClients: express.Response[] = [];

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'PulseFlow Enterprise', timestamp: new Date().toISOString() });
  });

  // Authentication & Security
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid enterprise credentials' });
    }

    if (user.accountLocked) {
      return res.status(403).json({ error: 'Account locked due to security policy violations. Contact Super Admin.' });
    }

    const accessToken = `jwt_access_${user.id}_${Date.now()}`;
    const refreshToken = `jwt_refresh_${user.id}_${Date.now()}`;

    db.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'User Login Authenticated',
      entityType: 'User',
      entityName: user.name,
      details: 'JWT Access Token generated with scope permissions.'
    });

    res.json({
      user,
      accessToken,
      refreshToken,
      expiresIn: 3600
    });
  });

  app.post('/api/auth/google', (req, res) => {
    const user = db.getUsers()[0]; // Sarah Connor
    res.json({
      user,
      accessToken: `google_oauth2_token_${Date.now()}`,
      provider: 'Google Workspace OAuth2'
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    res.json({ message: `Password reset instructions sent to ${email}` });
  });

  app.get('/api/auth/me', (req, res) => {
    const defaultUser = db.getUsers()[0];
    res.json({ user: defaultUser, allUsers: db.getUsers() });
  });

  // Global Search
  app.get('/api/search', (req, res) => {
    const q = (req.query.q as string) || '';
    res.json(db.globalSearch(q));
  });

  // Feature Flags
  app.get('/api/admin/feature-flags', (req, res) => {
    res.json(db.getFeatureFlags());
  });

  app.put('/api/admin/feature-flags/:key', (req, res) => {
    const updated = db.toggleFeatureFlag(req.params.key);
    if (!updated) return res.status(404).json({ error: 'Flag not found' });
    
    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Feature Flag Toggled',
      entityType: 'User',
      entityName: updated.name,
      details: `Flag "${updated.key}" set to ${updated.enabled ? 'ENABLED' : 'DISABLED'}.`
    });

    res.json(updated);
  });

  // Background Jobs
  app.get('/api/admin/background-jobs', (req, res) => {
    res.json(db.getBackgroundJobs());
  });

  app.post('/api/admin/background-jobs/:id/trigger', (req, res) => {
    const job = db.triggerBackgroundJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Background Job Manual Trigger',
      entityType: 'User',
      entityName: job.name,
      details: `Forced execution of job [${job.id}].`
    });

    res.json(job);
  });

  // Notifications & Realtime SSE Stream
  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  app.put('/api/notifications/read-all', (req, res) => {
    db.markAllNotificationsRead();
    res.json({ success: true });
  });

  app.get('/api/notifications/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time telemetry SSE stream active' })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  const broadcastSSE = (event: any) => {
    sseClients.forEach(client => {
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    });
  };

  // User Management
  app.post('/api/admin/users', (req, res) => {
    const newUser = db.createUser(req.body);
    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'User Created',
      entityType: 'User',
      entityName: newUser.name,
      details: `Provisioned user with role "${newUser.role}".`
    });
    res.status(201).json(newUser);
  });

  app.put('/api/admin/users/:id/role', (req, res) => {
    const { role, permissions } = req.body;
    const updated = db.updateUserRole(req.params.id, role, permissions);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'User Role & Permissions Updated',
      entityType: 'User',
      entityName: updated.name,
      details: `Role updated to "${updated.role}".`
    });

    res.json(updated);
  });

  app.put('/api/admin/users/:id/lock', (req, res) => {
    const updated = db.toggleUserLock(req.params.id);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: updated.accountLocked ? 'Account Locked' : 'Account Unlocked',
      entityType: 'User',
      entityName: updated.name,
      details: `Security status toggled. Locked: ${updated.accountLocked}.`
    });

    res.json(updated);
  });

  // Export CSV
  app.get('/api/reports/tasks/csv', (req, res) => {
    const tasks = db.getTasks();
    let csv = 'Key,Title,Status,Priority,Project,Assignee,LoggedHours,EstimatedHours,DueDate\n';
    tasks.forEach(t => {
      csv += `"${t.key}","${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.projectId}","${t.assigneeName || ''}",${t.loggedHours},${t.estimatedHours},"${t.dueDate}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pulseflow-tasks-report.csv"');
    res.status(200).send(csv);
  });

  app.get('/api/reports/audit/csv', (req, res) => {
    const logs = db.getAuditLogs();
    let csv = 'Timestamp,Actor,Role,Action,EntityType,EntityName,Details\n';
    logs.forEach(l => {
      csv += `"${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.entityType}","${l.entityName.replace(/"/g, '""')}","${l.details.replace(/"/g, '""')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pulseflow-audit-trail.csv"');
    res.status(200).send(csv);
  });


  // Users List
  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  // Workspace Metrics
  app.get('/api/workspaces/metrics', (req, res) => {
    res.json(db.getMetrics());
  });

  // Projects
  app.get('/api/projects', (req, res) => {
    res.json(db.getProjects());
  });

  app.get('/api/projects/:id', (req, res) => {
    const proj = db.getProjectById(req.params.id);
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    res.json(proj);
  });

  app.post('/api/projects', (req, res) => {
    const { name, key, description, category, leadId, leadName, startDate, targetEndDate, budgetHours, riskLevel } = req.body;
    if (!name || !key) {
      return res.status(400).json({ error: 'Name and key are required fields' });
    }
    const newProj = db.createProject({
      name,
      key: key.toUpperCase(),
      description: description || '',
      category: category || 'Engineering',
      leadId: leadId || 'usr_1',
      leadName: leadName || 'Sarah Connor',
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetEndDate: targetEndDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      budgetHours: Number(budgetHours) || 500,
      status: 'Active',
      riskLevel: riskLevel || 'Low'
    });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Project Created',
      entityType: 'Project',
      entityName: newProj.name,
      details: `Created new project [${newProj.key}] with budget of ${newProj.budgetHours} hours.`
    });

    res.status(201).json(newProj);
  });

  app.put('/api/projects/:id', (req, res) => {
    const updated = db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Project Updated',
      entityType: 'Project',
      entityName: updated.name,
      details: `Updated project status to ${updated.status} and risk level to ${updated.riskLevel}.`
    });

    res.json(updated);
  });

  // Tasks
  app.get('/api/tasks', (req, res) => {
    const { projectId, sprintId, assigneeId, status, search } = req.query;
    const tasks = db.getTasks({
      projectId: projectId as string,
      sprintId: sprintId as string,
      assigneeId: assigneeId as string,
      status: status as string,
      search: search as string
    });
    res.json(tasks);
  });

  app.get('/api/tasks/:id', (req, res) => {
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, description, priority, status, projectId, sprintId, assigneeId, estimatedHours, dueDate, tags, subtasks, reporterId } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId are required' });
    }

    const assignee = assigneeId ? db.getUserById(assigneeId) : undefined;

    const newTask = db.createTask({
      title,
      description: description || '',
      priority: priority || 'Medium',
      status: status || 'To Do',
      projectId,
      sprintId: sprintId || undefined,
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      assigneeAvatar: assignee?.avatar,
      reporterId: reporterId || 'usr_1',
      estimatedHours: Number(estimatedHours) || 8,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: Array.isArray(tags) ? tags : ['General'],
      subtasks: Array.isArray(subtasks) ? subtasks : []
    });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Task Created',
      entityType: 'Task',
      entityName: `${newTask.key}: ${newTask.title}`,
      details: `Created task with priority ${newTask.priority} and ${newTask.subtasks.length} subtasks.`
    });

    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const existing = db.getTaskById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    // Handle assignee update
    if (req.body.assigneeId && req.body.assigneeId !== existing.assigneeId) {
      const assignee = db.getUserById(req.body.assigneeId);
      if (assignee) {
        req.body.assigneeName = assignee.name;
        req.body.assigneeAvatar = assignee.avatar;
      }
    }

    const updated = db.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Update failed' });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Task Updated',
      entityType: 'Task',
      entityName: `${updated.key}: ${updated.title}`,
      details: `Status changed to "${updated.status}", priority: "${updated.priority}".`
    });

    res.json(updated);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const task = db.getTaskById(req.params.id);
    const success = db.deleteTask(req.params.id);
    if (!success) return res.status(404).json({ error: 'Task not found' });

    if (task) {
      db.logAudit({
        actorId: 'usr_1',
        actorName: 'Sarah Connor',
        actorRole: 'Super Admin',
        action: 'Task Deleted',
        entityType: 'Task',
        entityName: `${task.key}: ${task.title}`,
        details: 'Task removed from project backlog.'
      });
    }

    res.json({ message: 'Task deleted successfully' });
  });

  // Task Comments
  app.get('/api/tasks/:id/comments', (req, res) => {
    res.json(db.getCommentsByTaskId(req.params.id));
  });

  app.post('/api/tasks/:id/comments', (req, res) => {
    const { content, authorId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const author = db.getUserById(authorId || 'usr_1') || db.getUsers()[0];

    const newComment = db.addComment({
      taskId: req.params.id,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      content
    });

    res.status(201).json(newComment);
  });

  // Sprints
  app.get('/api/sprints', (req, res) => {
    const { projectId } = req.query;
    res.json(db.getSprints(projectId as string));
  });

  app.post('/api/sprints', (req, res) => {
    const { projectId, name, goal, startDate, endDate, totalPoints } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId and name are required' });
    }

    const newSprint = db.createSprint({
      projectId,
      name,
      goal: goal || '',
      status: 'Active',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      totalPoints: Number(totalPoints) || 30,
      completedPoints: 0
    });

    db.logAudit({
      actorId: 'usr_1',
      actorName: 'Sarah Connor',
      actorRole: 'Super Admin',
      action: 'Sprint Planned',
      entityType: 'Sprint',
      entityName: newSprint.name,
      details: `Created new active sprint with ${newSprint.totalPoints} total story points.`
    });

    res.status(201).json(newSprint);
  });

  // Time Entries
  app.get('/api/time-entries', (req, res) => {
    const { taskId } = req.query;
    res.json(db.getTimeEntries(taskId as string));
  });

  app.post('/api/time-entries', (req, res) => {
    const { taskId, userId, hours, description, date } = req.body;
    if (!taskId || !hours) {
      return res.status(400).json({ error: 'taskId and hours are required' });
    }

    const task = db.getTaskById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const user = db.getUserById(userId || 'usr_1') || db.getUsers()[0];

    const newEntry = db.addTimeEntry({
      taskId,
      taskTitle: task.title,
      userId: user.id,
      userName: user.name,
      hours: Number(hours),
      description: description || 'Work completed',
      date: date || new Date().toISOString().split('T')[0]
    });

    db.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'Time Logged',
      entityType: 'Task',
      entityName: `${task.key}: ${task.title}`,
      details: `Logged ${newEntry.hours} hrs. Note: "${newEntry.description}".`
    });

    res.status(201).json(newEntry);
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.getAuditLogs());
  });

  // AI Endpoints
  app.post('/api/ai/decompose', async (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required for AI decomposition' });

    try {
      const result = await decomposeTaskWithAI(title, description || '');

      db.logAudit({
        actorId: 'usr_1',
        actorName: 'Sarah Connor',
        actorRole: 'Super Admin',
        action: 'AI Task Decomposition Executed',
        entityType: 'AI',
        entityName: title,
        details: `Gemini AI decomposed task into ${result.subtasks.length} subtasks and estimated ${result.estimatedHours} hours.`
      });

      res.json(result);
    } catch (err: any) {
      console.error('AI Decompose API error:', err);
      res.status(500).json({ error: err.message || 'AI processing failed' });
    }
  });

  app.post('/api/ai/standup', async (req, res) => {
    const { projectId } = req.body;
    const proj = projectId ? db.getProjectById(projectId) : db.getProjects()[0];
    const tasks = db.getTasks({ projectId: proj?.id });

    try {
      const summary = await generateSprintSummaryWithAI(proj?.name || 'Workspace', tasks);
      res.json(summary);
    } catch (err: any) {
      console.error('AI Standup API error:', err);
      res.status(500).json({ error: err.message || 'AI processing failed' });
    }
  });

  app.post('/api/ai/risk-audit', async (req, res) => {
    const { projectId } = req.body;
    const proj = projectId ? db.getProjectById(projectId) : db.getProjects()[0];
    const tasks = db.getTasks({ projectId: proj?.id });

    try {
      const riskReport = await auditProjectRisksWithAI(
        proj?.name || 'Workspace Project',
        proj?.budgetHours || 500,
        proj?.loggedHours || 120,
        tasks
      );
      res.json(riskReport);
    } catch (err: any) {
      console.error('AI Risk Audit API error:', err);
      res.status(500).json({ error: err.message || 'AI processing failed' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    const { query, context } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
      const reply = await chatWithPulseFlowAI(query, context);
      res.json({ response: reply });
    } catch (err: any) {
      console.error('AI Chat API error:', err);
      res.status(500).json({ error: err.message || 'AI processing failed' });
    }
  });

  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PulseFlow Enterprise Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
