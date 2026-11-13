import React, { useState, useEffect, useRef } from 'react';
import { ALL_CHAPTERS } from '../data/curriculum';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = ALL_CHAPTERS.filter(ch => {
    const q = query.toLowerCase();
    const matchesBasic = (
      ch.number.includes(q) ||
      ch.title.toLowerCase().includes(q) ||
      ch.moduleName.toLowerCase().includes(q) ||
      ch.problemStatement.toLowerCase().includes(q) ||
      ch.motto.toLowerCase().includes(q)
    );
    if (matchesBasic) return true;

    const matchesRole = ch.targetRoles?.some(r => r.toLowerCase().includes(q));
    if (matchesRole) return true;

    const matchesLecture = ch.lectures?.some(l => 
      l.title.toLowerCase().includes(q) || l.speaker.toLowerCase().includes(q)
    );
    if (matchesLecture) return true;

    const matchesLab = ch.labs && (
      ch.labs.problemA.title.toLowerCase().includes(q) ||
      ch.labs.problemA.problemStatement.toLowerCase().includes(q) ||
      ch.labs.problemB.title.toLowerCase().includes(q) ||
      ch.labs.problemB.problemStatement.toLowerCase().includes(q)
    );
    return Boolean(matchesLab);
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-bar">
          <Search size={18} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chapters, concepts, KV-Cache, LoRA, MCP, RAG..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="search-results-list">
          {filtered.length === 0 ? (
            <div className="search-empty">
              No chapters found matching "{query}"
            </div>
          ) : (
            filtered.map(ch => (
              <div
                key={ch.id}
                className="search-item"
                onClick={() => {
                  onSelectChapter(ch.id);
                  onClose();
                }}
              >
                <div className="search-item-info">
                  <div className="search-item-meta">
                    <span className="search-item-num">Chapter {ch.number}</span>
                    <span className="search-item-mod">{ch.moduleName}</span>
                  </div>
                  <h4 className="search-item-title">{ch.title}</h4>
                  <p className="search-item-motto">"{ch.motto}"</p>
                </div>
                <ArrowRight size={16} className="search-arrow" />
              </div>
            ))
          )}
        </div>

        <div className="search-modal-footer">
          <span>Navigate with mouse or Esc to close</span>
          <span>{filtered.length} chapters found</span>
        </div>
      </div>
    </div>
  );
};
