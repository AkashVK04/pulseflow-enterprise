import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { Sprint, Task } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { Zap, Plus, Target } from 'lucide-react';

export const SprintManager: React.FC = () => {
  const { sprints, tasks, refreshData, showToast, projects } = useProjects();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [totalPoints] = useState('35');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);

  const activeSprints = sprints.filter(s => s.status === 'Active');

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !projectId) return;

    try {
      await api.createSprint({
        name,
        goal,
        projectId,
        totalPoints: parseInt(totalPoints) || 30
      });
      showToast(`Sprint "${name}" planned successfully!`);
      setName('');
      setGoal('');
      setIsCreating(false);
      await refreshData();
    } catch (err: any) {
      showToast(`Failed to create sprint: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-[#F5F5F5]">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[#0A0A0A] border border-[#1A1A1A] p-4">
        <div>
          <h2 className="text-xl font-black text-[#F5F5F5] uppercase tracking-tighter flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#F59E0B]" />
            <span>AGILE SPRINT CONSOLE</span>
          </h2>
          <p className="text-xs font-mono text-[#71717A] mt-0.5 uppercase">MANAGE SPRINT VELOCITY, MILESTONE OBJECTIVES, AND STORY POINTS.</p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 bg-[#F59E0B] text-black hover:bg-[#F5F5F5] text-xs font-black uppercase tracking-tighter px-3.5 py-2 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>PLAN SPRINT</span>
        </button>
      </div>

      {/* Plan Sprint Form Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateSprint} className="bg-[#0A0A0A] border border-[#F59E0B] p-5 space-y-3 text-xs font-mono">
          <h3 className="font-black text-[#F5F5F5] text-sm uppercase tracking-wider">PLAN NEW SPRINT CYCLE</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#71717A] uppercase font-bold mb-1">SPRINT NAME *</label>
              <input
                type="text"
                required
                placeholder="E.G. SPRINT 25 - API GATEWAY RESILIENCY"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#050505] border border-[#1A1A1A] text-[#F5F5F5] uppercase px-3 py-2 focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-[#71717A] uppercase font-bold mb-1">TARGET PROJECT *</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-[#050505] border border-[#1A1A1A] text-[#F5F5F5] uppercase px-3 py-2 focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#71717A] uppercase font-bold mb-1">SPRINT GOAL & OBJECTIVE</label>
            <input
              type="text"
              placeholder="E.G. COMPLETE ZERO-DOWNTIME DATABASE FAILOVER."
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full bg-[#050505] border border-[#1A1A1A] text-[#F5F5F5] uppercase px-3 py-2 focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-1.5 bg-[#1A1A1A] text-[#A1A1AA] uppercase cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[#F59E0B] text-black hover:bg-[#F5F5F5] font-black uppercase cursor-pointer transition-colors"
            >
              SAVE SPRINT
            </button>
          </div>
        </form>
      )}

      {/* Active Sprints */}
      <div className="space-y-4">
        {activeSprints.map((sprint: Sprint) => {
          const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
          const completedTasks = sprintTasks.filter(t => t.status === 'Completed').length;
          const completionPercent = sprintTasks.length ? Math.round((completedTasks / sprintTasks.length) * 100) : 0;

          return (
            <div key={sprint.id} className="bg-[#0A0A0A] border border-[#1A1A1A] p-5 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[#1A1A1A] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#F59E0B] text-black px-2 py-0.5 uppercase">
                      {sprint.status.toUpperCase()} SPRINT
                    </span>
                    <h3 className="text-base font-black text-[#F5F5F5] uppercase tracking-tight">{sprint.name}</h3>
                  </div>
                  <p className="text-xs font-mono text-[#71717A] mt-1 flex items-center gap-1.5 uppercase">
                    <Target className="h-3.5 w-3.5 text-[#3B82F6]" />
                    <span>GOAL: {sprint.goal || 'NO EXPLICIT GOAL SET.'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#F5F5F5]">
                  <div className="text-right">
                    <div className="font-bold text-[#F59E0B]">{sprint.completedPoints} / {sprint.totalPoints} PTS</div>
                    <div className="text-[10px] text-[#71717A] uppercase">STORY POINT BURN-DOWN</div>
                  </div>
                  <div className="text-right pl-3 border-l border-[#1A1A1A]">
                    <div className="font-bold text-[#10B981]">{completionPercent}%</div>
                    <div className="text-[10px] text-[#71717A] uppercase">TASK VELOCITY</div>
                  </div>
                </div>
              </div>

              {/* Sprint Task Backlog Cards */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-[0.2em]">
                  ASSIGNED SPRINT TASKS ({sprintTasks.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono">
                  {sprintTasks.map((t: Task) => (
                    <div key={t.id} className="bg-[#050505] border border-[#1A1A1A] p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-black bg-[#3B82F6] px-1.5 py-0.5 uppercase">{t.key}</span>
                          <span className="font-bold text-[#F5F5F5] uppercase">{t.title}</span>
                        </div>
                        <div className="text-[10px] text-[#71717A] mt-1 uppercase">
                          ASSIGNEE: {t.assigneeName || 'UNASSIGNED'} | DUE: {t.dueDate}
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                        t.status === 'Completed' ? 'bg-[#10B981] text-black' : 'bg-[#1A1A1A] text-[#A1A1AA]'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                  ))}

                  {sprintTasks.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-xs font-mono text-[#52525B] uppercase border border-dashed border-[#1A1A1A]">
                      NO TASKS ASSIGNED TO THIS SPRINT YET.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

