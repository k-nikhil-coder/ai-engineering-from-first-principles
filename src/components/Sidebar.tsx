import React from 'react';
import { MODULES, ALL_CHAPTERS } from '../data/curriculum';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Cpu, 
  Database, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  Calculator,
  Compass,
  X
} from 'lucide-react';

interface SidebarProps {
  currentChapterId: string | null;
  currentView: 'chapter' | 'tools' | 'resources' | 'overview';
  onSelectChapter: (id: string) => void;
  onSelectView: (view: 'chapter' | 'tools' | 'resources' | 'overview') => void;
  readChapters: Set<string>;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentChapterId,
  currentView,
  onSelectChapter,
  onSelectView,
  readChapters,
  isOpen,
  onClose
}) => {
  const progressPercent = Math.round((readChapters.size / ALL_CHAPTERS.length) * 100);

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu size={16} />;
      case 'Database': return <Database size={16} />;
      case 'Bot': return <Bot size={16} />;
      case 'Sparkles': return <Sparkles size={16} />;
      case 'ShieldCheck': return <ShieldCheck size={16} />;
      case 'Layers': return <Layers size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="flex items-center justify-between">
            <span className="sidebar-section-title">Navigation</span>
            <button className="sidebar-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Quick Views */}
          <div className="quick-links">
            <button
              className={`quick-link-btn ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('overview');
                onClose();
              }}
            >
              <Compass size={16} />
              <span>Syllabus & Architecture</span>
            </button>
            <button
              className={`quick-link-btn ${currentView === 'tools' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('tools');
                onClose();
              }}
            >
              <Calculator size={16} />
              <span>Interactive Simulators</span>
            </button>
            <button
              className={`quick-link-btn ${currentView === 'resources' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('resources');
                onClose();
              }}
            >
              <BookOpen size={16} />
              <span>Curated Ecosystem</span>
            </button>
          </div>

          {/* Progress Tracker */}
          <div className="progress-container">
            <div className="progress-label">
              <span>Read Progress</span>
              <span>{readChapters.size} / {ALL_CHAPTERS.length} ({progressPercent}%)</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapters by Module */}
        <div className="sidebar-modules">
          {MODULES.map(module => {
            const moduleChapters = ALL_CHAPTERS.filter(c => c.moduleId === module.id);
            return (
              <div key={module.id} className="module-group">
                <div className="module-header">
                  <div className="module-icon-box">
                    {getModuleIcon(module.icon)}
                  </div>
                  <div className="module-header-text">
                    <span className="module-range">{module.numberRange}</span>
                    <h3 className="module-title">{module.title}</h3>
                  </div>
                </div>

                <div className="chapter-nav-list">
                  {moduleChapters.map(chapter => {
                    const isActive = currentView === 'chapter' && currentChapterId === chapter.id;
                    const isRead = readChapters.has(chapter.id);

                    return (
                      <button
                        key={chapter.id}
                        className={`chapter-link ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          onSelectChapter(chapter.id);
                          onClose();
                        }}
                      >
                        <span className="chapter-link-num">{chapter.number}</span>
                        <span className="chapter-link-title">{chapter.title}</span>
                        <span className="chapter-link-status">
                          {isRead ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : (
                            <Circle size={14} className="text-muted" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
