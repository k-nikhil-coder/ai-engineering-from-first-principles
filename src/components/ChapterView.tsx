import React, { useState } from 'react';
import type { Chapter } from '../types/curriculum';
import { getAdjacentChapters } from '../data/curriculum';
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
  FileCode
} from 'lucide-react';

interface ChapterViewProps {
  chapter: Chapter;
  onSelectChapter: (id: string) => void;
  isRead: boolean;
  onToggleRead: (id: string) => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  onSelectChapter,
  isRead,
  onToggleRead
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const { prev, next } = getAdjacentChapters(chapter.id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chapter.codeImplementation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  return (
    <article className="chapter-article">
      {/* Chapter Top Header */}
      <header className="chapter-header">
        <div className="chapter-meta-row">
          <span className="chapter-module-badge">{chapter.moduleName}</span>
          <span className="chapter-read-time">{chapter.readTime} read</span>
          <button
            onClick={() => onToggleRead(chapter.id)}
            className={`read-toggle-btn ${isRead ? 'read' : ''}`}
          >
            {isRead ? (
              <>
                <CheckCircle size={15} /> Completed
              </>
            ) : (
              <>
                <Circle size={15} /> Mark as Complete
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
      </header>

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
          <button onClick={handleCopyCode} className="copy-btn">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <div className="code-block-wrapper">
          <div className="code-header">
            <div className="flex items-center gap-2">
              <FileCode size={14} className="text-muted" />
              <span>{chapter.codeImplementation.title}</span>
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
