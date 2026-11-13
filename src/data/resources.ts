import type { ExternalResource } from '../types/curriculum';

export const EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    title: "AI Engineering from Scratch",
    author: "Rohit Ghumare (@rohitg00)",
    url: "https://aiengineeringfromscratch.com",
    githubUrl: "https://github.com/rohitg00/ai-engineering-from-scratch",
    badge: "Most Direct Equivalent",
    description: "An open-source (MIT licensed) 20-phase curriculum spanning over 500+ lessons. It follows a strict first-principles philosophy: every model, tokenizer, embedding index, and agent loop is first derived from raw mathematics and built with standard Python before touching frameworks.",
    highlights: [
      "20 structured phases from Math/Linear Algebra to Multi-Agent Swarms and Serving",
      "Standard 6-step loop for every lesson: Motto, Problem, Concept, Build Raw, Use Production, Ship Artifact",
      "Native agent skill integration (can be plugged directly into Claude Code / Codex / Antigravity as a tutor)"
    ],
    bestFor: "Engineers wanting a ground-up 0-to-100 full stack syllabus with runnable code in multiple languages."
  },
  {
    title: "Build a Large Language Model (From Scratch)",
    author: "Sebastian Raschka (@rasbt)",
    url: "https://www.manning.com/books/build-a-large-language-model-from-scratch",
    githubUrl: "https://github.com/rasbt/LLMs-from-scratch",
    badge: "Gold Standard for Transformers",
    description: "The definitive guide to understanding GPT-style foundation models. You implement the tokenizer, multi-head attention, multi-layer perceptron, residual connections, pre-training loss, instruction fine-tuning, LoRA, and DPO in pure PyTorch.",
    highlights: [
      "Zero high-level abstraction: no HuggingFace Transformers, just PyTorch tensors",
      "Step-by-step tensor dimension tracking for every single layer",
      "Complete implementation of instruction tuning and Direct Preference Optimization (DPO)"
    ],
    bestFor: "Mastering the mathematics and tensor mechanics behind the transformer architecture and weights."
  },
  {
    title: "Patterns for Building LLM Systems",
    author: "Eugene Yan",
    url: "https://eugeneyan.com/writing/llm-patterns/",
    badge: "Applied AI Architecture",
    description: "A battle-tested reference guide detailing real-world patterns across 7 core dimensions: Evals, Retrieval/RAG, Fine-tuning, Caching, Guardrails, Defensive UX, and Human-in-the-Loop systems.",
    highlights: [
      "Clear trade-off matrix: when to prompt vs when to fine-tune vs when to RAG",
      "Practical production wisdom from real deployments at scale",
      "Defensive architecture patterns for handling non-deterministic LLM outputs"
    ],
    bestFor: "System architects designing reliable, high-uptime applied AI backends and enterprise pipelines."
  },
  {
    title: "Creating a LLM-as-a-Judge Evaluation System",
    author: "Hamel Husain",
    url: "https://hamel.dev/blog/posts/evals/",
    badge: "Definitive Guide to Evals",
    description: "A rigorous, uncompromising masterclass on how to actually evaluate LLM systems in production. Dismantles naive benchmark metrics and teaches how to build calibrated, reproducible domain-specific eval suites.",
    highlights: [
      "Error analysis workflows: looking at raw logs instead of aggregate vanity scores",
      "How to align LLM judges with human expert consensus",
      "Synthetic data generation and iterative prompt calibration"
    ],
    bestFor: "Engineers needing to prove whether a prompt or model change actually improved system performance."
  },
  {
    title: "Building Effective Agents",
    author: "Anthropic Research",
    url: "https://www.anthropic.com/research/building-effective-agents",
    badge: "Agentic Loop Design",
    description: "A seminal, pragmatic architectural guide from Anthropic advocating for simple, composable agentic patterns rather than over-engineered, opaque frameworks.",
    highlights: [
      "Breakdowns of Augmented LLMs, Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, and Evaluator-Optimizer",
      "When simple deterministic workflows beat autonomous stochastic agent loops",
      "Standard error handling, latency optimization, and tool execution boundaries"
    ],
    bestFor: "Anyone building agentic automations, code assistants, or multi-step reasoning workflows."
  },
  {
    title: "AI Engineering: Building Applications with Foundation Models",
    author: "Chip Huyen",
    url: "https://www.oreilly.com/library/view/ai-engineering/9781098166298/",
    badge: "Industry Textbook",
    description: "Comprehensive foundational textbook covering the entire lifecycle of AI engineering: model selection, context construction, retrieval, fine-tuning, latency optimization, continuous evaluation, and governance.",
    highlights: [
      "Deep dive into cost-vs-latency curves for enterprise AI systems",
      "Evaluation methodologies and benchmark curation",
      "Inference acceleration and deployment patterns"
    ],
    bestFor: "Comprehensive conceptual foundation and enterprise system design."
  },
  {
    title: "Neural Networks: Zero to Hero & minbpe",
    author: "Andrej Karpathy",
    url: "https://github.com/karpathy/minbpe",
    githubUrl: "https://github.com/karpathy/nanoGPT",
    badge: "First-Principles Legend",
    description: "The gold standard video lecture and code series from Andrej Karpathy. Builds micrograd (scalar backprop autograd engine), makemore, and nanoGPT from first principles in clean, readable Python.",
    highlights: [
      "minbpe: minimal, clean byte-pair encoding tokenizer matching OpenAI's tiktoken",
      "nanoGPT: the simplest, fastest repository for training/fine-tuning medium-sized GPTs",
      "Crystal clear explanations of gradient descent and matrix multiplication"
    ],
    bestFor: "Gaining rock-solid mathematical intuition for backpropagation and transformer training."
  }
];
