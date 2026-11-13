import React from 'react';
import { MODULES, ALL_CHAPTERS } from '../data/curriculum';
import { 
  X, 
  CheckCircle2, 
  BookOpen, 
  Video, 
  Terminal, 
  Trophy, 
  RotateCcw
} from 'lucide-react';

interface ProgressTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  readChapters: Set<string>;
  watchedLectures: Set<string>;
  solvedProblems: Set<string>;
  onSelectChapter: (id: string) => void;
  onResetProgress: () => void;
}

export const ProgressTrackerModal: React.FC<ProgressTrackerModalProps> = ({
  isOpen,
  onClose,
  readChapters,
  watchedLectures,
  solvedProblems,
  onSelectChapter,
  onResetProgress
}) => {
  if (!isOpen) return null;

  const totalChapters = ALL_CHAPTERS.length;
  const readCount = readChapters.size;
  const readPercent = Math.round((readCount / totalChapters) * 100);

  const allLectures = ALL_CHAPTERS.flatMap(c => c.lectures || []);
  const watchedCount = allLectures.filter(l => watchedLectures.has(l.url)).length;
  const watchedPercent = allLectures.length > 0 ? Math.round((watchedCount / allLectures.length) * 100) : 0;

  const totalProblems = totalChapters * 2;
  const solvedCount = ALL_CHAPTERS.reduce((acc, c) => {
    let count = 0;
    if (solvedProblems.has(`${c.id}-problemA`)) count++;
    if (solvedProblems.has(`${c.id}-problemB`)) count++;
    return acc + count;
  }, 0);
  const solvedPercent = Math.round((solvedCount / totalProblems) * 100);

  // Overall Weighted Score: 50% Read, 20% Watch, 30% Solve
  const overallMasteryScore = Math.round(
    (readPercent * 0.5) + (watchedPercent * 0.2) + (solvedPercent * 0.3)
  );

  // Rank / Title based on mastery
  const getMasteryRank = (score: number) => {
    if (score >= 90) return { rank: 'Principal AI Architect', badge: 'Tier 5' };
    if (score >= 65) return { rank: 'Staff AI Systems Engineer', badge: 'Tier 4' };
    if (score >= 40) return { rank: 'Senior Applied AI Engineer', badge: 'Tier 3' };
    if (score >= 15) return { rank: 'Production AI Practitioner', badge: 'Tier 2' };
    return { rank: 'First-Principles Apprentice', badge: 'Tier 1' };
  };

  const currentRank = getMasteryRank(overallMasteryScore);

  // SVG Circular Gauge Math (Radius 42, Circumference 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMasteryScore / 100) * circumference;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tracker-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tracker-modal-header">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="tracker-modal-title">Engineering Mastery Matrix</h2>
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="tracker-modal-body">
          {/* Top Overall Score Card */}
          <div className="tracker-hero-card">
            <div className="tracker-gauge-wrapper">
              <svg className="tracker-svg-ring" width="104" height="104" viewBox="0 0 104 104">
                <circle
                  className="tracker-ring-bg"
                  cx="52"
                  cy="52"
                  r={radius}
                  strokeWidth="8"
                />
                <circle
                  className="tracker-ring-fill"
                  cx="52"
                  cy="52"
                  r={radius}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tracker-gauge-inner">
                <span className="gauge-score">{overallMasteryScore}%</span>
                <span className="gauge-label">Mastery</span>
              </div>
            </div>

            <div className="tracker-hero-info">
              <div className="flex items-center gap-2 mb-1">
                <span className="rank-tier-pill">{currentRank.badge}</span>
                <h3 className="rank-title">{currentRank.rank}</h3>
              </div>
              <p className="rank-desc">
                Calculated across 36 First-Principles Chapters, Verified Engineering Talks, and 72 Production Build Labs.
              </p>

              <div className="mini-progress-bars-grid">
                <div className="mini-metric-col">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span className="flex items-center gap-1"><BookOpen size={12} /> Read</span>
                    <span className="font-mono">{readCount}/{totalChapters}</span>
                  </div>
                  <div className="progress-track mini">
                    <div className="progress-fill" style={{ width: `${readPercent}%` }} />
                  </div>
                </div>

                <div className="mini-metric-col">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span className="flex items-center gap-1"><Video size={12} /> Watched</span>
                    <span className="font-mono">{watchedCount}/{allLectures.length}</span>
                  </div>
                  <div className="progress-track mini">
                    <div className="progress-fill watch" style={{ width: `${watchedPercent}%` }} />
                  </div>
                </div>

                <div className="mini-metric-col">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span className="flex items-center gap-1"><Terminal size={12} /> Solved</span>
                    <span className="font-mono">{solvedCount}/{totalProblems}</span>
                  </div>
                  <div className="progress-track mini">
                    <div className="progress-fill solve" style={{ width: `${solvedPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 8 Tracks Mastery Matrix */}
          <div className="tracks-breakdown-section">
            <h4 className="tracker-section-title">8-Track Curriculum Breakdown</h4>
            <div className="tracker-tracks-grid">
              {MODULES.map(module => {
                const moduleChapters = ALL_CHAPTERS.filter(c => c.moduleId === module.id);
                const modRead = moduleChapters.filter(c => readChapters.has(c.id)).length;
                const modTotal = moduleChapters.length;
                const modPercent = Math.round((modRead / modTotal) * 100);
                const isComplete = modRead === modTotal;

                return (
                  <div
                    key={module.id}
                    className={`track-progress-card ${isComplete ? 'completed' : ''}`}
                    onClick={() => {
                      if (moduleChapters[0]) {
                        onSelectChapter(moduleChapters[0].id);
                        onClose();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title="Click to jump to this track"
                  >
                    <div className="track-card-top">
                      <div>
                        <span className="track-card-range">Track {module.trackNumber} ({module.numberRange})</span>
                        <h5 className="track-card-title">{module.title}</h5>
                      </div>
                      <span className="track-card-count">
                        {isComplete ? <CheckCircle2 size={14} className="text-emerald-400" /> : `${modRead}/${modTotal}`}
                      </span>
                    </div>

                    <div className="progress-track mini mt-2">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${modPercent}%`,
                          background: isComplete ? 'var(--accent-emerald)' : 'var(--accent-clay)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts Tip */}
          <div className="keyboard-shortcuts-box">
            <h5 className="shortcuts-title">Keyboard Navigation Shortcuts</h5>
            <div className="shortcuts-list">
              <span className="shortcut-pill"><kbd>[</kbd> Previous Chapter</span>
              <span className="shortcut-pill"><kbd>]</kbd> Next Chapter</span>
              <span className="shortcut-pill"><kbd>⌘K</kbd> Search Chapters</span>
              <span className="shortcut-pill"><kbd>M</kbd> Mark Completed</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="tracker-modal-footer">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all reading, watched, and solved progress?")) {
                onResetProgress();
              }
            }}
            className="btn-reset-progress"
          >
            <RotateCcw size={13} /> Reset All Progress
          </button>

          <button onClick={onClose} className="btn-secondary sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
