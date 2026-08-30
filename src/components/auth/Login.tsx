import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('sarah.connor@pulseflow.io');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xl shadow-lg mb-2">
            PF
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            PulseFlow Enterprise
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sign in to access your workspace telemetry & engineering tasks
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
            <span className="font-semibold shrink-0">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@pulseflow.io"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
          >
            {submitting ? 'Authenticating...' : 'Sign In with JWT'}
          </Button>
        </form>

        {/* Demo User Shortcuts */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs font-medium text-[var(--text-secondary)] text-center mb-2.5">
            Quick Select Development Accounts (Pass: <code className="text-indigo-400">Password123!</code>):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoUser('sarah.connor@pulseflow.io')}
              className="p-2 rounded-lg bg-[var(--bg-canvas)] hover:bg-indigo-600/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-400 text-left transition-colors truncate"
            >
              <div className="font-semibold text-[var(--text-primary)]">Sarah Connor</div>
              <div className="text-[10px] opacity-75">Super Admin</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('alex.rivera@pulseflow.io')}
              className="p-2 rounded-lg bg-[var(--bg-canvas)] hover:bg-indigo-600/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-400 text-left transition-colors truncate"
            >
              <div className="font-semibold text-[var(--text-primary)]">Alex Rivera</div>
              <div className="text-[10px] opacity-75">Project Manager</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('marcus.vance@pulseflow.io')}
              className="p-2 rounded-lg bg-[var(--bg-canvas)] hover:bg-indigo-600/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-400 text-left transition-colors truncate"
            >
              <div className="font-semibold text-[var(--text-primary)]">Marcus Vance</div>
              <div className="text-[10px] opacity-75">Senior Eng Lead</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('elena.rostova@pulseflow.io')}
              className="p-2 rounded-lg bg-[var(--bg-canvas)] hover:bg-indigo-600/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-400 text-left transition-colors truncate"
            >
              <div className="font-semibold text-[var(--text-primary)]">Elena Rostova</div>
              <div className="text-[10px] opacity-75">Staff Contributor</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
