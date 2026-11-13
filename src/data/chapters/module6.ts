import type { Chapter } from '../../types/curriculum';

export const MODULE_6_CHAPTERS: Chapter[] = [
  {
    id: "26-system-design-support-workflow-engine",
    number: "26",
    title: "System Design: Autonomous Customer Support & Workflow Engine",
    moduleId: "system-design",
    moduleName: "End-to-End System Design",
    readTime: "25 min",
    motto: "A toy chatbot answers questions; an enterprise support engine reads user state, verifies identity, dispatches CRM updates, and knows when to yield to a human.",
    problemStatement: "Designing a customer support automation capable of handling 500,000 monthly tickets across billing, technical issues, and cancellations. The system must meet <1 second response SLAs, maintain 99.9% uptime, prevent unauthorized account changes, and escalate gracefully to human support agents when confidence is low.",
    coreConcepts: [
      {
        title: "High-Level Architecture & Request Flow",
        summary: "The multi-stage pipeline connecting front-end webhooks to backend business machinery.",
        content: [
          "Stage 1: Ingestion & Auth Gate. Webhook validates cryptographic signature, extracts user ID, and pulls customer subscription tier from PostgreSQL.",
          "Stage 2: Semantic Intent Classifier & Fast Route. Fast 8B model classifies intent (e.g. Billing vs Bug vs Cancellation) and determines required permissions.",
          "Stage 3: Hybrid Retrieval. If intent requires documentation, queries Qdrant with BM25 + dense hybrid search; re-ranks top 3 chunks.",
          "Stage 4: Guarded Tool Execution. If intent requires action (e.g. `issue_refund`), executes with parameter validation and checks idempotency key.",
          "Stage 5: Human-in-the-Loop Escalation. If sentiment is hostile, refund value > $100, or LLM confidence < 0.85, routes ticket to Zendesk human agent queue with summarized context."
        ],
        diagram: `User Message (Webhook)
         │
         ▼
[1. Ingestion & Auth Gate] ──► Query Redis Session & Postgres Customer Profile
         │
         ▼
[2. Intent Classifier & Router (8B SLM)]
    ├─── FAQ / General ──► [3. Hybrid RAG (Qdrant + Cohere)] ──► Frontier LLM Answer
    ├─── Account Action ──► [4. Guarded Tool Dispatcher] ──► Stripe / CRM Update
    └─── High Risk / Anger ──► [5. Human Escalation Queue] ──► Zendesk Staff`
      },
      {
        title: "Latency & Cost Economics at Scale",
        summary: "Financial and architectural feasibility for 500,000 requests/month.",
        content: [
          "Without Tiering: 500k requests directly to GPT-4o @ 2,000 tokens avg = \$15,000/month, avg latency 2.5s.",
          "With Tiering (Semantic Cache + 8B Classifier + RAG): 30% cache hits (0ms, \$0), 50% handled by 8B model (\$120), 20% escalated to frontier model (\$3,000). Total cost: \$3,120/month (79% savings), avg latency 650ms."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "End-to-End Support Triage & Action Engine",
      description: "A complete runnable orchestration module coordinating triage, safe tool calling, and human escalation.",
      code: `import json

class EnterpriseSupportEngine:
    def __init__(self):
        self.refund_limit_auto = 100.0  # Max auto refund without human approval

    def process_ticket(self, user_id, user_email, message, account_balance):
        print(f"=== Incoming Ticket from {user_email} (Balance: \${account_balance}) ===")
        print(f"Message: '{message}'")

        # 1. Fast Intent Classification & Sentiment Analysis
        is_angry = "unacceptable" in message.lower() or "terrible" in message.lower()
        is_refund_request = "refund" in message.lower() or "charge" in message.lower()

        if is_angry:
            return self.escalate_to_human(user_id, message, reason="High user frustration detected.")

        if is_refund_request:
            # Extract refund amount (simulated extraction)
            refund_amount = 45.0 # Extracted from context
            
            if refund_amount > self.refund_limit_auto:
                return self.escalate_to_human(
                    user_id, message,
                    reason=f"Refund request of \${refund_amount} exceeds auto-approval ceiling of \${self.refund_limit_auto}."
                )
            
            # Safe automated tool dispatch
            action_result = self.execute_refund(user_id, refund_amount)
            return {
                "status": "RESOLVED_AUTOMATED",
                "response": f"Your refund of \${refund_amount:.2f} has been processed successfully. Confirmation ID: {action_result['tx_id']}."
            }

        return {
            "status": "RESOLVED_AUTOMATED",
            "response": "Thank you for reaching out. Here is how you can update your settings..."
        }

    def execute_refund(self, user_id, amount):
        print(f"[TOOL EXECUTION] Dispatching Stripe refund for user {user_id}: \${amount}")
        return {"status": "success", "tx_id": "re_3K9d8xL29A"}

    def escalate_to_human(self, user_id, message, reason):
        print(f"[ESCALATION TRIGGERED] Reason: {reason}")
        return {
            "status": "ESCALATED_TO_HUMAN",
            "zendesk_ticket_priority": "URGENT",
            "summary_for_agent": f"Customer {user_id} requested support. Reason for escalation: {reason}"
        }

engine = EnterpriseSupportEngine()

# Test Automated Resolution
res1 = engine.process_ticket(101, "alice@example.com", "Can you please refund the $45 accidental charge?", 150.0)
print("Result 1:", json.dumps(res1, indent=2))

# Test Human Escalation
print("\n")
res2 = engine.process_ticket(102, "bob@example.com", "This terrible service charged me $500! Unacceptable!", 500.0)
print("Result 2:", json.dumps(res2, indent=2))`
    },
    productionPitfalls: [
      "Letting the LLM authorize financial transactions without strict programmatic ceiling checks.",
      "Failing to pass conversation history and structured summaries to human agents upon escalation.",
      "Not caching repeated questions during product outage spikes, overwhelming backend services."
    ],
    keyTakeaways: [
      "Enterprise support engines combine semantic triage, deterministic policy enforcement, and seamless human escalation.",
      "Never allow an LLM to override hard business limits; enforce constraints in software, not prompts.",
      "Track escalation rate as a core engineering KPI."
    ],
    quiz: [
      {
        question: "Why should monetary refund limits be enforced via deterministic backend code rather than system prompt instructions?",
        options: [
          "Prompt instructions can be bypassed via prompt injection or unexpected phrasing, whereas code logic provides guaranteed enforcement",
          "Python runs faster than English",
          "LLMs cannot parse numbers with decimal points",
          "Stripe APIs do not allow LLM connections"
        ],
        correctIndex: 0,
        explanation: "System prompts are probabilistic suggestions, not guarantees. A clever adversarial user could trick the model into issuing unauthorized refunds. Hard limits must be coded as programmatic preconditions in software."
      }
    ]
  },
  {
    id: "27-system-design-enterprise-rag",
    number: "27",
    title: "System Design: Enterprise RAG Knowledge Engine",
    moduleId: "system-design",
    moduleName: "End-to-End System Design",
    readTime: "26 min",
    motto: "Enterprise RAG is 80% data engineering, 15% retrieval science, and 5% prompt generation.",
    problemStatement: "Building a multi-tenant enterprise search and question-answering platform indexing 5 million internal documents (PDFs, Confluence pages, Slack threads, and Google Drive docs). The system must enforce strict role-based access control (RBAC), prevent data leaks across organizations, guarantee exact citation grounding, and achieve sub-800ms query latency.",
    coreConcepts: [
      {
        title: "The Ingestion & Normalization Pipeline",
        summary: "Transforming unstructured enterprise chaos into clean, searchable vector representations.",
        content: [
          "Document Parsers: Specialized extractors for PDFs (layout-aware, OCR for scanned images), Markdown, and HTML tables.",
          "Metadata Tagging: Every chunk is stamped with `tenant_id`, `document_id`, `created_at`, `acl_groups` (user permissions), and `source_url`.",
          "Embedding Generation: Batch embedded using state-of-the-art dense models with asynchronous queue workers (Celery / Kafka)."
        ]
      },
      {
        title: "Multi-Tenant Security & Single-Stage Filtering",
        summary: "Guaranteeing that Tenant A never sees Tenant B's documents.",
        content: [
          "Single-Stage Vector Filtering: Vector database filters candidates on `tenant_id == req.tenant_id AND acl_group IN req.user_groups` directly during HNSW graph traversal.",
          "Citation Grounding: Model is forced via structured output to output `[{claim: str, source_chunk_id: str, exact_quote: str}]`. A post-generation verification step confirms that `exact_quote` actually exists verbatim in the referenced chunk."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Enterprise Multi-Tenant RAG Verifier & Citation Grounder",
      description: "Simulating role-based access filtering and automated quotation verification in Python.",
      code: `class EnterpriseRAGSearch:
    def __init__(self):
        # Simulated vector database documents with tenant IDs and ACLs
        self.doc_store = [
            {
                "id": "doc_eng_01",
                "tenant_id": "corp_acme",
                "acl": ["engineering", "all_employees"],
                "text": "The deployment key is rotated every 90 days via HashiCorp Vault.",
                "url": "https://wiki.acme.corp/sec/keys"
            },
            {
                "id": "doc_hr_02",
                "tenant_id": "corp_acme",
                "acl": ["hr_executives"],
                "text": "Executive compensation bonuses are calculated using metric Q4-EBITDA.",
                "url": "https://wiki.acme.corp/hr/comp"
            }
        ]

    def query(self, tenant_id, user_groups, search_terms):
        print(f"Executing search for Tenant: '{tenant_id}' | Groups: {user_groups}")
        allowed_results = []
        
        for doc in self.doc_store:
            # 1. Multi-Tenant isolation check
            if doc["tenant_id"] != tenant_id:
                continue
                
            # 2. RBAC Access Control check
            has_permission = any(g in doc["acl"] for g in user_groups)
            if not has_permission:
                continue
                
            # 3. Text relevance matching
            if any(term in doc["text"].lower() for term in search_terms):
                allowed_results.append(doc)
                
        return allowed_results

    def verify_grounded_citation(self, claim, cited_quote, original_doc_text):
        """Validates that cited quote exists verbatim in source document."""
        if cited_quote in original_doc_text:
            return True, "Citation verified verbatim."
        return False, "HALLUCINATION DETECTED: Cited quote not found in source text!"

rag = EnterpriseRAGSearch()

# Test 1: Standard engineer searching for compensation (Should be blocked by RBAC!)
results_eng = rag.query(tenant_id="corp_acme", user_groups=["engineering"], search_terms=["compensation", "bonuses"])
print(f"Engineer query returned {len(results_eng)} docs (RBAC successfully blocked unauthorized doc)")

# Test 2: Grounding verification check
doc_text = "The deployment key is rotated every 90 days via HashiCorp Vault."
claim = "Keys are rotated quarterly."
valid_quote = "rotated every 90 days"
fake_quote = "rotated every 30 days"

print("\nVerifying Valid Quote:", rag.verify_grounded_citation(claim, valid_quote, doc_text)[1])
print("Verifying Fake Quote:", rag.verify_grounded_citation(claim, fake_quote, doc_text)[1])`
    },
    productionPitfalls: [
      "Performing post-filtering: Querying top 100 vectors across the whole database and then filtering by tenant in Python, causing zero results if other tenants dominate the space.",
      "Ignoring table data: Naive text splitting destroys markdown and HTML tables; use table-specific chunking and summarization.",
      "Not monitoring embedding drift when updating document collections."
    ],
    keyTakeaways: [
      "Always filter by tenant and ACL groups inside the vector search index (Single-Stage Filtering).",
      "Mandate structured citations and verify that quoted snippets exist verbatim in source documents.",
      "Invest heavily in layout-aware document parsing for PDFs and tables."
    ],
    quiz: [
      {
        question: "Why is 'Single-Stage Filtering' (pre-filtering inside the vector graph) necessary for secure multi-tenant RAG systems?",
        options: [
          "Post-filtering after retrieving top-k global results can result in empty result sets if another tenant's documents occupy all the top slots, and leaks vector distances",
          "Single-stage filtering makes vectors smaller",
          "It is required by Python 3",
          "Post-filtering is illegal under GDPR"
        ],
        correctIndex: 0,
        explanation: "If you retrieve the top 20 nearest neighbors globally and then filter out documents the user cannot access, all 20 might belong to other tenants—leaving 0 valid results even though relevant accessible documents exist in the database."
      }
    ]
  },
  {
    id: "28-system-design-autonomous-coding-agent",
    number: "28",
    title: "System Design: Autonomous Coding & Engineering Agent",
    moduleId: "system-design",
    moduleName: "End-to-End System Design",
    readTime: "28 min",
    motto: "The ultimate applied AI engineering test: building an agent that can read, reason over, edit, and verify code inside an isolated sandbox.",
    problemStatement: "Architecting a production software engineering agent (similar to Devin, Cursor Agent, or Antigravity) that takes high-level user issues ('Fix bug in authentication token expiry'), navigates a 200,000-line codebase, generates unified diffs, runs test suites inside a sandbox, and verifies the solution before human review.",
    coreConcepts: [
      {
        title: "The Four Pillars of a Production Coding Agent",
        summary: "How modern autonomous programming agents operate under the hood.",
        content: [
          "1. Codebase Context Engine: Ripgrep for fast symbol search, Tree-sitter for AST parsing, and file outline summaries to avoid loading entire repositories into context.",
          "2. Tool Belt: Granular tools for `read_file(path, line_range)`, `edit_file(path, target, replacement)`, `list_dir(path)`, and `run_command(cmd, timeout)`.",
          "3. Isolated Sandbox: All bash commands execute inside an ephemeral, network-isolated container with resource limits (cgroups for memory and CPU).",
          "4. Test-Driven Verification Loop: The agent runs tests before and after making edits. If tests fail, the compiler/test error output is fed back into the next turn for self-healing."
        ],
        diagram: `User Task: "Fix race condition in UserCache"
  │
  ▼
[Agent Loop] ◄────────────────────────────────────────┐
  │                                                   │
  ├──► Tool: ripgrep("UserCache")                     │
  ├──► Tool: read_file("src/cache.py", L40-L90)       │
  ├──► Tool: edit_file("src/cache.py", diff)          │
  ├──► Tool: run_command("pytest tests/test_cache.py")│
  │          │                                        │
  │          ├── Failure? ────────────────────────────┘ (Self-healing iteration)
  │          └── Success?
  ▼
[Emit Git Diff & Ready for Review]`
      },
      {
        title: "Diff Strategies: Unified Diff vs Search-and-Replace",
        summary: "Why rewrite-the-whole-file approaches fail on large codebases.",
        content: [
          "Full File Rewrite: Asking an LLM to output a 1,000-line file to change 3 lines is slow, expensive, and frequently truncates code with '// ... rest of code unchanged'.",
          "Search-and-Replace Blocks: The agent outputs the exact target string to replace and the new replacement string. High precision, minimal tokens.",
          "Unified Diffs (patch): Standard patch format with line context."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Mental Model: Autonomous Code Edit & Test Self-Correction Loop",
      description: "An agent that applies edits to code, runs simulated unit tests, and self-corrects upon compilation failure.",
      code: `class CodingAgentLoop:
    def __init__(self):
        self.code_files = {
            "math_utils.py": "def divide(a, b):\\n    return a / b\\n"
        }

    def run_tests(self):
        """Simulates running pytest."""
        code = self.code_files["math_utils.py"]
        # Test case: divide(10, 0) should return None without crashing
        namespace = {}
        try:
            exec(code, namespace)
            divide_fn = namespace["divide"]
            # Run test 1: standard
            assert divide_fn(10, 2) == 5
            # Run test 2: zero check
            res = divide_fn(10, 0)
            if res is not None:
                return False, f"Test Failed: divide(10, 0) returned {res}, expected None"
            return True, "All tests passed!"
        except ZeroDivisionError as e:
            return False, f"ZeroDivisionError: division by zero"
        except Exception as e:
            return False, f"Error: {str(e)}"

    def apply_edit(self, filename, new_code):
        print(f"[EDIT] Updating {filename}...")
        self.code_files[filename] = new_code

    def solve_bug(self):
        print("Initial Test Run:")
        passed, log = self.run_tests()
        print(f"Status: Passed={passed} | Log: {log}\n")

        # Iteration 1: Agent observes failure and attempts fix
        if not passed:
            print("--- Agent Iteration 1 ---")
            print("Agent Observation: Tests failed with ZeroDivisionError.")
            print("Agent Thought: I need to add a check for b == 0 and return None.")
            
            fixed_code = "def divide(a, b):\\n    if b == 0:\\n        return None\\n    return a / b\\n"
            self.apply_edit("math_utils.py", fixed_code)

            # Verification run
            print("\nVerification Test Run:")
            passed_after, log_after = self.run_tests()
            print(f"Status: Passed={passed_after} | Log: {log_after}")
            if passed_after:
                print("\n[SUCCESS] Coding agent successfully fixed bug and verified tests!")

agent = CodingAgentLoop()
agent.solve_bug()`
    },
    productionPitfalls: [
      "Running agent shell commands directly on the host machine without container isolation.",
      "Passing entire 5,000-line files to the model instead of localized line-range reads.",
      "Allowing agents to delete git histories or push to protected branches without human sign-off."
    ],
    keyTakeaways: [
      "Coding agents require AST parsing and fast text search (ripgrep) to navigate repositories efficiently.",
      "Use targeted Search-and-Replace editing rather than full file rewrites.",
      "The self-correction test loop (Edit -> Test -> Observe Errors -> Refine) is the core engine of autonomous programming."
    ],
    quiz: [
      {
        question: "Why is Search-and-Replace block editing preferred over Full File Rewriting for AI coding agents?",
        options: [
          "It uses a tiny fraction of tokens, avoids 30-second generation latencies, and prevents accidental deletions of untouched code",
          "Full file rewriting is not supported by Python",
          "Compilers do not accept full files",
          "It makes git commits impossible"
        ],
        correctIndex: 0,
        explanation: "In large files (500+ lines), full file rewrites consume enormous token budgets, risk hitting output limits, and frequently truncate code with comments like '// rest of code here', breaking the build."
      }
    ]
  }
];
