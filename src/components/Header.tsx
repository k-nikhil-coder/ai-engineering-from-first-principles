import React from 'react';
import { Menu, Search, Sun, Moon, Sparkles, GitBranch } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onGoHome: () => void;
  onOpenTracker?: () => void;
  overallMastery?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  theme,
  onToggleTheme,
  onGoHome,
  onOpenTracker,
  overallMastery = 0
}) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);

  // SVG mini-ring math (Radius 8, Circumference 50.26)
  const ringRadius = 8;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (overallMastery / 100) * ringCircumference;

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
        {onOpenTracker && (
          <button
            className="mastery-pill-btn"
            onClick={onOpenTracker}
            title="Open Engineering Mastery Matrix"
          >
            <div className="mini-ring-wrapper">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <circle
                  className="mini-ring-bg"
                  cx="11"
                  cy="11"
                  r={ringRadius}
                  strokeWidth="2.5"
                />
                <circle
                  className="mini-ring-fill"
                  cx="11"
                  cy="11"
                  r={ringRadius}
                  strokeWidth="2.5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="mastery-pill-text">Mastery {overallMastery}%</span>
          </button>
        )}

        <button
          className="icon-action-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <a
          href="https://github.com/k-nikhil-coder/ai-engineering-from-first-principles"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-action-btn github-link"
          title="GitHub: k-nikhil-coder/ai-engineering-from-first-principles"
          aria-label="GitHub Repository"
        >
          <GitBranch size={16} />
        </a>
      </div>
    </header>
  );
};
