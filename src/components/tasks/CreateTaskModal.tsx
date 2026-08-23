import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { TaskPriority, TaskStatus } from '../../types/index.js';
import {
  Modal,
  Button,
  Input,
  Select
} from '../ui/index.js';
import { Sparkles } from 'lucide-react';

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    projects,
    sprints,
    createTask,
    selectedProject,
    showToast
  } = useProjects();

  const { allUsers, currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(selectedProject?.id || projects[0]?.id || '');
  const [sprintId, setSprintId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [estimatedHours, setEstimatedHours] = useState('8');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('Frontend, Feature');
  const [autoAiDecompose, setAutoAiDecompose] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      let subtasks: { id: string; title: string; completed: boolean; estimatedHours: number }[] = [];

      // If Auto AI Decompose is selected, request AI subtasks immediately upon task creation
      if (autoAiDecompose) {
        try {
          const aiRes = await fetch('/api/ai/decompose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
          });
          const aiData = await aiRes.json();
          if (aiData.subtasks) {
            subtasks = aiData.subtasks.map((st: any, idx: number) => ({
              id: `sub_init_${Date.now()}_${idx}`,
              title: st.title,
              completed: false,
              estimatedHours: st.estimatedHours || 2
            }));
          }
        } catch (err) {
          console.error('Auto AI decompose skipped:', err);
        }
      }

      await createTask({
        title,
        description,
        projectId,
        sprintId: sprintId || undefined,
        assigneeId: assigneeId || undefined,
        priority,
        status,
        estimatedHours: parseFloat(estimatedHours) || 8,
        dueDate,
        tags,
        subtasks,
        reporterId: currentUser?.id || 'usr_1'
      });

      setIsCreateTaskModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      showToast(`Error creating task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => setIsCreateTaskModalOpen(false)}
      title="CREATE ENTERPRISE WORK ITEM"
      subtitle="Provision a new work item with sprint assignment and AI decomposition"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        
        {/* Title */}
        <Input
          label="TASK TITLE *"
          required
          placeholder="E.G., INTEGRATE REDIS CACHE RESILIENCY LAYER"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            DESCRIPTION & REQUIREMENTS
          </label>
          <textarea
            rows={3}
            placeholder="PROVIDE TECHNICAL SCOPE, ACCEPTANCE CRITERIA, OR ARCHITECTURAL CONTEXT..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--text-primary)] uppercase p-3 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
          />
        </div>

        {/* Project & Sprint Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="TARGET PROJECT *"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
            ))}
          </Select>

          <Select
            label="SPRINT ASSIGNMENT"
            value={sprintId}
            onChange={e => setSprintId(e.target.value)}
          >
            <option value="">BACKLOG (NO ACTIVE SPRINT)</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>

        {/* Priority, Assignee, Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="PRIORITY"
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
          >
            <option value="Low">LOW</option>
            <option value="Medium">MEDIUM</option>
            <option value="High">HIGH</option>
            <option value="Critical">CRITICAL</option>
          </Select>

          <Select
            label="ASSIGNEE"
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
          >
            <option value="">UNASSIGNED</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </Select>

          <Input
            label="EST. HOURS"
            type="number"
            value={estimatedHours}
            onChange={e => setEstimatedHours(e.target.value)}
          />
        </div>

        {/* Due Date & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="TARGET DUE DATE"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          <Input
            label="TAGS (COMMA-SEPARATED)"
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />
        </div>

        {/* Auto AI Decompose Toggle */}
        <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
            <div>
              <span className="font-bold text-[var(--text-primary)] uppercase">AUTO-GENERATE AI SUBTASKS</span>
              <p className="text-[10px] text-[var(--text-muted)] uppercase">USE GEMINI 3.6 FLASH TO AUTOMATICALLY STRUCTURE SUBTASKS.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoAiDecompose}
            onChange={e => setAutoAiDecompose(e.target.checked)}
            className="h-4 w-4 bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--brand-primary)] cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsCreateTaskModalOpen(false)}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            CREATE TASK
          </Button>
        </div>

      </form>
    </Modal>
  );
};
