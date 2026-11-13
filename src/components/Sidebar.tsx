import React from 'react';
import type { TargetRole } from '../types/curriculum';
import { MODULES, ALL_CHAPTERS, filterChaptersByRole } from '../data/curriculum';
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
  Terminal, 
  Briefcase,
  Calculator, 
  Compass, 
  X,
  Video,
  Check
} from 'lucide-react';

interface SidebarProps {
  currentChapterId: string | null;
  currentView: 'chapter' | 'tools' | 'resources' | 'overview';
  onSelectChapter: (id: string) => void;
  onSelectView: (view: 'chapter' | 'tools' | 'resources' | 'overview') => void;
  readChapters: Set<string>;
  watchedLectures: Set<string>;
  solvedProblems: Set<string>;
  activeRole: TargetRole | 'all';
  onSelectRole: (role: TargetRole | 'all') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentChapterId,
  currentView,
  onSelectChapter,
  onSelectView,
  readChapters,
  watchedLectures,
  solvedProblems,
  activeRole,
  onSelectRole,
  isOpen,
  onClose
}) => {
  const filteredChapters = filterChaptersByRole(activeRole);
  const totalChapters = filteredChapters.length;
  
  // Calculate stats for current role filter
  const readCount = filteredChapters.filter(c => readChapters.has(c.id)).length;
  const readPercent = totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;

  // Total lectures in filtered chapters
  const allLectures = filteredChapters.flatMap(c => c.lectures || []);
  const watchedCount = allLectures.filter(l => watchedLectures.has(l.url)).length;

  // Total problems in filtered chapters
  const solvedCount = filteredChapters.reduce((acc, c) => {
    let count = 0;
    if (solvedProblems.has(`${c.id}-problemA`)) count++;
    if (solvedProblems.has(`${c.id}-problemB`)) count++;
    return acc + count;
  }, 0);
  const totalProblems = totalChapters * 2;

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu size={15} />;
      case 'Database': return <Database size={15} />;
      case 'Bot': return <Bot size={15} />;
      case 'Sparkles': return <Sparkles size={15} />;
      case 'ShieldCheck': return <ShieldCheck size={15} />;
      case 'Terminal': return <Terminal size={15} />;
      case 'Briefcase': return <Briefcase size={15} />;
      case 'Layers': return <Layers size={15} />;
      default: return <BookOpen size={15} />;
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="flex items-center justify-between">
            <span className="sidebar-section-title">Navigation</span>
            <button className="sidebar-close-btn" onClick={onClose} title="Close sidebar">
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
              <Compass size={15} />
              <span>Syllabus & Curriculum</span>
            </button>
            <button
              className={`quick-link-btn ${currentView === 'tools' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('tools');
                onClose();
              }}
            >
              <Calculator size={15} />
              <span>Interactive Simulators (7)</span>
            </button>
            <button
              className={`quick-link-btn ${currentView === 'resources' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('resources');
                onClose();
              }}
            >
              <BookOpen size={15} />
              <span>Curated Ecosystem</span>
            </button>
          </div>

          {/* Track Filter Selector */}
          <div className="sidebar-role-selector">
            <span className="sidebar-label">Active Track View:</span>
            <select
              value={activeRole}
              onChange={(e) => onSelectRole(e.target.value as TargetRole | 'all')}
              className="role-select-dropdown"
            >
              <option value="all">All Tracks (36 Chapters)</option>
              <option value="ai-engineer">AI Engineer (roadmap.sh)</option>
              <option value="agent-architect">AI Agents & Architect</option>
              <option value="harness-engineer">Agentic Coder (Claude Code)</option>
              <option value="fde">Forward Deployed Engineer (FDE)</option>
            </select>
          </div>

          {/* Multi-Metric Progress Tracker */}
          <div className="progress-container">
            <div className="progress-label">
              <span>Read Progress</span>
              <span className="text-emerald-400 font-mono font-medium">{readCount} / {totalChapters} ({readPercent}%)</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${readPercent}%` }}
              />
            </div>

            <div className="mini-stats-grid">
              <div className="mini-stat" title="Verified Lectures Watched">
                <Video size={12} className="text-muted" />
                <span>Watched: <strong>{watchedCount}/{allLectures.length}</strong></span>
              </div>
              <div className="mini-stat" title="Algorithmic & Debugging Labs Solved">
                <Terminal size={12} className="text-muted" />
                <span>Solved: <strong>{solvedCount}/{totalProblems}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters by Module */}
        <div className="sidebar-modules">
          {MODULES.map(module => {
            const moduleChapters = ALL_CHAPTERS.filter(c => {
              if (c.moduleId !== module.id) return false;
              if (activeRole === 'all') return true;
              return c.targetRoles.includes(activeRole);
            });

            if (moduleChapters.length === 0) return null;

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
                    const isProblemASolved = solvedProblems.has(`${chapter.id}-problemA`);
                    const isProblemBSolved = solvedProblems.has(`${chapter.id}-problemB`);
                    const bothSolved = isProblemASolved && isProblemBSolved;

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
                        <div className="chapter-link-badges">
                          {bothSolved && (
                            <span className="badge-mini-solved" title="Both Labs Solved">
                              <Check size={10} /> Lab
                            </span>
                          )}
                          <span className="chapter-link-status">
                            {isRead ? (
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                              <Circle size={14} className="text-muted" />
                            )}
                          </span>
                        </div>
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
