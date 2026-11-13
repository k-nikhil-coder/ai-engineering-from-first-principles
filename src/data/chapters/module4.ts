import type { Chapter } from '../../types/curriculum';

export const MODULE_4_CHAPTERS: Chapter[] = [
  {
    id: "17-when-to-prompt-rag-finetune",
    number: "17",
    title: "When to Prompt, RAG, Fine-Tune, or Pre-Train",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    readTime: "16 min",
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
    """
    Evaluates:
    - knowledge_type: 'static_syntax_style' vs 'dynamic_fast_changing'
    - latency_critical: bool (e.g. <200ms required)
    - cost_sensitivity: 'high' vs 'low'
    - verifiable_citations_required: bool
    """
    recommendations = []
    
    if reqs.get("verifiable_citations_required"):
        recommendations.append("MANDATORY: RAG (Retrieval-Augmented Generation) for grounded source citations.")
        
    if reqs.get("knowledge_type") == "dynamic_fast_changing":
        recommendations.append("USE: RAG or Dynamic Tool Execution. Do NOT fine-tune for fast-changing facts.")
        
    if reqs.get("knowledge_type") == "static_syntax_style" and reqs.get("cost_sensitivity") == "high":
        recommendations.append("USE: LoRA Fine-Tuning on a Small Language Model (e.g. LLaMA-3-8B) to eliminate long prompt tokens and replace expensive frontier models.")
        
    if reqs.get("latency_critical") and reqs.get("cost_sensitivity") == "high":
        recommendations.append("USE: Quantized Self-Hosted Fine-Tuned Model (vLLM / AWQ) to minimize TTFT and avoid cloud network overhead.")
        
    if not recommendations:
        recommendations.append("USE: Zero-Shot / Few-Shot Prompting with Frontier API (fastest time to production).")
        
    return recommendations

specs = {
    "knowledge_type": "static_syntax_style",
    "latency_critical": True,
    "cost_sensitivity": "high",
    "verifiable_citations_required": False
}

results = recommend_ai_strategy(specs)
print("Recommended Architectural Strategy:")
for r in results:
    print("-", r)`
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
    ]
  },
  {
    id: "18-dataset-curation-synthetic-data",
    number: "18",
    title: "Synthetic Data Generation & Dataset Curation",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    readTime: "19 min",
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
        summary: "Using frontier models (Claude 3.5 Sonnet / GPT-4o) as teachers to bootstrap datasets for smaller student models.",
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
    s1 = set(str1.lower().split())
    s2 = set(str2.lower().split())
    if not s1 or not s2:
        return 0.0
    return len(s1.intersection(s2)) / len(s1.union(s2))

def curate_dataset(raw_samples, similarity_threshold=0.8):
    curated = []
    
    for sample in raw_samples:
        prompt = sample.get("prompt", "").strip()
        response = sample.get("response", "").strip()
        
        # Rule 1: Length & non-empty filters
        if len(prompt) < 10 or len(response) < 10:
            continue
            
        # Rule 2: Sycophancy / refusal filter
        refusal_phrases = ["as an ai language model", "i cannot assist with that"]
        if any(rp in response.lower() for rp in refusal_phrases):
            continue
            
        # Rule 3: Deduplication against already accepted samples
        is_duplicate = False
        for accepted in curated:
            if jaccard_similarity(prompt, accepted["prompt"]) > similarity_threshold:
                is_duplicate = True
                break
        if is_duplicate:
            continue
            
        curated.append({"prompt": prompt, "response": response})
        
    return curated

# Raw uncurated synthetic data batch
raw_batch = [
    {"prompt": "Convert 50 USD to EUR", "response": "50 USD is approximately 46.50 EUR."},
    {"prompt": "convert 50 usd to eur please", "response": "46.50 EUR"}, # Duplicate
    {"prompt": "Short", "response": "Too short"},                         # Low quality
    {"prompt": "Write SQL to find top users", "response": "SELECT * FROM users ORDER BY score DESC LIMIT 10;"}
]

clean_data = curate_dataset(raw_batch)
print(f"Retained {len(clean_data)} / {len(raw_batch)} samples after curation:")
for item in clean_data:
    print("- Prompt:", item["prompt"])`
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
    ]
  },
  {
    id: "19-supervised-fine-tuning-sft",
    number: "19",
    title: "Supervised Fine-Tuning (SFT) Mechanics",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    readTime: "22 min",
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
    """
    predicted_probs: list of probabilities assigned to target tokens at each position
    target_token_ids: list of actual token IDs (-100 for masked tokens)
    """
    loss_sum = 0.0
    active_tokens_count = 0
    
    for prob, target in zip(predicted_probs, target_token_ids):
        if target == ignore_index:
            # Prompt token: do not compute loss!
            continue
            
        # Standard negative log likelihood: -log(P(target))
        loss = -math.log(max(prob, 1e-12))
        loss_sum += loss
        active_tokens_count += 1
        
    if active_tokens_count == 0:
        return 0.0
    return loss_sum / active_tokens_count

# Sequence of 6 tokens: 3 prompt tokens + 3 completion tokens
# User Prompt: "Hi" -> [10, 20, 30]
# Assistant Output: "Hello world" -> [40, 50, 60]
target_tokens = [-100, -100, -100, 40, 50, 60]

# Model probabilities predicted at each step for the target token
model_predictions = [0.05, 0.02, 0.10, 0.85, 0.72, 0.91]

loss = cross_entropy_loss_with_mask(model_predictions, target_tokens)
print("Calculated Masked SFT Loss:", round(loss, 4))
print("Notice: Prompt tokens had 0 contribution to loss gradient!")`
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
    ]
  },
  {
    id: "20-peft-lora-qlora",
    number: "20",
    title: "Parameter-Efficient Fine-Tuning: LoRA & QLoRA",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    readTime: "24 min",
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
        self.in_features = in_features
        self.out_features = out_features
        self.rank = rank
        self.scaling = alpha / rank
        
        # Frozen base weight W0 (simulated with fixed numbers)
        self.w0 = [[0.1 for _ in range(out_features)] for _ in range(in_features)]
        
        # Trainable Matrix A: (in_features x rank) - Gaussian random
        self.lora_A = [[random.gauss(0, 0.02) for _ in range(rank)] for _ in range(in_features)]
        
        # Trainable Matrix B: (rank x out_features) - Initialized to ZERO!
        self.lora_B = [[0.0 for _ in range(out_features)] for _ in range(rank)]

    def forward(self, x):
        # 1. Base forward pass: x @ W0
        base_out = [sum(x[i] * self.w0[i][j] for i in range(self.in_features)) for j in range(self.out_features)]
        
        # 2. LoRA branch: (x @ A) @ B
        # Step A: x @ A -> (1 x rank)
        xa = [sum(x[i] * self.lora_A[i][r] for i in range(self.in_features)) for r in range(self.rank)]
        # Step B: xa @ B -> (1 x out_features)
        xab = [sum(xa[r] * self.lora_B[r][j] for r in range(self.rank)) for j in range(self.out_features)]
        
        # 3. Combine with scaling factor
        return [b + self.scaling * ab for b, ab in zip(base_out, xab)]

# Compare parameter counts for a 4096 x 4096 hidden projection
dim = 4096
rank = 8
base_params = dim * dim
lora_params = (dim * rank) + (rank * dim)
savings = (1 - (lora_params / base_params)) * 100

print(f"Base Parameters:    {base_params:,} (requires ~33 MB VRAM for weights + 134 MB for Adam)")
print(f"LoRA (r={rank}) Params: {lora_params:,} (requires ~0.13 MB VRAM!)")
print(f"Parameter Reduction: {savings:.2f}%")`
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
    ]
  },
  {
    id: "21-model-alignment-dpo-rlhf",
    number: "21",
    title: "Model Alignment: Direct Preference Optimization (DPO) & RLHF",
    moduleId: "custom-models",
    moduleName: "Custom Models & Adaptation",
    readTime: "23 min",
    motto: "SFT teaches the model what to say; Preference Alignment (DPO) teaches the model what NOT to say.",
    problemStatement: "Supervised Fine-Tuning trains a model to imitate examples, but cannot effectively penalize subtle errors, sycophancy, or hallucinations. Traditional RLHF (Reinforcement Learning from Human Feedback via PPO) is notoriously unstable, complex, and requires training multiple neural networks. Direct Preference Optimization (DPO) revolutionizes alignment by optimizing preferences mathematically in closed form.",
    coreConcepts: [
      {
        title: "RLHF vs. DPO: The Architectural Shift",
        summary: "How DPO eliminated the need for complex reinforcement learning policy training.",
        content: [
          "Traditional RLHF: 1) Train an SFT model, 2) Train a separate Reward Model on pairwise human rankings (Chosen vs Rejected), 3) Use PPO (Proximal Policy Optimization) with a KL-divergence penalty to update the policy against the reward model. Highly unstable and GPU-heavy.",
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

def dpo_loss(policy_chosen_logp, policy_rejected_logp,
             ref_chosen_logp, ref_rejected_logp, beta=0.1):
    """
    Computes DPO loss for a single (prompt, chosen, rejected) triplet.
    """
    # Log-ratio of policy vs reference for chosen response
    chosen_log_ratio = policy_chosen_logp - ref_chosen_logp
    
    # Log-ratio of policy vs reference for rejected response
    rejected_log_ratio = policy_rejected_logp - ref_rejected_logp
    
    # Implicit reward difference scaled by beta
    logits = beta * (chosen_log_ratio - rejected_log_ratio)
    
    # Negative log-sigmoid loss
    loss = -math.log(max(sigmoid(logits), 1e-12))
    return loss, logits

# Example: Policy model strongly prefers the Chosen completion
# Log-probabilities: log(P(completion | prompt))
ref_chosen = -12.5
ref_rejected = -13.0

# Case 1: Policy improved on chosen, reduced probability of rejected
policy_chosen_good = -10.2
policy_rejected_good = -15.8

loss_good, logits_good = dpo_loss(
    policy_chosen_good, policy_rejected_good,
    ref_chosen, ref_rejected, beta=0.1
)
print("Aligned Policy -> DPO Loss:", round(loss_good, 4), f"(Reward Margin: {logits_good:.2f})")

# Case 2: Degraded Policy that preferred the rejected answer
policy_chosen_bad = -14.0
policy_rejected_bad = -11.0
loss_bad, logits_bad = dpo_loss(
    policy_chosen_bad, policy_rejected_bad,
    ref_chosen, ref_rejected, beta=0.1
)
print("Misaligned Policy -> DPO Loss:", round(loss_bad, 4), f"(Reward Margin: {logits_bad:.2f})")`
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
    ]
  }
];
