import type { Chapter, Module } from '../types/curriculum';
import { MODULE_1_CHAPTERS } from './chapters/module1';
import { MODULE_2_CHAPTERS } from './chapters/module2';
import { MODULE_3_CHAPTERS } from './chapters/module3';
import { MODULE_4_CHAPTERS } from './chapters/module4';
import { MODULE_5_CHAPTERS } from './chapters/module5';
import { MODULE_6_CHAPTERS } from './chapters/module6';

export const MODULES: Module[] = [
  {
    id: "substrate",
    numberRange: "01–06",
    title: "The Model & Inference Substrate",
    description: "From Unicode bytes and tokenization to attention mathematics, KV-cache lifecycle, quantization, and vLLM continuous batching.",
    icon: "Cpu",
    chapterIds: MODULE_1_CHAPTERS.map(c => c.id)
  },
  {
    id: "context",
    numberRange: "07–11",
    title: "Context & Retrieval Engineering",
    description: "Grammar-constrained structured outputs, context window dynamics, HNSW vector search, hybrid RAG, and multi-tier semantic caching.",
    icon: "Database",
    chapterIds: MODULE_2_CHAPTERS.map(c => c.id)
  },
  {
    id: "agents",
    numberRange: "12–16",
    title: "Agentic Loops & Automations",
    description: "Tool calling protocols, ReAct execution loops, Model Context Protocol (MCP), deterministic DAGs vs stochastic agents, and durable execution.",
    icon: "Bot",
    chapterIds: MODULE_3_CHAPTERS.map(c => c.id)
  },
  {
    id: "custom-models",
    numberRange: "17–21",
    title: "Custom Models & Adaptation",
    description: "Decision matrix for RAG vs fine-tuning, synthetic data curation, supervised fine-tuning (SFT), LoRA/QLoRA mathematics, and DPO alignment.",
    icon: "Sparkles",
    chapterIds: MODULE_4_CHAPTERS.map(c => c.id)
  },
  {
    id: "reliability",
    numberRange: "22–25",
    title: "Production Reliability, Evals & Security",
    description: "Automated eval systems & LLM-as-a-judge, OpenTelemetry tracing & cost attribution, prompt injection defenses, and model cascades.",
    icon: "ShieldCheck",
    chapterIds: MODULE_5_CHAPTERS.map(c => c.id)
  },
  {
    id: "system-design",
    numberRange: "26–28",
    title: "End-to-End System Design",
    description: "Architectural blueprints for enterprise support engines, secure multi-tenant RAG, and autonomous self-correcting coding agents.",
    icon: "Layers",
    chapterIds: MODULE_6_CHAPTERS.map(c => c.id)
  }
];

export const ALL_CHAPTERS: Chapter[] = [
  ...MODULE_1_CHAPTERS,
  ...MODULE_2_CHAPTERS,
  ...MODULE_3_CHAPTERS,
  ...MODULE_4_CHAPTERS,
  ...MODULE_5_CHAPTERS,
  ...MODULE_6_CHAPTERS
];

export function getChapterById(id: string): Chapter | undefined {
  return ALL_CHAPTERS.find(c => c.id === id);
}

export function getAdjacentChapters(currentId: string): { prev?: Chapter; next?: Chapter } {
  const index = ALL_CHAPTERS.findIndex(c => c.id === currentId);
  if (index === -1) return {};
  return {
    prev: index > 0 ? ALL_CHAPTERS[index - 1] : undefined,
    next: index < ALL_CHAPTERS.length - 1 ? ALL_CHAPTERS[index + 1] : undefined
  };
}
