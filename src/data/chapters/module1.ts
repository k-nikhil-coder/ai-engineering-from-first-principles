import type { Chapter } from '../../types/curriculum';

export const MODULE_1_CHAPTERS: Chapter[] = [
  {
    id: "01-tokens-and-tokenization",
    number: "01",
    title: "Tokens, Vocabulary & Tokenization Mechanics",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    readTime: "15 min",
    motto: "Large Language Models do not process strings; they navigate integer IDs projected over high-dimensional vector space.",
    problemStatement: "Most developers assume models read words like humans. This assumption leads directly to token boundary bugs, unexpected cost explosions in multilingual text, prompt injection bypasses via token splitting, and silent math failures (e.g., '123' vs '1' + '23'). Understanding tokenization at the byte level is non-negotiable for AI Engineers.",
    coreConcepts: [
      {
        title: "From Unicode Bytes to Discrete Tokens",
        summary: "The text-to-tensor pipeline begins with UTF-8 byte sequences compressed via Byte-Pair Encoding (BPE).",
        content: [
          "Characters can vary in byte length: ASCII is 1 byte, accented Latin is 2 bytes, Devanagari/CJK characters are 3-4 bytes, and emojis are up to 4 bytes.",
          "Byte-Pair Encoding (BPE) starts with a base vocabulary of 256 byte values (0x00 to 0xFF). It iteratively identifies the most frequently adjacent pair of tokens across a corpus and merges them into a new single token.",
          "Modern tokenizers (like OpenAI's tiktoken / cl100k_base or LLaMA 3's 128k tokenizer) use regular expressions to enforce word and symbol boundaries before applying BPE merges, preventing tokens from crossing punctuation or whitespace indiscriminately."
        ],
        diagram: `Raw String: "Learning AI"
  │ UTF-8 Encode
  ▼
Bytes: [0x4C, 0x65, 0x61, 0x72, 0x6E, 0x69, 0x6E, 0x67, 0x20, 0x41, 0x49]
  │ BPE Merge Lookups (Vocabulary Table)
  ▼
Tokens: ["Learn", "ing", " AI"]
  │ Integer ID Mapping
  ▼
Token IDs: [12450, 278, 9552]  -->  Passed to Embedding Layer Matrix (W_E)`
      },
      {
        title: "Token Inflation and Multilingual Tax",
        summary: "Because BPE vocabularies are trained predominantly on English text, non-English languages suffer a high 'Token Inflation Factor'.",
        content: [
          "An English sentence might consume 10 tokens, while the identical semantic sentence translated into Hindi, Arabic, or Japanese can consume 30 to 50 tokens.",
          "Consequences in production: 3x to 5x higher API cost, 3x faster context window exhaustion, and significantly higher inference latency (since LLM generation latency scales linearly with output tokens)."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Pure Python Byte-Pair Encoding (BPE) from Scratch",
      description: "A minimal, self-contained implementation of the BPE algorithm demonstrating how byte pairs are counted, merged, and indexed.",
      code: `def get_stats(ids):
    """Count frequency of adjacent token pairs."""
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts

def merge(ids, pair, idx):
    """Replace all occurrences of pair with new token index idx."""
    new_ids = []
    i = 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i+1] == pair[1]:
            new_ids.append(idx)
            i += 2
        else:
            new_ids.append(ids[i])
            i += 1
    return new_ids

# Example training corpus
text = "low lower newest widest lowest"
# 1. Start with raw UTF-8 byte integers (0-255)
tokens = list(text.encode("utf-8"))
print("Initial byte tokens count:", len(tokens))

vocab_size = 265  # 256 base bytes + 9 merges
merges = {}  # (p0, p1) -> new_token_id

for idx in range(256, vocab_size):
    stats = get_stats(tokens)
    if not stats:
        break
    best_pair = max(stats, key=stats.get)
    tokens = merge(tokens, best_pair, idx)
    merges[best_pair] = idx
    print(f"Merged {best_pair} -> ID {idx} (count: {stats[best_pair]})")

print("Compressed tokens count:", len(tokens))`
    },
    productionPitfalls: [
      "Assuming 1 word = 1 token (Rule of thumb: 1 English token ~= 0.75 words, or 4 characters; for code or non-English, 1 token can be < 1 character).",
      "Whitespace sensitivity: Leading spaces change token IDs. For instance, ' Hello' is token ID 18435, while 'Hello' is token ID 9906 in GPT-4.",
      "Token boundary prompt injections: An attacker splits a forbidden keyword across subword boundaries to bypass naive substring guardrails."
    ],
    keyTakeaways: [
      "Tokenization is lossy in terms of structure: punctuation, spaces, and formatting are converted into discrete integers.",
      "Always measure latency and budget context windows by token count, never character count.",
      "Verify the exact tokenizer used by your target model (e.g. tiktoken for OpenAI, tokenizers library for HuggingFace)."
    ],
    quiz: [
      {
        question: "Why does the word ' apple' (with a leading space) often produce a different token ID than 'apple'?",
        options: [
          "The leading whitespace byte is included in the BPE subword merge",
          "Modern tokenizers strip whitespace before encoding",
          "It is a bug in the Unicode standard",
          "Leading spaces are replaced with null bytes"
        ],
        correctIndex: 0,
        explanation: "In modern BPE tokenizers, whitespace is treated as a character and merged directly with adjacent characters into tokens like ' apple'."
      }
    ]
  },
  {
    id: "02-embeddings-and-vector-space",
    number: "02",
    title: "Embeddings & Vector Space Geometry",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    readTime: "16 min",
    motto: "An embedding is not a summary; it is a coordinate in a 1,536+ dimensional manifold where direction represents meaning.",
    problemStatement: "Engineers often treat embedding APIs as black boxes that output an array of floats. When retrieval quality degrades, they blindly tweak chunk sizes without understanding why cosine similarity fails on asymmetric queries, or how high-dimensional geometry causes the 'curse of dimensionality'.",
    coreConcepts: [
      {
        title: "Vector Geometry: Dot Product vs. Cosine Similarity vs. Euclidean Distance",
        summary: "Measuring similarity between text vectors depends on whether magnitude carries semantic significance.",
        content: [
          "Dot Product (u · v): Multiplies corresponding components. Sensitive to both vector angle and magnitude (length).",
          "Cosine Similarity: The cosine of the angle between two vectors: cos(θ) = (u · v) / (||u|| * ||v||). Invariant to vector length.",
          "If vectors are L2-normalized (length = 1.0), Cosine Similarity is mathematically identical to Dot Product, enabling ultra-fast matrix multiplication on GPUs and SIMD vector units.",
          "Euclidean Distance (L2): Geometric distance between endpoints: sqrt(Σ (ui - vi)^2). In normalized space, L2 distance is monotonically related to cosine distance."
        ],
        mathFormula: "Cosine Similarity: S_C(u, v) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|} = \\frac{\\sum_{i=1}^n u_i v_i}{\\sqrt{\\sum_{i=1}^n u_i^2} \\sqrt{\\sum_{i=1}^n v_i^2}}"
      },
      {
        title: "The Asymmetric Search Dilemma",
        summary: "Why short queries (3-5 words) struggle to match long passages (500 words) using raw cosine similarity.",
        content: [
          "A short user query like 'cancel subscription refund policy' has low semantic density compared to a complete Terms of Service document.",
          "Models trained with symmetric objectives fail on asymmetric search. Production systems use asymmetric embedding models (like BGE or text-embedding-3) or query prefixing (e.g. 'search_query: ' vs 'search_document: ')."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "First-Principles Vector Similarity & L2 Normalization in Pure Python",
      description: "Demonstrating how cosine similarity, dot product, and Euclidean distance relate to each other without third-party ML libraries.",
      code: `import math

def dot_product(v1, v2):
    return sum(a * b for a, b in zip(v1, v2))

def magnitude(v):
    return math.sqrt(sum(a * a for a in v))

def l2_normalize(v):
    mag = magnitude(v)
    if mag == 0:
        return v
    return [a / mag for a in v]

def cosine_similarity(v1, v2):
    mag1 = magnitude(v1)
    mag2 = magnitude(v2)
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product(v1, v2) / (mag1 * mag2)

def euclidean_distance(v1, v2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))

# Two 4-dimensional synthetic text embeddings
query_vec = [0.12, -0.45, 0.88, 0.05]
doc_vec_a = [0.10, -0.42, 0.91, 0.02]  # Closely aligned
doc_vec_b = [-0.85, 0.15, -0.10, 0.45] # Divergent

# Cosine similarity
print("Cosine Sim (Query, Doc A):", round(cosine_similarity(query_vec, doc_vec_a), 4))
print("Cosine Sim (Query, Doc B):", round(cosine_similarity(query_vec, doc_vec_b), 4))

# Prove that Dot Product on L2-normalized vectors equals Cosine Similarity
norm_q = l2_normalize(query_vec)
norm_a = l2_normalize(doc_vec_a)
print("Dot Product of Normalized Vectors:", round(dot_product(norm_q, norm_a), 4))`
    },
    productionPitfalls: [
      "Comparing embeddings generated by different models (e.g. text-embedding-3-small vs ada-002 vs Cohere). They inhabit completely different coordinate manifolds.",
      "Neglecting query prefixing for models that require instruction prefixes (e.g., E5 and BGE require 'query: ' and 'passage: ').",
      "Over-relying on dense vectors alone for exact keyword searches (product codes, SKUs, error logs) where sparse BM25 significantly outperforms dense embeddings."
    ],
    keyTakeaways: [
      "Always pre-normalize your vectors to unit length during ingestion to make retrieval pure dot products.",
      "Cosine distance does not understand keyword overlap or acronyms well; combine with sparse search (Hybrid Search).",
      "Higher dimensions (e.g. 1536 vs 3072) increase storage and search latency linearly; test Matryoshka dimension truncation."
    ],
    quiz: [
      {
        question: "When are Cosine Similarity and Dot Product mathematically identical?",
        options: [
          "When both vectors have been L2-normalized to unit magnitude (length = 1.0)",
          "Only when the vector dimensions are powers of 2",
          "When all numbers in the vector are positive",
          "They are never mathematically equivalent"
        ],
        correctIndex: 0,
        explanation: "Cosine similarity divides the dot product by the product of both magnitudes. When both magnitudes are 1.0, the denominator is 1.0, making them identical."
      }
    ]
  },
  {
    id: "03-attention-and-kv-cache",
    number: "03",
    title: "Transformer Architecture & KV-Cache Lifecycle",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    readTime: "20 min",
    motto: "The KV-Cache converts a quadratic O(N²) generation loop into an O(N) memory-bound step by caching previous keys and values.",
    problemStatement: "The transformer's self-attention mechanism is famously quadratic in compute and memory with respect to prompt length. During autoregressive token generation, re-computing attention over previous tokens wastes immense compute. The KV-Cache solves this, but becomes the primary bottleneck for GPU VRAM at scale.",
    coreConcepts: [
      {
        title: "Self-Attention: Query, Key, and Value Matrices",
        summary: "Attention allows every token to broadcast what it needs (Query) and match against what other tokens offer (Key) to aggregate context (Value).",
        content: [
          "Input vectors X are projected into Q = X * W_Q, K = X * W_K, and V = X * W_V.",
          "Attention scores are computed via: Attention(Q, K, V) = softmax((Q · K^T) / sqrt(d_k)) · V.",
          "The scaling factor sqrt(d_k) prevents the dot products from growing excessively large in high dimensions, which would push softmax into regions with near-zero gradients."
        ],
        mathFormula: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V"
      },
      {
        title: "Why KV-Caching is the Foundation of LLM Inference",
        summary: "Autoregressive generation emits one token at a time. The past tokens' Keys and Values do not change.",
        content: [
          "Without KV-Cache: Generating token 1001 requires running attention over all 1000 previous tokens from scratch (O(N^2) complexity).",
          "With KV-Cache: Pre-computed Key and Value tensors for tokens 1 through 1000 are stored in GPU VRAM. Generating token 1001 only computes Q for token 1001, matching it against cached K, and weighting cached V (O(N) memory lookup).",
          "The Trade-off: Compute-bound generation becomes a memory-bandwidth-bound problem. KV-cache memory scales as: 2 * num_layers * num_heads * head_dim * sequence_length * batch_size * bytes_per_element."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Self-Attention and KV-Cache Logic in Pure Python",
      description: "Step-by-step implementation of scaled dot-product attention and manual KV-cache append mechanism.",
      code: `import math

def softmax(x):
    e_x = [math.exp(i - max(x)) for i in x]
    total = sum(e_x)
    return [i / total for i in e_x]

def scaled_dot_product_attention(q, keys, values, d_k):
    """
    q: 1D vector (dim) for current token
    keys: list of 1D vectors (dim) for past tokens
    values: list of 1D vectors (dim) for past tokens
    """
    scores = []
    scale = math.sqrt(d_k)
    for k in keys:
        dot = sum(a * b for a, b in zip(q, k))
        scores.append(dot / scale)
    
    attn_weights = softmax(scores)
    
    # Weighted sum of values
    output_dim = len(values[0])
    out = [0.0] * output_dim
    for weight, v in zip(attn_weights, values):
        for d in range(output_dim):
            out[d] += weight * v[d]
    return out, attn_weights

# Simulated dimension
d_k = 4
# KV-Cache holding history for first 2 tokens
kv_cache_k = [[1.0, 0.0, 1.0, 0.0], [0.0, 1.0, 0.0, 1.0]]
kv_cache_v = [[0.5, 0.2, 0.1, 0.8], [0.2, 0.9, 0.4, 0.3]]

# Incoming Token 3: compute its Q, K, V
q_3 = [0.8, 0.5, 0.2, 0.9]
k_3 = [0.1, 0.9, 0.2, 0.8]
v_3 = [0.3, 0.7, 0.6, 0.4]

# Step 1: Append new K and V to cache
kv_cache_k.append(k_3)
kv_cache_v.append(v_3)

# Step 2: Compute attention over all cached tokens
output, weights = scaled_dot_product_attention(q_3, kv_cache_k, kv_cache_v, d_k)
print("Attention weights over 3 tokens:", [round(w, 3) for w in weights])
print("Aggregated Context Vector:", [round(x, 3) for x in output])`
    },
    productionPitfalls: [
      "KV-Cache OOM: In high-concurrency serving (e.g. 100 concurrent requests of 32k context), KV-cache can consume 10x more VRAM than the model weights themselves.",
      "Multi-Query Attention (MQA) and Grouped-Query Attention (GQA) reduce KV-cache size by sharing key/value heads across multiple query heads (LLaMA 3 uses GQA).",
      "PagedAttention (as implemented in vLLM) prevents memory fragmentation by allocating KV-cache blocks like OS virtual memory pages."
    ],
    keyTakeaways: [
      "Prefill phase (processing prompt) is compute-heavy (parallel). Decode phase (generating output) is memory-bandwidth heavy (sequential).",
      "Long context windows cost more in KV-cache VRAM than in initial compute.",
      "Modern architectures (vLLM, SGLang) optimize KV-cache memory allocation to maximize throughput."
    ],
    quiz: [
      {
        question: "Why does generating tokens one-by-one (decode phase) run into memory-bandwidth bottlenecks rather than compute bottlenecks?",
        options: [
          "For every single new token generated, the GPU must stream all model weights and the entire KV-cache from high-bandwidth memory (HBM) into SRAM",
          "Tokenizers run on the CPU which throttles GPU compute",
          "Attention cannot be executed in parallel with GPUs",
          "The softmax function requires disk I/O"
        ],
        correctIndex: 0,
        explanation: "In autoregressive decoding with batch size 1, the arithmetic intensity is very low: the GPU must transfer gigabytes of weights and KV-cache just to perform a few matrix-vector multiplications."
      }
    ]
  },
  {
    id: "04-next-token-sampling",
    number: "04",
    title: "Next-Token Generation & Sampling Mechanics",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    readTime: "14 min",
    motto: "A model outputs logits, not text. Sampling transforms uncalibrated raw scores into human-like creativity or deterministic code.",
    problemStatement: "Setting temperature=0.7 without understanding its mathematical impact on the logit probability distribution causes subtle hallucinations, formatting corruptions, or repetitive text loops. Developers must understand Temperature, Top-p, Top-k, and Min-p at the logit level.",
    coreConcepts: [
      {
        title: "Logits to Probabilities via Softmax and Temperature",
        summary: "Temperature scales the logits prior to the softmax normalization function.",
        content: [
          "The output of the final linear layer is an array of raw real numbers called logits (one for each vocabulary token).",
          "Applying temperature T: scaled_logits = logits / T.",
          "When T -> 0 (Argmax / Greedy decoding): The highest logit dominates completely, making generation deterministic.",
          "When T > 1.0: The probability distribution is flattened, increasing the probability of rare and unexpected tokens."
        ],
        mathFormula: "P(x_i) = \\frac{\\exp(z_i / T)}{\\sum_j \\exp(z_j / T)}"
      },
      {
        title: "Nucleus Sampling (Top-p) and Min-p",
        summary: "Modern sampling techniques prevent the model from picking nonsensical long-tail tokens.",
        content: [
          "Top-k: Truncates the candidate pool to only the k highest probability tokens. Problem: k=50 might be too wide for high-certainty contexts and too narrow for creative tasks.",
          "Top-p (Nucleus): Sorts tokens by probability and picks the smallest set whose cumulative sum reaches p (e.g. 0.90). Dynamic candidate pool size.",
          "Min-p: A recent superior alternative that discards tokens whose probability is less than a fraction (e.g. 5%) of the top token's probability."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Sampling Mechanics with Temperature and Top-p in Pure Python",
      description: "Compute probabilities from raw logits, apply temperature scaling, and filter with nucleus sampling.",
      code: `import math
import random

def softmax_with_temp(logits, temperature=1.0):
    if temperature <= 0.0001:
        # Greedy argmax
        max_idx = max(range(len(logits)), key=lambda i: logits[i])
        probs = [0.0] * len(logits)
        probs[max_idx] = 1.0
        return probs
    
    scaled = [z / temperature for z in logits]
    max_s = max(scaled)
    exp_s = [math.exp(s - max_s) for s in scaled]
    sum_exp = sum(exp_s)
    return [e / sum_exp for e in exp_s]

def sample_top_p(probs, p=0.9):
    # Pair indices with probabilities and sort descending
    indexed = sorted(list(enumerate(probs)), key=lambda x: x[1], reverse=True)
    
    cumulative = 0.0
    filtered = []
    for idx, prob in indexed:
        filtered.append((idx, prob))
        cumulative += prob
        if cumulative >= p:
            break
            
    # Re-normalize filtered probabilities
    total_p = sum(p for _, p in filtered)
    norm_probs = [p / total_p for _, p in filtered]
    
    # Weighted random choice
    r = random.random()
    acc = 0.0
    for (orig_idx, _), np in zip(filtered, norm_probs):
        acc += np
        if r <= acc:
            return orig_idx
    return filtered[-1][0]

# Simulated vocabulary: 5 tokens
vocab = ["def", "import", "class", "apple", "banana"]
raw_logits = [8.5, 8.2, 7.9, 1.2, 0.4]

# Compare Low Temp (Code generation) vs High Temp
prob_low_t = softmax_with_temp(raw_logits, temperature=0.2)
prob_high_t = softmax_with_temp(raw_logits, temperature=1.5)

print("Low Temp (0.2) Probabilities:", [round(p, 4) for p in prob_low_t])
print("High Temp (1.5) Probabilities:", [round(p, 4) for p in prob_high_t])
print("Sampled Token Index (Top-p = 0.9):", sample_top_p(prob_low_t, p=0.9))`
    },
    productionPitfalls: [
      "Using high temperature (e.g. T=0.8) for structured JSON generation, leading to broken syntax brackets.",
      "Combining high Top-k with high Temperature, causing bizarre hallucinations in technical pipelines.",
      "Not setting deterministic seeds when attempting to run repeatable automated regression tests."
    ],
    keyTakeaways: [
      "For code, SQL, and JSON extraction: use Temperature = 0.0 (or 0.1) and Top-p = 1.0.",
      "For creative drafting and brainstorming: use Temperature = 0.7 - 0.9 with Top-p = 0.9.",
      "Always inspect token logprobs when building calibration and confidence estimation systems."
    ],
    quiz: [
      {
        question: "What happens to the output distribution when temperature T approaches 0?",
        options: [
          "It collapses into a one-hot distribution choosing the single token with highest logit (Greedy Decoding)",
          "All tokens become equally probable (Uniform distribution)",
          "The model outputs random numbers",
          "Generation stops immediately"
        ],
        correctIndex: 0,
        explanation: "As T approaches 0, the difference between the highest logit and the others is amplified infinitely by division, making the top token have probability 1.0."
      }
    ]
  },
  {
    id: "05-quantization-and-compression",
    number: "05",
    title: "Quantization & Model Compression Mechanics",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    readTime: "18 min",
    motto: "Quantization is not dropping data; it is an intelligent affine projection from 16-bit floating-point tensors into 4-bit integer lattices.",
    problemStatement: "A 70B parameter model in standard FP16 requires ~140 GB of GPU VRAM just for weights—demanding two $30,000 H100 GPUs. Quantization compresses the model to fit on a single consumer GPU or lower-tier instance with minimal loss in reasoning capabilities.",
    coreConcepts: [
      {
        title: "Precision Formats: FP32, FP16, BF16, and INT8/INT4",
        summary: "Floating-point numbers allocate bits between sign, exponent (range), and mantissa (precision).",
        content: [
          "FP32: 1 sign bit, 8 exponent bits, 23 mantissa bits (4 bytes per parameter).",
          "FP16: 1 sign bit, 5 exponent bits, 10 mantissa bits. Prone to overflow during deep transformer training.",
          "BF16 (Bfloat16): 1 sign bit, 8 exponent bits (same dynamic range as FP32!), 7 mantissa bits. The industry standard for training modern LLMs.",
          "INT8 / INT4: Discrete integer values mapped through scaling factors (S) and zero-points (Z): real_val = S * (q_val - Z)."
        ]
      },
      {
        title: "Modern Quantization Algorithms: AWQ, GPTQ, and GGUF",
        summary: "Naive round-to-nearest quantization destroys perplexity; modern methods protect critical outlier activations.",
        content: [
          "Outlier weights: Less than 1% of transformer weights account for over 50% of reasoning performance.",
          "AWQ (Activation-aware Weight Quantization): Observes activation distributions and protects the salient weights from aggressive quantization.",
          "GPTQ: Second-order optimization that adjusts remaining weights as others are quantized to minimize layer-wise output error.",
          "GGUF: Binary file format engineered by llama.cpp for CPU/GPU offloading and consumer inference."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Affine Symmetric INT8 Quantization & Dequantization in Pure Python",
      description: "Projecting floating-point weight tensors into INT8 (-128 to 127) and reconstructing approximations.",
      code: `def quantize_int8_symmetric(weights):
    # Find absolute maximum to determine scale
    max_val = max(abs(w) for w in weights)
    # Range is -127 to +127
    scale = max_val / 127.0
    
    # Quantize to 8-bit signed integer
    quantized = [min(127, max(-127, round(w / scale))) for w in weights]
    return quantized, scale

def dequantize_int8_symmetric(quantized, scale):
    return [q * scale for q in quantized]

# Synthetic layer weights in FP32
weights_fp32 = [0.852, -0.412, 1.945, -0.015, 0.003, -1.890]
print("Original FP32 weights:\n", weights_fp32)

quantized_int8, scale = quantize_int8_symmetric(weights_fp32)
print("\nQuantized INT8 weights (1 byte each):\n", quantized_int8)
print("Quantization Scale:", round(scale, 6))

reconstructed = dequantize_int8_symmetric(quantized_int8, scale)
print("\nReconstructed FP32 weights:\n", [round(r, 4) for r in reconstructed])

# Calculate Mean Squared Error (MSE)
mse = sum((o - r)**2 for o, r in zip(weights_fp32, reconstructed)) / len(weights_fp32)
print("Quantization Loss (MSE):", round(mse, 6))`
    },
    productionPitfalls: [
      "Quantizing activation tensors naively: Weights are static, but activations change with every prompt and contain extreme outliers.",
      "Assuming INT4 is always faster: INT4 saves VRAM and memory bandwidth, but on compute-bound kernels (short prompts, large batch size), de-quantization arithmetic can introduce small compute overhead.",
      "Evaluating quantized models only on token perplexity rather than task-specific evaluation benchmarks."
    ],
    keyTakeaways: [
      "Rule of thumb VRAM sizing: Model Parameters (in billions) * Bytes per parameter (e.g. 70B in 4-bit = 70 * 0.5 GB = 35 GB + KV-Cache headroom).",
      "AWQ and EXL2 are superior for GPU serving; GGUF is the undisputed king for local desktop/CPU execution.",
      "Quantization is the single most cost-effective lever in applied AI infrastructure."
    ],
    quiz: [
      {
        question: "Approximately how much GPU VRAM is required to load a 70 Billion parameter model quantized to 4-bit precision?",
        options: [
          "~35 to 40 GB (allowing it to fit comfortably on an 80GB A100 or two 24GB GPUs)",
          "~140 GB",
          "~10 GB",
          "~700 GB"
        ],
        correctIndex: 0,
        explanation: "70 billion parameters at 4 bits (0.5 bytes) = 35 GB. Adding buffer for CUDA kernels and KV-cache brings it to ~40 GB."
      }
    ]
  },
  {
    id: "06-inference-engines-vllm",
    number: "06",
    title: "High-Performance Inference Engines & PagedAttention",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    readTime: "22 min",
    motto: "Naive PyTorch inference leaves 80% of GPU compute idle. Modern serving engines treat VRAM like an operating system page table.",
    problemStatement: "Deploying an LLM with vanilla Hugging Face `generate()` results in terrible throughput (5-10 requests/sec), massive memory fragmentation, and huge latency spikes. Production AI engineers must understand Continuous Batching, PagedAttention, and Speculative Decoding.",
    coreConcepts: [
      {
        title: "The Fragmentation Crisis in Traditional KV-Cache Management",
        summary: "Traditional systems pre-allocate contiguous memory chunks for maximum context length (e.g. 4096 tokens), wasting up to 60-80% of VRAM.",
        content: [
          "If a request only uses 200 tokens, the remaining 3896 reserved memory slots sit completely empty (Internal Fragmentation).",
          "Requests cannot share memory even when they have identical system prompts (Prompt Prefix Sharing).",
          "PagedAttention (introduced by vLLM) solves this by partitioning the KV-cache into fixed-size physical blocks (e.g. 16 tokens per block), dynamically mapped via a Virtual Page Table."
        ]
      },
      {
        title: "Continuous Batching (Iteration-Level Batching)",
        summary: "Static batching waits for the longest request in a batch to finish before accepting new requests. Continuous batching inserts new requests on every token step.",
        content: [
          "Static Batching: If request A needs 10 tokens and request B needs 500 tokens, request A's GPU slot is wasted for 490 iterations.",
          "Continuous Batching: As soon as request A finishes and emits `<|endoftext|>`, a new request C enters the batch at iteration 11 without waiting.",
          "This architecture increases production serving throughput by 4x to 10x at the same hardware cost."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Mental Model: Virtual PagedAttention Block Allocator in Python",
      description: "How physical memory blocks are dynamically allocated and mapped to virtual token sequences.",
      code: `class VirtualMemoryManager:
    def __init__(self, block_size=4, total_blocks=10):
        self.block_size = block_size
        self.free_blocks = list(range(total_blocks))
        # Maps request_id -> list of physical block IDs
        self.page_tables = {}
        
    def allocate(self, request_id, num_tokens):
        blocks_needed = (num_tokens + self.block_size - 1) // self.block_size
        if len(self.free_blocks) < blocks_needed:
            raise MemoryError("Out of GPU VRAM physical blocks!")
            
        allocated = [self.free_blocks.pop(0) for _ in range(blocks_needed)]
        self.page_tables[request_id] = allocated
        print(f"[Req {request_id}] {num_tokens} tokens mapped to physical blocks: {allocated}")
        
    def append_token(self, request_id, current_token_count):
        # Check if new block is required
        if current_token_count % self.block_size == 0:
            if not self.free_blocks:
                raise MemoryError("VRAM Exhausted during generation!")
            new_block = self.free_blocks.pop(0)
            self.page_tables[request_id].append(new_block)
            print(f"[Req {request_id}] Exceeded block capacity. Allocated new block {new_block}")
            
    def free(self, request_id):
        blocks = self.page_tables.pop(request_id, [])
        self.free_blocks.extend(blocks)
        print(f"[Req {request_id}] Released blocks {blocks}. Total free blocks: {len(self.free_blocks)}")

# Simulate Serving 2 concurrent requests
vram = VirtualMemoryManager(block_size=4, total_blocks=8)
vram.allocate(request_id="client_A", num_tokens=6)  # Needs 2 blocks
vram.allocate(request_id="client_B", num_tokens=3)  # Needs 1 block

# Token 7 generated for client_A
vram.append_token(request_id="client_A", current_token_count=7)
# Token 8 generated for client_A -> triggers next page allocation
vram.append_token(request_id="client_A", current_token_count=8)

vram.free(request_id="client_B")`
    },
    productionPitfalls: [
      "Measuring only Latency (TTFT) and ignoring Throughput (Tokens Per Second across all users).",
      "Not enabling Chunked Prefill in vLLM, causing long prompt prefills to block running generation steps.",
      "Failing to implement speculative decoding for latency-critical customer-facing tasks."
    ],
    keyTakeaways: [
      "Never use bare `AutoModelForCausalLM` in production; use vLLM, TGI, or TensorRT-LLM.",
      "PagedAttention enables near-zero memory waste and automatic prefix caching (system prompt reuse).",
      "Speculative decoding pairs a small draft model with a large target model to achieve 2x lower latency without accuracy loss."
    ],
    quiz: [
      {
        question: "What is the primary operational advantage of Continuous Batching over traditional Static Batching in LLM serving?",
        options: [
          "It injects new requests at iteration-level token steps instead of waiting for the longest request in a batch to complete",
          "It reduces token size by 50%",
          "It disables the attention mechanism for short sentences",
          "It eliminates the need for GPU VRAM"
        ],
        correctIndex: 0,
        explanation: "Continuous batching schedules work at the iteration level, so fast requests can leave and new requests can enter immediately, keeping the GPU constantly saturated."
      }
    ]
  }
];
