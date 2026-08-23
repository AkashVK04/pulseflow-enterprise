import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { Shield, Search } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useProjects();
  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (filterRole !== 'ALL' && log.actorRole !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-[#F5F5F5]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0A0A0A] border border-[#1A1A1A] p-4">
        <div>
          <h2 className="text-xl font-black text-[#F5F5F5] uppercase tracking-tighter flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#3B82F6]" />
            <span>ENTERPRISE SECURITY & ACTIVITY AUDIT LOG</span>
          </h2>
          <p className="text-xs font-mono text-[#71717A] mt-0.5 uppercase">IMMUTABLE AUDIT TRAIL OF ACTIONS, RBAC CHANGES, AND SYSTEM EXECUTIONS.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
            <input
              type="text"
              placeholder="FILTER LOGS..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#050505] border border-[#1A1A1A] text-xs text-[#F5F5F5] uppercase pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-[#050505] border border-[#1A1A1A] text-xs text-[#F5F5F5] uppercase px-2.5 py-1.5 font-bold cursor-pointer"
          >
            <option value="ALL">ALL ROLES</option>
            <option value="Super Admin">SUPER ADMIN</option>
            <option value="Project Manager">PROJECT MANAGER</option>
            <option value="Senior Engineer">SENIOR ENGINEER</option>
            <option value="Staff Contributor">STAFF CONTRIBUTOR</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[#F5F5F5]">
            <thead className="bg-[#050505] text-[#71717A] font-bold uppercase tracking-[0.2em] border-b border-[#1A1A1A]">
              <tr>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">ACTOR & ROLE</th>
                <th className="p-3">ACTION</th>
                <th className="p-3">TARGET ENTITY</th>
                <th className="p-3">DETAILS & TELEMETRY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                  <td className="p-3 text-[#71717A] font-mono whitespace-nowrap uppercase">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-3">
                    <div className="font-black text-[#F5F5F5] uppercase">{log.actorName}</div>
                    <span className="text-[10px] bg-[#1A1A1A] text-[#3B82F6] px-1.5 py-0.2 font-mono font-bold uppercase">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#3B82F6] whitespace-nowrap uppercase">
                    {log.action}
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase text-black bg-[#F59E0B] px-1.5 py-0.5 mr-1.5">
                      {log.entityType}
                    </span>
                    <span className="text-[#F5F5F5] font-bold uppercase">{log.entityName}</span>
                  </td>
                  <td className="p-3 text-[#A1A1AA] uppercase">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#52525B] uppercase">
                    NO AUDIT RECORDS MATCHING CRITERIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

