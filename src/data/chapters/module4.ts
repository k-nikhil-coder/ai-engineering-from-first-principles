import type { Chapter } from '../../types/curriculum';

export const MODULE_4_CHAPTERS: Chapter[] = [
  {
    id: "21-when-to-prompt-rag-finetune",
    number: "21",
    title: "When to Prompt, RAG, Fine-Tune, or Pre-Train",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    trackNumber: 4,
    readTime: "16 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'fde'],
    motto: "Prompting teaches task format; RAG provides dynamic facts; Fine-tuning internalizes style, domain syntax, and latency efficiency.",
    problemStatement: "Engineering teams waste months and hundreds of thousands of dollars attempting to fine-tune open-source models with new domain knowledge, only for the model to hallucinate or suffer catastrophic forgetting. Knowing the exact boundary between Prompting, RAG, and Fine-Tuning is the quintessential AI Engineer decision.",
    coreConcepts: [
      {
        title: "The Multi-Dimensional Decision Matrix",
        summary: "Evaluating the four pillars of model adaptation against real-world constraints.",
        content: [
          "Prompt Engineering: Best for rapid prototyping, general knowledge, standard formatting, and zero infrastructure overhead. Limitations: Token cost scales with every request, context window limits, lack of proprietary style.",
          "Retrieval-Augmented Generation (RAG): Best for dynamic, rapidly updating knowledge, private enterprise documents, and verifiable citation requirements. Limitations: Retrieval latency, chunk boundary issues, complexity of indexing pipelines.",
          "Supervised Fine-Tuning (SFT / LoRA): Best for teaching specialized syntax (e.g. proprietary code DSLs, SQL schemas), enforcing strict tone/style, reducing prompt token overhead by 80%, and replacing expensive frontier models with fast, cheap 8B models. Limitations: Poor at memorizing fast-changing facts, risks catastrophic forgetting.",
          "Continued Pre-Training: Best only when introducing a completely novel language, alphabet, or massive specialized domain corpus (e.g. 50 billion tokens of legal statutes or genomic sequences)."
        ]
      },
      {
        title: "The Complementary Flywheel (RAG + Fine-Tuning)",
        summary: "Production systems rarely choose between RAG or Fine-Tuning; they combine both.",
        content: [
          "Fine-tune an 8B model to master the exact reasoning patterns, tool-calling syntax, and response structure of your product.",
          "Use RAG to inject the live, up-to-the-second customer data and enterprise documents into that fine-tuned model's context."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Adaptation Strategy Evaluator (Decision Engine)",
      description: "A programmatic scoring engine mapping engineering requirements to the optimal AI adaptation architecture.",
      code: `def recommend_ai_strategy(reqs):
    recommendations = []
    if reqs.get("verifiable_citations_required"):
        recommendations.append("MANDATORY: RAG for grounded citations.")
    if reqs.get("knowledge_type") == "dynamic_fast_changing":
        recommendations.append("USE: RAG. Do not fine-tune for fast-changing facts.")
    if reqs.get("knowledge_type") == "static_syntax_style" and reqs.get("cost_sensitivity") == "high":
        recommendations.append("USE: LoRA Fine-Tuning on 8B SLM to cut prompt overhead.")
    return recommendations or ["USE: Prompting with Frontier API."]`
    },
    productionPitfalls: [
      "Attempting to 'teach' an LLM new product facts via fine-tuning instead of RAG; models hallucinate facts but learn styles easily.",
      "Fine-tuning before establishing an automated evaluation benchmark to measure if the new model is actually better.",
      "Ignoring the operational cost of self-hosting fine-tuned models compared to managed APIs."
    ],
    keyTakeaways: [
      "Use Prompting to prove product-market fit.",
      "Use RAG to provide live facts and eliminate hallucinations with citations.",
      "Use Fine-Tuning to compress prompt token overhead, standardize output syntax, and cut serving costs."
    ],
    quiz: [
      {
        question: "Why is fine-tuning generally the wrong strategy for teaching an LLM rapidly changing company policies or live catalog inventory?",
        options: [
          "Fine-tuning does not guarantee factual recall, suffers catastrophic forgetting, and requires expensive retraining for every data update",
          "Fine-tuning can only be performed once per model",
          "Fine-tuned models cannot read English",
          "Fine-tuning requires quantum computers"
        ],
        correctIndex: 0,
        explanation: "Neural network weights represent probabilistic representations, not relational databases. Fine-tuning to memorize facts leads to hallucinations and cannot keep up with real-time updates; RAG is designed specifically for this."
      }
    ],
    simulatorType: 'fde-economics',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Multi-Attribute Adaptation Strategy Scorer",
        subtitle: "Core DSA: Multi-Criteria Weighted Decision Matrix",
        problemStatement: "Implement `score_adaptation_path(weights: dict[str, float], criteria: dict[str, float]) -> str` which scores options: `['PROMPT', 'RAG', 'FINE_TUNE', 'PRE_TRAIN']` based on normalized weights across cost, latency, dynamic factual requirement, and syntax consistency.",
        starterCode: `def score_adaptation_path(weights: dict[str, float], criteria: dict[str, float]) -> str:
    # TODO: Calculate weighted scores
    pass`,
        solutionCode: `def score_adaptation_path(weights: dict[str, float], criteria: dict[str, float]) -> str:
    # Rule overrides:
    if criteria.get("dynamic_facts", 0) > 0.8:
        return "RAG"
    if criteria.get("unique_alphabet_pretraining", 0) > 0.8:
        return "PRE_TRAIN"
    if criteria.get("strict_syntax_latency", 0) > 0.7:
        return "FINE_TUNE"
    return "PROMPT"`,
        testCases: [
          {
            input: '{"dynamic_facts": 0.95}',
            expectedOutput: '"RAG"',
            explanation: "Dynamic facts override fine-tuning and pre-training."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Catastrophic Forgetting Outage",
        subtitle: "Production Systems Bug: Fine-tuning on 10,000 legal contracts destroys general coding ability",
        problemStatement: "A company fine-tuned LLaMA-3-8B on legal contracts. While legal terminology improved, the model lost basic arithmetic and Python formatting abilities. Fix the training mix using rehearsal replay buffers (adding 10-20% general instruction data).",
        starterCode: `# Buggy pure-domain dataset:
# dataset = legal_contracts_only`,
        solutionCode: `# Fix: Rehearsal Buffer Mixing
def mix_fine_tuning_dataset(domain_dataset, general_dataset, general_ratio=0.15):
    # Interleave 15% general instruct data (OpenHermes / SlimOrca)
    # to preserve base model cognitive reasoning and prevent catastrophic forgetting:
    num_general = int(len(domain_dataset) * (general_ratio / (1 - general_ratio)))
    return domain_dataset + general_dataset[:num_general]`,
        testCases: [
          {
            input: 'Domain dataset mixed with 15% general instruct replay',
            expectedOutput: 'Domain task performance maintained while GSM8K and HumanEval scores drop < 2%.',
            explanation: "Replay buffers stabilize weights in early transformer layers."
          }
        ]
      }
    }
  },
  {
    id: "22-dataset-curation-synthetic-data",
    number: "22",
    title: "Synthetic Data Generation & Dataset Curation",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    trackNumber: 4,
    readTime: "19 min",
    targetRoles: ['ai-engineer', 'agent-architect'],
    motto: "In modern AI engineering, quality trumps quantity: 1,000 pristine instruction pairs outperform 100,000 noisy scraped samples.",
    problemStatement: "The phrase 'Garbage In, Garbage Out' is amplified by machine learning. Naively fine-tuning on dirty, uncurated data degrades base model reasoning, causes repetitive loops, and teaches sycophancy. Mastering synthetic data curation with frontier teacher models and algorithmic filtering is the primary differentiator of elite AI engineers.",
    coreConcepts: [
      {
        title: "Instruction Dataset Schemas (Alpaca vs. ShareGPT vs. ChatML)",
        summary: "Standardizing prompt-completion data structures for supervised fine-tuning.",
        content: [
          "Alpaca Format: Simple flat triplet: `{instruction, input, output}`. Suitable for single-turn extraction or task completion.",
          "ShareGPT / OpenAI Chat Format: Multi-turn conversational list: `[{role: 'user', content: ...}, {role: 'assistant', content: ...}]`. Essential for training agent loops and dialogue systems.",
          "ChatML Delimiters: Special tokens used by base models during tokenization (e.g. `<|im_start|>system\\n...<|im_end|>`)."
        ]
      },
      {
        title: "Synthetic Data Curation & Filtering Pipeline",
        summary: "Using frontier models as teachers to bootstrap datasets for smaller student models.",
        content: [
          "Evolutionary Prompting (Evol-Instruct): Start with basic seed prompts; ask teacher LLM to increase reasoning depth, add constraints, or introduce edge cases.",
          "Deduplication (MinHash LSH): Remove duplicate or near-duplicate examples to prevent overfitting.",
          "Reward Model / LLM-as-a-Judge Filtering: Discard generations with low correctness or formatting errors before training."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Synthetic Instruction Quality Filter & Deduplicator",
      description: "Filtering synthetic instruction datasets using heuristic filters, schema validation, and Jaccard similarity deduplication.",
      code: `def jaccard_similarity(str1, str2):
    s1, s2 = set(str1.lower().split()), set(str2.lower().split())
    return len(s1 & s2) / len(s1 | s2) if (s1 | s2) else 0.0

def curate_dataset(raw_samples, threshold=0.8):
    curated = []
    for s in raw_samples:
        p, r = s.get("prompt", "").strip(), s.get("response", "").strip()
        if len(p) < 10 or len(r) < 10: continue
        if any(rp in r.lower() for rp in ["as an ai language model", "i cannot assist"]): continue
        if any(jaccard_similarity(p, c["prompt"]) > threshold for c in curated): continue
        curated.append({"prompt": p, "response": r})
    return curated

data = [{"prompt": "Convert 50 USD to EUR", "response": "46.50 EUR"}, {"prompt": "convert 50 usd to eur please", "response": "46.50"}]
print("Curated count:", len(curate_dataset(data)))`
    },
    productionPitfalls: [
      "Training student models on raw outputs containing teacher model apologies ('As an AI, I am unable...').",
      "Overfitting on narrow prompt templates, destroying the model's ability to handle slight variations in user phrasing.",
      "Neglecting to validate synthetic code by actually running it in a sandbox against unit tests."
    ],
    keyTakeaways: [
      "High-quality synthetic data generated by frontier models and filtered by unit tests is the modern gold standard for fine-tuning.",
      "Remove repetitive prompts via MinHash or semantic clustering to prevent catastrophic forgetting.",
      "Always verify synthetic tool-calling trajectories against real API schemas."
    ],
    quiz: [
      {
        question: "Why is deduplication crucial when preparing a training dataset for fine-tuning an LLM?",
        options: [
          "Duplicate examples cause the model to overfit on specific phrases, memorize exact answers, and degrade general reasoning",
          "Duplicate examples make files too large to store on SSDs",
          "The PyTorch optimizer crashes on duplicate tokens",
          "Deduplication is only needed for image models"
        ],
        correctIndex: 0,
        explanation: "When identical or near-identical prompts appear multiple times in fine-tuning datasets, gradient descent repeatedly pushes weights toward memorizing those specific tokens, leading to repetition loops and loss of generalizability."
      }
    ],
    simulatorType: 'lora',
    labs: {
      problemA: {
        title: "Algorithmic Lab: MinHash LSH Near-Duplicate Deduplication",
        subtitle: "Core DSA: Locality Sensitive Hashing & Jaccard Estimation",
        problemStatement: "Implement `minhash_signature(tokens: set[str], num_hashes: int = 16) -> list[int]` using hash functions $h_i(x) = (a_i \\times \\text{hash}(x) + b_i) \\pmod p$ to compute a compact signature representing token sets for fast cluster deduplication.",
        starterCode: `def minhash_signature(tokens: set[str], num_hashes: int = 16) -> list[int]:
    # TODO: Compute MinHash signature
    pass`,
        solutionCode: `def minhash_signature(tokens: set[str], num_hashes: int = 16) -> list[int]:
    if not tokens: return [0] * num_hashes
    p = 2147483647
    sig = [float('inf')] * num_hashes
    for t in tokens:
        raw_h = hash(t)
        for i in range(num_hashes):
            val = (3 * (i + 1) * raw_h + 7 * (i + 1)) % p
            if val < sig[i]:
                sig[i] = val
    return sig`,
        testCases: [
          {
            input: 'tokens1={"hello", "world"}, tokens2={"hello", "world"}',
            expectedOutput: 'Identical 16-integer MinHash signatures',
            explanation: "Identical token sets produce identical signatures."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Sycophantic Synthetic Data Contamination",
        subtitle: "Production Systems Bug: Teacher model hallucinations baked into fine-tuned weights",
        problemStatement: "A team used GPT-4o to generate 50,000 synthetic Python code solutions. They fine-tuned an 8B model. The model hallucinated non-existent library methods (`import pandas; pandas.magic_clean()`). Rewrite the curation pipeline using sandbox verification where code must execute without error.",
        starterCode: `# Unverified data pipeline:
# dataset.append({"instruction": prompt, "code": raw_llm_code})`,
        solutionCode: `# Production Execution-Gated Curation:
def curate_synthetic_code(prompt: str, generated_code: str, test_suite: str) -> bool:
    # Run code against automated unit tests inside an isolated sandbox
    sandbox_result = execute_untrusted_python(f"{generated_code}\\n\\n{test_suite}", timeout_sec=5)
    return sandbox_result.get("exit_code") == 0 and sandbox_result.get("status") == "COMPLETED"`,
        testCases: [
          {
            input: 'Hallucinated method call `pandas.magic_clean()`',
            expectedOutput: 'AttributeError in sandbox -> Rejected from fine-tuning dataset',
            explanation: "Code execution gates ensure 100% of fine-tuned code examples are syntactically and logically valid."
          }
        ]
      }
    }
  },
  {
    id: "23-supervised-fine-tuning-sft",
    number: "23",
    title: "Supervised Fine-Tuning (SFT) Mechanics",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    trackNumber: 4,
    readTime: "22 min",
    targetRoles: ['ai-engineer'],
    motto: "Fine-tuning does not teach new facts; it adjusts the transition probabilities between existing semantic concepts.",
    problemStatement: "Pre-trained base models (e.g. LLaMA 3 Base) are raw document continuers. If you ask 'What is the capital of France?', a base model might respond with 'and what is its population?'. Supervised Fine-Tuning (SFT) transforms raw text predictors into instruction-following conversational assistants.",
    coreConcepts: [
      {
        title: "Masked Cross-Entropy Loss on Completion Tokens",
        summary: "In SFT, loss is calculated only on the assistant's completion tokens, never on the user's prompt tokens.",
        content: [
          "Prompt tokens are passed through the transformer to build the KV-cache and attention context.",
          "Target labels for prompt tokens are set to -100 (PyTorch's `ignore_index`). Their cross-entropy loss is ignored.",
          "The model is penalized only when its predicted token logits deviate from the ground-truth assistant response tokens."
        ],
        mathFormula: "\\mathcal{L}_{\\text{SFT}} = - \\sum_{t \\in \\text{completion}} \\log P(y_t \\mid y_{<t}, x)"
      },
      {
        title: "Hyperparameter Dynamics: Learning Rates and Overfitting",
        summary: "Fine-tuning uses dramatically lower learning rates than pre-training to avoid weight corruption.",
        content: [
          "Learning Rate: Typically 1e-5 to 5e-5 for full fine-tuning; 1e-4 to 2e-4 for LoRA. 10x to 100x smaller than pre-training.",
          "Epochs: 1 to 3 epochs maximum. More than 3 epochs almost invariably leads to severe overfitting and catastrophic forgetting.",
          "Cosine Annealing: Decays the learning rate smoothly to 10% of maximum with a short 5-10% warm-up phase."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Mental Model: Masked Target Loss Calculation in Pure Python",
      description: "Demonstrating how prompt tokens are masked out (-100) so loss is computed strictly on response tokens.",
      code: `import math

def cross_entropy_loss_with_mask(predicted_probs, target_token_ids, ignore_index=-100):
    loss_sum, active = 0.0, 0
    for prob, target in zip(predicted_probs, target_token_ids):
        if target == ignore_index: continue
        loss_sum += -math.log(max(prob, 1e-12))
        active += 1
    return loss_sum / active if active else 0.0

# 3 prompt tokens (masked -100) + 3 completion tokens
target_tokens = [-100, -100, -100, 40, 50, 60]
model_predictions = [0.05, 0.02, 0.10, 0.85, 0.72, 0.91]
loss = cross_entropy_loss_with_mask(model_predictions, target_tokens)
print("Masked SFT Loss:", round(loss, 4))`
    },
    productionPitfalls: [
      "Calculating loss on user prompt tokens: This forces the model to memorize user questions instead of learning how to answer.",
      "Training for too many epochs (>3), resulting in catastrophic forgetting of general reasoning capabilities.",
      "Not packing sequences: Padding short sequences with thousands of pad tokens wastes GPU FLOPs; use sequence packing with FlashAttention."
    ],
    keyTakeaways: [
      "Always mask user prompt tokens with `ignore_index=-100`.",
      "1-2 epochs on high-quality curated data is optimal.",
      "Monitor validation loss continuously; stop immediately when validation loss plateaus or starts rising."
    ],
    quiz: [
      {
        question: "Why are user prompt tokens masked with `ignore_index = -100` during Supervised Fine-Tuning (SFT)?",
        options: [
          "To prevent the model from wasting gradient updates learning to predict the user prompt rather than the assistant completion",
          "Because prompt tokens are deleted from GPU memory",
          "To protect user privacy from the training logs",
          "Because base models do not support prompts"
        ],
        correctIndex: 0,
        explanation: "In instruction tuning, our objective is purely to optimize the conditional probability of the assistant's response given the user prompt. Computing loss on the prompt itself degrades performance."
      }
    ],
    simulatorType: 'lora',
    labs: {
      problemA: {
        title: "Algorithmic Lab: FlashAttention Sequence Packing & Boundary Tensor Builder",
        subtitle: "Core DSA: 1D Bin Packing & Cumulative Index Offsets",
        problemStatement: "Given a list of tokenized training examples of lengths `[120, 450, 300, 80]`, pack them into a maximum context length of 1024 without wasteful padding, returning `(packed_tensor, cumulative_seq_lens)` for FlashAttention cu_seqlens indexing.",
        starterCode: `def pack_sequences(seqs: list[list[int]], max_len: int = 1024) -> tuple[list[int], list[int]]:
    # TODO: Pack sequences greedily and return cu_seqlens
    pass`,
        solutionCode: `def pack_sequences(seqs: list[list[int]], max_len: int = 1024) -> tuple[list[int], list[int]]:
    packed = []
    cu_seqlens = [0]
    curr_len = 0
    for s in seqs:
        if curr_len + len(s) <= max_len:
            packed.extend(s)
            curr_len += len(s)
            cu_seqlens.append(curr_len)
        else:
            break
    return packed, cu_seqlens`,
        testCases: [
          {
            input: 'seqs with lengths 2, 3 in max_len=10',
            expectedOutput: 'packed length 5, cu_seqlens=[0, 2, 5]',
            explanation: "Enables variable-length training in PyTorch without padding FLOP waste."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Unmasked Prompt Loss Catastrophe",
        subtitle: "Production Systems Bug: Model memorizing user prompts and echoing questions",
        problemStatement: "A fine-tuned model started repeating the user's question back verbatim instead of answering. Examination of the PyTorch training loop revealed `labels = input_ids.clone()`. Fix the training script using tokenizer prompt masking.",
        starterCode: `# Buggy training step:
# labels = inputs["input_ids"].clone() # Computes loss over user prompt!`,
        solutionCode: `# Fix: Tokenizer Prompt Masking
labels = inputs["input_ids"].clone()
prompt_len = len(tokenizer.encode(prompt_text, add_special_tokens=False))
# Set all tokens in the user prompt section to -100 so cross_entropy ignores them:
labels[:, :prompt_len] = -100`,
        testCases: [
          {
            input: 'labels[:, :prompt_len] = -100',
            expectedOutput: 'Gradients computed strictly on assistant response tokens',
            explanation: "Ensures the model learns conditional generation rather than prompt memorization."
          }
        ]
      }
    }
  },
  {
    id: "24-peft-lora-qlora",
    number: "24",
    title: "Parameter-Efficient Fine-Tuning: LoRA & QLoRA",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    trackNumber: 4,
    readTime: "24 min",
    targetRoles: ['ai-engineer'],
    motto: "Instead of updating 70 billion parameters, Low-Rank Adaptation (LoRA) freezes the base model and trains two tiny low-rank matrices.",
    problemStatement: "Full fine-tuning of a 70B parameter model requires updating 140 GB of weights plus storing optimizer states (Adam stores 8 bytes per parameter), demanding over 800 GB of GPU VRAM across multiple 80GB GPUs. LoRA slashes trainable parameters by 99% while achieving 99% of full fine-tuning performance.",
    coreConcepts: [
      {
        title: "The Mathematical Foundation of LoRA",
        summary: "Decomposing the weight update matrix ΔW into two low-rank matrices: A and B.",
        content: [
          "Base Linear Layer: Y = X · W, where W has dimensions (d × k).",
          "LoRA formulation: Y = X · W_0 + (α / r) · (X · A · B).",
          "W_0 is completely frozen (no gradient updates, zero optimizer state memory).",
          "Matrix A has dimensions (d × r) initialized with Gaussian noise. Matrix B has dimensions (r × k) initialized to zero, ensuring ΔW = 0 at the start of training.",
          "Rank r: Typically set to 8, 16, or 32. Because r << min(d, k), the parameter count drops from d × k down to r × (d + k)."
        ],
        mathFormula: "W_{\\text{new}} = W_0 + \\frac{\\alpha}{r} (A \\times B), \\quad A \\in \\mathbb{R}^{d \\times r}, \\, B \\in \\mathbb{R}^{r \\times k}, \\, r \\ll \\min(d, k)"
      },
      {
        title: "QLoRA: 4-bit NormalFloat (NF4) and Double Quantization",
        summary: "Fine-tuning 70B models on a single consumer GPU (24GB VRAM).",
        content: [
          "NF4 (NormalFloat4): Information-theoretically optimal quantile quantization for normally distributed neural network weights.",
          "Double Quantization: Quantizes the quantization constants themselves, saving an additional 0.37 bits per parameter.",
          "Paged Optimizers: Uses CUDA Unified Memory to automatically page optimizer states to CPU RAM during memory spikes, preventing OOM crashes."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Pure Python LoRA Layer Forward Pass & Parameter Math",
      description: "Implementing a low-rank linear layer from scratch and calculating exact parameter and VRAM savings.",
      code: `import random

class LoRALinear:
    def __init__(self, in_features, out_features, rank=8, alpha=16):
        self.in_dim = in_features
        self.out_dim = out_features
        self.rank = rank
        self.scaling = alpha / rank
        self.w0 = [[0.1 for _ in range(out_features)] for _ in range(in_features)]
        self.lora_A = [[random.gauss(0, 0.02) for _ in range(rank)] for _ in range(in_features)]
        self.lora_B = [[0.0 for _ in range(out_features)] for _ in range(rank)]

    def forward(self, x):
        base = [sum(x[i] * self.w0[i][j] for i in range(self.in_dim)) for j in range(self.out_dim)]
        xa = [sum(x[i] * self.lora_A[i][r] for i in range(self.in_dim)) for r in range(self.rank)]
        xab = [sum(xa[r] * self.lora_B[r][j] for r in range(self.rank)) for j in range(self.out_dim)]
        return [b + self.scaling * ab for b, ab in zip(base, xab)]

layer = LoRALinear(4096, 4096, rank=8)
print("Base params: 16,777,216 | LoRA params: 65,536 (99.6% reduction)")`
    },
    productionPitfalls: [
      "Targeting only Q and V projections: Modern research proves that applying LoRA to all linear layers (Q, K, V, O, Gate, Up, Down) yields far better performance.",
      "Forgetting to merge weights for production serving: Never run LoRA branch addition in latency-critical production; merge W = W_0 + (alpha/r)*AB into a single static matrix before deploying to vLLM.",
      "Setting rank r unnecessarily high (e.g. r=128): r=8 or r=16 is almost always optimal and prevents overfitting."
    ],
    keyTakeaways: [
      "LoRA freezes base weights and trains two tiny matrices A and B, cutting optimizer VRAM by >90%.",
      "QLoRA quantizes base weights to 4-bit NormalFloat (NF4), enabling fine-tuning of massive models on single GPUs.",
      "Always merge LoRA adapters back into base weights prior to production deployment."
    ],
    quiz: [
      {
        question: "Why is Matrix B in a LoRA layer initialized to zeros at the beginning of training?",
        options: [
          "To guarantee that ΔW = A × B = 0 at step zero, ensuring the model's pre-trained behavior is initially unmodified",
          "Because PyTorch cannot allocate random numbers for B",
          "To bypass GPU quantization checks",
          "To reduce the number of matrix columns"
        ],
        correctIndex: 0,
        explanation: "If B were randomly initialized, the output at step 0 would be corrupted by random noise. Initializing B to zero ensures ΔW is exactly zero until training begins."
      }
    ],
    simulatorType: 'lora',
    labs: {
      problemA: {
        title: "Algorithmic Lab: LoRA Weight Matrix Merger & Unsloth SVD",
        subtitle: "Core DSA: Matrix Multiplication & In-Place Tensor Merging",
        problemStatement: "Write a function `merge_lora_weights(W0: list[list[float]], A: list[list[float]], B: list[list[float]], alpha: float, rank: int) -> list[list[float]]` that computes $W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r}(A \\times B)$ to bake adapter weights into the base matrix for zero-latency inference.",
        starterCode: `def merge_lora_weights(W0: list[list[float]], A: list[list[float]], B: list[list[float]], alpha: float, rank: int) -> list[list[float]]:
    # TODO: Compute delta W and add in-place
    pass`,
        solutionCode: `def merge_lora_weights(W0: list[list[float]], A: list[list[float]], B: list[list[float]], alpha: float, rank: int) -> list[list[float]]:
    scaling = alpha / rank
    d = len(A)
    k = len(B[0])
    r = rank
    
    # Compute delta = A @ B
    delta = [[sum(A[i][m] * B[m][j] for m in range(r)) * scaling for j in range(k)] for i in range(d)]
    # Add to W0
    merged = [[W0[i][j] + delta[i][j] for j in range(k)] for i in range(d)]
    return merged`,
        testCases: [
          {
            input: 'W0 2x2 identity, A 2x1 [1, 2], B 1x2 [3, 4], alpha=1, rank=1',
            expectedOutput: '[[4.0, 4.0], [6.0, 9.0]]',
            explanation: "Delta W = [[3, 4], [6, 8]]. Adding W0 gives [[4, 4], [6, 9]]."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Serving Adapter Latency Penalty",
        subtitle: "Production Systems Bug: Keeping LoRA branches separate during online vLLM serving",
        problemStatement: "A production service loaded an 8B model with 4 distinct LoRA adapters. Latency jumped 40% because the GPU executed separate forward passes for each LoRA branch. Fix the serving architecture using static offline adapter merges or Multi-LoRA vLLM batched kernel execution.",
        starterCode: `# Sub-optimal: loading unmerged adapter in production single-tenant endpoint
# model = PeftModel.from_pretrained(base_model, adapter_path)`,
        solutionCode: `# Fix 1: Merge weights permanently for dedicated endpoint:
model = model.merge_and_unload()
model.save_pretrained("./merged_production_model")

# Fix 2: If multi-tenant dynamic LoRA serving, enable vLLM LoRA engine:
# vllm serve --model base-model --enable-lora --max-loras 4`,
        testCases: [
          {
            input: 'model.merge_and_unload() executed prior to export',
            expectedOutput: 'Serving latency identical to vanilla base model (zero adapter branch overhead)',
            explanation: "Merging eliminates auxiliary matrix multiplications during decoding."
          }
        ]
      }
    }
  },
  {
    id: "25-model-alignment-dpo-rlhf",
    number: "25",
    title: "Model Alignment: Direct Preference Optimization (DPO) & RLHF",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    trackNumber: 4,
    readTime: "23 min",
    targetRoles: ['ai-engineer'],
    motto: "SFT teaches the model what to say; Preference Alignment (DPO) teaches the model what NOT to say.",
    problemStatement: "Supervised Fine-Tuning trains a model to imitate examples, but cannot effectively penalize subtle errors, sycophancy, or hallucinations. Traditional RLHF (Reinforcement Learning from Human Feedback via PPO) is notoriously unstable, complex, and requires training multiple neural networks. Direct Preference Optimization (DPO) revolutionizes alignment by optimizing preferences mathematically in closed form.",
    coreConcepts: [
      {
        title: "RLHF vs. DPO: The Architectural Shift",
        summary: "How DPO eliminated the need for complex reinforcement learning policy training.",
        content: [
          "Traditional RLHF: 1) Train an SFT model, 2) Train a separate Reward Model on pairwise human rankings (Chosen vs Rejected), 3) Use PPO with a KL-divergence penalty to update the policy against the reward model. Highly unstable and GPU-heavy.",
          "Direct Preference Optimization (DPO): Mathematically proves that the language model policy can implicitly represent its own reward function. Optimizes the policy directly on (prompt, chosen, rejected) triplets using a simple binary cross-entropy loss without training a separate reward model or using RL."
        ],
        mathFormula: "\\mathcal{L}_{\\text{DPO}}(\\pi_\\theta; \\pi_{\\text{ref}}) = - \\mathbb{E} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{\\text{ref}}(y_w \\mid x)} - \\beta \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{\\text{ref}}(y_l \\mid x)} \\right) \\right]"
      },
      {
        title: "The Reference Model Anchor (KL Penalty via Beta)",
        summary: "Preventing the model from drifting into degenerate output modes.",
        content: [
          "The hyperparameter beta (β, typically 0.1 to 0.5) controls the strength of the KL-divergence penalty.",
          "The policy model π_θ is compared against the frozen reference model π_ref.",
          "If the model tries to increase chosen probability by collapsing into repetitive reward-hacking gibberish, the ratio against the reference model penalizes it heavily."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Direct Preference Optimization (DPO) Loss in Pure Python",
      description: "Implementing the mathematical objective of DPO comparing chosen vs rejected log probabilities against a reference model.",
      code: `import math

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-max(min(x, 20), -20)))

def dpo_loss(pol_win, pol_lose, ref_win, ref_lose, beta=0.1):
    win_ratio = pol_win - ref_win
    lose_ratio = pol_lose - ref_lose
    logits = beta * (win_ratio - lose_ratio)
    return -math.log(max(sigmoid(logits), 1e-12)), logits

loss, margin = dpo_loss(-10.2, -15.8, -12.5, -13.0, beta=0.1)
print(f"DPO Loss: {loss:.4f} (Implicit Reward Margin: {margin:.2f})")`
    },
    productionPitfalls: [
      "Running DPO before SFT: DPO requires the model to already be capable of generating valid responses; always run SFT first.",
      "Setting beta too high (causes the model to barely change) or too low (causes immediate mode collapse and gibberish).",
      "Using noisy preference data where human or AI annotators disagree on which answer is actually better."
    ],
    keyTakeaways: [
      "DPO aligns models directly on preference pairs without requiring an external reward model or reinforcement learning.",
      "The beta parameter acts as a regularization anchor to prevent policy drift away from the reference model.",
      "Pairwise preference datasets must be rigorously curated to prevent reward hacking."
    ],
    quiz: [
      {
        question: "What major engineering obstacle does Direct Preference Optimization (DPO) eliminate compared to traditional PPO-based RLHF?",
        options: [
          "It eliminates the need to train a separate reward model and run unstable reinforcement learning policy gradient updates",
          "It eliminates the need for GPU hardware",
          "It removes the tokenizer layer",
          "It allows models to train without internet"
        ],
        correctIndex: 0,
        explanation: "DPO mathematically re-formulates the RLHF objective such that the optimal policy can be trained directly on preference pairs using standard cross-entropy-style loss, avoiding reward models and PPO."
      }
    ],
    simulatorType: 'lora',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Pairwise Margin & DPO Gradient Magnitude Calculator",
        subtitle: "Core DSA: Sigmoid Derivatives & Weight Update Magnitudes",
        problemStatement: "The gradient of DPO loss with respect to implicit reward margin is given by $\\sigma(-\\beta(r_w - r_l))$. Implement `dpo_gradient_weight(policy_win_logp: float, policy_lose_logp: float, ref_win_logp: float, ref_lose_logp: float, beta: float = 0.1) -> float` to measure update magnitude.",
        starterCode: `def dpo_gradient_weight(p_w: float, p_l: float, r_w: float, r_l: float, beta: float = 0.1) -> float:
    # TODO: Calculate gradient scaling factor
    pass`,
        solutionCode: `import math

def dpo_gradient_weight(p_w: float, p_l: float, r_w: float, r_l: float, beta: float = 0.1) -> float:
    diff = (p_w - r_w) - (p_l - r_l)
    logits = beta * diff
    # Sigmoid(-logits)
    clipped = max(min(-logits, 20), -20)
    return 1.0 / (1.0 + math.exp(-clipped))`,
        testCases: [
          {
            input: 'p_w=-10, p_l=-20, r_w=-10, r_l=-10, beta=0.1',
            expectedOutput: 'gradient weight ~= 0.2689',
            explanation: "When policy already strongly prefers chosen, gradient dampens automatically."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The DPO Mode Collapse & Length Exploitation",
        subtitle: "Production Systems Bug: Model generates 5x longer responses to game implicit reward",
        problemStatement: "After DPO training, the model started generating 2,000-word essays for simple queries like 'What is 2+2?'. Root cause analysis showed human preference annotators consistently preferred longer answers in the training dataset (Length Bias). Fix the DPO objective using margin length-normalization.",
        starterCode: `# Standard unnormalized DPO:
# loss = dpo_loss(chosen_logp, rejected_logp, ref_chosen_logp, ref_rejected_logp)`,
        solutionCode: `# Production Fix: Length-Normalized DPO Loss
def length_normalized_dpo_loss(chosen_logp: float, rejected_logp: float,
                               ref_chosen_logp: float, ref_rejected_logp: float,
                               len_chosen: int, len_rejected: int, beta: float = 0.1):
    # Normalize log probabilities by token length to neutralize verbosity bias:
    norm_chosen = (chosen_logp - ref_chosen_logp) / max(1, len_chosen)
    norm_rejected = (rejected_logp - ref_rejected_logp) / max(1, len_rejected)
    logits = beta * (norm_chosen - norm_rejected)
    return -math.log(max(1.0 / (1.0 + math.exp(-logits)), 1e-12))`,
        testCases: [
          {
            input: 'Longer answer with lower per-token probability',
            expectedOutput: 'Penalized correctly by length normalization, eliminating verbosity hacking.',
            explanation: "Length-normalized DPO neutralizes human and model bias toward superficial verbosity."
          }
        ]
      }
    }
  }
];
