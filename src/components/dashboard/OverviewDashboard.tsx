import React, { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { AISummaryResult, AIRiskAnalysisResult } from '../../types/index.js';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Skeleton, EmptyState } from '../ui/index.js';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Zap,
  Calendar,
  Activity,
  Target,
  Download,
  Printer,
  Share2,
  UserCheck,
  CalendarDays,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const TIMERANGE_STORAGE_KEY = 'pulseflow-dashboard-timerange';

export const OverviewDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    metrics,
    projects,
    tasks,
    sprints,
    auditLogs,
    selectedProject,
    setActiveTab,
    setSelectedTaskId,
    refreshData,
    showToast
  } = useProjects();

  const [standupReport, setStandupReport] = useState<AISummaryResult | null>(null);
  const [riskReport, setRiskReport] = useState<AIRiskAnalysisResult | null>(null);
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false);
  const [isGeneratingRisk, setIsGeneratingRisk] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Time Range Personalization with LocalStorage Persistence
  const [timeRange, setTimeRangeState] = useState<'7D' | '30D' | 'QTR' | 'ALL'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TIMERANGE_STORAGE_KEY);
      if (saved && ['7D', '30D', 'QTR', 'ALL'].includes(saved)) {
        return saved as any;
      }
    }
    return '30D';
  });

  const setTimeRange = (range: '7D' | '30D' | 'QTR' | 'ALL') => {
    localStorage.setItem(TIMERANGE_STORAGE_KEY, range);
    setTimeRangeState(range);
  };

  // Active Sprint
  const activeSprint = useMemo(() => {
    return sprints.find(s => s.status === 'Active') || sprints[0] || null;
  }, [sprints]);

  // Status Breakdown Data for Recharts
  const statusCounts = useMemo(() => {
    return {
      'Backlog': tasks.filter(t => t.status === 'Backlog').length,
      'To Do': tasks.filter(t => t.status === 'To Do').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      'In Review': tasks.filter(t => t.status === 'In Review').length,
      'Completed': tasks.filter(t => t.status === 'Completed').length,
    };
  }, [tasks]);

  const statusPieData = useMemo(() => {
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [statusCounts]);

  const CHART_COLORS = ['#64748B', '#3B82F6', '#F59E0B', '#A855F7', '#10B981'];

  // Project Progress Bar Chart Data
  const projectChartData = useMemo(() => {
    return projects.map(p => ({
      name: p.key,
      logged: p.loggedHours,
      budget: p.budgetHours,
      progress: Math.round((p.loggedHours / (p.budgetHours || 1)) * 100)
    }));
  }, [projects]);

  // Derived KPIs
  const sprintProgressPercent = useMemo(() => {
    if (!activeSprint || !activeSprint.totalPoints) return 0;
    return Math.round((activeSprint.completedPoints / activeSprint.totalPoints) * 100);
  }, [activeSprint]);

  const taskCompletionRate = useMemo(() => {
    if (!metrics?.totalTasks) return 0;
    return Math.round((metrics.completedTasks / metrics.totalTasks) * 100);
  }, [metrics]);

  const budgetUtilizationPercent = useMemo(() => {
    if (!metrics?.budgetHours) return 0;
    return Math.round((metrics.totalLoggedHours / metrics.budgetHours) * 100);
  }, [metrics]);

  const assignedToMeTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(t => t.assigneeId === currentUser.id);
  }, [tasks, currentUser]);

  const criticalTasks = useMemo(() => {
    return tasks.filter(t => t.priority === 'Critical' || t.priority === 'High');
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    return [...tasks]
      .filter(t => t.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  }, [tasks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    showToast('Dashboard Telemetry Updated');
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleExportCSV = () => {
    window.open('/api/reports/tasks/csv', '_blank');
    showToast('Exporting Tasks Telemetry CSV Report');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Executive Dashboard Link Copied to Clipboard');
    } else {
      showToast('Executive Dashboard Link Ready');
    }
  };

  const handleGenerateStandup = async () => {
    setIsGeneratingStandup(true);
    try {
      const res = await api.aiStandup(selectedProject?.id);
      setStandupReport(res);
      showToast('AI Sprint Brief Generated');
    } catch (err: any) {
      showToast(`AI Brief Error: ${err.message}`);
    } finally {
      setIsGeneratingStandup(false);
    }
  };

  const handleGenerateRisk = async () => {
    setIsGeneratingRisk(true);
    try {
      const res = await api.aiRiskAudit(selectedProject?.id);
      setRiskReport(res);
      showToast('AI Risk Audit Completed');
    } catch (err: any) {
      showToast(`AI Audit Error: ${err.message}`);
    } finally {
      setIsGeneratingRisk(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 text-[var(--text-primary)] font-sans antialiased">
      
      {/* Top Header & Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
            <Calendar className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>{formattedDate}</span>
            <span className="text-[var(--border-default)]">•</span>
            <span className="text-[var(--brand-primary)] font-bold">EXECUTIVE COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[var(--text-primary)]">
            Welcome back, {currentUser?.name.split(' ')[0] || 'Executive'}
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 uppercase">
            Real-time operations telemetry, velocity metrics, and Gemini AI risk analysis.
          </p>
        </div>

        {/* Action Controls & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Time Range Selector */}
          <div className="flex items-center bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-0.5 font-mono text-[11px]">
            {(['7D', '30D', 'QTR', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 font-bold uppercase transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            aria-label="Refresh Dashboard Telemetry"
          >
            REFRESH
          </Button>

          {/* Export Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-3.5 w-3.5 text-[var(--brand-primary)]" />}
            title="Export CSV Telemetry"
            aria-label="Export CSV"
          >
            EXPORT
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-3.5 w-3.5" />}
            title="Print Executive Dashboard"
            aria-label="Print view"
          >
            PRINT
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            leftIcon={<Share2 className="h-3.5 w-3.5" />}
            title="Share Dashboard View"
            aria-label="Share View"
          >
            SHARE
          </Button>

          {/* AI Standup Trigger */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateStandup}
            isLoading={isGeneratingStandup}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            AI SPRINT BRIEF
          </Button>

          {/* AI Risk Audit Trigger */}
          <Button
            variant="danger"
            size="sm"
            onClick={handleGenerateRisk}
            isLoading={isGeneratingRisk}
            leftIcon={<ShieldAlert className="h-3.5 w-3.5" />}
          >
            AI RISK AUDIT
          </Button>
        </div>
      </div>

      {/* 8-Card Premium KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Projects */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1" title="Active engineering & product clusters">
                <span>ACTIVE PROJECTS</span>
                <Info className="h-3 w-3 text-[var(--text-muted)] opacity-60" />
              </span>
              <FolderKanban className="h-4 w-4 text-[var(--brand-primary)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                {metrics?.activeProjects || 0}
              </span>
              <Badge variant="success" size="sm">
                +12% vs last mo
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>TOTAL CLUSTERS: {metrics?.totalProjects || 0}</span>
              <SparklineSVG color="var(--status-success)" />
            </div>
          </Card>
        )}

        {/* KPI 2: Sprint Progress */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>SPRINT PROGRESS</span>
              <Zap className="h-4 w-4 text-[var(--status-warning)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--status-warning)]">
                {sprintProgressPercent}%
              </span>
              <Badge variant="high" size="sm">
                {activeSprint?.completedPoints || 0}/{activeSprint?.totalPoints || 0} PTS
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>SPRINT: {activeSprint?.name || 'ACTIVE'}</span>
              <SparklineSVG color="var(--status-warning)" />
            </div>
          </Card>
        )}

        {/* KPI 3: Tasks Completed */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>TASKS COMPLETED</span>
              <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--status-success)]">
                {metrics?.completedTasks || 0}
              </span>
              <Badge variant="success" size="sm">
                {taskCompletionRate}% RATE
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>TOTAL: {metrics?.totalTasks || 0} TASKS</span>
              <SparklineSVG color="var(--status-success)" />
            </div>
          </Card>
        )}

        {/* KPI 4: Open Blockers */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>OPEN BLOCKERS / RISKS</span>
              <AlertTriangle className="h-4 w-4 text-[var(--status-danger)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--status-danger)]">
                {metrics?.overdueTasks || 0}
              </span>
              <Badge variant="critical" size="sm">
                CRITICAL RISK
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>ACTION REQUIRED</span>
              <SparklineSVG color="var(--status-danger)" />
            </div>
          </Card>
        )}

        {/* KPI 5: Team Velocity */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>TEAM VELOCITY</span>
              <Target className="h-4 w-4 text-[var(--brand-primary)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                {activeSprint?.completedPoints || 34} <span className="text-xs font-normal text-[var(--text-muted)]">PTS</span>
              </span>
              <Badge variant="neutral" size="sm">
                AVG 38 PTS
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>TARGET: 45 PTS/SPRINT</span>
              <SparklineSVG color="var(--brand-primary)" />
            </div>
          </Card>
        )}

        {/* KPI 6: Logged Hours */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>LOGGED HOURS</span>
              <Clock className="h-4 w-4 text-[var(--status-warning)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--status-warning)]">
                {metrics?.totalLoggedHours || 0} <span className="text-xs font-normal text-[var(--text-muted)]">HRS</span>
              </span>
              <Badge variant="high" size="sm">
                {metrics?.budgetHours || 0} BUDGET
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>EFFORT CONSUMPTION</span>
              <SparklineSVG color="var(--status-warning)" />
            </div>
          </Card>
        )}

        {/* KPI 7: AI Risk Score */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>AI RISK SCORE</span>
              <ShieldAlert className="h-4 w-4 text-[var(--status-info)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                {riskReport?.overallRiskScore || 24}<span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
              </span>
              <Badge variant={riskReport?.riskCategory === 'High' ? 'critical' : 'success'} size="sm">
                {riskReport?.riskCategory || 'LOW'} RISK
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>PREDICTED DELAY: +{riskReport?.timelineDelayEstimateDays || 0} DAYS</span>
              <SparklineSVG color="var(--status-info)" />
            </div>
          </Card>
        )}

        {/* KPI 8: Budget Utilization */}
        {!metrics ? (
          <Skeleton height="120px" className="w-full" />
        ) : (
          <Card variant="elevated" padding="md" className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-2">
              <span>BUDGET UTILIZATION</span>
              <Activity className="h-4 w-4 text-[var(--brand-primary)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black font-mono tracking-tight text-[var(--brand-primary)]">
                {budgetUtilizationPercent}%
              </span>
              <Badge variant="neutral" size="sm">
                OPTIMAL
              </Badge>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase">
              <span>CAPACITY ALLOCATION</span>
              <SparklineSVG color="var(--brand-primary)" />
            </div>
          </Card>
        )}

      </div>

      {/* AI Standup / Risk Reports Banner */}
      {standupReport && (
        <Card variant="default" className="border-2 border-[var(--brand-primary)] shadow-lg animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-[var(--brand-primary)]">
              <Sparkles className="h-5 w-5" />
              <CardTitle>{standupReport.headline}</CardTitle>
            </div>
            <Badge variant="info">AI SPRINT BRIEF</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed uppercase">
              {standupReport.statusOverview}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-3 border-t border-[var(--border-subtle)]">
              <div>
                <span className="font-bold text-[var(--status-success)] uppercase tracking-wider text-[11px]">ACHIEVEMENTS</span>
                <ul className="text-[var(--text-secondary)] text-[11px] mt-1.5 space-y-1 uppercase">
                  {standupReport.keyAchievements.map((item, idx) => <li key={idx}>▪ {item}</li>)}
                </ul>
              </div>
              <div>
                <span className="font-bold text-[var(--status-danger)] uppercase tracking-wider text-[11px]">BLOCKERS & RISKS</span>
                <ul className="text-[var(--text-secondary)] text-[11px] mt-1.5 space-y-1 uppercase">
                  {standupReport.blockersAndRisks.map((item, idx) => <li key={idx}>▪ {item}</li>)}
                </ul>
              </div>
              <div>
                <span className="font-bold text-[var(--brand-primary)] uppercase tracking-wider text-[11px]">RECOMMENDED ACTIONS</span>
                <ul className="text-[var(--text-secondary)] text-[11px] mt-1.5 space-y-1 uppercase">
                  {standupReport.recommendedActions.map((item, idx) => <li key={idx}>▪ {item}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {riskReport && (
        <Card variant="default" className="border-2 border-[var(--status-danger)] shadow-lg animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-[var(--status-danger)]">
              <ShieldAlert className="h-5 w-5" />
              <CardTitle>AI RISK AUDIT: CATEGORY {riskReport.riskCategory} ({riskReport.overallRiskScore}/100)</CardTitle>
            </div>
            <Badge variant="critical">+{riskReport.timelineDelayEstimateDays} DAYS DELAY</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">{riskReport.capacityWarning}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-3 border-t border-[var(--border-subtle)]">
              <div>
                <span className="font-bold text-[var(--status-danger)] uppercase tracking-wider text-[11px]">VULNERABILITIES</span>
                <ul className="text-[var(--text-secondary)] text-[11px] mt-1.5 space-y-1 uppercase">
                  {riskReport.keyVulnerabilities.map((v, i) => <li key={i}>▪ {v}</li>)}
                </ul>
              </div>
              <div>
                <span className="font-bold text-[var(--status-success)] uppercase tracking-wider text-[11px]">MITIGATION PLAN</span>
                <ul className="text-[var(--text-secondary)] text-[11px] mt-1.5 space-y-1 uppercase">
                  {riskReport.mitigationPlan.map((m, i) => <li key={i}>▪ {m}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Charts & Operations Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Charts & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Hours Consumption Bar Chart */}
          <Card variant="default" padding="md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--brand-primary)]" />
                <CardTitle>PROJECT HOURS CONSUMPTION (LOGGED VS BUDGET)</CardTitle>
              </div>
              <Badge variant="neutral">BY PROJECT KEY</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full pt-2">
                {projectChartData.length === 0 ? (
                  <EmptyState
                    title="NO PROJECT DATA AVAILABLE"
                    description="Create a project to start tracking budget and logged hours."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectChartData}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface-elevated)',
                          borderColor: 'var(--border-default)',
                          borderRadius: '0px',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Bar dataKey="logged" fill="var(--brand-primary)" name="LOGGED" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="budget" fill="var(--border-default)" name="BUDGET" radius={[0, 0, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Stream */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>AUDIT LOG ACTIVITY TRAIL</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('audit')}
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                VIEW FULL LOGS
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.length === 0 ? (
                <EmptyState title="NO AUDIT LOGS RECORDED" description="System telemetry logs will appear here as actions occur." />
              ) : (
                auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="text-xs font-mono border-b border-[var(--border-subtle)] pb-2.5 last:border-0 last:pb-0 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-[var(--brand-primary)] uppercase">{log.actorName}</span>
                        <Badge variant="neutral" size="sm">{log.actorRole}</Badge>
                      </div>
                      <div className="text-[var(--text-primary)] font-bold uppercase mt-1">
                        {log.action}: <span className="text-[var(--brand-primary)]">{log.entityName}</span>
                      </div>
                      <div className="text-[var(--text-secondary)] text-[11px] mt-0.5 uppercase">
                        {log.details}
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar Column: Task Distribution, My Tasks & Upcoming Deadlines */}
        <div className="space-y-6">
          
          {/* Task Status Distribution Pie Chart */}
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>TASK STATUS DISTRIBUTION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderColor: 'var(--border-default)',
                        borderRadius: '0px',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                {statusPieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                    <span className="truncate">{item.name}: <strong className="text-[var(--text-primary)]">{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Assigned Tasks Widget */}
          <Card variant="default" padding="md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                <CardTitle>MY ASSIGNED TASKS</CardTitle>
              </div>
              <Badge variant="neutral">{assignedToMeTasks.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignedToMeTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-2.5 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold bg-[var(--brand-primary)] text-white px-1 py-0.2">
                        {task.key}
                      </span>
                      <Badge variant="low" size="sm">{task.priority}</Badge>
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)] uppercase truncate max-w-[160px] mt-1">
                      {task.title}
                    </div>
                  </div>
                  <Badge variant="info" size="sm">{task.status}</Badge>
                </div>
              ))}

              {assignedToMeTasks.length === 0 && (
                <EmptyState
                  title="NO ASSIGNED TASKS"
                  description="You currently have no tasks assigned directly to your user."
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines Widget */}
          <Card variant="default" padding="md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[var(--status-warning)]" />
                <CardTitle>UPCOMING DEADLINES</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingDeadlines.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-2.5 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-[var(--brand-primary)] uppercase">
                      {task.key}
                    </span>
                    <div className="text-xs font-bold text-[var(--text-primary)] uppercase truncate max-w-[160px]">
                      {task.title}
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono shrink-0">
                    <div className="text-[var(--status-warning)] font-bold">{task.dueDate}</div>
                    <div className="text-[var(--text-muted)] text-[9px] uppercase">{task.status}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

// Mini Sparkline SVG Visualizer Component
const SparklineSVG: React.FC<{ color: string }> = ({ color }) => (
  <svg className="w-14 h-4 overflow-visible shrink-0" viewBox="0 0 50 15">
    <path
      d="M0 12 L10 9 L20 13 L30 5 L40 8 L50 2"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
