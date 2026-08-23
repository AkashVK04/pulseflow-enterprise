import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext.js';
import { api } from '../../lib/api.js';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AICopilotDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, selectedProject, tasks, showToast } = useProjects();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: 'SYSTEM INITIALIZED. I am PulseFlow AI Copilot, powered by Gemini 3.6 Flash. Ask me to decompose tasks, generate executive status summaries, or evaluate project risks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isAiDrawerOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    try {
      const contextText = `Active Project: ${selectedProject?.name || 'All Projects'}, Tasks Total: ${tasks.length}`;
      const res = await api.aiChat(q, contextText);

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      showToast(`AI Chat error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handlePresetAction = async (actionType: 'standup' | 'risk' | 'decompose') => {
    if (isSending) return;

    if (actionType === 'standup') {
      handleSendMessage(`Generate executive sprint status briefing for ${selectedProject?.name || 'workspace'}.`);
    } else if (actionType === 'risk') {
      handleSendMessage(`Audit project risks and capacity warnings for active tasks.`);
    } else if (actionType === 'decompose') {
      handleSendMessage(`Suggest high-priority subtasks and engineering effort estimates for backlog items.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
      <div className="bg-[#050505] border-l border-[#1A1A1A] w-full max-w-md h-full flex flex-col font-mono text-[#F5F5F5]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1A1A1A] bg-[#0A0A0A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-[#3B82F6] flex items-center justify-center text-black">
              <Sparkles className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F5F5F5] uppercase tracking-wider">PULSEFLOW AI COPILOT</h3>
              <span className="text-[10px] text-[#3B82F6] font-bold uppercase">POWERED BY GEMINI 3.6 FLASH</span>
            </div>
          </div>

          <button
            onClick={() => setIsAiDrawerOpen(false)}
            className="p-1 hover:bg-[#1A1A1A] text-[#71717A] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset Prompt Chips */}
        <div className="p-3 bg-[#0A0A0A] border-b border-[#1A1A1A] flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handlePresetAction('standup')}
            className="flex items-center gap-1 bg-[#050505] hover:bg-[#3B82F6] hover:text-white text-[#3B82F6] border border-[#1A1A1A] px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            <Zap className="h-3 w-3 text-[#3B82F6]" />
            <span>SPRINT BRIEFING</span>
          </button>

          <button
            onClick={() => handlePresetAction('risk')}
            className="flex items-center gap-1 bg-[#050505] hover:bg-[#EF4444] hover:text-white text-[#EF4444] border border-[#1A1A1A] px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            <ShieldAlert className="h-3 w-3 text-[#EF4444]" />
            <span>RISK AUDIT</span>
          </button>

          <button
            onClick={() => handlePresetAction('decompose')}
            className="flex items-center gap-1 bg-[#050505] hover:bg-[#F59E0B] hover:text-black text-[#F59E0B] border border-[#1A1A1A] px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            <Sparkles className="h-3 w-3 text-[#F59E0B]" />
            <span>DECOMPOSE BACKLOG</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="h-6 w-6 bg-[#3B82F6] text-black flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-[#F5F5F5] text-black border-[#F5F5F5]'
                    : 'bg-[#0A0A0A] text-[#F5F5F5] border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase font-bold text-[#71717A] mb-1">
                  <span>{msg.sender === 'user' ? 'YOU' : 'GEMINI COPILOT'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap uppercase font-mono">{msg.text}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="h-6 w-6 bg-[#1A1A1A] text-[#F5F5F5] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-2.5 items-center text-[#71717A] text-xs font-mono uppercase">
              <Sparkles className="h-4 w-4 text-[#3B82F6] animate-spin" />
              <span>AI AGENT THINKING...</span>
            </div>
          )}
        </div>

        {/* Query Input Footer */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-[#1A1A1A] bg-[#0A0A0A] flex gap-2"
        >
          <input
            type="text"
            placeholder="ASK AI COPILOT FOR ADVICE, RISKS, OR ESTIMATES..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="flex-1 bg-[#050505] border border-[#1A1A1A] text-xs text-[#F5F5F5] uppercase px-3 py-2.5 focus:outline-none focus:border-[#3B82F6]"
          />
          <button
            type="submit"
            disabled={isSending || !inputQuery.trim()}
            className="bg-[#3B82F6] text-black hover:bg-[#F5F5F5] p-2.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

