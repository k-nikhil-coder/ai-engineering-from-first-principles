import React from 'react';
import { EXTERNAL_RESOURCES } from '../data/resources';
import { ExternalLink, BookOpen, Star, Sparkles } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  return (
    <div className="resources-page">
      <div className="resources-hero">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-emerald-400" size={24} />
          <h2>Curated Ecosystem & First-Principles References</h2>
        </div>
        <p className="text-muted text-base max-w-3xl">
          If you appreciate the depth of <code>backend-from-first-principle.vercel.app</code>, these are the authoritative, gold-standard open-source repositories, books, and interactive curricula in the AI Engineering and Applied AI space.
        </p>
      </div>

      <div className="resources-grid">
        {EXTERNAL_RESOURCES.map((res, idx) => (
          <div key={idx} className="resource-card">
            <div className="resource-card-header">
              <span className="resource-badge">{res.badge}</span>
              <div className="resource-links">
                {res.url && (
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="icon-link" title="Visit Website">
                    <ExternalLink size={16} />
                  </a>
                )}
                {res.githubUrl && (
                  <a href={res.githubUrl} target="_blank" rel="noopener noreferrer" className="icon-link" title="GitHub Repo">
                    <Star size={16} />
                  </a>
                )}
              </div>
            </div>

            <h3 className="resource-title">{res.title}</h3>
            <span className="resource-author">by {res.author}</span>
            <p className="resource-desc">{res.description}</p>

            <div className="resource-highlights">
              <strong>Key Highlights:</strong>
              <ul>
                {res.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="resource-best-for">
              <BookOpen size={14} className="text-emerald-400 shrink-0" />
              <span><strong>Best for:</strong> {res.bestFor}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
