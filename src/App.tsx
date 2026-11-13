import { useState, useEffect } from 'react';
import type { TargetRole } from './types/curriculum';
import { ALL_CHAPTERS, getChapterById } from './data/curriculum';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChapterView } from './components/ChapterView';
import { InteractiveTools } from './components/InteractiveTools';
import { ResourcesView } from './components/ResourcesView';
import { OverviewView } from './components/OverviewView';
import { SearchModal } from './components/SearchModal';

export function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('ai-fp-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // storage blocked
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<'chapter' | 'tools' | 'resources' | 'overview'>('overview');
  const [currentChapterId, setCurrentChapterId] = useState<string>('01-tokens-and-tokenization');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Active Role Filter State
  const [activeRole, setActiveRole] = useState<TargetRole | 'all'>(() => {
    try {
      const saved = localStorage.getItem('ai-fp-active-role');
      if (saved && ['all', 'ai-engineer', 'agent-architect', 'harness-engineer', 'fde'].includes(saved)) {
        return saved as TargetRole | 'all';
      }
    } catch {
      // ignore
    }
    return 'all';
  });

  // Read Progress State
  const [readChapters, setReadChapters] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ai-fp-read-chapters');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Watched Lectures State
  const [watchedLectures, setWatchedLectures] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ai-fp-watched-lectures');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Solved Problems State
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ai-fp-solved-problems');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('ai-fp-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'tools') {
        setCurrentView('tools');
      } else if (hash === 'resources') {
        setCurrentView('resources');
      } else if (hash === 'overview' || !hash) {
        setCurrentView('overview');
      } else {
        const found = getChapterById(hash);
        if (found) {
          setCurrentChapterId(found.id);
          setCurrentView('chapter');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleToggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectRole = (role: TargetRole | 'all') => {
    setActiveRole(role);
    try {
      localStorage.setItem('ai-fp-active-role', role);
    } catch {
      // ignore
    }
  };

  const handleSelectChapter = (id: string) => {
    setCurrentChapterId(id);
    setCurrentView('chapter');
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectView = (view: 'chapter' | 'tools' | 'resources' | 'overview') => {
    setCurrentView(view);
    if (view === 'chapter') {
      window.location.hash = currentChapterId;
    } else {
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleRead = (id: string) => {
    setReadChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('ai-fp-read-chapters', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleWatched = (lectureUrl: string) => {
    setWatchedLectures(prev => {
      const next = new Set(prev);
      if (next.has(lectureUrl)) {
        next.delete(lectureUrl);
      } else {
        next.add(lectureUrl);
      }
      try {
        localStorage.setItem('ai-fp-watched-lectures', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleSolved = (problemKey: string) => {
    setSolvedProblems(prev => {
      const next = new Set(prev);
      if (next.has(problemKey)) {
        next.delete(problemKey);
      } else {
        next.add(problemKey);
      }
      try {
        localStorage.setItem('ai-fp-solved-problems', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const activeChapter = getChapterById(currentChapterId) || ALL_CHAPTERS[0];

  return (
    <div className="app-layout">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(o => !o)}
        onOpenSearch={() => setIsSearchOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onGoHome={() => handleSelectView('overview')}
      />

      <div className="app-main-container">
        <Sidebar
          currentChapterId={currentChapterId}
          currentView={currentView}
          onSelectChapter={handleSelectChapter}
          onSelectView={handleSelectView}
          readChapters={readChapters}
          watchedLectures={watchedLectures}
          solvedProblems={solvedProblems}
          activeRole={activeRole}
          onSelectRole={handleSelectRole}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="app-content-area">
          {currentView === 'overview' && (
            <OverviewView
              onSelectChapter={handleSelectChapter}
              onOpenTools={() => handleSelectView('tools')}
              onOpenResources={() => handleSelectView('resources')}
              readChapters={readChapters}
              watchedLectures={watchedLectures}
              solvedProblems={solvedProblems}
              activeRole={activeRole}
              onSelectRole={handleSelectRole}
            />
          )}

          {currentView === 'chapter' && (
            <ChapterView
              chapter={activeChapter}
              onSelectChapter={handleSelectChapter}
              isRead={readChapters.has(activeChapter.id)}
              onToggleRead={handleToggleRead}
              watchedLectures={watchedLectures}
              onToggleWatched={handleToggleWatched}
              solvedProblems={solvedProblems}
              onToggleSolved={handleToggleSolved}
              activeRole={activeRole}
            />
          )}

          {currentView === 'tools' && (
            <InteractiveTools />
          )}

          {currentView === 'resources' && (
            <ResourcesView />
          )}
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}

export default App;
