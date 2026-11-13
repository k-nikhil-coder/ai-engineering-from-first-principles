import React from 'react';
import { Menu, Search, Sun, Moon, Sparkles, GitBranch } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  theme,
  onToggleTheme,
  onGoHome
}) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);

  return (
    <header className="site-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          <Menu size={18} />
        </button>
        <div className="brand" onClick={onGoHome} role="button" tabIndex={0} title="Home Syllabus">
          <div className="brand-logo">
            <Sparkles size={16} className="brand-sparkle" />
          </div>
          <div className="brand-text">
            <span className="brand-title">AI Engineer</span>
            <span className="brand-sub">From First Principles</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <button className="search-trigger-btn" onClick={onOpenSearch}>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-muted" />
            <span className="search-placeholder">Quick search 36 chapters & labs...</span>
          </div>
          <kbd className="search-kbd">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
      </div>

      <div className="header-right">
        <button
          className="icon-action-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <a
          href="https://github.com/rohitg00/ai-engineering-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-action-btn github-link"
          title="Curriculum Inspiration & Repos"
          aria-label="GitHub Repository"
        >
          <GitBranch size={16} />
        </a>
      </div>
    </header>
  );
};
