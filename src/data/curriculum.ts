import type { Chapter, Module, TargetRole } from '../types/curriculum';
import { MODULE_1_CHAPTERS } from './chapters/module1';
import { MODULE_2_CHAPTERS } from './chapters/module2';
import { MODULE_3_CHAPTERS } from './chapters/module3';
import { MODULE_4_CHAPTERS } from './chapters/module4';
import { MODULE_5_CHAPTERS } from './chapters/module5';
import { MODULE_6_CHAPTERS } from './chapters/module6';
import { MODULE_7_CHAPTERS } from './chapters/module7';
import { MODULE_8_CHAPTERS } from './chapters/module8';

export const MODULES: Module[] = [
  {
    id: "substrate",
    trackNumber: 1,
    numberRange: "01–06",
    title: "The Model & Inference Substrate",
    description: "From Unicode bytes and tokenization to attention mathematics, KV-cache lifecycle, quantization, and vLLM continuous batching.",
    icon: "Cpu",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer'],
    chapterIds: MODULE_1_CHAPTERS.map(c => c.id)
  },
  {
    id: "context",
    trackNumber: 2,
    numberRange: "07–13",
    title: "Context, Memory & Multimodal Retrieval",
    description: "Grammar-constrained structured outputs, context window dynamics, HNSW vector search, hybrid RAG, multimodal pipelines, and episodic/semantic agent memory warehousing.",
    icon: "Database",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer', 'fde'],
    chapterIds: MODULE_2_CHAPTERS.map(c => c.id)
  },
  {
    id: "agents",
    trackNumber: 3,
    numberRange: "14–20",
    title: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    description: "Tool calling protocols, ReAct execution loops, Model Context Protocol (MCP), durable state, multi-agent swarms, and microVM computer-use sandboxes.",
    icon: "Bot",
    targetRoles: ['agent-architect', 'ai-engineer', 'harness-engineer'],
    chapterIds: MODULE_3_CHAPTERS.map(c => c.id)
  },
  {
    id: "custom-models",
    trackNumber: 4,
    numberRange: "21–25",
    title: "Custom Models & Adaptation",
    description: "Decision matrix for RAG vs fine-tuning, synthetic data curation, supervised fine-tuning (SFT), LoRA/QLoRA mathematics, and DPO alignment.",
    icon: "Sparkles",
    targetRoles: ['ai-engineer', 'agent-architect', 'fde'],
    chapterIds: MODULE_4_CHAPTERS.map(c => c.id)
  },
  {
    id: "reliability",
    trackNumber: 5,
    numberRange: "26–29",
    title: "Production Reliability, Evals & Security",
    description: "Automated eval systems & LLM-as-a-judge, OpenTelemetry tracing & cost attribution, prompt injection defenses, and model cascades.",
    icon: "ShieldCheck",
    targetRoles: ['ai-engineer', 'agent-architect', 'fde'],
    chapterIds: MODULE_5_CHAPTERS.map(c => c.id)
  },
  {
    id: "harness",
    trackNumber: 6,
    numberRange: "30–31",
    title: "Agentic Coding & Harness Engineering",
    description: "Repository context architecture, hierarchical CLAUDE.md rules, Tree-sitter AST symbol maps, lifecycle hooks, custom skills, and headless CI/CD execution.",
    icon: "Terminal",
    targetRoles: ['harness-engineer', 'agent-architect', 'ai-engineer'],
    chapterIds: MODULE_6_CHAPTERS.map(c => c.id)
  },
  {
    id: "fde",
    trackNumber: 7,
    numberRange: "32–33",
    title: "Forward Deployed Engineering (FDE) & Last-Mile Delivery",
    description: "Auditing corrupt enterprise PDFs and legacy ERP schemas, CDC vector ingestion, unit economics ROI modeling, PII masking, and Day-2 governance.",
    icon: "Briefcase",
    targetRoles: ['fde', 'agent-architect', 'ai-engineer'],
    chapterIds: MODULE_7_CHAPTERS.map(c => c.id)
  },
  {
    id: "system-design",
    trackNumber: 8,
    numberRange: "34–36",
    title: "End-to-End System Design",
    description: "Architectural blueprints for enterprise support engines, secure multi-tenant RAG, and autonomous self-correcting coding agents.",
    icon: "Layers",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer', 'fde'],
    chapterIds: MODULE_8_CHAPTERS.map(c => c.id)
  }
];

export const ALL_CHAPTERS: Chapter[] = [
  ...MODULE_1_CHAPTERS,
  ...MODULE_2_CHAPTERS,
  ...MODULE_3_CHAPTERS,
  ...MODULE_4_CHAPTERS,
  ...MODULE_5_CHAPTERS,
  ...MODULE_6_CHAPTERS,
  ...MODULE_7_CHAPTERS,
  ...MODULE_8_CHAPTERS
];

export function getChapterById(id: string): Chapter | undefined {
  return ALL_CHAPTERS.find(c => c.id === id);
}

export function getAdjacentChapters(currentId: string, roleFilter?: TargetRole | 'all'): { prev?: Chapter; next?: Chapter } {
  const chapters = roleFilter && roleFilter !== 'all' 
    ? ALL_CHAPTERS.filter(c => c.targetRoles.includes(roleFilter))
    : ALL_CHAPTERS;
    
  const index = chapters.findIndex(c => c.id === currentId);
  if (index === -1) return {};
  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined
  };
}

export function filterChaptersByRole(role: TargetRole | 'all'): Chapter[] {
  if (role === 'all') return ALL_CHAPTERS;
  return ALL_CHAPTERS.filter(c => c.targetRoles.includes(role));
}
