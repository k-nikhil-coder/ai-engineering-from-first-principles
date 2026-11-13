# AI Engineering & Applied AI from First Principles 🧠⚡

> Inspired directly by [Backend from First Principles](https://backend-from-first-principle.vercel.app/), this is an open-source, comprehensive 28-chapter engineering reference and interactive curriculum covering the foundation model substrate, context engineering, autonomous agent loops, custom model fine-tuning, automated evals, and production system design.

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

Deploy this exact documentation hub and interactive simulator to Vercel in seconds:

```bash
npx vercel
```

---

## 🗺️ Complete 28-Chapter Curriculum Structure

### Track 1: The Model & Inference Substrate (Chapters 01–06)
- **01: Tokens, Vocabulary & Tokenization Mechanics** — Byte-Pair Encoding (BPE), Unicode handling, token budgets, multilingual inflation tax.
- **02: Embeddings & Vector Space Geometry** — High-dimensional manifolds, Dot Product vs Cosine Similarity vs Euclidean Distance, L2 normalization.
- **03: Transformer Architecture & KV-Cache Lifecycle** — Self-attention matrix math, Scaled Dot-Product, Grouped-Query Attention (GQA), KV-cache VRAM scaling.
- **04: Next-Token Generation & Sampling Mechanics** — Uncalibrated logits, Softmax temperature scaling, Top-p (Nucleus), Top-k, and Min-p sampling.
- **05: Quantization & Model Compression Mechanics** — FP32/FP16/BF16 vs INT8/INT4, AWQ, GPTQ, GGUF, outlier activations, and memory reduction.
- **06: High-Performance Inference Engines & PagedAttention** — Solving KV-cache fragmentation with virtual page tables, Continuous Batching, and Speculative Decoding in vLLM.

### Track 2: Context & Retrieval Engineering (Chapters 07–11)
- **07: Prompt Architecture & Structured Outputs** — Trust boundaries, XML quarantining, Grammar-Constrained Decoding via FSM/CFG logit masking.
- **08: Context Window Dynamics & Compaction** — Attention degradation ("Lost in the Middle"), sliding window vs recursive summarization vs structured state.
- **09: Vector Search & Indexing Internals** — Hierarchical Navigable Small World (HNSW) skip-graphs, IVF Voronoi cells, and Product Quantization (PQ).
- **10: RAG Architecture & Hybrid Retrieval** — BM25 sparse search + Dense vector search, Reciprocal Rank Fusion (RRF), Cross-Encoder re-ranking.
- **11: Caching Strategies: Exact, Semantic & KV-Cache Reuse** — SHA-256 exact caching, vector semantic threshold caching, and provider-level KV prefix reuse.

### Track 3: Agentic Loops & Automations (Chapters 12–16)
- **12: Tool Calling & Function Schemas** — JSON-RPC / JSON Schema function declarations, parameter parsing, execution dispatch, and error reflection.
- **13: The Agent Execution Loop: ReAct, Planning & Reflection** — Reason + Act + Observe loops, intermediate thought reasoning, cycle detection, iteration caps.
- **14: Model Context Protocol (MCP) & Inter-Agent Standards** — Hosts, clients, and servers; tools, resources, and prompt templates over stdio / SSE.
- **15: Deterministic Workflows vs Stochastic Agents** — Hardcoded DAGs vs dynamic while-loops, state machines, LangGraph/Temporal patterns, deterministic routing.
- **16: Resilient Automations & Durable Execution** — Checkpointing, durable state stores, idempotency keys, and Human-in-the-Loop approval gates.

### Track 4: Custom Models & Adaptation (Chapters 17–21)
- **17: When to Prompt, RAG, Fine-Tune, or Pre-Train** — Multi-dimensional decision matrix (cost, latency, domain syntax, live facts, privacy).
- **18: Synthetic Data Generation & Dataset Curation** — Alpaca vs ShareGPT formats, Evol-Instruct, MinHash deduplication, LLM-as-a-judge filtering.
- **19: Supervised Fine-Tuning (SFT) Mechanics** — Masked cross-entropy loss (`ignore_index = -100`), completion-only gradients, learning rate schedules.
- **20: Parameter-Efficient Fine-Tuning: LoRA & QLoRA** — Low-Rank Adaptation math ($W_0 + \frac{\alpha}{r} AB$), 4-bit NormalFloat (NF4), optimizer VRAM elimination.
- **21: Model Alignment: Direct Preference Optimization (DPO)** — Eliminating reward models and PPO; optimizing policy directly on (chosen, rejected) preference pairs.

### Track 5: Production Reliability, Evals & Security (Chapters 22–25)
- **22: Evaluation Systems & Benchmarking** — Programmatic assertions, calibrated LLM-as-a-judge binary rubrics, mitigating position/verbosity bias.
- **23: Observability, Tracing & Cost Engineering** — TTFT, TPS, end-to-end latency, distributed OpenTelemetry trace spans, and per-tenant cost attribution.
- **24: AI Security: Prompt Injections, Jailbreaks & Guardrails** — Direct jailbreaks vs indirect prompt injections, dual-LLM architectures, container sandboxing.
- **25: Fallback Strategies, Model Cascades & Semantic Routing** — Cascading small 8B models to frontier models with deterministic verification, circuit breakers.

### Track 6: End-to-End System Design (Chapters 26–28)
- **26: System Design: Autonomous Customer Support & Workflow Engine** — Multi-stage triage, guarded tool execution, Stripe refunds, and human escalation.
- **27: System Design: Enterprise RAG Knowledge Engine** — Multi-tenant ACL isolation, single-stage HNSW filtering, and verbatim citation grounding.
- **28: System Design: Autonomous Coding & Engineering Agent** — Codebase AST parsing, localized Search-and-Replace edits, and test self-correction loops.

---

## 🛠️ Interactive First-Principles Simulators

Built right into the application:
1. **KV-Cache & GPU VRAM Sizer**: Dynamic memory calculation across 7B/14B/70B models, FP16/INT8/INT4 precisions, context lengths up to 64k, and batch sizes.
2. **LoRA Parameter & VRAM Savings Calculator**: Demonstrates the $W + \frac{\alpha}{r}AB$ decomposition and calculates Adam optimizer VRAM reductions.
3. **Vector Space Geometry Sandbox**: Interactive 3D vector coordinates with live Dot Product, Cosine Similarity, and Euclidean Distance computation.
4. **ReAct Loop Execution Stepper**: Interactive trace showing Thought -> Action -> Host Observation -> Reflection -> Final Answer.

---

## 📚 premier External First-Principles References

1. **[AI Engineering from Scratch](https://aiengineeringfromscratch.com)** (`rohitg00/ai-engineering-from-scratch`) — 20-phase MIT open-source curriculum.
2. **[LLMs from Scratch](https://github.com/rasbt/LLMs-from-scratch)** by Sebastian Raschka — Coding a GPT model from raw PyTorch tensors.
3. **[Patterns for Building LLM Systems](https://eugeneyan.com/writing/llm-patterns/)** by Eugene Yan — Battle-tested applied LLM architecture patterns.
4. **[Creating a LLM-as-a-Judge Evaluation System](https://hamel.dev/blog/posts/evals/)** by Hamel Husain — Gold standard practical evals guide.
5. **[Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)** by Anthropic — Composable agentic workflow patterns.
6. **[minbpe & nanoGPT](https://github.com/karpathy/minbpe)** by Andrej Karpathy — Pure, clean tokenizers and transformer training.
