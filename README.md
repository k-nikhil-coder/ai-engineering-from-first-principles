# AI Engineering & Applied AI from First Principles 🧠⚡

> Inspired directly by [Backend from First Principles](https://backend-from-first-principle.vercel.app/), this is an open-source, comprehensive **36-chapter interactive engineering curriculum and production platform** that unifies theoretical first principles with the 4 core industry tracks:
> 1. **AI Engineer** (`roadmap.sh/ai-engineer`)
> 2. **AI Agents & Architect** (`roadmap.sh/ai-agents`)
> 3. **Agentic Coding & Harness Engineering** (`roadmap.sh/claude-code`)
> 4. **Forward Deployed Engineer (FDE)** (`roadmap.sh/forward-deployed-engineer`)

---

## 🎯 The 4-Tab Chapter Learning Loop

Every chapter in the platform is structured into an active **"Learn + Watch + Solve + Build"** loop:

1. **📖 First Principles (Read)**: Deep-dive theory, mathematical formulations ($O(N^2)$ attention, $RRF = \sum \frac{1}{k + r}$, LoRA low-rank decomposition), ASCII architectural diagrams, pure runnable Python implementations, production pitfalls, key takeaways, and interactive self-assessment checkpoints.
2. **🎥 Curated Lectures (Watch)**: Verified first-principles talks from seminal practitioners (Andrej Karpathy, Anthropic engineering leads, Hamel Husain) with timestamped architectural takeaways and direct playback links.
3. **⚡ Interactive Simulator (Explore)**: 7 mathematical sandboxes dynamically connected to each chapter's concepts to experiment with parameters, token limits, and memory limits in real time.
4. **💻 Problems & Build Labs (Solve)**: 72 concrete challenges (2 per chapter):
   - **Problem A (Algorithmic / DSA Core for AI)**: Pure algorithmic challenge with starter templates, guarantees, and test cases (e.g., BPE Merge Priority Queue, Radix-Tree Prefix Cache, Token-Window Deque Compactor, RRF Harmonic Merger, Paired Bootstrap Evaluator).
   - **Problem B (Production Systems Debugging Lab)**: Realistic broken production incident (e.g., streaming tool-call race conditions, vector ACL data leaks, infinite ReAct loops, prompt injections, and corrupt enterprise PDF extraction) with root-cause analysis and hardened fixes.

---

## 🚀 Live Local Development

```bash
# Install dependencies
npm install

# Start local interactive server (Vite + React)
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 📦 One-Click Vercel Deployment

Deploy this documentation hub and interactive simulator to Vercel in seconds:

```bash
npx vercel
```

---

## 🗺️ Complete 36-Chapter Curriculum (8 Tracks)

### Track 1: The Model & Inference Substrate (Chapters 01–06)
- **01: Tokens, Vocabulary & Tokenization Mechanics** — Byte-Pair Encoding (BPE), Unicode byte offsets, token budgets, multilingual inflation tax.
- **02: Embeddings & Vector Space Geometry** — High-dimensional manifolds, Dot Product vs Cosine Similarity vs Euclidean Distance, L2 normalization.
- **03: Transformer Architecture & KV-Cache Lifecycle** — Self-attention matrix math, Scaled Dot-Product, Grouped-Query Attention (GQA), KV-cache VRAM scaling.
- **04: Next-Token Generation & Sampling Mechanics** — Uncalibrated logits, Softmax temperature scaling, Top-p (Nucleus), Top-k, and Min-p sampling.
- **05: Quantization & Model Compression Mechanics** — FP32/FP16/BF16 vs INT8/INT4, AWQ, GPTQ, GGUF, outlier activations, and memory reduction.
- **06: High-Performance Inference Engines & PagedAttention** — Solving KV-cache fragmentation with virtual page tables, Continuous Batching, and Speculative Decoding in vLLM.

### Track 2: Context, Memory & Multimodal Retrieval (Chapters 07–13)
- **07: Prompt Architecture & Structured Outputs** — Trust boundaries, XML quarantining, Grammar-Constrained Decoding via FSM/CFG logit masking.
- **08: Context Window Dynamics & Compaction** — Attention degradation ("Lost in the Middle"), sliding window vs recursive summarization vs structured state.
- **09: Vector Search & Indexing Internals** — Hierarchical Navigable Small World (HNSW) skip-graphs, IVF Voronoi cells, and Product Quantization (PQ).
- **10: RAG Architecture & Hybrid Retrieval** — BM25 sparse search + Dense vector search, Reciprocal Rank Fusion (RRF), Cross-Encoder re-ranking.
- **11: Caching Strategies: Exact, Semantic & KV-Cache Reuse** — SHA-256 exact caching, vector semantic threshold caching, and provider-level KV prefix reuse.
- **12: Multimodal AI & Cross-Modal Pipelines** — Vision-language patch token projection, audio/speech streaming, OCR vs native vision PDF parsing, and cross-modal embeddings.
- **13: Context Warehousing & Agent Memory Systems** — Short-term working context vs Long-term memory (Episodic, Semantic, Procedural), entity extraction, and memory decay/aging policies.

### Track 3: Agentic Loops, Sandboxes & Multi-Agent Systems (Chapters 14–20)
- **14: Tool Calling & Function Schemas** — JSON-RPC / JSON Schema function declarations, parameter parsing, execution dispatch, and error reflection.
- **15: The Agent Execution Loop: ReAct, Planning & Reflection** — Reason + Act + Observe loops, intermediate thought reasoning, cycle detection, iteration caps.
- **16: Model Context Protocol (MCP) & Inter-Agent Standards** — Hosts, clients, and servers; tools, resources, and prompt templates over stdio / SSE.
- **17: Deterministic Workflows vs Stochastic Agents** — Hardcoded DAGs vs dynamic while-loops, state machines, LangGraph/Temporal patterns, deterministic routing.
- **18: Resilient Automations & Durable Execution** — Checkpointing, durable state stores, idempotency keys, and Human-in-the-Loop approval gates.
- **19: Multi-Agent Orchestration & Handoffs** — Supervisor vs Swarm topologies, Planner-Executor DAGs, context isolation across sub-agents, and handoff state schemas.
- **20: Code Execution Sandboxes & Computer Use** — MicroVM isolation (Docker/E2B/gVisor), headless browser automation (Playwright/CDP), filesystem boundaries, and timeout recovery.

### Track 4: Custom Models & Adaptation (Chapters 21–25)
- **21: When to Prompt, RAG, Fine-Tune, or Pre-Train** — Multi-dimensional decision matrix (cost, latency, domain syntax, live facts, privacy).
- **22: Synthetic Data Generation & Dataset Curation** — Alpaca vs ShareGPT formats, Evol-Instruct, MinHash deduplication, LLM-as-a-judge filtering.
- **23: Supervised Fine-Tuning (SFT) Mechanics** — Masked cross-entropy loss (`ignore_index = -100`), completion-only gradients, learning rate schedules.
- **24: Parameter-Efficient Fine-Tuning: LoRA & QLoRA** — Low-Rank Adaptation math ($W_0 + \frac{\alpha}{r} AB$), 4-bit NormalFloat (NF4), optimizer VRAM elimination.
- **25: Model Alignment: Direct Preference Optimization (DPO)** — Eliminating reward models and PPO; optimizing policy directly on (chosen, rejected) preference pairs.

### Track 5: Production Reliability, Evals & Security (Chapters 26–29)
- **26: Evaluation Systems & Benchmarking** — Programmatic assertions, calibrated LLM-as-a-judge binary rubrics, mitigating position/verbosity bias.
- **27: Observability, Tracing & Cost Engineering** — TTFT, TPS, end-to-end latency, distributed OpenTelemetry trace spans, and per-tenant cost attribution.
- **28: AI Security: Prompt Injections, Jailbreaks & Guardrails** — Direct jailbreaks vs indirect prompt injections, dual-LLM architectures, container sandboxing.
- **29: Fallback Strategies, Model Cascades & Semantic Routing** — Cascading small 8B models to frontier models with deterministic verification, circuit breakers.

### Track 6: Agentic Coding & Harness Engineering (Chapters 30–31)
- **30: Repository Context, CLAUDE.md & AST Indexing** — Designing hierarchical agent rules (`CLAUDE.md`), Tree-sitter repo maps, `/compact` vs `/clear` context lifecycle, and Git worktree isolation for parallel sub-agents.
- **31: Lifecycle Hooks, Custom Skills & Headless CI/CD** — Deterministic hooks (`PreToolUse`, `PostToolUse`, `Stop`), reusable skill markdown files, non-interactive CLI execution (`claude -p`), and automated PR review pipelines.

### Track 7: Forward Deployed Engineering (FDE) & Last-Mile Delivery (Chapters 32–33)
- **32: Enterprise Data Audits & Legacy Schema Untangling** — Auditing messy customer SQL/ERP schemas, CDC ingestion pipelines, handling corrupt enterprise PDFs, and data quality gates.
- **33: Scoping, Unit Economics & Day-2 Governance** — PoC-to-production scoping, token/compute ROI modeling, PII redaction, multi-tenant RBAC/ACL propagation, and drift monitoring.

### Track 8: End-to-End System Design (Chapters 34–36)
- **34: System Design: Autonomous Customer Support & Workflow Engine** — Multi-stage triage, guarded tool execution, Stripe refunds, and human escalation.
- **35: System Design: Enterprise RAG Knowledge Engine** — Multi-tenant ACL isolation, single-stage HNSW filtering, and verbatim citation grounding.
- **36: System Design: Autonomous Coding & Engineering Agent** — Codebase AST parsing, localized Search-and-Replace edits, and test self-correction loops.

---

## 🛠️ 7 Interactive First-Principles Simulators

1. **KV-Cache & GPU VRAM Sizer**: Dynamic memory calculation across 7B/14B/70B models, FP16/INT8/INT4 precisions, context lengths up to 64k, and batch sizes.
2. **LoRA Parameter & VRAM Savings Calculator**: Demonstrates the $W_0 + \frac{\alpha}{r}AB$ decomposition and calculates Adam optimizer VRAM reductions.
3. **Vector Space Geometry Sandbox**: Interactive 3D vector coordinates with live Dot Product, Cosine Similarity, and Euclidean Distance computation.
4. **ReAct Loop Execution Stepper**: Interactive trace showing Thought -> Action -> Host Observation -> Reflection -> Final Answer.
5. **Hybrid RAG & RRF Fusion Visualizer**: Interactive slider comparing BM25 rank + Dense Vector rank to compute Reciprocal Rank Fusion ($RRF = \sum \frac{w_i}{k + rank_i}$).
6. **Context Window & Compaction Inspector**: Visual token bar showing System Prompt, Pinned Memory, Tool Outputs, Sliding Window eviction, and KV-Cache prefix hit ratio.
7. **FDE Unit Economics & Cascade Calculator**: Inputs for DAU, queries/user, prompt/completion tokens, cache hit %, and 8B-to-Frontier model cascade routing to calculate monthly cost and P99 latency.

---

## 🧭 Role-Based Filtering & Multi-Metric Progress Tracking

- **Track Filter Pills**: Instantly toggle curriculum views between **All (36 Chapters)**, **AI Engineer**, **AI Agents**, **Agentic Coder**, and **Forward Deployed Engineer**.
- **Multi-Metric Persistence**: All progress (Chapters Read, Lectures Watched, and Labs Solved) is saved automatically in `localStorage`, showing granular progress bars per track.

---

## 📚 premier External First-Principles References

1. **[AI Engineering from Scratch](https://aiengineeringfromscratch.com)** (`rohitg00/ai-engineering-from-scratch`) — 20-phase MIT open-source curriculum.
2. **[LLMs from Scratch](https://github.com/rasbt/LLMs-from-scratch)** by Sebastian Raschka — Coding a GPT model from raw PyTorch tensors.
3. **[Patterns for Building LLM Systems](https://eugeneyan.com/writing/llm-patterns/)** by Eugene Yan — Battle-tested applied LLM architecture patterns.
4. **[Creating a LLM-as-a-Judge Evaluation System](https://hamel.dev/blog/posts/evals/)** by Hamel Husain — Gold standard practical evals guide.
5. **[Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)** by Anthropic — Composable agentic workflow patterns.
6. **[minbpe & nanoGPT](https://github.com/karpathy/minbpe)** by Andrej Karpathy — Pure, clean tokenizers and transformer training.
