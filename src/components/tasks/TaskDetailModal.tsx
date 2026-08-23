import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Task, TaskComment, Subtask } from '../../types/index.js';
import {
  Modal,
  Card,
  Badge,
  Button,
  Input,
  Select,
  Skeleton
} from '../ui/index.js';
import {
  Sparkles,
  CheckSquare,
  Clock,
  MessageSquare,
  User,
  Send,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const { selectedTaskId, setSelectedTaskId, refreshData, showToast } = useProjects();
  const { currentUser } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Time entry form state
  const [hoursToLog, setHoursToLog] = useState('');
  const [timeDescription, setTimeDescription] = useState('');

  // Comment form state
  const [commentText, setCommentText] = useState('');

  // AI Decompose loading state
  const [isDecomposing, setIsDecomposing] = useState(false);

  const fetchTaskDetails = async () => {
    if (!selectedTaskId) return;
    setIsLoading(true);
    try {
      const [tData, cData] = await Promise.all([
        api.getTaskById(selectedTaskId),
        api.getComments(selectedTaskId)
      ]);
      setTask(tData);
      setComments(cData);
    } catch (err: any) {
      showToast(`Error fetching task details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [selectedTaskId]);

  if (!selectedTaskId) return null;

  const handleToggleSubtask = async (subId: string) => {
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(s =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    setTask({ ...task, subtasks: updatedSubtasks });
    await api.updateTask(task.id, { subtasks: updatedSubtasks });
    await refreshData();
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !hoursToLog) return;
    const hrs = parseFloat(hoursToLog);
    if (isNaN(hrs) || hrs <= 0) return;

    try {
      await api.addTimeEntry({
        taskId: task.id,
        hours: hrs,
        description: timeDescription || 'Work logged on task',
        userId: currentUser?.id
      });
      showToast(`Logged ${hrs} hours on ${task.key}`);
      setHoursToLog('');
      setTimeDescription('');
      await fetchTaskDetails();
      await refreshData();
    } catch (err: any) {
      showToast(`Failed to log time: ${err.message}`);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentText.trim()) return;

    try {
      const newComment = await api.addComment(task.id, commentText, currentUser?.id);
      setComments([...comments, newComment]);
      setCommentText('');
      showToast('Comment posted');
    } catch (err: any) {
      showToast(`Failed to post comment: ${err.message}`);
    }
  };

  const handleAIDecompose = async () => {
    if (!task) return;
    setIsDecomposing(true);
    try {
      const aiResult = await api.aiDecompose(task.title, task.description);
      
      // Convert AI subtasks to system subtasks
      const generatedSubtasks: Subtask[] = aiResult.subtasks.map((st, idx) => ({
        id: `sub_ai_${Date.now()}_${idx}`,
        title: st.title,
        completed: false,
        estimatedHours: st.estimatedHours
      }));

      const mergedSubtasks = [...task.subtasks, ...generatedSubtasks];
      
      await api.updateTask(task.id, {
        subtasks: mergedSubtasks,
        estimatedHours: Math.max(task.estimatedHours, aiResult.estimatedHours)
      });

      showToast(`AI generated ${generatedSubtasks.length} intelligent subtasks!`);
      await fetchTaskDetails();
      await refreshData();
    } catch (err: any) {
      showToast(`AI Decomposition error: ${err.message}`);
    } finally {
      setIsDecomposing(false);
    }
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => setSelectedTaskId(null)}
      title={task ? `[${task.key}] TASK EXECUTION CONSOLE` : 'TASK EXECUTION CONSOLE'}
      maxWidth="2xl"
    >
      {isLoading || !task ? (
        <div className="space-y-4 p-4">
          <Skeleton height="32px" className="w-3/4" />
          <Skeleton height="100px" className="w-full" />
        </div>
      ) : (
        <div className="space-y-6 font-mono text-xs text-[var(--text-primary)]">
          
          {/* Header & Title */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">{task.title}</h1>
              <Badge variant={getPriorityBadgeVariant(task.priority)} size="md">
                {task.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] mt-3 pb-3 border-b border-[var(--border-subtle)] uppercase">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <span>ASSIGNEE: <strong className="text-[var(--text-primary)]">{task.assigneeName || 'UNASSIGNED'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--status-warning)]" />
                <span>EFFORT: <strong className="text-[var(--text-primary)]">{task.loggedHours} / {task.estimatedHours}H</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <span>DUE: <strong className="text-[var(--text-primary)]">{task.dueDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">DESCRIPTION</span>
            <div className="text-xs text-[var(--text-secondary)] uppercase leading-relaxed bg-[var(--bg-canvas)] p-3 border border-[var(--border-subtle)]">
              {task.description || 'NO DESCRIPTION PROVIDED.'}
            </div>
          </div>

          {/* Subtasks Section & Gemini Decompose */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[var(--status-success)]" />
                <span>SUBTASK CHECKLIST ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
              </span>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAIDecompose}
                isLoading={isDecomposing}
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                GEMINI DECOMPOSE
              </Button>
            </div>

            <div className="space-y-2">
              {task.subtasks.map(st => (
                <label
                  key={st.id}
                  className="flex items-center justify-between bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-2.5 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="bg-[var(--bg-canvas)] border-[var(--border-default)] text-[var(--brand-primary)] h-4 w-4"
                    />
                    <span className={st.completed ? 'line-through text-[var(--text-muted)] uppercase' : 'text-[var(--text-primary)] font-bold uppercase'}>
                      {st.title}
                    </span>
                  </div>
                  {st.estimatedHours && (
                    <Badge variant="neutral" size="sm">
                      {st.estimatedHours}H EST
                    </Badge>
                  )}
                </label>
              ))}

              {task.subtasks.length === 0 && (
                <div className="text-center py-4 text-xs text-[var(--text-muted)] uppercase border border-dashed border-[var(--border-subtle)]">
                  NO SUBTASKS YET. CLICK "GEMINI DECOMPOSE" TO AUTO-GENERATE SUBTASKS.
                </div>
              )}
            </div>
          </div>

          {/* Time Logging Form */}
          <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 space-y-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--status-warning)]" />
              <span>LOG HOURS SPENT</span>
            </span>

            <form onSubmit={handleLogTime} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                step="0.5"
                placeholder="HOURS (2.5)"
                value={hoursToLog}
                onChange={e => setHoursToLog(e.target.value)}
                className="w-full sm:w-32"
                required
              />
              <Input
                type="text"
                placeholder="WORK DESCRIPTION..."
                value={timeDescription}
                onChange={e => setTimeDescription(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary" size="md">
                LOG WORK
              </Button>
            </form>
          </div>

          {/* Comments Thread */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>ACTIVITY & COMMENTS ({comments.length})</span>
            </span>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] uppercase">
                    <div className="flex items-center gap-2">
                      <img src={c.authorAvatar} alt="" className="h-4 w-4 border border-[var(--brand-primary)]" />
                      <span className="font-bold text-[var(--text-primary)]">{c.authorName}</span>
                    </div>
                    <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] uppercase leading-relaxed pl-6">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <Input
                type="text"
                placeholder="TYPE A COMMENT..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary" size="md">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>
      )}
    </Modal>
  );
};
