import React from 'react';
import type { TargetRole } from '../types/curriculum';
import { ALL_CHAPTERS } from '../data/curriculum';
import { Sparkles, Bot, Terminal, Briefcase, Layers } from 'lucide-react';

export interface RoleOption {
  id: TargetRole | 'all';
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'all',
    label: 'All Tracks (36-Chapter Master Curriculum)',
    shortLabel: 'All (36 Chapters)',
    badge: 'Master Track',
    description: 'The complete end-to-end curriculum from token math to multi-agent swarms and full enterprise architectures.',
    icon: <Layers size={15} />
  },
  {
    id: 'ai-engineer',
    label: 'AI Engineer (roadmap.sh/ai-engineer)',
    shortLabel: 'AI Engineer',
    badge: 'Core Track',
    description: 'Foundational models, embeddings, RAG architectures, model adaptation, fine-tuning, and production reliability.',
    icon: <Sparkles size={15} />
  },
  {
    id: 'agent-architect',
    label: 'AI Agents & Architect (roadmap.sh/ai-agents)',
    shortLabel: 'AI Agents',
    badge: 'Agent Track',
    description: 'Tool calling protocols, ReAct execution loops, MCP servers, multi-agent swarms, and sandboxed computer use.',
    icon: <Bot size={15} />
  },
  {
    id: 'harness-engineer',
    label: 'Agentic Coder & Harness Eng (roadmap.sh/claude-code)',
    shortLabel: 'Agentic Coder',
    badge: 'Harness Track',
    description: 'Hierarchical CLAUDE.md rules, AST symbol repo maps, lifecycle hooks, custom skills, and headless CI execution.',
    icon: <Terminal size={15} />
  },
  {
    id: 'fde',
    label: 'Forward Deployed Engineer (roadmap.sh/forward-deployed-engineer)',
    shortLabel: 'FDE Track',
    badge: 'FDE Track',
    description: 'Untangling legacy ERP/SQL schemas, corrupt enterprise PDFs, CDC pipelines, unit economics, and Day-2 governance.',
    icon: <Briefcase size={15} />
  }
];

interface RoleFilterBarProps {
  activeRole: TargetRole | 'all';
  onSelectRole: (role: TargetRole | 'all') => void;
  compact?: boolean;
}

export const RoleFilterBar: React.FC<RoleFilterBarProps> = ({
  activeRole,
  onSelectRole,
  compact = false
}) => {
  const getChapterCount = (roleId: TargetRole | 'all') => {
    if (roleId === 'all') return ALL_CHAPTERS.length;
    return ALL_CHAPTERS.filter(c => c.targetRoles.includes(roleId)).length;
  };

  return (
    <div className={`role-filter-container ${compact ? 'compact' : ''}`}>
      <div className="role-filter-header">
        <span className="role-filter-title">Filter Curriculum by Target Industry Track:</span>
      </div>
      <div className="role-pills-row">
        {ROLE_OPTIONS.map(opt => {
          const isSelected = activeRole === opt.id;
          const count = getChapterCount(opt.id);
          return (
            <button
              key={opt.id}
              className={`role-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectRole(opt.id)}
              title={opt.description}
            >
              <span className="role-pill-icon">{opt.icon}</span>
              <span className="role-pill-label">{compact ? opt.shortLabel : opt.shortLabel}</span>
              <span className="role-pill-count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
