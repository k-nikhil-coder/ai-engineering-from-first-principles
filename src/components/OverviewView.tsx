import React from 'react';
import type { TargetRole } from '../types/curriculum';
import { MODULES, ALL_CHAPTERS } from '../data/curriculum';
import { RoleFilterBar } from './RoleFilterBar';
import { 
  ArrowRight, 
  BookOpen, 
  Cpu, 
  Database, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Briefcase,
  CheckCircle2,
  Video,
  Calculator
} from 'lucide-react';

interface OverviewViewProps {
  onSelectChapter: (id: string) => void;
  onOpenTools: () => void;
  onOpenResources: () => void;
  readChapters: Set<string>;
  watchedLectures: Set<string>;
  solvedProblems: Set<string>;
  activeRole: TargetRole | 'all';
  onSelectRole: (role: TargetRole | 'all') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectChapter,
  onOpenTools,
  onOpenResources,
  readChapters,
  watchedLectures,
  solvedProblems,
  activeRole,
  onSelectRole
}) => {
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu size={22} className="text-emerald-400" />;
      case 'Database': return <Database size={22} className="text-blue-400" />;
      case 'Bot': return <Bot size={22} className="text-purple-400" />;
      case 'Sparkles': return <Sparkles size={22} className="text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck size={22} className="text-rose-400" />;
      case 'Terminal': return <Terminal size={22} className="text-emerald-400" />;
      case 'Briefcase': return <Briefcase size={22} className="text-cyan-400" />;
      case 'Layers': return <Layers size={22} className="text-indigo-400" />;
      default: return <BookOpen size={22} className="text-emerald-400" />;
    }
  };

  const roleLabelMap: Record<TargetRole, string> = {
    'ai-engineer': 'AI Engineer',
    'agent-architect': 'Agent Architect',
    'harness-engineer': 'Agentic Coder',
    'fde': 'FDE Track'
  };

  // Filter modules/chapters based on activeRole
  const displayedModules = MODULES.map(module => {
    const chapters = ALL_CHAPTERS.filter(c => {
      if (c.moduleId !== module.id) return false;
      if (activeRole === 'all') return true;
      return c.targetRoles.includes(activeRole);
    });
    return { ...module, chapters };
  }).filter(m => m.chapters.length > 0);

  const totalFilteredChapters = displayedModules.reduce((acc, m) => acc + m.chapters.length, 0);

  return (
    <div className="overview-page">
      {/* Hero Section */}
      <section className="overview-hero">
        <div className="hero-badge">
          <Terminal size={14} className="text-emerald-400" />
          <span>Interactive 36-Chapter Master Curriculum & Production Platform</span>
        </div>
        <h1 className="hero-title">
          Applied AI & AI Systems Engineering,<br />
          <span className="gradient-text">from first principles.</span>
        </h1>
        <p className="hero-subtitle">
          Moving far beyond framework wrappers and black boxes. Every concept—from tokenization and attention mathematics to HNSW vector search, ReAct loops, LoRA parameter adaptation, AST repo maps, microVM computer sandboxes, enterprise CDC pipelines, and distributed evals—is derived, visualized, and implemented in pure, readable code.
        </p>

        {/* 4 Industry Tracks Callout */}
        <div className="curriculum-tracks-banner">
          <div className="tracks-banner-title">Aligned with 4 Industry Roadmaps:</div>
          <div className="tracks-pills-list">
            <span className="track-tag">roadmap.sh/ai-engineer</span>
            <span className="track-tag">roadmap.sh/ai-agents</span>
            <span className="track-tag">roadmap.sh/claude-code</span>
            <span className="track-tag">roadmap.sh/forward-deployed-engineer</span>
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => onSelectChapter('01-tokens-and-tokenization')}
          >
            Start Chapter 01 <ArrowRight size={16} />
          </button>
          <button
            className="btn-secondary"
            onClick={onOpenTools}
          >
            <Calculator size={15} /> 7 Interactive Simulators
          </button>
          <button
            className="btn-secondary"
            onClick={onOpenResources}
          >
            Curated Ecosystem Hub
          </button>
        </div>

        {/* Stats Row */}
        <div className="overview-stats-grid">
          <div className="stat-pill">
            <span className="stat-number">36</span>
            <span className="stat-desc">Production Chapters</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">8</span>
            <span className="stat-desc">Core Engineering Tracks</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">7</span>
            <span className="stat-desc">Interactive Simulators</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">72</span>
            <span className="stat-desc">Algorithmic & Debugging Labs</span>
          </div>
        </div>
      </section>

      {/* Role Filter Bar */}
      <section className="overview-filter-section">
        <RoleFilterBar
          activeRole={activeRole}
          onSelectRole={onSelectRole}
        />
      </section>

      {/* Modules Roadmap Grid */}
      <section className="overview-curriculum-section">
        <div className="curriculum-header-row">
          <div>
            <h2 className="section-title">The Engineering Curriculum</h2>
            <p className="section-subtitle">
              Showing <strong>{totalFilteredChapters}</strong> chapters for current track filter.
            </p>
          </div>
        </div>

        <div className="modules-grid">
          {displayedModules.map(module => {
            const moduleChapters = module.chapters;
            const readInModule = moduleChapters.filter(c => readChapters.has(c.id)).length;
            const lecturesInModule = moduleChapters.flatMap(c => c.lectures || []);
            const watchedInModule = lecturesInModule.filter(l => watchedLectures.has(l.url)).length;
            const solvedInModule = moduleChapters.reduce((acc, c) => {
              let count = 0;
              if (solvedProblems.has(`${c.id}-problemA`)) count++;
              if (solvedProblems.has(`${c.id}-problemB`)) count++;
              return acc + count;
            }, 0);

            return (
              <div key={module.id} className="module-card">
                <div className="module-card-header">
                  <div className="flex items-center gap-3">
                    <div className="module-card-icon">
                      {getModuleIcon(module.icon)}
                    </div>
                    <div>
                      <span className="module-card-range">{module.numberRange}</span>
                      <h3 className="module-card-title">{module.title}</h3>
                    </div>
                  </div>
                  <div className="module-card-metrics">
                    <span className="metric-badge read" title="Completed chapters">
                      <CheckCircle2 size={12} /> {readInModule}/{moduleChapters.length} read
                    </span>
                    {lecturesInModule.length > 0 && (
                      <span className="metric-badge watch" title="Watched lectures">
                        <Video size={12} /> {watchedInModule}/{lecturesInModule.length}
                      </span>
                    )}
                    <span className="metric-badge solve" title="Solved problem labs">
                      <Terminal size={12} /> {solvedInModule}/{moduleChapters.length * 2}
                    </span>
                  </div>
                </div>

                <p className="module-card-desc">{module.description}</p>

                <div className="module-chapters-list">
                  {moduleChapters.map(ch => {
                    const isRead = readChapters.has(ch.id);
                    const isSolvedA = solvedProblems.has(`${ch.id}-problemA`);
                    const isSolvedB = solvedProblems.has(`${ch.id}-problemB`);

                    return (
                      <div
                        key={ch.id}
                        className="module-chapter-item"
                        onClick={() => onSelectChapter(ch.id)}
                      >
                        <div className="chapter-item-left">
                          <span className="chapter-item-num">{ch.number}</span>
                          <span className="chapter-item-title">{ch.title}</span>
                        </div>

                        <div className="chapter-item-right">
                          <div className="chapter-item-tags">
                            {ch.targetRoles.map(role => (
                              <span key={role} className={`mini-role-pill mini-role-${role}`}>
                                {roleLabelMap[role]}
                              </span>
                            ))}
                          </div>
                          {(isSolvedA || isSolvedB) && (
                            <span className="status-indicator-lab" title="Labs solved">
                              <Terminal size={11} /> {isSolvedA && isSolvedB ? '2/2' : '1/2'}
                            </span>
                          )}
                          {isRead && <span className="read-dot" title="Read completed">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
