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
  return (
    <header className="site-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <div className="brand" onClick={onGoHome} role="button" tabIndex={0}>
          <div className="brand-logo">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div className="brand-text">
            <span className="brand-title">AI Engineer</span>
            <span className="brand-sub">from first principles</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <button className="search-trigger-btn" onClick={onOpenSearch}>
          <Search size={16} className="text-muted" />
          <span className="search-placeholder">Quick search 28 chapters...</span>
          <kbd className="search-kbd">Ctrl K</kbd>
        </button>
      </div>

      <div className="header-right">
        <button
          className="icon-action-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <a
          href="https://github.com/rohitg00/ai-engineering-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-action-btn github-link"
          title="Curriculum Inspiration & Repos"
        >
          <GitBranch size={18} />
        </a>
      </div>
    </header>
  );
};
