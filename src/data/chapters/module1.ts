import type { Chapter } from '../../types/curriculum';

export const MODULE_1_CHAPTERS: Chapter[] = [
  {
    id: "01-tokens-and-tokenization",
    number: "01",
    title: "Tokens, Vocabulary & Tokenization Mechanics",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    trackNumber: 1,
    readTime: "15 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer'],
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
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts

def merge(ids, pair, idx):
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

text = "low lower newest widest lowest"
tokens = list(text.encode("utf-8"))
vocab_size = 265  # 256 base bytes + 9 merges
merges = {}

for idx in range(256, vocab_size):
    stats = get_stats(tokens)
    if not stats:
        break
    best_pair = max(stats, key=stats.get)
    tokens = merge(tokens, best_pair, idx)
    merges[best_pair] = idx

print("Trained BPE Vocab Size:", len(merges) + 256)`
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
    ],
    lectures: [
      {
        title: "Let's build the GPT Tokenizer",
        speaker: "Andrej Karpathy",
        url: "https://www.youtube.com/watch?v=zduSFxRajkE",
        youtubeId: "zduSFxRajkE",
        duration: "2h 13m",
        timestampedTakeaways: [
          { time: "00:08:30", takeaway: "Why LLMs cannot do simple spelling and reverse words without character tokenization" },
          { time: "00:23:45", takeaway: "UTF-8 byte encodings vs Unicode code points representation" },
          { time: "00:45:10", takeaway: "Byte-Pair Encoding (BPE) merge loop algorithm line-by-line" },
          { time: "01:15:20", takeaway: "Why regex splitting (e.g., GPT-4's cl100k pattern) is necessary to avoid merging across letter/number boundaries" }
        ]
      }
    ],
    simulatorType: 'vector',
    labs: {
      problemA: {
        title: "Algorithmic Lab: BPE Tokenizer Trainer & Priority Queue Merger",
        subtitle: "Core DSA: Hash Maps, Priority Queues, Doubly Linked Lists",
        problemStatement: "Implement a function `train_bpe(corpus: str, num_merges: int) -> dict[tuple[int, int], int]` that extracts byte tokens from a raw string corpus, finds the most frequent adjacent pair, replaces it with a new token index (starting at 256), and returns the dictionary of ordered merges.",
        constraints: [
          "Input is standard ASCII / UTF-8 text.",
          "Must handle tie-breaking deterministically by lowest lexicographical pair tuple.",
          "Time complexity per merge should be O(N) where N is current token sequence length."
        ],
        starterCode: `def train_bpe(corpus: str, num_merges: int) -> dict[tuple[int, int], int]:
    # TODO: Encode corpus to UTF-8 bytes
    # TODO: In each of num_merges iterations, find most frequent pair and merge
    pass`,
        solutionCode: `def train_bpe(corpus: str, num_merges: int) -> dict[tuple[int, int], int]:
    tokens = list(corpus.encode("utf-8"))
    merges = {}
    next_id = 256
    
    for _ in range(num_merges):
        counts = {}
        for pair in zip(tokens, tokens[1:]):
            counts[pair] = counts.get(pair, 0) + 1
        if not counts:
            break
        # Pick most frequent, tie-break by pair values
        best_pair = max(counts.keys(), key=lambda p: (counts[p], -p[0], -p[1]))
        if counts[best_pair] < 2:
            break  # No meaningful repetitions left
            
        merges[best_pair] = next_id
        new_tokens = []
        i = 0
        while i < len(tokens):
            if i < len(tokens) - 1 and (tokens[i], tokens[i+1]) == best_pair:
                new_tokens.append(next_id)
                i += 2
            else:
                new_tokens.append(tokens[i])
                i += 1
        tokens = new_tokens
        next_id += 1
        
    return merges`,
        testCases: [
          {
            input: 'train_bpe("aaabdaaabac", 3)',
            expectedOutput: '{(97, 97): 256, (256, 97): 257, (257, 98): 258}',
            explanation: "'aa' (97, 97) is merged first into 256, then 'aaa' becomes (256, 97) -> 257."
          }
        ]
      },
      problemB: {
        title: "Production Debugging: The Multilingual Token Inflation & Truncation Bug",
        subtitle: "Production Systems Bug: Truncation logic slicing raw strings instead of token bounds",
        problemStatement: "A production customer support bot receives Hindi, Japanese, and English complaints. The engineer wrote `user_input[:4000]` assuming 4,000 characters is safely within an 8,000-token context window. Explain the catastrophic failure mode and rewrite the truncation layer using token counts and safe UTF-8 boundaries.",
        starterCode: `def prepare_context_naive(user_prompt: str, max_chars: int = 4000) -> str:
    # BUGGY: naive string slice can split multi-byte characters and ignores token inflation!
    return user_prompt[:max_chars]`,
        solutionCode: `import tiktoken

def prepare_context_safe(user_prompt: str, max_tokens: int = 2000, model: str = "gpt-4o") -> str:
    enc = tiktoken.encoding_for_model(model)
    tokens = enc.encode(user_prompt)
    if len(tokens) <= max_tokens:
        return user_prompt
    # Truncate at exact token boundary and decode safely
    truncated_tokens = tokens[:max_tokens]
    return enc.decode(truncated_tokens)`,
        testCases: [
          {
            input: 'Multilingual string with 4-byte Devanagari or Kanji characters',
            expectedOutput: 'Never raises UnicodeDecodeError, guarantees output token count <= max_tokens',
            explanation: "Slicing strings arbitrarily can sever a 3-byte character in half, creating invalid byte sequences (), and ignores that 1,000 Japanese characters can be 3,000 tokens."
          }
        ]
      }
    }
  },
  {
    id: "02-embeddings-and-vector-space",
    number: "02",
    title: "Embeddings & Vector Space Geometry",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    trackNumber: 1,
    readTime: "16 min",
    targetRoles: ['ai-engineer', 'agent-architect'],
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
    return [a / mag for a in v] if mag > 0 else v

def cosine_similarity(v1, v2):
    mag1, mag2 = magnitude(v1), magnitude(v2)
    return dot_product(v1, v2) / (mag1 * mag2) if mag1 and mag2 else 0.0

query_vec = [0.12, -0.45, 0.88, 0.05]
doc_vec = [0.10, -0.42, 0.91, 0.02]
print("Cosine Sim:", round(cosine_similarity(query_vec, doc_vec), 4))
print("Dot Product of L2-Normalized:", round(dot_product(l2_normalize(query_vec), l2_normalize(doc_vec)), 4))`
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
    ],
    simulatorType: 'vector',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Batch L2 Normalization & Top-K Cosine Retrieval",
        subtitle: "Core DSA: Linear Algebra, Heaps / Min-Heap for Top-K",
        problemStatement: "Given a query vector Q of dimension D and a matrix of N document vectors, implement `top_k_cosine(query, docs, k)` that normalizes all vectors and returns the indices of the top K highest scoring documents using a min-heap without sorting all N scores.",
        constraints: [
          "Dimensions D up to 1536, N up to 50,000.",
          "Must achieve O(N * D + N * log K) complexity."
        ],
        starterCode: `import heapq

def top_k_cosine(query: list[float], docs: list[list[float]], k: int) -> list[tuple[int, float]]:
    # TODO: Implement L2 normalization and min-heap tracking
    pass`,
        solutionCode: `import math, heapq

def top_k_cosine(query: list[float], docs: list[list[float]], k: int) -> list[tuple[int, float]]:
    q_mag = math.sqrt(sum(x * x for x in query))
    if q_mag == 0: return []
    q_norm = [x / q_mag for x in query]
    
    # Min-heap of size k storing (score, doc_index)
    heap = []
    
    for idx, doc in enumerate(docs):
        d_mag = math.sqrt(sum(y * y for y in doc))
        if d_mag == 0: continue
        # Dot product of normalized vectors
        score = sum(q * (d / d_mag) for q, d in zip(q_norm, doc))
        
        if len(heap) < k:
            heapq.heappush(heap, (score, idx))
        elif score > heap[0][0]:
            heapq.heapreplace(heap, (score, idx))
            
    # Return sorted descending by score
    return [(idx, score) for score, idx in sorted(heap, key=lambda x: x[0], reverse=True)]`,
        testCases: [
          {
            input: 'query=[1, 0], docs=[[1, 1], [0, 1], [2, 0]], k=2',
            expectedOutput: '[(2, 1.0), (0, 0.7071)]',
            explanation: "Doc 2 is collinear with query (cos=1.0), Doc 0 has angle 45 deg (cos=0.7071)."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Dimensionality Mismatch Outage",
        subtitle: "Production Systems Bug: Storing mismatched vector dimension in PostgreSQL pgvector",
        problemStatement: "An engineering team upgraded their embedding pipeline from `text-embedding-ada-002` (1536 dims) to `text-embedding-3-large` (3072 dims). Production queries started returning HTTP 500 errors and degraded search relevance. Identify the root cause across index configuration, query normalization, and pgvector table schemas.",
        starterCode: `# Buggy Migration:
# ALTER TABLE documents ADD COLUMN embedding vector(1536);
# client.embeddings.create(model="text-embedding-3-large", input=chunk) # outputs 3072 dims!`,
        solutionCode: `-- Correct Migration:
ALTER TABLE documents ALTER COLUMN embedding TYPE vector(3072);
-- Or leverage Matryoshka dimension truncation to 1536 if retaining existing index:
-- client.embeddings.create(model="text-embedding-3-large", dimensions=1536, input=chunk);
-- Re-index with HNSW cosine operator class:
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);`,
        testCases: [
          {
            input: 'Vector length 3072 inserted into vector(1536) column',
            expectedOutput: 'SQLSTATE 22000: different vector dimensions 3072 and 1536',
            explanation: "pgvector strictly validates dimensionality at the column type constraint."
          }
        ]
      }
    }
  },
  {
    id: "03-attention-and-kv-cache",
    number: "03",
    title: "Transformer Architecture & KV-Cache Lifecycle",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    trackNumber: 1,
    readTime: "20 min",
    targetRoles: ['ai-engineer', 'agent-architect'],
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
    scale = math.sqrt(d_k)
    scores = [sum(a * b for a, b in zip(q, k)) / scale for k in keys]
    weights = softmax(scores)
    dim = len(values[0])
    out = [sum(w * v[d] for w, v in zip(weights, values)) for d in range(dim)]
    return out, weights

d_k = 4
kv_k = [[1.0, 0.0, 1.0, 0.0], [0.0, 1.0, 0.0, 1.0]]
kv_v = [[0.5, 0.2, 0.1, 0.8], [0.2, 0.9, 0.4, 0.3]]

q_3 = [0.8, 0.5, 0.2, 0.9]
kv_k.append([0.1, 0.9, 0.2, 0.8])
kv_v.append([0.3, 0.7, 0.6, 0.4])

output, weights = scaled_dot_product_attention(q_3, kv_k, kv_v, d_k)
print("Context Output Vector:", [round(x, 3) for x in output])`
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
    ],
    lectures: [
      {
        title: "Let's build GPT: from scratch, in code, spelled out",
        speaker: "Andrej Karpathy",
        url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
        youtubeId: "kCc8FmEb1nY",
        duration: "1h 56m",
        timestampedTakeaways: [
          { time: "00:15:00", takeaway: "Linear projection into Query, Key, and Value spaces" },
          { time: "00:38:00", takeaway: "Scaled Dot-Product Attention derivation and variance normalization" },
          { time: "00:52:15", takeaway: "Causal masking (lower triangular matrix) preventing future token peek" },
          { time: "01:22:00", takeaway: "Residual connections and LayerNorm stabilization" }
        ]
      },
      {
        title: "Let's reproduce GPT-2 (124M)",
        speaker: "Andrej Karpathy",
        url: "https://www.youtube.com/watch?v=l8pRSuU81PU",
        youtubeId: "l8pRSuU81PU",
        duration: "4h 12m",
        timestampedTakeaways: [
          { time: "00:32:00", takeaway: "Weight tying between embedding matrix and final output classifier" },
          { time: "01:14:00", takeaway: "FlashAttention kernel speedups and memory footprint savings" }
        ]
      }
    ],
    simulatorType: 'kv-cache',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Grouped-Query Attention (GQA) Head Expansion",
        subtitle: "Core DSA: Tensor Reshaping & Strided Indexing",
        problemStatement: "In LLaMA 3, 32 Query heads share 8 Key/Value heads (GQA with ratio 4:1). Write a pure Python function `expand_kv_heads(kv_tensor: list[list[float]], num_query_heads: int, num_kv_heads: int) -> list[list[float]]` that repeats each KV head across its corresponding Query head partition.",
        starterCode: `def expand_kv_heads(kv_tensor: list[list[float]], num_q: int, num_kv: int) -> list[list[float]]:
    # Repeat each KV head (num_q // num_kv) times
    pass`,
        solutionCode: `def expand_kv_heads(kv_tensor: list[list[float]], num_q: int, num_kv: int) -> list[list[float]]:
    if num_q % num_kv != 0:
        raise ValueError("Query heads must be a multiple of KV heads")
    ratio = num_q // num_kv
    expanded = []
    for head in kv_tensor:
        for _ in range(ratio):
            expanded.append(list(head))
    return expanded`,
        testCases: [
          {
            input: 'kv_tensor=[[1.0], [2.0]], num_q=4, num_kv=2',
            expectedOutput: '[[1.0], [1.0], [2.0], [2.0]]',
            explanation: "Each of the 2 KV heads is broadcast 2 times to match the 4 Query heads."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The OOM KV-Cache Spill",
        subtitle: "Production Systems Bug: Dynamic context length spike exhausting VRAM",
        problemStatement: "A vLLM deployment handles 50 concurrent requests. During peak load, several users submit 64k-token prompts, causing CUDA Out-of-Memory crashes for all existing active sessions. Propose the system configuration changes in vLLM to enforce request preemption, chunked prefill, and max model len caps.",
        starterCode: `# vLLM startup:
# python -m vllm.entrypoints.openai.api_server --model meta-llama/Meta-Llama-3-8B-Instruct`,
        solutionCode: `# Production-hardened vLLM configuration:
python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Meta-Llama-3-8B-Instruct \\
  --max-model-len 32768 \\
  --gpu-memory-utilization 0.90 \\
  --enable-chunked-prefill \\
  --max-num-batched-tokens 4096 \\
  --swap-space 16`,
        testCases: [
          {
            input: 'Chunked prefill enabled + max-num-batched-tokens capped',
            expectedOutput: 'Long prefills chunked into 4096-token slices, preventing decode-phase starvation and OOM.',
            explanation: "Chunked prefill interleaves prefill and decode tokens, maintaining strict memory limits."
          }
        ]
      }
    }
  },
  {
    id: "04-next-token-sampling",
    number: "04",
    title: "Next-Token Generation & Sampling Mechanics",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    trackNumber: 1,
    readTime: "14 min",
    targetRoles: ['ai-engineer', 'agent-architect'],
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
      code: `import math, random

def softmax_with_temp(logits, temperature=1.0):
    if temperature <= 0.0001:
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
    indexed = sorted(list(enumerate(probs)), key=lambda x: x[1], reverse=True)
    cumulative = 0.0
    filtered = []
    for idx, prob in indexed:
        filtered.append((idx, prob))
        cumulative += prob
        if cumulative >= p: break
    total_p = sum(p for _, p in filtered)
    norm_probs = [p / total_p for _, p in filtered]
    r = random.random()
    acc = 0.0
    for (orig_idx, _), np in zip(filtered, norm_probs):
        acc += np
        if r <= acc: return orig_idx
    return filtered[-1][0]

raw_logits = [8.5, 8.2, 7.9, 1.2, 0.4]
prob_low_t = softmax_with_temp(raw_logits, temperature=0.2)
print("Low Temp (0.2) Probabilities:", [round(p, 4) for p in prob_low_t])`
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
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Min-p Dynamic Threshold Filtering",
        subtitle: "Core DSA: Prefix Scanning & Dynamic Quantiles",
        problemStatement: "Implement `min_p_filter(probs: list[float], min_p_ratio: float = 0.05) -> list[float]` which finds the maximum probability $P_{top}$, calculates the cutoff threshold $T = P_{top} \\times \\text{min\\_p\\_ratio}$, zeroes out any token whose probability is below $T$, and re-normalizes the remaining probabilities.",
        starterCode: `def min_p_filter(probs: list[float], min_p_ratio: float = 0.05) -> list[float]:
    # TODO: Calculate threshold and re-normalize
    pass`,
        solutionCode: `def min_p_filter(probs: list[float], min_p_ratio: float = 0.05) -> list[float]:
    if not probs: return []
    p_max = max(probs)
    threshold = p_max * min_p_ratio
    filtered = [p if p >= threshold else 0.0 for p in probs]
    total = sum(filtered)
    return [p / total for p in filtered] if total > 0 else probs`,
        testCases: [
          {
            input: 'probs=[0.8, 0.15, 0.03, 0.02], min_p_ratio=0.05',
            expectedOutput: '[0.8421, 0.1579, 0.0, 0.0]',
            explanation: "p_max=0.8, cutoff = 0.8 * 0.05 = 0.04. 0.03 and 0.02 are pruned."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Non-Deterministic JSON Schema Outage",
        subtitle: "Production Systems Bug: High temperature causing corrupted trailing brackets",
        problemStatement: "A background invoice-processing worker uses GPT-4 with temperature=0.7 and json_object response format. 1.5% of responses fail `json.loads` because of hallucinated explanations after the closing brace. Implement the deterministic fix using temperature=0 and logit bias/pydantic validation.",
        starterCode: `response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": invoice_text}],
    temperature=0.7 # BUG: non-zero temperature produces non-deterministic schema deviations
)`,
        solutionCode: `response = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": invoice_text}],
    temperature=0.0, # Deterministic argmax decoding
    response_format=InvoiceDataSchema # Enforces Grammar-Constrained Decoding
)`,
        testCases: [
          {
            input: 'temperature=0.0 with Structured Outputs',
            expectedOutput: '100% syntactically valid JSON matching Pydantic schema across 10,000 runs',
            explanation: "Grammar-constrained decoding masks invalid token logits at every decoding step."
          }
        ]
      }
    }
  },
  {
    id: "05-quantization-and-compression",
    number: "05",
    title: "Quantization & Model Compression Mechanics",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    trackNumber: 1,
    readTime: "18 min",
    targetRoles: ['ai-engineer', 'agent-architect'],
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
    max_val = max(abs(w) for w in weights)
    scale = max_val / 127.0
    quantized = [min(127, max(-127, round(w / scale))) for w in weights]
    return quantized, scale

def dequantize_int8_symmetric(quantized, scale):
    return [q * scale for q in quantized]

weights_fp32 = [0.852, -0.412, 1.945, -0.015, 0.003, -1.890]
quantized_int8, scale = quantize_int8_symmetric(weights_fp32)
reconstructed = dequantize_int8_symmetric(quantized_int8, scale)
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
    ],
    simulatorType: 'lora',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Asymmetric INT4 Quantizer with Zero-Point",
        subtitle: "Core DSA: Fixed-Point Arithmetic & Bit Packing",
        problemStatement: "Implement `quantize_int4_asymmetric(weights: list[float]) -> tuple[list[int], float, int]` that maps floating point numbers to the unsigned integer range [0, 15] by computing dynamic `scale` and integer `zero_point`.",
        starterCode: `def quantize_int4_asymmetric(weights: list[float]) -> tuple[list[int], float, int]:
    # Range is 0 to 15
    pass`,
        solutionCode: `def quantize_int4_asymmetric(weights: list[float]) -> tuple[list[int], float, int]:
    w_min, w_max = min(weights), max(weights)
    if w_min == w_max: return [0] * len(weights), 1.0, 0
    scale = (w_max - w_min) / 15.0
    zero_point = round(-w_min / scale)
    quantized = [min(15, max(0, round(w / scale + zero_point))) for w in weights]
    return quantized, scale, zero_point`,
        testCases: [
          {
            input: 'weights=[-2.0, 0.0, 2.0]',
            expectedOutput: 'quantized=[0, 8, 15], scale=0.2667, zero_point=8',
            explanation: "-2.0 maps to min 0, 0.0 maps to midpoint 8, 2.0 maps to max 15."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Outlier Activation Perplexity Collapse",
        subtitle: "Production Systems Bug: RTN (Round-to-Nearest) breaking reasoning on 70B models",
        problemStatement: "A team quantized an 8B coding model with standard RTN INT4 and noticed syntax error rates spiked from 3% to 42%. Analyze why RTN fails on transformer FFN layers and configure AWQ with calibration data to protect outlier channels.",
        starterCode: `# Buggy naive quant:
# model.quantize(bits=4, method="rtn")`,
        solutionCode: `# Fix: Use Activation-aware Weight Quantization (AWQ)
from awq import AutoAWQForCausalLM
model = AutoAWQForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")
model.quantize(
    quant_config={"zero_point": True, "q_group_size": 128, "w_bit": 4, "version": "GEMM"},
    calib_data="pileval" # Uses calibration activations to identify outlier channels
)`,
        testCases: [
          {
            input: 'AWQ vs RTN on HumanEval code benchmark',
            expectedOutput: 'AWQ preserves 99.2% of FP16 pass@1, whereas RTN degrades by >30%.',
            explanation: "AWQ multiplies salient weights by activation magnitude before quantizing, minimizing output error."
          }
        ]
      }
    }
  },
  {
    id: "06-inference-engines-vllm",
    number: "06",
    title: "High-Performance Inference Engines & PagedAttention",
    moduleId: "substrate",
    moduleName: "The Model & Inference Substrate",
    trackNumber: 1,
    readTime: "22 min",
    targetRoles: ['ai-engineer', 'agent-architect'],
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
        self.page_tables = {}
        
    def allocate(self, request_id, num_tokens):
        blocks_needed = (num_tokens + self.block_size - 1) // self.block_size
        if len(self.free_blocks) < blocks_needed:
            raise MemoryError("Out of GPU VRAM physical blocks!")
        self.page_tables[request_id] = [self.free_blocks.pop(0) for _ in range(blocks_needed)]
        
    def append_token(self, request_id, current_token_count):
        if current_token_count % self.block_size == 0:
            if not self.free_blocks: raise MemoryError("VRAM Exhausted!")
            self.page_tables[request_id].append(self.free_blocks.pop(0))

vram = VirtualMemoryManager(block_size=4, total_blocks=8)
vram.allocate(request_id="client_A", num_tokens=6)
print("Page table for client_A:", vram.page_tables["client_A"])`
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
    ],
    simulatorType: 'kv-cache',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Speculative Decoding Acceptance Verifier",
        subtitle: "Core DSA: Rejection Sampling & Probability Ratio Checks",
        problemStatement: "In speculative decoding, a small draft model predicts K tokens $x_1, \\dots, x_K$ with draft probabilities $q(x)$. A target model evaluates the sequence in parallel with target probabilities $p(x)$. Implement `verify_speculative_tokens(draft_tokens, q_probs, p_probs) -> list[int]` using the exact standard acceptance criterion $\\min(1, p(x)/q(x))$.",
        starterCode: `import random

def verify_speculative_tokens(tokens: list[int], q_probs: list[float], p_probs: list[float]) -> list[int]:
    # TODO: Implement rejection sampling
    pass`,
        solutionCode: `import random

def verify_speculative_tokens(tokens: list[int], q_probs: list[float], p_probs: list[float]) -> list[int]:
    accepted = []
    for tok, q, p in zip(tokens, q_probs, p_probs):
        if p >= q:
            accepted.append(tok)
        else:
            accept_prob = p / q
            if random.random() <= accept_prob:
                accepted.append(tok)
            else:
                break # First rejected token halts draft sequence
    return accepted`,
        testCases: [
          {
            input: 'tokens=[1, 2, 3], q=[0.8, 0.7, 0.9], p=[0.9, 0.8, 0.05]',
            expectedOutput: 'tokens 1 and 2 guaranteed accepted, token 3 rejected',
            explanation: "Token 1 and 2 have p >= q (100% accepted). Token 3 has p/q = 0.05/0.9 = 5.5% acceptance probability."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The TTFT vs TPS Sla Trade-off",
        subtitle: "Production Systems Bug: High batch size causing 5,000ms Time-To-First-Token",
        problemStatement: "A customer chatbot requires TTFT < 600ms and TPS > 30. Under 200 concurrent users, TTFT ballooned to 6,200ms because new prompt prefills were queued behind active generation steps. Architect the split-worker configuration (disaggregated prefill and decode) to solve this.",
        starterCode: `# Current config:
# Single vLLM instance serving both prefill and decode concurrently`,
        solutionCode: `# Disaggregated Prefill & Decode Architecture:
# Worker 1 (Prefill Nodes): High FLOP GPUs (e.g. 4x H100) running prefill only, transferring KV-cache via RDMA/NVSwitch.
# Worker 2 (Decode Nodes): High HBM Memory Bandwidth GPUs streaming autoregressive generation tokens.
# Or configure vLLM chunked prefill: --enable-chunked-prefill --max-num-batched-tokens 2048`,
        testCases: [
          {
            input: 'Disaggregated Prefill/Decode or Chunked Prefill enabled',
            expectedOutput: 'TTFT reduced from 6,200ms to 480ms without sacrificing overall server throughput',
            explanation: "Prevents massive prompt prefills from starving ongoing token decode streaming."
          }
        ]
      }
    }
  }
];
