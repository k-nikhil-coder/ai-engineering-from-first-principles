import type { Chapter } from '../../types/curriculum';

export const MODULE_2_CHAPTERS: Chapter[] = [
  {
    id: "07-prompt-architecture-structured-outputs",
    number: "07",
    title: "Prompt Architecture & Structured Outputs",
    moduleId: "context",
    moduleName: "Context & Retrieval Engineering",
    readTime: "17 min",
    motto: "Hope is not an engineering strategy; prompt formatting is a software specification enforced by formal grammars.",
    problemStatement: "Directing an LLM to 'Respond in valid JSON' inevitably fails at scale under unexpected edge cases or adversarial input. Production systems require deterministic schema guarantees through grammar-constrained decoding (e.g. Outlines, Instructor, OpenAI Structured Outputs) rather than regex retries.",
    coreConcepts: [
      {
        title: "Prompt Anatomy: System, Developer, Context, and User Layers",
        summary: "A robust prompt is not a single blob of text; it is an onion architecture with distinct trust boundaries.",
        content: [
          "System Instructions: High-privilege root rules, output formatting constraints, and safety guardrails.",
          "Dynamic Context: Untrusted injected knowledge (retrieved RAG chunks, user database records) that must be quarantined using XML tags or markdown delimiters.",
          "Few-Shot Exemplars: Demonstrations showing input/output pairs to calibrate edge cases, tone, and reasoning depth.",
          "User Input: Low-privilege runtime instructions."
        ]
      },
      {
        title: "Grammar-Constrained Decoding at the Logit Level",
        summary: "How modern structured output engines guarantee 100% syntactically valid JSON without retries.",
        content: [
          "The engine compiles a JSON Schema or Pydantic model into a Context-Free Grammar (CFG) or Finite State Machine (FSM).",
          "At every generation step, before sampling a token, the FSM determines which tokens in the vocabulary are syntactically valid next characters.",
          "Invalid tokens have their logits masked to -infinity. The model is mathematically incapable of emitting invalid syntax (e.g. It cannot emit a letter where a comma or closing quote is required)."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Mental Model: Finite State Machine (FSM) Logit Masker in Python",
      description: "Simulating how structured decoding masks invalid tokens based on the current JSON parsing state.",
      code: `class SimpleJsonFSM:
    """State machine tracking basic key-value JSON syntax."""
    STATE_EXPECT_START = 0
    STATE_EXPECT_KEY = 1
    STATE_EXPECT_COLON = 2
    STATE_EXPECT_VAL = 3
    STATE_EXPECT_END = 4

    def __init__(self):
        self.state = self.STATE_EXPECT_START

    def get_allowed_tokens(self, vocab):
        """Mask logits based on current FSM state."""
        allowed = []
        for token_id, token_str in enumerate(vocab):
            if self.state == self.STATE_EXPECT_START and token_str == "{":
                allowed.append(token_id)
            elif self.state == self.STATE_EXPECT_KEY and token_str.startswith('"'):
                allowed.append(token_id)
            elif self.state == self.STATE_EXPECT_COLON and token_str == ":":
                allowed.append(token_id)
            elif self.state == self.STATE_EXPECT_VAL and (token_str.isdigit() or token_str.startswith('"')):
                allowed.append(token_id)
            elif self.state == self.STATE_EXPECT_END and token_str == "}":
                allowed.append(token_id)
        return allowed

    def step(self, token_str):
        if self.state == self.STATE_EXPECT_START and token_str == "{":
            self.state = self.STATE_EXPECT_KEY
        elif self.state == self.STATE_EXPECT_KEY:
            self.state = self.STATE_EXPECT_COLON
        elif self.state == self.STATE_EXPECT_COLON:
            self.state = self.STATE_EXPECT_VAL
        elif self.state == self.STATE_EXPECT_VAL:
            self.state = self.STATE_EXPECT_END

# Simulated vocabulary
vocab = ["{", '"name"', ":", '"Alice"', "}", "while", "class", "123"]
fsm = SimpleJsonFSM()

print("Step 0 Allowed Tokens:", [vocab[i] for i in fsm.get_allowed_tokens(vocab)])
fsm.step("{")
print("Step 1 Allowed Tokens:", [vocab[i] for i in fsm.get_allowed_tokens(vocab)])
fsm.step('"name"')
print("Step 2 Allowed Tokens:", [vocab[i] for i in fsm.get_allowed_tokens(vocab)])`
    },
    productionPitfalls: [
      "Asking the LLM to format JSON via free-form text prompting without schema constraints.",
      "Injecting untrusted user documents directly into the prompt without delimiter isolation, allowing prompt injections.",
      "Over-specifying few-shot examples that bias the model towards mimicking the example data instead of real inputs."
    ],
    keyTakeaways: [
      "Always use Structured Outputs / Grammar Constrained Decoding for backend API integrations.",
      "Isolate retrieved context inside explicit XML tags: `<context>...</context>`.",
      "Never trust unvalidated JSON strings in production; validate against Pydantic or Zod schemas."
    ],
    quiz: [
      {
        question: "How does Grammar-Constrained Decoding guarantee that an LLM outputs syntactically valid JSON?",
        options: [
          "It masks the logits of syntactically invalid tokens to negative infinity at each step based on a state machine",
          "It prompts the model three times and averages the results",
          "It runs a post-processing regex on the output text",
          "It uses a separate smaller model to rewrite errors"
        ],
        correctIndex: 0,
        explanation: "By converting the JSON schema into a state machine, the inference engine sets logits of all tokens that would violate the grammar to -infinity before sampling."
      }
    ]
  },
  {
    id: "08-context-window-dynamics",
    number: "08",
    title: "Context Window Dynamics & Compaction",
    moduleId: "context",
    moduleName: "Context & Retrieval Engineering",
    readTime: "18 min",
    motto: "A 1-million-token context window does not mean 1-million-token perfect recall. Attention degrades with distance.",
    problemStatement: "The 'Lost in the Middle' phenomenon proves that transformer attention is heavily biased toward the beginning (primacy effect) and end (recency effect) of the context window. Stuttering multi-turn conversation histories explode costs and degrade model reasoning unless compacted intelligently.",
    coreConcepts: [
      {
        title: "The Attention Degradation Curve (Lost in the Middle)",
        summary: "Empirical studies reveal that information placed in the middle 60% of large context windows is significantly harder for models to retrieve.",
        content: [
          "Position encodings (like RoPE or ALiBi) decay attention scores over long relative token distances.",
          "Key takeaway for RAG: Rank the most critical, high-relevance retrieved documents at the very top (first) and very bottom (last) of the context prompt.",
          "Never bury instructions beneath thousands of tokens of raw reference material."
        ]
      },
      {
        title: "Context Compaction Strategies: Sliding Window vs. Recursive Summarization",
        summary: "How to manage state in long-running autonomous agents and multi-day user sessions.",
        content: [
          "Sliding Window (FIFO): Drops oldest messages. Problem: Erases critical initial system constraints and user preferences.",
          "Recursive Summarization: Periodically feeds past turns into a background LLM to produce a running state delta, retaining recent turns verbatim.",
          "Structured State Extraction: Extracts specific entities, decisions, and tasks into a typed JSON state object instead of free-form conversation text."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Context Compactor & Priority Re-ranker in Python",
      description: "Mitigating 'Lost in the Middle' by interleaving high-priority chunks at prompt boundaries.",
      code: `def arrange_for_lost_in_the_middle(chunks_ranked):
    """
    Given chunks sorted by descending relevance [1, 2, 3, 4, 5, 6...],
    distribute them so the highest relevance chunks sit at the extremes
    (start and end) where attention recall is strongest.
    """
    reordered = [None] * len(chunks_ranked)
    left = 0
    right = len(chunks_ranked) - 1
    
    for i, chunk in enumerate(chunks_ranked):
        if i % 2 == 0:
            reordered[left] = chunk
            left += 1
        else:
            reordered[right] = chunk
            right -= 1
    return reordered

# Synthetic retrieved chunks scored by relevance
chunks = [
    {"id": "doc_1", "score": 0.95},
    {"id": "doc_2", "score": 0.91},
    {"id": "doc_3", "score": 0.85},
    {"id": "doc_4", "score": 0.78},
    {"id": "doc_5", "score": 0.72},
    {"id": "doc_6", "score": 0.65}
]

optimized = arrange_for_lost_in_the_middle(chunks)
print("Position in Prompt -> Chunk ID (Score):")
for pos, c in enumerate(optimized):
    print(f"Index {pos}: {c['id']} ({c['score']})")`
    },
    productionPitfalls: [
      "Stuffing 100k tokens into a prompt just because the model supports it, ballooning latency from 500ms to 8,000ms.",
      "Summarizing summaries iteratively without anchoring to original source entities, resulting in semantic drift.",
      "Placing system instructions at the top and 50 dense documents after it without repeating the expected output format at the very end."
    ],
    keyTakeaways: [
      "Keep context prompts lean; more tokens = higher latency, higher cost, lower reasoning precision.",
      "Always repeat the final output instruction at the very end of the prompt right before the assistant trigger.",
      "Use hierarchical structured state rather than raw conversation logs for multi-turn automations."
    ],
    quiz: [
      {
        question: "Where in a long context window does an LLM exhibit the weakest recall for retrieved facts?",
        options: [
          "In the middle 40%–70% of the prompt",
          "At the very beginning of the prompt",
          "At the very end of the prompt",
          "Recall is identical throughout the entire window"
        ],
        correctIndex: 0,
        explanation: "Research ('Lost in the Middle' by Liu et al.) demonstrates that transformer attention recall forms a U-shaped curve, with performance dropping significantly in the middle."
      }
    ]
  },
  {
    id: "09-vector-search-hnsw",
    number: "09",
    title: "Vector Search & Indexing Internals",
    moduleId: "context",
    moduleName: "Context & Retrieval Engineering",
    readTime: "21 min",
    motto: "Exhaustive kNN search across 10 million vectors takes seconds. Approximate Nearest Neighbors (ANN) does it in 3 milliseconds.",
    problemStatement: "Brute-force exact search compares a query vector against every single vector in a database ($O(N \\times D)$). In production datasets with millions of documents, this destroys SLA latency. Vector databases rely on Approximate Nearest Neighbor (ANN) algorithms like HNSW and IVF-PQ.",
    coreConcepts: [
      {
        title: "Hierarchical Navigable Small World (HNSW) Graphs",
        summary: "The multi-layer skip-list graph algorithm that powers Milvus, Qdrant, Pinecone, and pgvector.",
        content: [
          "Inspired by the 'six degrees of separation' small-world network theory.",
          "Layered structure: Top layers have sparse, long-range links for fast greedy routing across the vector space. Bottom layers have dense, local clustering links for fine-grained neighbor discovery.",
          "Search complexity drops from O(N) to O(log N) with high recall (>95%)."
        ]
      },
      {
        title: "Product Quantization (PQ) and IVF",
        summary: "Compressing high-dimensional vectors to fit billions of embeddings in RAM.",
        content: [
          "Inverted File Index (IVF): Partitions the vector space into Voronoi cells using k-means clustering. At query time, only the closest centroid clusters are searched.",
          "Product Quantization (PQ): Chops a 1536-dimensional vector into 64 sub-vectors of 24 dimensions, quantizing each sub-vector to 8 bits. Reduces vector storage by 95%."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Pure Python Navigable Small World (NSW) 2D Graph Search",
      description: "Greedy graph traversal demonstrating how small-world networks route queries to nearest neighbors in logarithmic time.",
      code: `import math

def dist(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

class NSWGraph:
    def __init__(self):
        self.nodes = {}  # node_id -> (x, y)
        self.edges = {}  # node_id -> set of neighbor_ids
        
    def add_node(self, node_id, point, neighbors):
        self.nodes[node_id] = point
        self.edges[node_id] = set(neighbors)
        for n in neighbors:
            self.edges[n].add(node_id)
            
    def greedy_search(self, query, entry_node_id):
        current = entry_node_id
        current_dist = dist(query, self.nodes[current])
        path = [current]
        
        while True:
            improved = False
            for neighbor in self.edges[current]:
                d = dist(query, self.nodes[neighbor])
                if d < current_dist:
                    current = neighbor
                    current_dist = d
                    path.append(current)
                    improved = True
                    break
            if not improved:
                break
        return current, self.nodes[current], path

# Construct a simple small-world 2D network
graph = NSWGraph()
graph.add_node("A", (0.0, 0.0), [])
graph.add_node("B", (1.0, 2.0), ["A"])
graph.add_node("C", (3.0, 3.0), ["B"])
graph.add_node("D", (5.0, 5.0), ["C", "A"])  # Long-range link
graph.add_node("E", (5.2, 5.1), ["D"])        # Local cluster

query = (5.3, 5.0)
nearest, coords, hops = graph.greedy_search(query, entry_node_id="A")
print(f"Target query: {query}")
print(f"Routing path traversed: {' -> '.join(hops)}")
print(f"Nearest neighbor found: {nearest} at {coords}")`
    },
    productionPitfalls: [
      "Over-indexing memory: Storing uncompressed 1536-dim FP32 vectors for 10M chunks requires ~60 GB of expensive RAM; use scalar or product quantization.",
      "Neglecting metadata filtering performance: Naive post-filtering can cause empty result sets; ensure your vector DB supports single-stage graph filtering.",
      "Assuming high cosine similarity always means factual relevance."
    ],
    keyTakeaways: [
      "HNSW balances query speed and recall better than almost any other index type, at the cost of higher build memory.",
      "IVF-PQ trades a slight amount of recall accuracy for massive memory compression and multi-billion scale search.",
      "Always benchmark your query latency under concurrent production read/write loads."
    ],
    quiz: [
      {
        question: "Why does HNSW organize vectors into multiple hierarchical layers?",
        options: [
          "Top layers have long-range links for fast coarse routing, while lower layers provide dense local refinement",
          "It is required by the GPU matrix arithmetic hardware",
          "Each layer corresponds to a different language",
          "To enforce access-control security permissions"
        ],
        correctIndex: 0,
        explanation: "Similar to a skip-list data structure, higher layers traverse vast distances across the vector space with few hops, zooming in on the correct neighborhood before lower layers refine the exact neighbors."
      }
    ]
  },
  {
    id: "10-rag-from-first-principles",
    number: "10",
    title: "RAG Architecture & Hybrid Retrieval",
    moduleId: "context",
    moduleName: "Context & Retrieval Engineering",
    readTime: "24 min",
    motto: "Naive RAG is a toy; Production RAG is an information retrieval pipeline combining sparse lexical search, dense semantic search, and cross-encoder re-ranking.",
    problemStatement: "Naive RAG (top-k vector similarity over fixed 500-token chunks) fails dramatically in real enterprise use cases. It misses exact keyword matches (e.g. error codes, product SKUs), retrieves redundant or fragmented text, and suffers from hallucinations when context does not contain the answer.",
    coreConcepts: [
      {
        title: "The Hybrid Search Triad: BM25 + Dense Vectors + Cross-Encoder",
        summary: "Combining lexical precision with semantic understanding creates an order-of-magnitude more robust retrieval system.",
        content: [
          "Lexical Search (BM25 / SPLADE): Inverted index matching exact keywords, entity names, numbers, and technical terms. Immune to semantic drift.",
          "Dense Semantic Search: Catches synonyms, paraphrased concepts, and conceptual questions where exact keywords differ.",
          "Reciprocal Rank Fusion (RRF): Combines the rank positions of both lists without requiring normalized score calibration: RRF(d) = Σ 1 / (k + rank_i(d)).",
          "Cross-Encoder Re-ranker (e.g. Cohere Re-rank, BGE-Reranker): Unlike bi-encoders which embed query and document separately, cross-encoders pass query and doc through self-attention together, calculating exact relevance."
        ]
      },
      {
        title: "Intelligent Chunking: Beyond Fixed Character Splits",
        summary: "Fixed-size chunking splits sentences and tables in half, destroying semantics.",
        content: [
          "Recursive Character Splitting: Attempts to split along logical boundaries: paragraphs (`\\n\\n`), then sentences (`\\n`), then words (` `).",
          "Semantic Chunking: Measures cosine similarity between consecutive sentences; splits whenever similarity drops below a threshold (topic shift).",
          "Parent-Document Retrieval: Indexes small chunks (100 tokens) for high-precision retrieval, but injects the larger parent section (1000 tokens) into the LLM context."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Reciprocal Rank Fusion (RRF) in Pure Python",
      description: "Merging ranked candidate lists from sparse (BM25) and dense (vector) retrieval pipelines.",
      code: `def reciprocal_rank_fusion(ranked_lists, k=60):
    """
    ranked_lists: list of lists containing doc_ids ordered by relevance
    k: smoothing constant (industry standard = 60)
    """
    rrf_scores = {}
    for r_list in ranked_lists:
        for rank, doc_id in enumerate(r_list):
            if doc_id not in rrf_scores:
                rrf_scores[doc_id] = 0.0
            # rank is 0-indexed, so add 1
            rrf_scores[doc_id] += 1.0 / (k + (rank + 1))
            
    # Sort docs by descending combined score
    sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_docs

# Results from BM25 sparse search (exact keywords)
bm25_results = ["doc_error_403", "doc_auth_guide", "doc_faq", "doc_setup"]

# Results from Dense Vector search (semantic intent)
dense_results = ["doc_auth_guide", "doc_session_mgmt", "doc_error_403", "doc_pricing"]

# Fused hybrid ranking
fused = reciprocal_rank_fusion([bm25_results, dense_results], k=60)

print("Final Hybrid Ranking:")
for rank, (doc_id, score) in enumerate(fused, 1):
    print(f"Rank {rank}: {doc_id} (RRF Score: {score:.5f})")`
    },
    productionPitfalls: [
      "Not using a Re-ranker: Feeding raw top-20 vector search results directly into the LLM wastes context and reduces answer accuracy by up to 30%.",
      "Chunk size mismatch: Chunking tables or code files like prose text, causing broken syntax and unparseable rows.",
      "Lack of Citation Grounding: Generating answers without requiring the LLM to cite the exact chunk ID and quote the supporting evidence."
    ],
    keyTakeaways: [
      "Always implement Hybrid Search (BM25 + Dense Vector) for enterprise datasets.",
      "Cross-encoder re-ranking top 50 candidates down to top 5 is the single highest-ROI step in any RAG pipeline.",
      "Index small chunks, pass large parent contexts (Parent-Document Retrieval)."
    ],
    quiz: [
      {
        question: "Why does Reciprocal Rank Fusion (RRF) use rank positions rather than raw similarity scores when merging BM25 and vector search results?",
        options: [
          "BM25 scores (unbounded floats) and vector cosine similarities (0 to 1) operate on completely incompatible scales that cannot be naively added",
          "Rank positions are encrypted for data privacy",
          "BM25 does not produce numbers",
          "Cosine similarity is only valid for images"
        ],
        correctIndex: 0,
        explanation: "BM25 outputs unbounded positive scores based on term frequency, whereas cosine similarity ranges between -1 and +1. RRF normalizes across systems by using pure ordinal rank order."
      }
    ]
  },
  {
    id: "11-caching-strategies-in-ai",
    number: "11",
    title: "Caching Strategies: Exact, Semantic & KV-Cache Reuse",
    moduleId: "context",
    moduleName: "Context & Retrieval Engineering",
    readTime: "16 min",
    motto: "The fastest and cheapest LLM call is the one you never make.",
    problemStatement: "At high scale, 20% to 40% of incoming user requests are semantically identical or share long system prompt prefixes. Making redundant frontier model API calls wastes millions of dollars and adds 1-2 seconds of unnecessary latency per interaction.",
    coreConcepts: [
      {
        title: "The Three Tiers of AI Caching",
        summary: "Modern AI architectures employ caching across three distinct abstraction levels.",
        content: [
          "Tier 1: Exact Hash Caching (Redis/Memcached). SHA-256 hash of model parameters + prompt string. 0ms LLM latency, 100% deterministic, 0 cost.",
          "Tier 2: Semantic Caching (GPTCache / Vector DB). Computes embedding of incoming query; returns cached response if cosine similarity > threshold (e.g. 0.94). Handles paraphrased queries like 'How do I cancel?' and 'Steps to terminate account?'.",
          "Tier 3: Provider-level Prompt/KV Caching (Anthropic Prompt Caching, OpenAI Cached Tokens, DeepSeek Prefix Caching). Providers reuse the KV-cache of identical prompt prefixes, cutting input costs by 50-90% and latency by 80%."
        ]
      },
      {
        title: "The Semantic Cache Invalidation Trap",
        summary: "Semantic caching introduces non-deterministic hazards if applied carelessly.",
        content: [
          "Threshold Calibration: Too low (e.g. 0.85) returns completely wrong answers to nuanced questions. Too high (e.g. 0.98) yields near-zero cache hits.",
          "Dynamic Context Danger: Never semantically cache queries containing user-specific variables, timestamps, authentication tokens, or real-time database state."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "First-Principles Semantic Cache in Python",
      description: "A functional semantic cache storing queries, embeddings, and responses with configurable similarity threshold.",
      code: `import math

def dot_product(v1, v2):
    return sum(a * b for a, b in zip(v1, v2))

class SemanticCache:
    def __init__(self, threshold=0.92):
        self.threshold = threshold
        # List of dicts: {"query": str, "vector": list[float], "response": str}
        self.entries = []
        
    def get(self, query_vector):
        best_match = None
        highest_sim = -1.0
        
        for entry in self.entries:
            sim = dot_product(query_vector, entry["vector"])
            if sim > highest_sim:
                highest_sim = sim
                best_match = entry
                
        if highest_sim >= self.threshold:
            return best_match["response"], highest_sim
        return None, highest_sim
        
    def put(self, query, query_vector, response):
        self.entries.append({
            "query": query,
            "vector": query_vector,
            "response": response
        })

# Simulated normalized 3D vectors
cache = SemanticCache(threshold=0.90)

# Store initial query
vec_q1 = [0.267, 0.534, 0.801]  # "How do I reset my password?"
cache.put("How do I reset my password?", vec_q1, "Navigate to Settings -> Security -> Reset Password.")

# Paraphrased incoming query
vec_q2 = [0.270, 0.530, 0.803]  # "Forgot password, how to change?"
cached_resp, sim = cache.get(vec_q2)

if cached_resp:
    print(f"CACHE HIT! (Similarity: {sim:.4f})")
    print("Response:", cached_resp)
else:
    print("CACHE MISS - calling model...")`
    },
    productionPitfalls: [
      "Caching responses containing ephemeral data (e.g., current stock prices, account balances).",
      "Using semantic caching for code generation tasks where a single variable name difference changes program behavior.",
      "Failing to structure system prompts so static instructions appear at the beginning to maximize KV-cache prefix hits."
    ],
    keyTakeaways: [
      "Structure your prompts so static content (system prompt, few-shot examples, large reference docs) is placed first to exploit provider KV-cache reuse.",
      "Use Exact Hash caching for deterministic batch workflows; use Semantic Caching only for high-volume customer FAQ queries.",
      "Always set a strict similarity threshold (>= 0.93) to avoid semantic false positives."
    ],
    quiz: [
      {
        question: "Why should static system instructions and documents always be placed at the very start of a prompt when using modern LLM APIs?",
        options: [
          "Provider KV-cache prefix caching reuses precomputed attention keys from the beginning of the prompt, slashing input cost and latency",
          "Models read backwards from the bottom",
          "HTTP headers require it",
          "To bypass JSON parsing errors"
        ],
        correctIndex: 0,
        explanation: "Engines like OpenAI, Anthropic, and DeepSeek cache KV-cache blocks matching the prefix of prompts. If the prefix is identical across requests, it is read directly from memory."
      }
    ]
  }
];
