import React, { useState, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { TaskStatus, TaskPriority, Task } from '../../types/index.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  EmptyState,
  Skeleton
} from '../ui/index.js';
import {
  Plus,
  Clock,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Kanban,
  Tag,
  User
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string; accentColor: string }[] = [
  { id: 'Backlog', label: 'BACKLOG', accentColor: 'var(--text-muted)' },
  { id: 'To Do', label: 'TO DO', accentColor: 'var(--brand-primary)' },
  { id: 'In Progress', label: 'IN PROGRESS', accentColor: 'var(--status-warning)' },
  { id: 'In Review', label: 'IN REVIEW', accentColor: 'var(--status-info)' },
  { id: 'Completed', label: 'COMPLETED', accentColor: 'var(--status-success)' }
];

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    selectedProject,
    updateTaskStatus,
    setSelectedTaskId,
    setIsCreateTaskModalOpen,
    priorityFilter,
    setPriorityFilter
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, priorityFilter, searchQuery]);

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
    }
  };

  const getNextStatus = (curr: TaskStatus): TaskStatus | null => {
    const idx = COLUMNS.findIndex(c => c.id === curr);
    if (idx < COLUMNS.length - 1) return COLUMNS[idx + 1].id;
    return null;
  };

  const getPrevStatus = (curr: TaskStatus): TaskStatus | null => {
    const idx = COLUMNS.findIndex(c => c.id === curr);
    if (idx > 0) return COLUMNS[idx - 1].id;
    return null;
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)] font-sans antialiased">
      
      {/* Header & Filter Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
            <Kanban className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>AGILE KANBAN BOARD</span>
            {selectedProject && (
              <>
                <span className="text-[var(--border-default)]">•</span>
                <span className="text-[var(--brand-primary)] font-bold">[{selectedProject.key}] {selectedProject.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[var(--text-primary)]">
            KANBAN WORKFLOW & TELEMETRY
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 uppercase">
            Manage task status transitions across sprints ({filteredTasks.length} ITEMS ON BOARD).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-mono text-xs">
          
          {/* Inline Search Input */}
          <div className="w-full sm:w-48">
            <Input
              placeholder="SEARCH BOARD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
            />
          </div>

          {/* Priority Select */}
          <div className="w-40">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="Critical">CRITICAL ONLY</option>
              <option value="High">HIGH ONLY</option>
              <option value="Medium">MEDIUM ONLY</option>
              <option value="Low">LOW ONLY</option>
            </Select>
          </div>

          {/* Create Task Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateTaskModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            CREATE TASK
          </Button>
        </div>
      </div>

      {/* Kanban Columns Grid (Responsive Scroll Wrapper) */}
      <div className="flex overflow-x-auto pb-4 gap-4 items-start md:grid md:grid-cols-5 md:overflow-x-visible">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className="w-72 md:w-auto shrink-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 flex flex-col min-h-[560px] space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.accentColor }}
                  />
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)] tracking-wider uppercase">
                    {col.label}
                  </span>
                </div>
                <Badge variant="neutral" size="sm">
                  {colTasks.length}
                </Badge>
              </div>

              {/* Task Cards Stack */}
              <div className="space-y-3 flex-1">
                {colTasks.map((task: Task) => {
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const prevStatus = getPrevStatus(task.status);
                  const nextStatus = getNextStatus(task.status);

                  return (
                    <Card
                      key={task.id}
                      variant="interactive"
                      padding="sm"
                      className="flex flex-col justify-between space-y-2.5 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Top Row: Key & Priority */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="medium"
                          size="sm"
                          className="cursor-pointer hover:underline"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          {task.key}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Task Title */}
                      <div
                        onClick={() => setSelectedTaskId(task.id)}
                        className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer uppercase tracking-tight leading-snug"
                      >
                        {task.title}
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 font-mono">
                          {task.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[9px] bg-[var(--bg-canvas)] text-[var(--text-muted)] px-1.5 py-0.2 uppercase border border-[var(--border-subtle)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Subtasks & Hours Metrics */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1.5 border-t border-[var(--border-subtle)] uppercase">
                        {totalSubtasks > 0 ? (
                          <div className="flex items-center gap-1 text-[var(--text-primary)]">
                            <CheckSquare className="h-3 w-3 text-[var(--status-success)]" />
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">NO SUBTASKS</span>
                        )}

                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[var(--status-warning)]" />
                          <span>{task.loggedHours}/{task.estimatedHours}H</span>
                        </div>
                      </div>

                      {/* Assignee & Status Transition Arrow Buttons */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {task.assigneeAvatar ? (
                            <img
                              src={task.assigneeAvatar}
                              alt=""
                              className="h-4 w-4 object-cover border border-[var(--brand-primary)] shrink-0"
                            />
                          ) : (
                            <User className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                          )}
                          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase truncate max-w-[80px]">
                            {task.assigneeName?.split(' ')[0] || 'UNASSIGNED'}
                          </span>
                        </div>

                        {/* Transition Arrows */}
                        <div className="flex items-center gap-1">
                          {prevStatus && (
                            <button
                              onClick={() => updateTaskStatus(task.id, prevStatus)}
                              title={`Move back to ${prevStatus}`}
                              className="p-1 bg-[var(--bg-canvas)] hover:bg-[var(--brand-primary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors cursor-pointer"
                              aria-label={`Move back to ${prevStatus}`}
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => updateTaskStatus(task.id, nextStatus)}
                              title={`Move forward to ${nextStatus}`}
                              className="p-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white transition-colors cursor-pointer"
                              aria-label={`Move forward to ${nextStatus}`}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {colTasks.length === 0 && (
                  <EmptyState
                    title="EMPTY COLUMN"
                    description="No tasks currently in this column."
                    className="py-8"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
