import type { Chapter } from '../../types/curriculum';

export const MODULE_7_CHAPTERS: Chapter[] = [
  {
    id: "32-enterprise-data-audits-legacy-schemas",
    number: "32",
    title: "Enterprise Data Audits & Legacy Schema Untangling",
    moduleId: "fde",
    moduleName: "Forward Deployed Engineering (FDE) & Last-Mile Delivery",
    trackNumber: 7,
    readTime: "26 min",
    targetRoles: ['fde', 'ai-engineer'],
    motto: "In forward-deployed engineering, 90% of the battle is untangling 20-year-old enterprise data pipelines before an LLM ever touches them.",
    problemStatement: "In clean hackathons, datasets are pristine markdown or JSON. In real-world enterprise deployments (Palantir/OpenAI/Scale style FDE), the client provides corrupt PDFs with rotated scans, undocumented Oracle/SAP databases with 500-column tables named `TBL_CUST_V2_FINAL`, and live CDC streams with missing foreign keys. An FDE must build resilient ingestion pipelines, schema translators, and automated data quality gates.",
    coreConcepts: [
      {
        title: "The Enterprise Data Audit Checklist",
        summary: "Systematically validating customer data before deploying AI workflows.",
        content: [
          "Document Sanity: Detecting password-protected PDFs, rotated scans, non-standard embedded fonts, and multi-layer OCR artifacts.",
          "Database Schemas: Mapping legacy 500-column tables into concise Pydantic models with semantic descriptions so Text-to-SQL agents don't hallucinate column names.",
          "Change Data Capture (CDC): Streaming real-time updates via Debezium / Kafka to update vector stores incrementally without running expensive full-corpus re-indexing."
        ],
        diagram: `Messy Enterprise Data
  ├── Rotated / Corrupt Scanned PDFs ──► Layout-Aware PDF Parser + Pre-rotation filter
  ├── 500-Column Oracle DB Table ─────► Semantic Schema Pruner & Pydantic View Model
  └── Kafka CDC Event Stream ─────────► Incremental Vector Ingestion & Upsert Gate`
      },
      {
        title: "Automated Data Quality & Ingestion Gates",
        summary: "Preventing garbage data from poisoning downstream RAG and agent systems.",
        content: [
          "Heuristic Anomaly Detection: Flagging chunks with abnormal character/token ratios, encoding glitches (`\ufffd`), or duplicate boilerplates (legal disclaimers, headers/footers).",
          "Semantic Schema Pruning: Using few-shot LLM runs to generate semantic dictionaries mapping cryptic abbreviations (`CUST_STAT_CD_04`) to human-readable names (`account_active`)."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Enterprise Document Pre-flight Auditor & Schema Pruner in Python",
      description: "Detecting corrupted PDF encoding, stripping boilerplate disclaimers, and mapping legacy database schemas.",
      code: `import re

class EnterpriseDataAuditor:
    @staticmethod
    def audit_text_chunk(raw_text: str):
        issues = []
        # Check 1: Corrupted UTF-8 replacement characters
        if "\ufffd" in raw_text:
            issues.append("CRITICAL: Corrupted byte encoding detected (replacement character present)")
        # Check 2: Abnormal whitespace or zero content
        words = raw_text.split()
        if len(words) < 5:
            issues.append("WARNING: Low semantic density (< 5 words)")
        # Check 3: Header / legal boilerplate ratio
        if "CONFIDENTIAL & PROPRIETARY. DO NOT DISTRIBUTE." in raw_text:
            raw_text = raw_text.replace("CONFIDENTIAL & PROPRIETARY. DO NOT DISTRIBUTE.", "").strip()
            issues.append("INFO: Stripped recurring legal disclaimer")
            
        return {
            "clean_text": raw_text,
            "word_count": len(words),
            "quality_issues": issues,
            "is_indexable": "CRITICAL" not in str(issues)
        }

sample_bad = "CONFIDENTIAL & PROPRIETARY. DO NOT DISTRIBUTE.\\nInvoice\\ufffd details for account #492"
print(EnterpriseDataAuditor.audit_text_chunk(sample_bad))`
    },
    productionPitfalls: [
      "Running text embeddings directly on raw PDF extracts containing repeated 10-line headers on every single page, cluttering vector search with boilerplate.",
      "Attempting Text-to-SQL over unpruned 200-column tables, overflowing context and producing hallucinated JOIN conditions.",
      "Ignoring CDC delete events: when a record is deleted in the client ERP, failing to purge the corresponding vector chunk from Qdrant/Pinecone."
    ],
    keyTakeaways: [
      "Never feed raw enterprise exports directly into RAG; always implement an automated data quality gate.",
      "Translate cryptic legacy database schemas into semantic view models before exposing them to Text-to-SQL agents.",
      "Synchronize vector indexes with enterprise databases using Change Data Capture (CDC) upserts and deletes."
    ],
    quiz: [
      {
        question: "Why should repetitive legal disclaimers and page headers be stripped during enterprise document ingestion?",
        options: [
          "They dominate dense vector representations, causing completely different documents to cluster together merely because they share identical headers",
          "Headers are illegal to store in databases",
          "Python cannot parse headers",
          "It makes PDFs smaller than 1 byte"
        ],
        correctIndex: 0,
        explanation: "If every page of every company document has the same 50-word legal disclaimer, embedding models will assign high similarity to those chunks based purely on the repeated boilerplate rather than actual content."
      }
    ],
    lectures: [
      {
        title: "How to Process Documents at Scale with LLMs",
        speaker: "Hamel Husain",
        url: "https://www.youtube.com/watch?v=t6r4U0SlnPc",
        youtubeId: "t6r4U0SlnPc",
        duration: "48m",
        timestampedTakeaways: [
          { time: "00:07:30", takeaway: "Handling corrupt and scanned enterprise PDFs in production pipelines" },
          { time: "00:21:00", takeaway: "Layout-aware parsing vs raw OCR extraction tradeoffs" },
          { time: "00:35:15", takeaway: "Building reliable extraction evaluation benchmarks with ground-truth spreadsheets" }
        ]
      }
    ],
    simulatorType: 'rrf-fusion',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Legacy Column Name Semantic Translator",
        subtitle: "Core DSA: Hash-Map Schema Dictionary Transformation",
        problemStatement: "Implement `prune_and_translate_schema(table_schema: dict[str, str], mapping_dict: dict[str, str], keep_columns: set[str]) -> dict[str, str]` that filters out unneeded legacy columns and renames cryptic acronyms into clear semantic identifiers for Text-to-SQL prompts.",
        starterCode: `def prune_and_translate_schema(schema: dict[str, str], mapping: dict[str, str], keep: set[str]) -> dict[str, str]:
    # TODO: Filter and rename schema columns
    pass`,
        solutionCode: `def prune_and_translate_schema(schema: dict[str, str], mapping: dict[str, str], keep: set[str]) -> dict[str, str]:
    translated = {}
    for col, dtype in schema.items():
        if col in keep:
            new_name = mapping.get(col, col)
            translated[new_name] = dtype
    return translated`,
        testCases: [
          {
            input: 'schema={"CUST_ID_PK": "int", "TX_AMT_01": "float", "DUMMY_COL": "text"}, keep={"CUST_ID_PK", "TX_AMT_01"}, mapping={"CUST_ID_PK": "customer_id", "TX_AMT_01": "transaction_amount"}',
            expectedOutput: '{"customer_id": "int", "transaction_amount": "float"}',
            explanation: "Cryptic enterprise legacy columns converted into intuitive natural language schemas."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The CDC Ghost Vector Search Leak",
        subtitle: "Production Systems Bug: Deleted customer record still showing up in RAG answers",
        problemStatement: "A GDPR 'Right to be Forgotten' request deleted user 8820 from the client's PostgreSQL database. Two weeks later, an enterprise RAG assistant cited the deleted user's records. Investigation revealed the CDC pipeline only handled `INSERT` events and ignored `DELETE` events. Architect the tombstone deletion listener for the vector database.",
        starterCode: `# Buggy CDC listener:
# def on_event(event):
#     if event['op'] == 'c': index.upsert(event['row']) # Missing delete!`,
        solutionCode: `# Fix: Comprehensive CDC Event Handler
def on_cdc_database_event(event: dict, vector_index):
    op = event.get("op") # 'c'=create, 'u'=update, 'd'=delete
    doc_id = event["row"]["id"]
    
    if op in ('c', 'u'):
        chunk_text = event["row"]["content"]
        emb = get_embedding(chunk_text)
        vector_index.upsert(id=str(doc_id), vector=emb, metadata=event["row"])
    elif op == 'd':
        # Instantly purge deleted record from vector database:
        vector_index.delete(ids=[str(doc_id)])`,
        testCases: [
          {
            input: 'CDC DELETE event received for record 8820',
            expectedOutput: 'vector_index.delete(ids=["8820"]) called; record immediately unsearchable',
            explanation: "Synchronizes deletions across relational storage and vector retrieval indexes."
          }
        ]
      }
    }
  },
  {
    id: "33-scoping-unit-economics-day2-governance",
    number: "33",
    title: "Scoping, Unit Economics & Day-2 Governance",
    moduleId: "fde",
    moduleName: "Forward Deployed Engineering (FDE) & Last-Mile Delivery",
    trackNumber: 7,
    readTime: "25 min",
    targetRoles: ['fde', 'agent-architect', 'ai-engineer'],
    motto: "A Proof-of-Concept proves feasibility; a Forward Deployed Engineer delivers profitability, compliance, and Day-2 operational governance.",
    problemStatement: "Many enterprise AI projects die after a successful Proof-of-Concept because no one modeled the unit economics at scale (e.g., $40,000/month API bills for a system saving $15,000 of labor), or because the client's InfoSec team halted deployment over missing PII redaction and role-based access control (RBAC). An FDE bridges technical capability with business viability.",
    coreConcepts: [
      {
        title: "The PoC-to-Production Unit Economics Equation",
        summary: "Financial modeling of token consumption, model cascading, and infrastructure costs.",
        content: [
          "Cost per Resolution: $\\text{Cost} = (N_{\\text{in}} \\times P_{\\text{in}} + N_{\\text{out}} \\times P_{\\text{out}}) \\times (1 - \\text{Cache\\%}) + \\text{Hosting Overhead}$.",
          "Cascade ROI: Routing 70% of tickets to an 8B SLM ($0.20/1M tokens) and only 30% to a frontier model ($10.00/1M tokens) drops unit cost by >80%.",
          "Target Labor Arbitrage: If a human agent costs $25/hour and resolves 5 tickets ($5/ticket), the AI system must operate at < $0.50/ticket with >95% accuracy to justify deployment."
        ]
      },
      {
        title: "Day-2 Governance: RBAC, PII Redaction & Model Drift",
        summary: "Keeping systems secure, compliant, and accurate after the initial launch.",
        content: [
          "PII Redaction Gates: Automatically masking Social Security numbers, credit card tokens, and phone numbers using Presidio before queries hit external LLM APIs.",
          "RBAC & Document ACL Propagation: Propagating user Active Directory / Okta groups down to individual vector chunks so executives see financial projections but contractors do not.",
          "Drift Monitoring: Tracking weekly shifts in user query embeddings and confidence scores to detect product updates or policy changes that break existing prompts."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Forward Deployed Engineer Unit Economics & ROI Calculator",
      description: "Modeling monthly enterprise AI operational cost, labor savings, and gross margin in Python.",
      code: `def calculate_fde_unit_economics(
    monthly_tickets: int = 100000,
    human_cost_per_ticket: float = 5.0,
    avg_input_tokens: int = 1500,
    avg_output_tokens: int = 300,
    cache_hit_ratio: float = 0.35,
    slm_route_ratio: float = 0.70
):
    # Costs per 1,000 tokens (USD)
    frontier_in, frontier_out = 0.0025, 0.0100
    slm_in, slm_out = 0.0002, 0.0002
    
    uncached_tickets = monthly_tickets * (1 - cache_hit_ratio)
    
    # 70% SLM, 30% Frontier
    slm_cost = uncached_tickets * slm_route_ratio * (
        (avg_input_tokens / 1000 * slm_in) + (avg_output_tokens / 1000 * slm_out)
    )
    frontier_cost = uncached_tickets * (1 - slm_route_ratio) * (
        (avg_input_tokens / 1000 * frontier_in) + (avg_output_tokens / 1000 * frontier_out)
    )
    
    total_ai_cost = slm_cost + frontier_cost
    human_labor_cost = monthly_tickets * human_cost_per_ticket
    monthly_savings = human_labor_cost - total_ai_cost
    
    return {
        "monthly_tickets": monthly_tickets,
        "total_ai_cost_usd": round(total_ai_cost, 2),
        "cost_per_ticket_usd": round(total_ai_cost / monthly_tickets, 4),
        "monthly_net_savings_usd": round(monthly_savings, 2),
        "roi_multiple": round(human_labor_cost / total_ai_cost, 1)
    }

print(calculate_fde_unit_economics())`
    },
    productionPitfalls: [
      "Agreeing to fixed-price client contracts without capping maximum token usage per customer request.",
      "Promising 99.9% accuracy without defining an unambiguous human evaluation rubric and test dataset.",
      "Deploying to enterprise production without automated daily alerts on prompt drift and cost spikes."
    ],
    keyTakeaways: [
      "Every enterprise AI system must have a clearly articulated labor arbitrage ROI equation.",
      "Model cascades and semantic caching are essential to achieve sub-$0.10 cost per resolution.",
      "Day-2 governance (PII masking, RBAC propagation, drift tracking) is mandatory for enterprise retention."
    ],
    quiz: [
      {
        question: "Why do enterprise AI projects with 95% benchmark accuracy often fail to transition from Proof-of-Concept (PoC) to full production?",
        options: [
          "Unviable unit economics (high frontier token costs), lack of compliance/RBAC security gates, and failure to monitor Day-2 drift",
          "Clients prefer using manual typewriters",
          "LLMs stop working after 30 days",
          "Cloud providers ban enterprise accounts"
        ],
        correctIndex: 0,
        explanation: "Moving from PoC to production requires proving economic viability (ROI > cost), passing stringent security/PII audits, and establishing long-term maintenance processes."
      }
    ],
    simulatorType: 'fde-economics',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Presidio-Style PII Token Masker",
        subtitle: "Core DSA: Fast Regular Expression & Context Token Replacement",
        problemStatement: "Implement `mask_pii_tokens(prompt: str) -> str` that detects and redacts: 1) US SSNs (`XXX-XX-XXXX`), 2) Emails (`user@domain.com`), and 3) 10-digit US phone numbers before dispatching to cloud LLM APIs.",
        starterCode: `def mask_pii_tokens(prompt: str) -> str:
    # TODO: Redact SSNs, emails, and phone numbers
    pass`,
        solutionCode: `import re

def mask_pii_tokens(prompt: str) -> str:
    ssn_regex = r'\\b\\d{3}-\\d{2}-\\d{4}\\b'
    email_regex = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b'
    phone_regex = r'\\b(?:\\+?1[-. ]?)?\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\\b'
    
    clean = re.sub(ssn_regex, "[REDACTED_SSN]", prompt)
    clean = re.sub(email_regex, "[REDACTED_EMAIL]", clean)
    clean = re.sub(phone_regex, "[REDACTED_PHONE]", clean)
    return clean`,
        testCases: [
          {
            input: '"Contact john.doe@acme.com or call 415-555-1234. SSN: 123-45-6789"',
            expectedOutput: '"Contact [REDACTED_EMAIL] or call [REDACTED_PHONE]. SSN: [REDACTED_SSN]"',
            explanation: "All sensitive identifiers safely masked before external cloud API transmission."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Runaway Token Bill Attack",
        subtitle: "Production Systems Bug: Client employee pasting 500-page document into customer portal",
        problemStatement: "A client employee pasted a 500-page PDF into an unconstrained chatbot prompt. The system processed 400,000 input tokens on GPT-4o, costing $1.00 per message and exhausting the daily enterprise tier token quota in 15 minutes. Implement token budgeting and rate-limiting middleware.",
        starterCode: `# VULNERABLE:
# response = client.chat.completions.create(messages=[{"role": "user", "content": huge_text}])`,
        solutionCode: `import tiktoken

MAX_PROMPT_TOKENS = 4096

def enforce_tenant_token_budget(tenant_id: str, prompt_text: str):
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(prompt_text)
    if len(tokens) > MAX_PROMPT_TOKENS:
        raise ValueError(f"Prompt of {len(tokens)} tokens exceeds maximum per-request ceiling of {MAX_PROMPT_TOKENS}.")
    # Check tenant monthly quota in Redis before proceeding:
    # check_redis_quota(tenant_id, cost_estimate)`,
        testCases: [
          {
            input: 'Prompt with 400,000 tokens submitted',
            expectedOutput: 'Rejected with HTTP 413 / Request Entity Too Large error (zero API cost incurred)',
            explanation: "Token budgeting gates protect enterprise accounts from runaway billing spikes."
          }
        ]
      }
    }
  }
];
