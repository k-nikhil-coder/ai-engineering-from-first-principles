import React from 'react';
import { MODULES, ALL_CHAPTERS } from '../data/curriculum';
import { ArrowRight, BookOpen, Cpu, Database, Bot, Sparkles, ShieldCheck, Layers, Terminal } from 'lucide-react';

interface OverviewViewProps {
  onSelectChapter: (id: string) => void;
  onOpenTools: () => void;
  onOpenResources: () => void;
  readChapters: Set<string>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectChapter,
  onOpenTools,
  onOpenResources,
  readChapters
}) => {
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu size={22} className="text-emerald-400" />;
      case 'Database': return <Database size={22} className="text-blue-400" />;
      case 'Bot': return <Bot size={22} className="text-purple-400" />;
      case 'Sparkles': return <Sparkles size={22} className="text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck size={22} className="text-rose-400" />;
      case 'Layers': return <Layers size={22} className="text-cyan-400" />;
      default: return <BookOpen size={22} className="text-emerald-400" />;
    }
  };

  return (
    <div className="overview-page">
      {/* Hero Section */}
      <section className="overview-hero">
        <div className="hero-badge">
          <Terminal size={14} className="text-emerald-400" />
          <span>Complete 28-Chapter Production Reference</span>
        </div>
        <h1 className="hero-title">
          Applied AI & AI Engineering,<br />
          <span className="gradient-text">from first principles.</span>
        </h1>
        <p className="hero-subtitle">
          Moving beyond framework wrappers and black boxes. Every concept—from tokenization and attention mathematics to HNSW vector search, ReAct loops, LoRA parameter adaptation, and distributed evals—is derived and implemented in pure, readable Python.
        </p>

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
            Open Interactive Simulators
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
            <span className="stat-number">28</span>
            <span className="stat-desc">Exhaustive Chapters</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">6</span>
            <span className="stat-desc">Core Engineering Tracks</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">100%</span>
            <span className="stat-desc">Pure Python Runnables</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">28</span>
            <span className="stat-desc">Self-Assessment Quizzes</span>
          </div>
        </div>
      </section>

      {/* Modules Roadmap Grid */}
      <section className="overview-curriculum-section">
        <h2 className="section-title">The Engineering Curriculum</h2>
        <div className="modules-grid">
          {MODULES.map(module => {
            const moduleChapters = ALL_CHAPTERS.filter(c => c.moduleId === module.id);
            const readInModule = moduleChapters.filter(c => readChapters.has(c.id)).length;

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
                  <span className="module-card-count">
                    {readInModule}/{moduleChapters.length} read
                  </span>
                </div>

                <p className="module-card-desc">{module.description}</p>

                <div className="module-chapters-list">
                  {moduleChapters.map(ch => {
                    const isRead = readChapters.has(ch.id);
                    return (
                      <div
                        key={ch.id}
                        className="module-chapter-item"
                        onClick={() => onSelectChapter(ch.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="chapter-item-num">{ch.number}</span>
                          <span className="chapter-item-title">{ch.title}</span>
                        </div>
                        {isRead && <span className="read-dot" title="Completed">✓</span>}
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
