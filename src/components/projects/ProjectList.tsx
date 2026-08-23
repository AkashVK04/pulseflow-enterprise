import React, { useState, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { Project } from '../../types/index.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  Skeleton,
  EmptyState
} from '../ui/index.js';
import {
  Plus,
  Clock,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  FolderKanban,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const ProjectList: React.FC = () => {
  const {
    projects,
    setSelectedProject,
    setActiveTab,
    isCreateProjectModalOpen,
    setIsCreateProjectModalOpen
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'name' | 'key' | 'risk' | 'hours'>('key');

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => {
        if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
        if (riskFilter !== 'ALL' && p.riskLevel !== riskFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.key.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.leadName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'key') return a.key.localeCompare(b.key);
        if (sortField === 'name') return a.name.localeCompare(b.name);
        if (sortField === 'risk') {
          const riskWeight = { High: 3, Moderate: 2, Low: 1 };
          return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
        }
        if (sortField === 'hours') return b.loggedHours - a.loggedHours;
        return 0;
      });
  }, [projects, searchQuery, categoryFilter, riskFilter, sortField]);

  return (
    <div className="space-y-6 text-[var(--text-primary)] font-sans antialiased">
      
      {/* Top Header & Search/Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
            <FolderKanban className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>PORTFOLIO DIRECTORY</span>
            <span className="text-[var(--border-default)]">•</span>
            <span className="text-[var(--brand-primary)] font-bold">{projects.length} PROJECTS</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[var(--text-primary)]">
            ENTERPRISE PORTFOLIO & PROJECTS
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 uppercase">
            Track milestones, budget capacity utilization, and AI risk indexes across engineering clusters.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateProjectModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          NEW PROJECT
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 shadow-sm font-mono text-xs">
        
        {/* Search Input */}
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="SEARCH BY NAME, KEY, LEAD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Filter */}
          <div className="w-36">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="Engineering">ENGINEERING</option>
              <option value="Product">PRODUCT</option>
              <option value="Marketing">MARKETING</option>
              <option value="Operations">OPERATIONS</option>
            </Select>
          </div>

          {/* Risk Level Filter */}
          <div className="w-32">
            <Select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="ALL">ALL RISKS</option>
              <option value="Low">LOW RISK</option>
              <option value="Moderate">MODERATE</option>
              <option value="High">HIGH RISK</option>
            </Select>
          </div>

          {/* Sort Selection */}
          <div className="w-36">
            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
            >
              <option value="key">SORT BY KEY</option>
              <option value="name">SORT BY NAME</option>
              <option value="risk">SORT BY RISK</option>
              <option value="hours">SORT BY HOURS</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p: Project) => {
          const hoursPercent = Math.round((p.loggedHours / (p.budgetHours || 1)) * 100);

          return (
            <Card
              key={p.id}
              variant="elevated"
              padding="md"
              className="flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Top Badges Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="medium" size="md">
                      [{p.key}]
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {p.category}
                    </Badge>
                  </div>

                  <Badge
                    variant={
                      p.riskLevel === 'High'
                        ? 'critical'
                        : p.riskLevel === 'Moderate'
                        ? 'high'
                        : 'success'
                    }
                    size="sm"
                    dot
                  >
                    {p.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                {/* Project Title & Description */}
                <CardTitle className="group-hover:text-[var(--brand-primary)] transition-colors text-base font-black uppercase tracking-tight">
                  {p.name}
                </CardTitle>

                <p className="text-xs font-mono text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed uppercase">
                  {p.description || 'No detailed project description available.'}
                </p>
              </div>

              {/* Progress Bar & Capacity Metrics */}
              <div className="space-y-3 pt-4 mt-4 border-t border-[var(--border-subtle)] text-xs font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)] uppercase">
                    <Clock className="h-3.5 w-3.5 text-[var(--status-warning)] shrink-0" />
                    <span>LOGGED HOURS</span>
                  </span>
                  <strong className="text-[var(--text-primary)] font-bold">
                    {p.loggedHours} / {p.budgetHours}H ({hoursPercent}%)
                  </strong>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hoursPercent > 90
                        ? 'bg-[var(--status-danger)]'
                        : hoursPercent > 70
                        ? 'bg-[var(--status-warning)]'
                        : 'bg-[var(--brand-primary)]'
                    }`}
                    style={{ width: `${Math.min(100, hoursPercent)}%` }}
                  />
                </div>

                {/* Lead & Target Info */}
                <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] uppercase pt-1 font-bold">
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <Users className="h-3 w-3 text-[var(--brand-primary)] shrink-0" />
                    <span>LEAD: {p.leadName}</span>
                  </span>
                  <span>TARGET: {p.targetEndDate}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => {
                    setSelectedProject(p);
                    setActiveTab('kanban');
                  }}
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  VIEW KANBAN BOARD
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 text-[var(--text-muted)]" />}
          title="NO MATCHING PROJECTS FOUND"
          description="Try adjusting your category filter, risk filter, or search query."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setRiskFilter('ALL');
              }}
            >
              CLEAR FILTERS
            </Button>
          }
        />
      )}

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateProjectModalOpen(false)} />
      )}
    </div>
  );
};

// Create Project Modal Component with Phase 1 Design System Controls
const CreateProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createProject, showToast } = useProjects();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Engineering' | 'Product' | 'Marketing' | 'Operations'>('Engineering');
  const [budgetHours, setBudgetHours] = useState('600');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name,
        key: key.toUpperCase(),
        description,
        category,
        budgetHours: parseFloat(budgetHours) || 500,
        riskLevel
      });
      onClose();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="CREATE ENTERPRISE PROJECT"
      subtitle="Provision a new cluster with budget and lead assignments"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="PROJECT NAME *"
          required
          placeholder="E.G., CLOUD SECURITY ARCHITECTURE"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <Input
          label="PROJECT KEY (3-5 LETTERS) *"
          required
          maxLength={5}
          placeholder="E.G., SEC"
          value={key}
          onChange={e => setKey(e.target.value)}
        />

        <div className="w-full space-y-1">
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            DESCRIPTION
          </label>
          <textarea
            rows={3}
            placeholder="BRIEF OBJECTIVE AND DELIVERABLES..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--text-primary)] font-mono text-xs uppercase p-3 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="CATEGORY"
            value={category}
            onChange={e => setCategory(e.target.value as any)}
          >
            <option value="Engineering">ENGINEERING</option>
            <option value="Product">PRODUCT</option>
            <option value="Marketing">MARKETING</option>
            <option value="Operations">OPERATIONS</option>
          </Select>

          <Input
            label="BUDGET HOURS"
            type="number"
            value={budgetHours}
            onChange={e => setBudgetHours(e.target.value)}
          />
        </div>

        <Select
          label="INITIAL RISK LEVEL"
          value={riskLevel}
          onChange={e => setRiskLevel(e.target.value as any)}
        >
          <option value="Low">LOW RISK</option>
          <option value="Moderate">MODERATE RISK</option>
          <option value="High">HIGH RISK</option>
        </Select>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            CREATE PROJECT
          </Button>
        </div>
      </form>
    </Modal>
  );
};
