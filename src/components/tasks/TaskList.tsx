import React, { useState, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { Task, TaskPriority, TaskStatus } from '../../types/index.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  EmptyState
} from '../ui/index.js';
import {
  CheckSquare,
  Clock,
  Edit3,
  Plus,
  ArrowUpDown,
  Filter,
  Search,
  ListTodo,
  User,
  Calendar
} from 'lucide-react';

export const TaskList: React.FC = () => {
  const {
    tasks,
    selectedProject,
    setSelectedTaskId,
    updateTaskStatus,
    setIsCreateTaskModalOpen,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter
  } = useProjects();

  const [sortField, setSortField] = useState<'key' | 'priority' | 'status' | 'dueDate'>('key');
  const [sortAsc, setSortAsc] = useState(true);

  const priorityOrder: Record<TaskPriority, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.assigneeName && t.assigneeName.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      let result = 0;
      if (sortField === 'key') result = a.key.localeCompare(b.key);
      if (sortField === 'priority') result = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (sortField === 'status') result = a.status.localeCompare(b.status);
      if (sortField === 'dueDate') result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortAsc ? result : -result;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
    }
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)] font-sans antialiased">
      
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
            <ListTodo className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>ENTERPRISE INVENTORY</span>
            {selectedProject && (
              <>
                <span className="text-[var(--border-default)]">•</span>
                <span className="text-[var(--brand-primary)] font-bold">[{selectedProject.key}] {selectedProject.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[var(--text-primary)]">
            WORK ITEM INVENTORY
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 uppercase">
            Filter, re-assign, and audit work items ({filteredTasks.length} MATCHING TASKS).
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateTaskModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          NEW TASK
        </Button>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 shadow-sm font-mono text-xs">
        
        {/* Inline Search */}
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="SEARCH BY TITLE, KEY, ASSIGNEE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="Backlog">BACKLOG</option>
              <option value="To Do">TO DO</option>
              <option value="In Progress">IN PROGRESS</option>
              <option value="In Review">IN REVIEW</option>
              <option value="Completed">COMPLETED</option>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="w-36">
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

          {/* Sort Selection */}
          <div className="w-36">
            <Select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as any)}
            >
              <option value="key">SORT BY KEY</option>
              <option value="priority">SORT BY PRIORITY</option>
              <option value="status">SORT BY STATUS</option>
              <option value="dueDate">SORT BY DUE DATE</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Task Data Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('key')}>
              <div className="flex items-center gap-1">
                <span>KEY</span>
                <ArrowUpDown className="h-3 w-3 text-[var(--brand-primary)]" />
              </div>
            </TableHead>
            <TableHead>TITLE & SUBTASKS</TableHead>
            <TableHead className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('priority')}>
              <div className="flex items-center gap-1">
                <span>PRIORITY</span>
                <ArrowUpDown className="h-3 w-3 text-[var(--brand-primary)]" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('status')}>
              <div className="flex items-center gap-1">
                <span>STATUS</span>
                <ArrowUpDown className="h-3 w-3 text-[var(--brand-primary)]" />
              </div>
            </TableHead>
            <TableHead>ASSIGNEE</TableHead>
            <TableHead>LOGGED EFFORT</TableHead>
            <TableHead className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('dueDate')}>
              <div className="flex items-center gap-1">
                <span>DUE DATE</span>
                <ArrowUpDown className="h-3 w-3 text-[var(--brand-primary)]" />
              </div>
            </TableHead>
            <TableHead className="text-right">ACTION</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {filteredTasks.map((task: Task) => {
            const subCompleted = task.subtasks.filter(s => s.completed).length;
            const percentHours = Math.min(100, Math.round((task.loggedHours / (task.estimatedHours || 1)) * 100));

            return (
              <TableRow key={task.id}>
                
                {/* Key Badge */}
                <TableCell>
                  <Badge
                    variant="medium"
                    size="sm"
                    className="cursor-pointer hover:underline"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    {task.key}
                  </Badge>
                </TableCell>

                {/* Title & Subtasks */}
                <TableCell>
                  <div
                    onClick={() => setSelectedTaskId(task.id)}
                    className="font-bold text-xs text-[var(--text-primary)] hover:text-[var(--brand-primary)] uppercase tracking-tight cursor-pointer"
                  >
                    {task.title}
                  </div>
                  {task.subtasks.length > 0 && (
                    <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1 uppercase">
                      <CheckSquare className="h-3 w-3 text-[var(--status-success)]" />
                      <span>{subCompleted}/{task.subtasks.length} SUBTASKS COMPLETED</span>
                    </div>
                  )}
                </TableCell>

                {/* Priority Badge */}
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </TableCell>

                {/* Inline Status Select */}
                <TableCell>
                  <Select
                    selectSize="sm"
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="w-32"
                  >
                    <option value="Backlog">BACKLOG</option>
                    <option value="To Do">TO DO</option>
                    <option value="In Progress">IN PROGRESS</option>
                    <option value="In Review">IN REVIEW</option>
                    <option value="Completed">COMPLETED</option>
                  </Select>
                </TableCell>

                {/* Assignee */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {task.assigneeAvatar ? (
                      <img src={task.assigneeAvatar} alt="" className="h-5 w-5 object-cover border border-[var(--brand-primary)]" />
                    ) : (
                      <div className="h-5 w-5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold">?</div>
                    )}
                    <span className="text-[var(--text-secondary)] uppercase font-bold text-[11px]">{task.assigneeName || 'UNASSIGNED'}</span>
                  </div>
                </TableCell>

                {/* Logged Hours Progress */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-[var(--status-warning)]" />
                    <span className="text-[var(--text-primary)] font-bold">{task.loggedHours} / {task.estimatedHours}H</span>
                  </div>
                  <div className="w-24 h-1.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-primary)] transition-all duration-200"
                      style={{ width: `${percentHours}%` }}
                    />
                  </div>
                </TableCell>

                {/* Due Date */}
                <TableCell className="text-[var(--text-muted)] font-mono">
                  {task.dueDate}
                </TableCell>

                {/* Action Button */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTaskId(task.id)}
                    title="View Task Details"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <EmptyState
          icon={<ListTodo className="h-8 w-8 text-[var(--text-muted)]" />}
          title="NO MATCHING WORK ITEMS FOUND"
          description="Try adjusting your status filter, priority filter, or search query."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
            >
              CLEAR FILTERS
            </Button>
          }
        />
      )}
    </div>
  );
};
