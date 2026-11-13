import { useState, useEffect } from 'react';
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
            />
          )}

          {currentView === 'chapter' && (
            <ChapterView
              chapter={activeChapter}
              onSelectChapter={handleSelectChapter}
              isRead={readChapters.has(activeChapter.id)}
              onToggleRead={handleToggleRead}
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
