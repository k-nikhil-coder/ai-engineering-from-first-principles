import React, { useState } from 'react';
import type { Chapter, TargetRole } from '../types/curriculum';
import { getAdjacentChapters } from '../data/curriculum';
import { InteractiveTools } from './InteractiveTools';
import { 
  CheckCircle, 
  Circle, 
  Copy, 
  Check, 
  AlertTriangle, 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight,
  Code,
  HelpCircle,
  FileCode,
  BookOpen,
  Video,
  Cpu,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bug,
  CheckCircle2,
  Clock,
  Sparkles,
  Play
} from 'lucide-react';

interface ChapterViewProps {
  chapter: Chapter;
  onSelectChapter: (id: string) => void;
  isRead: boolean;
  onToggleRead: (id: string) => void;
  watchedLectures: Set<string>;
  onToggleWatched: (lectureUrl: string) => void;
  solvedProblems: Set<string>;
  onToggleSolved: (problemKey: string) => void;
  activeRole?: TargetRole | 'all';
}

type TabType = 'read' | 'watch' | 'explore' | 'solve';

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  onSelectChapter,
  isRead,
  onToggleRead,
  watchedLectures,
  onToggleWatched,
  solvedProblems,
  onToggleSolved,
  activeRole = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('read');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  // Accordions for solutions
  const [showSolutionA, setShowSolutionA] = useState<boolean>(false);
  const [showSolutionB, setShowSolutionB] = useState<boolean>(false);

  const { prev, next } = getAdjacentChapters(chapter.id, activeRole);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const roleLabelMap: Record<TargetRole, string> = {
    'ai-engineer': 'AI Engineer',
    'agent-architect': 'Agent Architect',
    'harness-engineer': 'Agentic Coder',
    'fde': 'FDE Track'
  };

  const problemAKey = `${chapter.id}-problemA`;
  const problemBKey = `${chapter.id}-problemB`;
  const isProblemASolved = solvedProblems.has(problemAKey);
  const isProblemBSolved = solvedProblems.has(problemBKey);

  return (
    <article className="chapter-article">
      {/* Chapter Top Header */}
      <header className="chapter-header">
        <div className="chapter-meta-row">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chapter-module-badge">{chapter.moduleName}</span>
            <span className="chapter-read-time">{chapter.readTime} read</span>
            {chapter.targetRoles.map(role => (
              <span key={role} className={`chapter-role-tag role-${role}`}>
                {roleLabelMap[role]}
              </span>
            ))}
          </div>

          <button
            onClick={() => onToggleRead(chapter.id)}
            className={`read-toggle-btn ${isRead ? 'read' : ''}`}
          >
            {isRead ? (
              <>
                <CheckCircle size={15} /> Completed Read
              </>
            ) : (
              <>
                <Circle size={15} /> Mark as Read
              </>
            )}
          </button>
        </div>

        <h1 className="chapter-title">
          <span className="chapter-number">{chapter.number}</span> {chapter.title}
        </h1>

        <div className="chapter-motto-box">
          <Lightbulb className="motto-icon" size={20} />
          <blockquote>"{chapter.motto}"</blockquote>
        </div>

        {/* 4-Tab Navigation Bar */}
        <nav className="chapter-tabs-bar" aria-label="Chapter Learning Modes">
          <button
            className={`chapter-tab-btn ${activeTab === 'read' ? 'active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            <BookOpen size={16} />
            <span>1. First Principles (Read)</span>
            {isRead && <span className="tab-status-dot completed" title="Read" />}
          </button>

          <button
            className={`chapter-tab-btn ${activeTab === 'watch' ? 'active' : ''}`}
            onClick={() => setActiveTab('watch')}
          >
            <Video size={16} />
            <span>2. Curated Lectures (Watch)</span>
            {chapter.lectures && chapter.lectures.length > 0 && (
              <span className="tab-counter-badge">{chapter.lectures.length}</span>
            )}
          </button>

          <button
            className={`chapter-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Cpu size={16} />
            <span>3. Interactive Simulator (Explore)</span>
            {chapter.simulatorType && (
              <span className="tab-pill-badge">{chapter.simulatorType}</span>
            )}
          </button>

          <button
            className={`chapter-tab-btn ${activeTab === 'solve' ? 'active' : ''}`}
            onClick={() => setActiveTab('solve')}
          >
            <Terminal size={16} />
            <span>4. Problems & Labs (Solve)</span>
            <span className="tab-counter-badge">
              {(isProblemASolved ? 1 : 0) + (isProblemBSolved ? 1 : 0)}/2
            </span>
          </button>
        </nav>
      </header>

      {/* =========================================================================
          TAB 1: FIRST PRINCIPLES (READ)
         ========================================================================= */}
      {activeTab === 'read' && (
        <div className="chapter-tab-content tab-read">
          {/* Problem Statement Callout */}
          <section className="chapter-section problem-box">
            <div className="section-title-row">
              <AlertTriangle className="text-amber-400" size={18} />
              <h3>The Problem & Common False Assumptions</h3>
            </div>
            <p className="problem-text">{chapter.problemStatement}</p>
          </section>

          {/* Core Concepts */}
          <section className="chapter-section">
            <h2 className="section-heading">First-Principles Concepts</h2>
            {chapter.coreConcepts.map((concept, idx) => (
              <div key={idx} className="concept-card">
                <h3 className="concept-title">{concept.title}</h3>
                <p className="concept-summary">{concept.summary}</p>
                <div className="concept-content">
                  {concept.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {concept.mathFormula && (
                  <div className="math-box">
                    <span className="math-label">Mathematical Formulation:</span>
                    <code>{concept.mathFormula}</code>
                  </div>
                )}

                {concept.diagram && (
                  <div className="diagram-container">
                    <pre className="ascii-diagram">{concept.diagram}</pre>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Code Implementation */}
          <section className="chapter-section">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="text-emerald-400" size={20} />
                <h2 className="section-heading" style={{ margin: 0 }}>First-Principles Implementation</h2>
              </div>
              <button 
                onClick={() => handleCopy(chapter.codeImplementation.code, 'main-code')} 
                className="copy-btn"
              >
                {copiedCode === 'main-code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedCode === 'main-code' ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <div className="code-block-wrapper">
              <div className="code-header">
                <div className="flex items-center gap-3">
                  <div className="mac-window-dots" aria-hidden="true">
                    <span className="mac-dot mac-dot-close" />
                    <span className="mac-dot mac-dot-minimize" />
                    <span className="mac-dot mac-dot-maximize" />
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCode size={13} className="text-muted" />
                    <span className="code-file-title">{chapter.codeImplementation.title}</span>
                  </div>
                </div>
                <span className="code-lang">{chapter.codeImplementation.language}</span>
              </div>
              <pre className="code-pre">
                <code>{chapter.codeImplementation.code}</code>
              </pre>
              <div className="code-desc">
                <p>{chapter.codeImplementation.description}</p>
              </div>
            </div>
          </section>

          {/* Production Pitfalls */}
          <section className="chapter-section pitfalls-box">
            <div className="section-title-row">
              <AlertTriangle className="text-rose-400" size={18} />
              <h3>Production Pitfalls & Hard Truths</h3>
            </div>
            <ul className="pitfalls-list">
              {chapter.productionPitfalls.map((pitfall, i) => (
                <li key={i}>{pitfall}</li>
              ))}
            </ul>
          </section>

          {/* Key Takeaways */}
          <section className="chapter-section takeaways-box">
            <h3 className="takeaways-title">Key Engineering Takeaways</h3>
            <ul className="takeaways-list">
              {chapter.keyTakeaways.map((takeaway, i) => (
                <li key={i}>{takeaway}</li>
              ))}
            </ul>
          </section>

          {/* Interactive Quiz */}
          {chapter.quiz && chapter.quiz.length > 0 && (
            <section className="chapter-section quiz-section">
              <div className="section-title-row">
                <HelpCircle className="text-emerald-400" size={20} />
                <h2 className="section-heading" style={{ margin: 0 }}>Self-Assessment Checkpoint</h2>
              </div>
              <p className="text-muted text-sm mb-4">
                Test your first-principles understanding before moving to the next chapter.
              </p>

              {chapter.quiz.map((q, qIdx) => {
                const selected = selectedAnswers[qIdx];
                const isAnswered = selected !== undefined;
                const isCorrect = isAnswered && selected === q.correctIndex;

                return (
                  <div key={qIdx} className="quiz-card">
                    <p className="quiz-question">{q.question}</p>
                    <div className="quiz-options">
                      {q.options.map((opt, optIdx) => {
                        let optClass = "quiz-option";
                        if (isAnswered) {
                          if (optIdx === q.correctIndex) {
                            optClass += " correct";
                          } else if (selected === optIdx) {
                            optClass += " incorrect";
                          }
                        }
                        return (
                          <button
                            key={optIdx}
                            className={optClass}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                          >
                            <span className="opt-marker">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="opt-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className={`quiz-feedback ${isCorrect ? 'pass' : 'fail'}`}>
                        <p>
                          <strong>{isCorrect ? "Correct! " : "Not quite. "}</strong>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CURATED LECTURES (WATCH)
         ========================================================================= */}
      {activeTab === 'watch' && (
        <div className="chapter-tab-content tab-watch">
          <div className="tab-banner">
            <Video size={22} className="text-emerald-400" />
            <div>
              <h3>Verified Engineering Talks & Deep Dives</h3>
              <p>Curated technical lectures from seminal AI researchers and system creators with verified architectural takeaways.</p>
            </div>
          </div>

          {chapter.lectures && chapter.lectures.length > 0 ? (
            <div className="lectures-grid">
              {chapter.lectures.map((lec, idx) => {
                const isWatched = watchedLectures.has(lec.url);
                return (
                  <div key={idx} className={`lecture-card ${isWatched ? 'watched' : ''}`}>
                    <div className="lecture-card-header">
                      <div className="lecture-meta">
                        <span className="lecture-speaker">{lec.speaker}</span>
                        <span className="lecture-duration">
                          <Clock size={13} /> {lec.duration}
                        </span>
                      </div>
                      <button
                        onClick={() => onToggleWatched(lec.url)}
                        className={`lecture-watch-toggle ${isWatched ? 'active' : ''}`}
                      >
                        {isWatched ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-400" /> Watched
                          </>
                        ) : (
                          <>
                            <Circle size={14} /> Mark as Watched
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="lecture-title">{lec.title}</h3>

                    <div className="lecture-actions-row">
                      <a
                        href={lec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-lecture-watch"
                      >
                        <Play size={14} /> Watch on YouTube <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="lecture-takeaways-box">
                      <h4 className="takeaways-header">Timestamped Architecture Takeaways:</h4>
                      <ul className="lecture-takeaway-list">
                        {lec.timestampedTakeaways.map((item, tIdx) => (
                          <li key={tIdx} className="takeaway-item">
                            <span className="takeaway-timestamp">{item.time}</span>
                            <span className="takeaway-text">{item.takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="lecture-fallback-card">
              <Sparkles size={24} className="text-emerald-400 mb-2" />
              <h3>Curated Engineering Reading & Seminal Papers</h3>
              <p>This chapter's core concepts are derived from foundational publications and systems specifications. Refer to the first-principles derivations and runnable implementation in Tab 1.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: INTERACTIVE SIMULATOR (EXPLORE)
         ========================================================================= */}
      {activeTab === 'explore' && (
        <div className="chapter-tab-content tab-explore">
          <div className="tab-banner">
            <Cpu size={22} className="text-cyan-400" />
            <div>
              <h3>Interactive Architectural Sandbox</h3>
              <p>
                Visualizing the dynamic mechanics of <strong>{chapter.title}</strong>. Experiment with inputs, sliding windows, and hyper-parameters to see memory and token calculations in real time.
              </p>
            </div>
          </div>

          <div className="embedded-simulator-wrapper">
            <InteractiveTools
              initialTab={chapter.simulatorType || 'kv-cache'}
              standalone={false}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PROBLEMS & BUILD LABS (SOLVE)
         ========================================================================= */}
      {activeTab === 'solve' && (
        <div className="chapter-tab-content tab-solve">
          <div className="tab-banner">
            <Terminal size={22} className="text-emerald-400" />
            <div>
              <h3>Engineering Labs & Production Fixes</h3>
              <p>Two concrete challenges for this chapter: an algorithmic core problem and a real-world production systems debugging incident.</p>
            </div>
          </div>

          {chapter.labs ? (
            <div className="labs-container">
              {/* Problem A: Algorithmic / DSA Core */}
              <div className="lab-card problem-a">
                <div className="lab-header">
                  <div className="flex items-center gap-2">
                    <span className="lab-badge algo">Problem A: Algorithmic Core</span>
                    <span className="lab-status">
                      {isProblemASolved ? (
                        <span className="status-badge solved">
                          <CheckCircle2 size={13} /> Solved
                        </span>
                      ) : (
                        <span className="status-badge unsolved">Unsolved</span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleSolved(problemAKey)}
                    className={`btn-solve-toggle ${isProblemASolved ? 'active' : ''}`}
                  >
                    {isProblemASolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                  </button>
                </div>

                <h3 className="lab-title">{chapter.labs.problemA.title}</h3>
                <p className="lab-subtitle">{chapter.labs.problemA.subtitle}</p>

                <div className="lab-statement">
                  <h4>Problem Statement</h4>
                  <p>{chapter.labs.problemA.problemStatement}</p>
                </div>

                {chapter.labs.problemA.constraints && chapter.labs.problemA.constraints.length > 0 && (
                  <div className="lab-constraints">
                    <h4>Constraints & Guarantees</h4>
                    <ul>
                      {chapter.labs.problemA.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Test Cases */}
                <div className="lab-testcases">
                  <h4>Verification Test Cases</h4>
                  <div className="testcases-list">
                    {chapter.labs.problemA.testCases.map((tc, i) => (
                      <div key={i} className="testcase-item">
                        <div className="tc-row">
                          <span className="tc-label">Input:</span>
                          <code>{tc.input}</code>
                        </div>
                        <div className="tc-row">
                          <span className="tc-label">Expected:</span>
                          <code>{tc.expectedOutput}</code>
                        </div>
                        {tc.explanation && (
                          <div className="tc-explanation">
                            <span>Note: {tc.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Starter Code */}
                <div className="lab-code-section">
                  <div className="lab-code-header">
                    <div className="flex items-center gap-3">
                      <div className="mac-window-dots" aria-hidden="true">
                        <span className="mac-dot mac-dot-close" />
                        <span className="mac-dot mac-dot-minimize" />
                        <span className="mac-dot mac-dot-maximize" />
                      </div>
                      <span>Starter Template (Python 3.11+)</span>
                    </div>
                    <button
                      onClick={() => handleCopy(chapter.labs!.problemA.starterCode, 'starter-a')}
                      className="copy-btn sm"
                    >
                      {copiedCode === 'starter-a' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode === 'starter-a' ? 'Copied' : 'Copy Starter'}
                    </button>
                  </div>
                  <pre className="code-pre lab-pre">
                    <code>{chapter.labs.problemA.starterCode}</code>
                  </pre>
                </div>

                {/* Solution Accordion */}
                <div className="lab-solution-accordion">
                  <button
                    className="solution-toggle-btn"
                    onClick={() => setShowSolutionA(s => !s)}
                  >
                    <span>{showSolutionA ? 'Hide Reference Solution' : 'Reveal Reference Solution & Complexity Analysis'}</span>
                    {showSolutionA ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showSolutionA && (
                    <div className="solution-drawer">
                      <div className="lab-code-header">
                        <div className="flex items-center gap-3">
                          <div className="mac-window-dots" aria-hidden="true">
                            <span className="mac-dot mac-dot-close" />
                            <span className="mac-dot mac-dot-minimize" />
                            <span className="mac-dot mac-dot-maximize" />
                          </div>
                          <span className="text-emerald-400">Complete Production Solution</span>
                        </div>
                        <button
                          onClick={() => handleCopy(chapter.labs!.problemA.solutionCode, 'solution-a')}
                          className="copy-btn sm"
                        >
                          {copiedCode === 'solution-a' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCode === 'solution-a' ? 'Copied' : 'Copy Solution'}
                        </button>
                      </div>
                      <pre className="code-pre lab-pre solution-pre">
                        <code>{chapter.labs.problemA.solutionCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Problem B: Production Systems Debugging */}
              <div className="lab-card problem-b">
                <div className="lab-header">
                  <div className="flex items-center gap-2">
                    <span className="lab-badge debug">
                      <Bug size={13} /> Problem B: Production Debugging Lab
                    </span>
                    <span className="lab-status">
                      {isProblemBSolved ? (
                        <span className="status-badge solved">
                          <CheckCircle2 size={13} /> Solved
                        </span>
                      ) : (
                        <span className="status-badge unsolved">Unsolved</span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleSolved(problemBKey)}
                    className={`btn-solve-toggle ${isProblemBSolved ? 'active' : ''}`}
                  >
                    {isProblemBSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                  </button>
                </div>

                <h3 className="lab-title">{chapter.labs.problemB.title}</h3>
                <p className="lab-subtitle">{chapter.labs.problemB.subtitle}</p>

                <div className="lab-statement">
                  <h4>The Incident / Failure Mode</h4>
                  <p>{chapter.labs.problemB.problemStatement}</p>
                </div>

                {chapter.labs.problemB.constraints && chapter.labs.problemB.constraints.length > 0 && (
                  <div className="lab-constraints">
                    <h4>Production Failure Symptoms</h4>
                    <ul>
                      {chapter.labs.problemB.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Buggy Snippet */}
                <div className="lab-code-section">
                  <div className="lab-code-header buggy">
                    <div className="flex items-center gap-3">
                      <div className="mac-window-dots" aria-hidden="true">
                        <span className="mac-dot mac-dot-close" />
                        <span className="mac-dot mac-dot-minimize" />
                        <span className="mac-dot mac-dot-maximize" />
                      </div>
                      <span className="text-rose-400">Broken Production Code (Contains Vulnerability / Bug)</span>
                    </div>
                    <button
                      onClick={() => handleCopy(chapter.labs!.problemB.starterCode, 'starter-b')}
                      className="copy-btn sm"
                    >
                      {copiedCode === 'starter-b' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode === 'starter-b' ? 'Copied' : 'Copy Buggy Code'}
                    </button>
                  </div>
                  <pre className="code-pre lab-pre buggy-pre">
                    <code>{chapter.labs.problemB.starterCode}</code>
                  </pre>
                </div>

                {/* Solution Accordion */}
                <div className="lab-solution-accordion">
                  <button
                    className="solution-toggle-btn debug"
                    onClick={() => setShowSolutionB(s => !s)}
                  >
                    <span>{showSolutionB ? 'Hide Root Cause & Production Fix' : 'Reveal Root Cause & Fixed Implementation'}</span>
                    {showSolutionB ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showSolutionB && (
                    <div className="solution-drawer">
                      <div className="lab-code-header fixed">
                        <div className="flex items-center gap-3">
                          <div className="mac-window-dots" aria-hidden="true">
                            <span className="mac-dot mac-dot-close" />
                            <span className="mac-dot mac-dot-minimize" />
                            <span className="mac-dot mac-dot-maximize" />
                          </div>
                          <span className="text-emerald-400">Hardened Production Fix</span>
                        </div>
                        <button
                          onClick={() => handleCopy(chapter.labs!.problemB.solutionCode, 'solution-b')}
                          className="copy-btn sm"
                        >
                          {copiedCode === 'solution-b' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCode === 'solution-b' ? 'Copied' : 'Copy Fix'}
                        </button>
                      </div>
                      <pre className="code-pre lab-pre solution-pre">
                        <code>{chapter.labs.problemB.solutionCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="lab-fallback-card">
              <p>Lab exercises are being prepared for this module.</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Chapter Navigation */}
      <nav className="chapter-nav-footer">
        {prev ? (
          <button
            onClick={() => onSelectChapter(prev.id)}
            className="nav-btn prev"
          >
            <ChevronLeft size={18} />
            <div className="nav-btn-text">
              <span className="nav-label">Previous Chapter</span>
              <span className="nav-title">{prev.number} {prev.title}</span>
            </div>
          </button>
        ) : <div />}

        {next ? (
          <button
            onClick={() => onSelectChapter(next.id)}
            className="nav-btn next"
          >
            <div className="nav-btn-text text-right">
              <span className="nav-label">Next Chapter</span>
              <span className="nav-title">{next.number} {next.title}</span>
            </div>
            <ChevronRight size={18} />
          </button>
        ) : <div />}
      </nav>
    </article>
  );
};
