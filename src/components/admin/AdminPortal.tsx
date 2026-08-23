import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useProjects } from '../../context/ProjectContext.js';
import { api } from '../../lib/api.js';
import { User, UserRole, FeatureFlag, BackgroundJob } from '../../types/index.js';
import {
  Users,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Play,
  FileSpreadsheet,
  FileText,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Cpu,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { featureFlags, backgroundJobs, toggleFeatureFlag, triggerJob, showToast, refreshData } = useProjects();
  
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'flags' | 'jobs' | 'reports'>('users');
  const [usersList, setUsersList] = useState<User[]>(allUsers);
  
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Senior Engineer');
  const [newUserDept, setNewUserDept] = useState('Engineering');

  useEffect(() => {
    setUsersList(allUsers);
  }, [allUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      const created = await api.createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        department: newUserDept
      });
      showToast(`User ${created.name} provisioned successfully`);
      setIsCreateUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      await refreshData();
    } catch (err: any) {
      showToast(`Error creating user: ${err.message}`);
    }
  };

  const handleUserRoleChange = async (userId: string, role: UserRole) => {
    try {
      await api.updateUserRole(userId, role);
      showToast(`Role updated to ${role}`);
      await refreshData();
    } catch (err: any) {
      showToast(`Failed: ${err.message}`);
    }
  };

  const handleToggleLock = async (userId: string) => {
    try {
      await api.toggleUserLock(userId);
      showToast('Account security status toggled');
      await refreshData();
    } catch (err: any) {
      showToast(`Failed: ${err.message}`);
    }
  };

  const downloadTaskCSV = () => {
    window.open('/api/reports/tasks/csv', '_blank');
  };

  const downloadAuditCSV = () => {
    window.open('/api/reports/audit/csv', '_blank');
  };

  return (
    <div className="space-y-6 font-mono text-[#F5F5F5]">
      
      {/* Top Banner Header */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            <span>ENTERPRISE ADMINISTRATION PORTAL</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#F5F5F5] mt-1">
            RBAC, FEATURE FLAGS & BACKGROUND JOBS
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Logged in as <span className="text-[#3B82F6] font-bold">{currentUser?.name}</span> ({currentUser?.role})
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex flex-wrap gap-2 bg-[#050505] p-1.5 border border-[#1A1A1A]">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'users' ? 'bg-[#3B82F6] text-white' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>USERS & RBAC</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flags')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'flags' ? 'bg-[#3B82F6] text-white' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>FEATURE FLAGS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jobs')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'jobs' ? 'bg-[#3B82F6] text-white' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>BACKGROUND JOBS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'reports' ? 'bg-[#3B82F6] text-white' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>REPORT GENERATOR</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Users & RBAC */}
      {activeSubTab === 'users' && (
        <div className="bg-[#050505] border border-[#1A1A1A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3B82F6]" />
              <span>USER PROVISIONING & ROLE MATRIX ({usersList.length})</span>
            </h2>

            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="bg-[#3B82F6] hover:bg-blue-600 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>PROVISION NEW USER</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#1A1A1A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#1A1A1A] text-[#71717A] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">USER</th>
                  <th className="p-3">EMAIL</th>
                  <th className="p-3">DEPARTMENT</th>
                  <th className="p-3">ASSIGNED ROLE</th>
                  <th className="p-3">SECURITY STATUS</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#0A0A0A] transition-colors">
                    <td className="p-3 font-bold text-[#F5F5F5] flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="h-7 w-7 object-cover border border-[#262626]" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 text-[#A1A1AA]">{u.email}</td>
                    <td className="p-3 text-[#A1A1AA]">{u.department}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-[#0A0A0A] border border-[#262626] text-[#3B82F6] font-bold text-xs p-1 focus:outline-none uppercase cursor-pointer"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Senior Engineer">Senior Engineer</option>
                        <option value="Staff Contributor">Staff Contributor</option>
                        <option value="Guest">Guest</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {u.accountLocked ? (
                        <span className="bg-red-950/60 border border-red-800 text-red-400 font-bold px-2 py-0.5 text-[10px] uppercase flex items-center gap-1 w-max">
                          <Lock className="h-3 w-3" /> LOCKED
                        </span>
                      ) : (
                        <span className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold px-2 py-0.5 text-[10px] uppercase flex items-center gap-1 w-max">
                          <CheckCircle className="h-3 w-3" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleLock(u.id)}
                        className="bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#262626] text-[#A1A1AA] hover:text-[#F5F5F5] px-2.5 py-1 text-[11px] font-bold uppercase transition-colors cursor-pointer"
                      >
                        {u.accountLocked ? <Unlock className="h-3 w-3 inline mr-1 text-emerald-400" /> : <Lock className="h-3 w-3 inline mr-1 text-red-400" />}
                        {u.accountLocked ? 'UNLOCK' : 'LOCK'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Feature Flags */}
      {activeSubTab === 'flags' && (
        <div className="bg-[#050505] border border-[#1A1A1A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#3B82F6]" />
              <span>SYSTEM CONFIGURATION & FEATURE TOGGLES</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureFlags.map((flag) => (
              <div
                key={flag.key}
                className="bg-[#0A0A0A] border border-[#1A1A1A] p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#F5F5F5] uppercase">{flag.name}</span>
                    <span className="text-[10px] bg-[#1A1A1A] text-[#3B82F6] px-2 py-0.5 font-bold uppercase">
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-1">{flag.description}</p>
                  <div className="text-[10px] text-[#52525B] mt-2 font-mono">KEY: {flag.key}</div>
                </div>

                <button
                  onClick={() => toggleFeatureFlag(flag.key)}
                  className="cursor-pointer text-[#3B82F6] hover:scale-105 transition-transform shrink-0"
                >
                  {flag.enabled ? (
                    <ToggleRight className="h-8 w-8 text-[#10B981]" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-[#52525B]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Background Jobs */}
      {activeSubTab === 'jobs' && (
        <div className="bg-[#050505] border border-[#1A1A1A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3B82F6]" />
              <span>BACKGROUND SCHEDULER & CRON MONITOR</span>
            </h2>
          </div>

          <div className="overflow-x-auto border border-[#1A1A1A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#1A1A1A] text-[#71717A] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">JOB NAME</th>
                  <th className="p-3">CRON SCHEDULE</th>
                  <th className="p-3">LAST EXECUTED</th>
                  <th className="p-3">DURATION</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">MANUAL TRIGGER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {backgroundJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#0A0A0A]">
                    <td className="p-3 font-bold text-[#F5F5F5]">{j.name}</td>
                    <td className="p-3 text-[#3B82F6] font-mono">{j.schedule}</td>
                    <td className="p-3 text-[#A1A1AA]">{new Date(j.lastRun).toLocaleString()}</td>
                    <td className="p-3 text-[#A1A1AA]">{j.durationMs} ms</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        j.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        j.status === 'RUNNING' ? 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse' :
                        'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => triggerJob(j.id)}
                        className="bg-[#3B82F6] hover:bg-blue-600 text-white px-2.5 py-1 text-[11px] font-bold uppercase transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" /> RUN NOW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Reports */}
      {activeSubTab === 'reports' && (
        <div className="bg-[#050505] border border-[#1A1A1A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#3B82F6]" />
              <span>EXECUTIVE REPORT GENERATOR & EXPORT</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-4 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-xs uppercase text-[#F5F5F5] flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-[#10B981]" />
                  TASK INVENTORY CSV EXPORT
                </h3>
                <p className="text-xs text-[#71717A] mt-1">
                  Export complete backlog, active tasks, status, priority, logged hours, and assigned engineers to CSV format.
                </p>
              </div>
              <button
                onClick={downloadTaskCSV}
                className="bg-[#10B981] hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider py-2 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" /> DOWNLOAD TASK INVENTORY CSV
              </button>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-4 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-xs uppercase text-[#F5F5F5] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#3B82F6]" />
                  SECURITY & AUDIT TRAIL CSV EXPORT
                </h3>
                <p className="text-xs text-[#71717A] mt-1">
                  Download immutable security logs, actor actions, role mutations, and AI execution history for compliance review.
                </p>
              </div>
              <button
                onClick={downloadAuditCSV}
                className="bg-[#3B82F6] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider py-2 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="h-4 w-4" /> DOWNLOAD AUDIT TRAIL CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New User */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#050505] border-2 border-[#3B82F6] w-full max-w-md p-6 font-mono text-[#F5F5F5] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <h3 className="font-black text-sm uppercase text-[#F5F5F5]">PROVISION NEW USER</h3>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="text-[#71717A] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#71717A] font-bold uppercase">FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Vance"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] p-2 text-xs text-[#F5F5F5] focus:border-[#3B82F6] focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#71717A] font-bold uppercase">ENTERPRISE EMAIL</label>
                <input
                  type="email"
                  required
                  placeholder="david.vance@pulseflow.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] p-2 text-xs text-[#F5F5F5] focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#71717A] font-bold uppercase">ASSIGNED ROLE</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] p-2 text-xs text-[#3B82F6] focus:outline-none uppercase font-bold"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Senior Engineer">Senior Engineer</option>
                  <option value="Staff Contributor">Staff Contributor</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#71717A] font-bold uppercase">DEPARTMENT</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] p-2 text-xs text-[#F5F5F5] focus:border-[#3B82F6] focus:outline-none uppercase"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold uppercase bg-[#0A0A0A] text-[#71717A] hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold uppercase bg-[#3B82F6] hover:bg-blue-600 text-white cursor-pointer"
                >
                  SAVE USER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
