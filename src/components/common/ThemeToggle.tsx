import React from 'react';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-0.5 font-mono">
      <button
        onClick={() => setTheme('light')}
        title="Light Theme"
        className={`p-1.5 transition-colors cursor-pointer ${
          theme === 'light'
            ? 'bg-[var(--brand-primary)] text-white font-bold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Dark Theme"
        className={`p-1.5 transition-colors cursor-pointer ${
          theme === 'dark'
            ? 'bg-[var(--brand-primary)] text-white font-bold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => setTheme('system')}
        title="System Theme"
        className={`p-1.5 transition-colors cursor-pointer ${
          theme === 'system'
            ? 'bg-[var(--brand-primary)] text-white font-bold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
