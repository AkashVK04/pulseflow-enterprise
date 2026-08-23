import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { TimeEntry } from '../../types/index.js';
import { Clock, Play, Pause, RotateCcw, Check } from 'lucide-react';

export const TimeTracker: React.FC = () => {
  const { tasks, showToast, refreshData } = useProjects();
  const { currentUser } = useAuth();

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || '');
  const [description, setDescription] = useState('');

  // Active Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    api.getTimeEntries().then(setTimeEntries).catch(console.error);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveTimer = async () => {
    if (!selectedTaskId || elapsedSeconds === 0) return;
    const hours = parseFloat((elapsedSeconds / 3600).toFixed(2));
    
    try {
      const newEntry = await api.addTimeEntry({
        taskId: selectedTaskId,
        userId: currentUser?.id,
        hours: Math.max(0.25, hours),
        description: description || 'Timer logged work',
        date: new Date().toISOString().split('T')[0]
      });

      showToast(`Logged ${newEntry.hours} hrs on task!`);
      setTimeEntries([newEntry, ...timeEntries]);
      setIsTimerRunning(false);
      setElapsedSeconds(0);
      setDescription('');
      await refreshData();
    } catch (err: any) {
      showToast(`Error saving time: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-[#F5F5F5]">
      
      {/* Header */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-4">
        <h2 className="text-xl font-black text-[#F5F5F5] uppercase tracking-tighter flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#F59E0B]" />
          <span>INTERACTIVE TIME TRACKER & WORK LOGS</span>
        </h2>
        <p className="text-xs font-mono text-[#71717A] mt-0.5 uppercase">TRACK REAL-TIME ENGINEERING EFFORT AND AUDIT LOGS FOR CAPACITY PLANNING.</p>
      </div>

      {/* Live Stopwatch Timer Widget */}
      <div className="bg-[#0A0A0A] border border-[#3B82F6] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#3B82F6]">LIVE STOPWATCH TIMER</div>
          <div className="text-5xl font-mono font-black text-[#F5F5F5] tracking-widest">
            {formatTimer(elapsedSeconds)}
          </div>
          <p className="text-xs font-mono text-[#71717A] uppercase">SELECT TASK, START TIMER, AND LOG PRECISE EFFORT.</p>
        </div>

        {/* Timer Task & Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto font-mono text-xs">
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="bg-[#050505] border border-[#1A1A1A] text-[#F5F5F5] uppercase px-3 py-2.5 focus:outline-none w-full sm:w-64 font-bold"
          >
            {tasks.map(t => (
              <option key={t.id} value={t.id}>[{t.key}] {t.title}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="WORK NOTE..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="bg-[#050505] border border-[#1A1A1A] text-[#F5F5F5] uppercase px-3 py-2.5 focus:outline-none w-full sm:w-48"
          />

          <div className="flex items-center gap-2">
            {!isTimerRunning ? (
              <button
                onClick={() => setIsTimerRunning(true)}
                className="p-3 bg-[#10B981] hover:bg-[#F5F5F5] text-black font-black uppercase transition-colors cursor-pointer"
                title="START TIMER"
              >
                <Play className="h-4 w-4 fill-current stroke-none" />
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="p-3 bg-[#F59E0B] hover:bg-[#F5F5F5] text-black font-black uppercase transition-colors cursor-pointer"
                title="PAUSE TIMER"
              >
                <Pause className="h-4 w-4 fill-current stroke-none" />
              </button>
            )}

            <button
              onClick={handleSaveTimer}
              disabled={elapsedSeconds === 0}
              className="p-3 bg-[#3B82F6] hover:bg-[#F5F5F5] text-white hover:text-black font-black uppercase transition-colors cursor-pointer disabled:opacity-40"
              title="SAVE & LOG TIME"
            >
              <Check className="h-4 w-4 stroke-[3]" />
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setElapsedSeconds(0);
              }}
              className="p-3 bg-[#1A1A1A] hover:bg-[#EF4444] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="RESET TIMER"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Time Log Table */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A]">
        <div className="p-4 border-b border-[#1A1A1A] font-mono font-bold text-xs uppercase tracking-[0.2em] text-[#71717A]">
          ENTERPRISE WORK LOG HISTORY
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[#F5F5F5]">
            <thead className="bg-[#050505] text-[#71717A] font-bold uppercase tracking-[0.2em] border-b border-[#1A1A1A]">
              <tr>
                <th className="p-3">USER</th>
                <th className="p-3">TASK TITLE</th>
                <th className="p-3">LOGGED HOURS</th>
                <th className="p-3">WORK NOTE</th>
                <th className="p-3">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {timeEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                  <td className="p-3 font-bold text-[#3B82F6] uppercase">{entry.userName}</td>
                  <td className="p-3 text-[#F5F5F5] font-bold uppercase">{entry.taskTitle}</td>
                  <td className="p-3 font-bold text-[#F59E0B] uppercase">{entry.hours} HRS</td>
                  <td className="p-3 text-[#71717A] uppercase">{entry.description}</td>
                  <td className="p-3 text-[#71717A]">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

