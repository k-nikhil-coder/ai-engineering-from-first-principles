import type { Chapter } from '../../types/curriculum';

export const MODULE_3_CHAPTERS: Chapter[] = [
  {
    id: "14-tool-calling-and-function-schemas",
    number: "14",
    title: "Tool Calling & Function Schemas",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "19 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer'],
    motto: "Tool calling does not execute code inside the model; it is a contract where the model emits a structured function signature that your runtime executes.",
    problemStatement: "New engineers often believe models 'call APIs' directly over the internet. In reality, the model outputs a text token sequence formatted as a JSON function call. The host application parses it, runs the local or remote function, and feeds the result back into the model's next turn. Understanding this boundary is vital for security and reliability.",
    coreConcepts: [
      {
        title: "The Tool Calling Protocol Lifecycle",
        summary: "The four-step dance between client runtime and foundation model.",
        content: [
          "1. Declaration: Client passes available tool definitions (name, description, JSON Schema parameter specification) in the request payload.",
          "2. Decision & Generation: Model recognizes that answering requires external state; emits a `tool_calls` array containing the tool name and argument values instead of standard text.",
          "3. Execution: Client runtime validates parameters against the schema, executes the local code/database query/API call, and captures the stdout/return value.",
          "4. Observation: Client appends a message with role='tool' containing the output back into the conversation context for the model to synthesize the final answer."
        ],
        diagram: `User Request: "Check balance for user 42"
  │
  ▼
LLM receives: [User message + Tool Declarations: get_balance(user_id)]
  │
  ▼ LLM outputs: tool_call -> get_balance(user_id=42)
  │
Host Runtime executes: DB.query("SELECT balance FROM accounts WHERE id = 42")
  │ Output: {"balance": 1540.50, "currency": "USD"}
  ▼
LLM receives: [..., Role: tool, Content: {"balance": 1540.50}]
  │
  ▼ LLM outputs final answer: "User 42 currently has a balance of $1,540.50 USD."`
      },
      {
        title: "Defensive Tool Schema Engineering",
        summary: "Vague descriptions cause wrong tool selections and invalid arguments.",
        content: [
          "Tool descriptions are documentation for the model. Be explicit about prerequisites, units (e.g. seconds vs milliseconds), and parameter constraints.",
          "Always handle tool runtime exceptions gracefully: If an API returns HTTP 500 or timeout, feed the error string back to the model as an observation so it can retry or choose an alternate tool."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "First-Principles Tool Dispatcher & Execution Runtime",
      description: "A complete, safe tool registry, schema validator, and dispatcher implemented in Python.",
      code: `import json

class ToolRegistry:
    def __init__(self):
        self.tools = {}
        
    def register(self, name, description, parameters, func):
        self.tools[name] = {
            "definition": {"name": name, "description": description, "parameters": parameters},
            "func": func
        }
        
    def execute(self, tool_name, arguments_json):
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' does not exist."}
        try:
            kwargs = json.loads(arguments_json) if isinstance(arguments_json, str) else arguments_json
            result = self.tools[tool_name]["func"](**kwargs)
            return {"status": "success", "result": result}
        except Exception as e:
            return {"error": f"Tool execution failed: {str(e)}"}

registry = ToolRegistry()
registry.register(
    name="query_weather",
    description="Retrieve live weather for a city",
    parameters={"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
    func=lambda city: f"Current weather in {city}: 22°C, Sunny"
)
print(registry.execute("query_weather", '{"city": "Tokyo"}'))`
    },
    productionPitfalls: [
      "Granting models destructive tools (e.g., delete_database, send_wire_transfer) without human-in-the-loop approval gates.",
      "Providing 50+ tool schemas simultaneously, which pollutes context and degrades tool selection accuracy; use dynamic tool filtering.",
      "Not catching tool execution exceptions, causing the entire backend service to crash on bad model inputs."
    ],
    keyTakeaways: [
      "The model does not execute tools; it emits JSON strings representing execution intents.",
      "Always validate arguments against strict types before passing them to backend functions.",
      "Feed errors back to the model as observations so it can self-correct."
    ],
    quiz: [
      {
        question: "When an LLM executes a tool call, where does the actual function code run?",
        options: [
          "On the host application/backend server running outside the LLM",
          "Inside the neural network weight matrix",
          "On the model provider's GPU cluster",
          "Inside the client's web browser exclusively"
        ],
        correctIndex: 0,
        explanation: "The LLM merely outputs a structured specification of which function to run and with what arguments; the host environment receives this text, executes the actual code, and passes the output back."
      }
    ],
    lectures: [
      {
        title: "How We Build Effective Agents",
        speaker: "Barry Zhang (Anthropic)",
        url: "https://www.youtube.com/watch?v=D7_ipDqhtwk",
        youtubeId: "D7_ipDqhtwk",
        duration: "34m",
        timestampedTakeaways: [
          { time: "00:04:15", takeaway: "Why simple composable patterns beat complex black-box agent frameworks" },
          { time: "00:12:30", takeaway: "Tool schema design: writing explicit instructions and defensive error boundaries" },
          { time: "00:22:00", takeaway: "Evaluator-Optimizer feedback loops and reducing variance in tool selection" }
        ]
      },
      {
        title: "Building more effective AI agents",
        speaker: "Anthropic Engineering",
        url: "https://www.youtube.com/watch?v=uhJJgc-0iTQ",
        youtubeId: "uhJJgc-0iTQ",
        duration: "45m",
        timestampedTakeaways: [
          { time: "00:08:00", takeaway: "Augmented LLMs vs autonomous loops: when to give an agent a tool vs hardcoded code" },
          { time: "00:25:30", takeaway: "Context management during multi-turn tool execution" }
        ]
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Streaming Tool Call Chunk Accumulator",
        subtitle: "Core DSA: Streaming JSON Buffer Assembly",
        problemStatement: "When an LLM streams tool calls, the JSON arguments arrive fragmented over dozens of SSE chunks (e.g. `{\"ci`, `ty\": \"`, `Tokyo\"}`). Implement `accumulate_streaming_tool_call(chunks: list[dict]) -> dict` that reconstructs the complete tool call name and parsed argument dictionary.",
        starterCode: `def accumulate_streaming_tool_call(chunks: list[dict]) -> dict:
    # TODO: Concatenate argument delta fragments and parse valid JSON
    pass`,
        solutionCode: `import json

def accumulate_streaming_tool_call(chunks: list[dict]) -> dict:
    call_id = None
    name = None
    args_str = ""
    for ch in chunks:
        if 'id' in ch and ch['id']: call_id = ch['id']
        if 'name' in ch and ch['name']: name = ch['name']
        if 'arguments_delta' in ch: args_str += ch['arguments_delta']
    return {
        "id": call_id,
        "name": name,
        "arguments": json.loads(args_str) if args_str else {}
    }`,
        testCases: [
          {
            input: 'chunks with delta arguments `{"city": `, `"Paris"}`',
            expectedOutput: '{"id": "...", "name": "...", "arguments": {"city": "Paris"}}',
            explanation: "Assembles fragmented tokens into a parseable JSON object."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Unvalidated Shell Injection Tool",
        subtitle: "Production Systems Bug: Agent executing untrusted bash string concatenation",
        problemStatement: "A developer implemented `execute_bash(command: str)` using `os.system(command)`. A prompt injection in a user issue caused the agent to run `pytest tests; rm -rf /`. Rewrite the tool execution runtime to enforce strict command whitelisting and argument tokenization via `subprocess.run`.",
        starterCode: `# VULNERABLE:
# def run_tool(cmd): os.system(cmd)`,
        solutionCode: `import subprocess, shlex

ALLOWED_BINARIES = {"pytest", "python", "git", "grep", "ls"}

def run_tool_secure(cmd_str: str, timeout_sec: int = 30) -> dict:
    args = shlex.split(cmd_str)
    if not args or args[0] not in ALLOWED_BINARIES:
        return {"error": f"Execution of binary '{args[0] if args else ''}' is barred."}
    try:
        proc = subprocess.run(args, capture_output=True, text=True, timeout=timeout_sec, check=False)
        return {"stdout": proc.stdout, "stderr": proc.stderr, "exit_code": proc.returncode}
    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}`,
        testCases: [
          {
            input: 'cmd_str="rm -rf /"',
            expectedOutput: 'Execution barred error returned safely',
            explanation: "Binary whitelisting and argument parsing prevents shell injection escapes."
          }
        ]
      }
    }
  },
  {
    id: "15-the-agent-execution-loop",
    number: "15",
    title: "The Agent Execution Loop: ReAct, Planning & Reflection",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "23 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer'],
    motto: "An agent is an autoregressive model wrapped inside a while-loop governed by state machines and termination guards.",
    problemStatement: "Single-turn LLM calls cannot solve complex multi-step objectives that require trial, error, verification, and intermediate observations. Autonomous agents bridge this gap using the ReAct (Reason + Act + Observe) paradigm, but without strict loop bounds, they enter infinite loops, hallucinate progress, and burn unlimited API credits.",
    coreConcepts: [
      {
        title: "The ReAct Loop: Thought, Action, Observation",
        summary: "Interleaving reasoning steps with concrete actions produces dramatically higher task completion rates.",
        content: [
          "1. Thought: Model explicitly reasons about the current state, missing information, and the immediate next milestone.",
          "2. Action: Model selects a tool and provides exact parameters.",
          "3. Observation: Model pauses while the environment executes the tool and injects the output.",
          "4. Repeat or Terminate: Model assesses whether the original objective has been fulfilled. If yes, it emits the Final Answer and exits the loop."
        ]
      },
      {
        title: "Loop Guardrails: Preventing Infinite Traps",
        summary: "Autonomous agents will inevitably encounter stuck states unless restricted by operational boundaries.",
        content: [
          "Max Iteration Cap: Hard cut-off (e.g. 10 iterations) to guarantee termination.",
          "Cost & Token Budgets: Cumulative budget limits per agent run (e.g. max $0.50 or 50,000 tokens).",
          "Repetition & Cycle Detection: Hash recent action signatures; if the model calls the same tool with the same arguments twice with identical results, inject a warning prompt forcing an alternate approach."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Production-Grade ReAct Agent Loop in Pure Python",
      description: "A complete autonomous loop featuring tool execution, cycle detection, iteration caps, and conversation state management.",
      code: `import json

class SimpleReActAgent:
    def __init__(self, tools_dict, max_iterations=5):
        self.tools = tools_dict
        self.max_iterations = max_iterations
        self.history = []
        self.executed_actions = set()

    def run(self, user_goal):
        self.history.append({"role": "user", "content": user_goal})
        for iteration in range(1, self.max_iterations + 1):
            # Simulated model step
            action_sig = "calc:200*0.0825"
            if action_sig in self.executed_actions:
                break
            self.executed_actions.add(action_sig)
            obs = "16.5"
            return f"Calculated sales tax is \${obs}."
        return "Terminated without resolution."

agent = SimpleReActAgent({})
print(agent.run("Calculate sales tax on $200 in CA"))`
    },
    productionPitfalls: [
      "Letting agents run indefinitely without hard iteration or monetary cost ceilings.",
      "Appending full, multi-megabyte API payloads to the prompt, immediately overflowing the context window.",
      "Allowing agents to perform irreversible writes (e.g. sending emails or updating records) without dry-run confirmation."
    ],
    keyTakeaways: [
      "ReAct combines reasoning traces with action execution, enabling step-by-step problem solving.",
      "Always truncate tool observations before re-injecting them into context.",
      "Implement cycle detection to abort repetitive loops early."
    ],
    quiz: [
      {
        question: "What is the primary function of the 'Thought' step in the ReAct (Reason + Act + Observe) framework?",
        options: [
          "It forces the model to articulate intermediate reasoning and state assessment before committing to a tool action",
          "It compresses the prompt into an image",
          "It sends an alert to the system administrator",
          "It verifies the API key"
        ],
        correctIndex: 0,
        explanation: "By decomposing complex tasks into an explicit thought step before acting, the model leverages chain-of-thought autoregression to decide the optimal next tool and arguments."
      }
    ],
    lectures: [
      {
        title: "Tips for building AI agents",
        speaker: "Anthropic Engineering",
        url: "https://www.youtube.com/watch?v=LP5OCa20Zpg",
        youtubeId: "LP5OCa20Zpg",
        duration: "28m",
        timestampedTakeaways: [
          { time: "00:03:30", takeaway: "The loop invariant: state management across tool turns" },
          { time: "00:11:45", takeaway: "How to prevent agents from getting stuck in repetitive debugging loops" },
          { time: "00:19:20", takeaway: "Human-in-the-loop checkpoints for sensitive actions" }
        ]
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Agent Action Cycle & Loop Detector",
        subtitle: "Core DSA: Cycle Detection via Sliding Window Hashing",
        problemStatement: "Implement `detect_agent_cycle(action_history: list[tuple[str, str]], window_size: int = 3) -> bool` which inspects the history of (tool_name, argument_hash) tuples and returns True if the same sequence of actions has repeated cyclically.",
        starterCode: `def detect_agent_cycle(history: list[tuple[str, str]], window_size: int = 3) -> bool:
    # TODO: Detect repeating subsequences
    pass`,
        solutionCode: `def detect_agent_cycle(history: list[tuple[str, str]], window_size: int = 3) -> bool:
    n = len(history)
    if n < 2 * window_size: return False
    # Check if the last window_size items are identical to the preceding window_size items
    recent = history[-window_size:]
    preceding = history[-2*window_size:-window_size]
    return recent == preceding`,
        testCases: [
          {
            input: 'history=[("read", "h1"), ("grep", "h2"), ("read", "h1"), ("grep", "h2")], window=2',
            expectedOutput: 'True (cycle detected!)',
            explanation: "The agent repeated the exact sequence ('read', 'h1') -> ('grep', 'h2') consecutively."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The 50MB Tool Output Context Blowup",
        subtitle: "Production Systems Bug: An agent reads a 50MB log file into prompt context",
        problemStatement: "An agent called `read_file('var/log/syslog')`. The tool returned a 50MB string. The host application dumped the entire string into the conversation context, causing an immediate 400 Bad Request (Context Window Exceeded) and $25 in burned tokens. Rewrite the tool observation wrapper with head-tail truncation and disk paging.",
        starterCode: `# Buggy tool return:
# return {"role": "tool", "content": raw_file_contents}`,
        solutionCode: `def format_tool_observation_safe(raw_output: str, max_chars: int = 8000) -> str:
    if len(raw_output) <= max_chars:
        return raw_output
    half = max_chars // 2
    truncated = (
        raw_output[:half] +
        f"\\n\\n[... TRUNCATED {len(raw_output) - max_chars} CHARACTERS TO PREVENT CONTEXT OVERFLOW ...]\\n\\n" +
        raw_output[-half:]
    )
    return truncated`,
        testCases: [
          {
            input: 'raw_output with 1,000,000 characters',
            expectedOutput: 'Output capped at 8000 chars with explicit truncation warning',
            explanation: "Prevents giant tool payloads from blowing up context windows while preserving head and tail logs."
          }
        ]
      }
    }
  },
  {
    id: "16-model-context-protocol-mcp",
    number: "16",
    title: "Model Context Protocol (MCP) & Inter-Agent Standards",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "20 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'harness-engineer'],
    motto: "MCP is the USB-C of AI engineering: a universal open protocol connecting agents to data sources, tools, and execution environments.",
    problemStatement: "Historically, every AI platform wrote proprietary integrations for Slack, GitHub, Postgres, and Jira. When developers switched frameworks, all integrations had to be rewritten. Anthropic's Model Context Protocol (MCP) standardizes how models discover and execute tools, read resources, and apply prompt templates across vendors.",
    coreConcepts: [
      {
        title: "MCP Architecture: Hosts, Clients, and Servers",
        summary: "A client-server JSON-RPC 2.0 protocol separating agent orchestration from tool implementation.",
        content: [
          "MCP Host: The application coordinating the agent (e.g. Antigravity, Claude Desktop, Cursor, Custom Backend).",
          "MCP Client: The protocol client running inside the host that maintains 1:1 connections with servers.",
          "MCP Server: Lightweight service exposing: 1) Tools (executable functions), 2) Resources (file-like read-only data streams), and 3) Prompts (pre-packaged templates).",
          "Transports: Standard I/O (`stdio`) for local process sandboxes; Server-Sent Events (`SSE`) / HTTP for remote web services."
        ]
      },
      {
        title: "The Three MCP Primitives: Tools, Resources, and Prompts",
        summary: "Understanding the difference between actionable functions and ambient context.",
        content: [
          "Tools (`tools/list`, `tools/call`): Invokable functions that have side-effects or perform real-time compute.",
          "Resources (`resources/list`, `resources/read`): Static or dynamic data feeds (e.g. database schemas, log files, repository contents) that provide context without execution side effects.",
          "Prompts (`prompts/list`, `prompts/get`): Slash-command workflows and system templates exposed directly by the server."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Pure Python MCP JSON-RPC 2.0 Stdio Handler",
      description: "Implementing the core JSON-RPC 2.0 dispatch mechanism that underlies Model Context Protocol servers.",
      code: `import json

class SimpleMCPServer:
    def __init__(self):
        self.tools = {}

    def register_tool(self, name, description, schema, handler):
        self.tools[name] = {"name": name, "description": description, "inputSchema": schema, "handler": handler}

    def handle_request(self, json_str):
        req = json.loads(json_str)
        method = req.get("method")
        req_id = req.get("id")
        
        if method == "tools/list":
            return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": list(self.tools.values())}}
        elif method == "tools/call":
            p = req.get("params", {})
            res = self.tools[p["name"]]["handler"](p.get("arguments", {}))
            return {"jsonrpc": "2.0", "id": req_id, "result": {"content": [{"type": "text", "text": str(res)}]}}

server = SimpleMCPServer()
server.register_tool("get_time", "Returns server time", {}, lambda args: "2026-11-13T12:00:00Z")
print(server.handle_request('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'))`
    },
    productionPitfalls: [
      "Running untrusted third-party MCP servers without container/sandbox isolation.",
      "Over-exposing sensitive environment variables and credentials to MCP stdio child processes.",
      "Blocking the stdio transport with debug print statements; in stdio mode, non-JSON stdout corrupts the protocol stream."
    ],
    keyTakeaways: [
      "MCP decouples tools from specific agent harnesses, enabling write-once run-anywhere integrations.",
      "All communication happens via JSON-RPC 2.0 over standard streams (stdio) or HTTP/SSE.",
      "Always sandbox tools that execute shell commands or write to file systems."
    ],
    quiz: [
      {
        question: "What transport protocol does Model Context Protocol (MCP) use for local machine tool servers?",
        options: [
          "JSON-RPC 2.0 over standard I/O (stdin / stdout)",
          "Bluetooth Low Energy",
          "Raw UDP broadcast packets",
          "gRPC binary over Unix domain sockets only"
        ],
        correctIndex: 0,
        explanation: "MCP utilizes standardized JSON-RPC 2.0 messages transmitted over standard input and output (stdio) for local processes, and HTTP with Server-Sent Events (SSE) for remote servers."
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: MCP JSON-RPC 2.0 Message Dispatcher",
        subtitle: "Core DSA: Protocol Serialization & Error Code Formatting",
        problemStatement: "Implement `mcp_dispatch(server_state: dict, raw_json_message: str) -> str` supporting `initialize`, `ping`, and returning proper JSON-RPC error `-32601` (Method not found) for unknown methods according to spec.",
        starterCode: `def mcp_dispatch(server_state: dict, raw_json_message: str) -> str:
    # TODO: Implement spec-compliant JSON-RPC 2.0 router
    pass`,
        solutionCode: `import json

def mcp_dispatch(server_state: dict, raw_json_message: str) -> str:
    try:
        req = json.loads(raw_json_message)
    except Exception:
        return json.dumps({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}})
    
    req_id = req.get("id")
    method = req.get("method")
    
    if method == "initialize":
        return json.dumps({"jsonrpc": "2.0", "id": req_id, "result": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}}})
    elif method == "ping":
        return json.dumps({"jsonrpc": "2.0", "id": req_id, "result": {}})
    else:
        return json.dumps({"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Method '{method}' not found"}})`,
        testCases: [
          {
            input: '{"jsonrpc": "2.0", "id": 4, "method": "unknown_cmd"}',
            expectedOutput: 'error with code -32601 and message "Method not found"',
            explanation: "Strict JSON-RPC 2.0 error contract compliance."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The MCP Stdout Stream Poisoning Crash",
        subtitle: "Production Systems Bug: Print statements corrupting stdio JSON-RPC transport",
        problemStatement: "A Python developer added `print('Connecting to DB...')` inside an MCP tool handler. Immediately, Claude Desktop / Cursor threw `JsonRpcTransportError: Unexpected non-JSON character 'C'` and disconnected. Fix the logging architecture by redirecting all debug statements to stderr.",
        starterCode: `# Buggy print:
# print(f"Executing tool {name}") # Corrupts stdio!`,
        solutionCode: `import sys

def debug_log(msg: str):
    # CRITICAL: stdio transport reserves stdout exclusively for JSON-RPC 2.0 messages!
    # All logging, diagnostics, and errors must be emitted to stderr:
    print(f"[DEBUG] {msg}", file=sys.stderr, flush=True)`,
        testCases: [
          {
            input: 'debug_log("Starting connection...")',
            expectedOutput: 'Logged to stderr without poisoning stdout JSON stream',
            explanation: "stdout is strictly a protocol channel in stdio MCP implementations."
          }
        ]
      }
    }
  },
  {
    id: "17-deterministic-workflows-vs-agents",
    number: "17",
    title: "Deterministic Workflows vs. Stochastic Agents",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "18 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'fde'],
    motto: "Use code for predictability; use agents only for ambiguity. Never let an LLM decide what a Python IF statement can solve.",
    problemStatement: "The most common architectural mistake in modern AI engineering is building a fully autonomous, stochastic agent for a problem that is 90% deterministic business logic. Stochastic agents have variance, failure rates, and high latency; production automations require Directed Acyclic Graphs (DAGs) and state machines.",
    coreConcepts: [
      {
        title: "The Agent Spectrum: From Hardcoded DAGs to Autonomous Loops",
        summary: "Classifying systems based on how much control is handed to the model.",
        content: [
          "Pattern 1: Prompt Chaining (Deterministic). Step A -> Step B -> Step C. The output of one LLM call is passed as input to the next via hardcoded code logic.",
          "Pattern 2: Router / Switch. An LLM classifies user intent into one of 5 deterministic workflows. Once routed, standard code takes over.",
          "Pattern 3: Parallelization (Fan-Out / Fan-In). Multiple calls run concurrently to vote or generate components, merged deterministically.",
          "Pattern 4: Orchestrator-Workers. An orchestrator model breaks down a goal, delegates sub-tasks to worker models, and synthesizes output.",
          "Pattern 5: Autonomous ReAct Agent. Fully stochastic loop where the model decides its own control flow dynamically."
        ]
      },
      {
        title: "The Golden Rule of AI Automations",
        summary: "Push variance to the leaves of your architecture.",
        content: [
          "Keep the control plane (routing, error handling, retries, database transactions) in deterministic software (Python, TypeScript, Go).",
          "Use LLMs purely for data transformation, natural language comprehension, and ambiguous decision nodes."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "State-Machine Directed Workflow (Deterministic Routing)",
      description: "A predictable workflow pattern combining deterministic state transitions with LLM intelligence.",
      code: `class SupportWorkflowEngine:
    def classify_intent(self, text):
        t = text.lower()
        if any(w in t for w in ["bill", "charge", "refund"]): return "BILLING"
        elif any(w in t for w in ["bug", "error", "down"]): return "TECH_SUPPORT"
        return "GENERAL"

    def run(self, ticket):
        intent = self.classify_intent(ticket)
        if intent == "BILLING": return "Routed to Billing Engine."
        elif intent == "TECH_SUPPORT": return "Routed to Tech Support."
        return "Routed to FAQ."

engine = SupportWorkflowEngine()
print(engine.run("Why was my credit card charged twice?"))`
    },
    productionPitfalls: [
      "Letting an autonomous agent navigate an entire 15-step enterprise payroll workflow autonomously without check-points.",
      "Using an LLM for simple string extraction when regex or standard library parsers are 1000x faster and 100% deterministic.",
      "Failing to record state transitions in a durable database (e.g. Postgres, SQLite) between workflow steps."
    ],
    keyTakeaways: [
      "Hardcoded DAGs and state machines beat autonomous agents in reliability, latency, cost, and auditability.",
      "Use agents when the steps cannot be predicted upfront (e.g., exploratory coding, debugging unknown failures).",
      "Use workflows when the steps are known and only individual task content requires intelligence."
    ],
    quiz: [
      {
        question: "When should an engineering team prefer a deterministic workflow (DAG) over an autonomous stochastic agent?",
        options: [
          "When the business process has well-defined stages, strict compliance rules, and repeatable milestones",
          "Only when using open-source models",
          "When the prompt is shorter than 10 tokens",
          "Deterministic workflows are obsolete"
        ],
        correctIndex: 0,
        explanation: "For structured, high-stakes business processes, deterministic state machines and DAGs ensure reproducibility, auditability, and minimal failure rates compared to stochastic agent loops."
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: DAG Topological Sort & Cycle Validator for Workflows",
        subtitle: "Core DSA: Kahn's Algorithm & Graph Traversal",
        problemStatement: "In a workflow builder, tasks depend on outputs of other tasks. Implement `validate_workflow_dag(tasks: dict[str, list[str]]) -> tuple[bool, list[str]]` which validates if a workflow dependency graph has cycles, returning `(True, execution_order)` or `(False, [])` if cyclic.",
        starterCode: `def validate_workflow_dag(tasks: dict[str, list[str]]) -> tuple[bool, list[str]]:
    # tasks: dict mapping task_id -> list of task_ids it depends on
    pass`,
        solutionCode: `from collections import deque

def validate_workflow_dag(tasks: dict[str, list[str]]) -> tuple[bool, list[str]]:
    # In-degree calculation
    in_degree = {t: len(deps) for t, deps in tasks.items()}
    # Adjacency list: dep -> list of tasks waiting for it
    adj = {t: [] for t in tasks}
    for t, deps in tasks.items():
        for d in deps:
            if d in adj: adj[d].append(t)
            
    q = deque([t for t, deg in in_degree.items() if deg == 0])
    order = []
    
    while q:
        curr = q.popleft()
        order.append(curr)
        for follower in adj.get(curr, []):
            in_degree[follower] -= 1
            if in_degree[follower] == 0:
                q.append(follower)
                
    if len(order) == len(tasks):
        return True, order
    return False, []`,
        testCases: [
          {
            input: '{"A": [], "B": ["A"], "C": ["B"]}',
            expectedOutput: '(True, ["A", "B", "C"])',
            explanation: "Valid linear DAG executed in topological order."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Stochastic Routing Flake Bug",
        subtitle: "Production Systems Bug: Model classifying refunds as product feedback at temperature=0.7",
        problemStatement: "A payment routing endpoint used an LLM prompt to classify tickets. At high concurrency, 3% of angry cancellation tickets were misclassified as 'Feature Requests', causing SLA breaches. Replace the stochastic classification with few-shot calibrated logit bias or Pydantic enum validation.",
        starterCode: `# Flaky classification:
# resp = llm.complete("Classify ticket into: REFUND, BUG, FEATURE: " + text)`,
        solutionCode: `from enum import Enum
from pydantic import BaseModel

class TicketCategory(str, Enum):
    REFUND = "REFUND"
    BUG = "BUG"
    FEATURE = "FEATURE"

class TriageResult(BaseModel):
    category: TicketCategory
    confidence: float

# Using Structured Outputs with Temperature = 0.0 guarantees exact Enum membership:
result = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": ticket_text}],
    temperature=0.0,
    response_format=TriageResult
)`,
        testCases: [
          {
            input: 'Angry cancellation ticket',
            expectedOutput: 'Guaranteed to return category=TicketCategory.REFUND',
            explanation: "Temperature 0 + Pydantic Enum eliminates classification variance."
          }
        ]
      }
    }
  },
  {
    id: "18-resilient-automations-durable-execution",
    number: "18",
    title: "Resilient Automations & Durable Execution",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "21 min",
    targetRoles: ['ai-engineer', 'agent-architect', 'fde'],
    motto: "A long-running agent will crash, lose network connectivity, or hit rate limits. Durable execution ensures it resumes from step 7, not step 1.",
    problemStatement: "Multi-step AI automations that take 5-30 minutes to execute (e.g., repository migration, multi-document research, compliance auditing) cannot run in-memory inside an ephemeral web request. If the container restarts or hits a 429 rate limit, the entire process dies, wasting tokens and leaving systems in inconsistent states.",
    coreConcepts: [
      {
        title: "Durable Execution Mechanics (Temporal, Inngest, DB Checkpointing)",
        summary: "Separating process state and execution checkpoints from ephemeral container lifecycles.",
        content: [
          "Checkpointing: Before and after every tool execution or LLM step, the complete conversation context, tool state, and variables are committed to durable persistence (Postgres, Redis).",
          "Idempotency Keys: Every external action (Stripe charge, email send, git commit) is tagged with a deterministic idempotency key. If a crashed step re-executes on retry, the external service ignores the duplicate call.",
          "Exponential Backoff with Jitter: When model provider APIs return HTTP 429 (Rate Limit) or HTTP 503 (Overloaded), automations must pause execution without terminating the parent thread."
        ]
      },
      {
        title: "Human-in-the-Loop (HITL) Approval Suspensions",
        summary: "Safely pausing execution indefinitely until an authorized human grants permission.",
        content: [
          "The automation executes steps 1 through 4 autonomously.",
          "Step 5 involves an irreversible action (e.g. merging a pull request or deleting resources). The workflow yields execution and enters a `WAITING_FOR_APPROVAL` state.",
          "The worker thread exits, freeing memory. Hours later, a human clicks 'Approve' in Slack or web dashboard, which sends a resume event and restores state instantly."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Durable Agent Checkpointing & Resume in Pure Python",
      description: "A resilient state store that persists step execution and can resume from crashes without re-running completed work.",
      code: `class DurableWorkflow:
    def __init__(self, db_store, task_id):
        self.db = db_store
        self.task_id = task_id

    def step(self, step_idx, name, fn, state):
        ckpt = self.db.get(self.task_id, {})
        if ckpt.get("last_step", 0) >= step_idx:
            return ckpt["state"][f"step_{step_idx}"]
        res = fn(state)
        state[f"step_{step_idx}"] = res
        self.db[self.task_id] = {"last_step": step_idx, "state": state}
        return res

db = {}
wf = DurableWorkflow(db, "job_492")
s = {}
s["s1"] = wf.step(1, "Fetch", lambda st: "Fetched Data", s)
s["s2"] = wf.step(2, "Process", lambda st: 42, s)
# Simulate crash & resume:
wf2 = DurableWorkflow(db, "job_492")
print("Resuming Step 2:", wf2.step(2, "Process", lambda st: 999, s))`
    },
    productionPitfalls: [
      "Running multi-step agents inside single HTTP request handlers subject to 30-second gateway timeouts.",
      "Retrying side-effect tool calls without idempotency keys, resulting in double-charging credit cards or duplicate tickets.",
      "Failing to persist state before entering a human-approval pause, losing context when the application redeploys."
    ],
    keyTakeaways: [
      "Production agent automations must be built on durable execution patterns (Temporal, Inngest, or database-backed state machines).",
      "Always attach idempotency keys to non-read-only tool calls.",
      "Decouple long-running workflows into asynchronous step checkpoints."
    ],
    quiz: [
      {
        question: "Why are Idempotency Keys critical when building resilient AI automations with tool execution?",
        options: [
          "They prevent duplicate execution of side-effects (e.g. payments or email sends) if a failed step is retried",
          "They speed up GPU floating-point matrix multiplication",
          "They allow the model to bypass safety filters",
          "They are required by the JSON standard"
        ],
        correctIndex: 0,
        explanation: "If a workflow fails or times out after sending a request but before receiving confirmation, retrying the step with the same idempotency key guarantees the downstream service executes it only once."
      }
    ],
    simulatorType: 'fde-economics',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Exponential Backoff with Full Jitter",
        subtitle: "Core DSA: Stochastic Retry Intervals (AWS Architecture Pattern)",
        problemStatement: "Implement `calculate_backoff_delay(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float` using the standard AWS Full Jitter algorithm $V = \\text{Uniform}(0, \\min(\\text{max\\_delay}, \\text{base} \\times 2^{\\text{attempt}}))$.",
        starterCode: `def calculate_backoff_delay(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    # TODO: Implement full jitter backoff
    pass`,
        solutionCode: `import random

def calculate_backoff_delay(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    cap = min(max_delay, base_delay * (2 ** attempt))
    return random.uniform(0, cap)`,
        testCases: [
          {
            input: 'attempt=3, base=1.0, max=60.0',
            expectedOutput: 'Random float uniformly distributed between 0 and 8.0 seconds',
            explanation: "Prevents 'thundering herd' spikes when hundreds of parallel workers hit rate limits simultaneously."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Duplicate Stripe Charge on Worker Timeout",
        subtitle: "Production Systems Bug: Celery worker timeout retrying payment task without idempotency key",
        problemStatement: "A background agent task called `stripe.Charge.create(amount=5000)`. The HTTP response hung for 35 seconds, triggering Celery's worker timeout. Celery retried the task, charging the customer $50.00 twice. Fix the payment tool with deterministic UUID idempotency keys.",
        starterCode: `# Buggy payment tool:
# charge = stripe.Charge.create(amount=5000, customer=cust_id)`,
        solutionCode: `import hashlib

def create_idempotent_charge(workflow_id: str, step_id: str, amount: int, customer_id: str):
    # Derive deterministic idempotency key from workflow state:
    idempotency_key = hashlib.sha256(f"{workflow_id}:{step_id}:{customer_id}".encode()).hexdigest()
    return stripe.Charge.create(
        amount=amount,
        customer=customer_id,
        idempotency_key=idempotency_key # Stripe guarantees exact 1 execution within 24h
    )`,
        testCases: [
          {
            input: 'Same task re-executed 3 times after worker timeout',
            expectedOutput: 'Customer charged exactly once; subsequent calls return initial transaction response.',
            explanation: "Idempotency keys ensure external payment gateways execute transactions exactly once."
          }
        ]
      }
    }
  },
  {
    id: "19-multi-agent-orchestration-handoffs",
    number: "19",
    title: "Multi-Agent Orchestration & Handoffs",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "24 min",
    targetRoles: ['agent-architect', 'ai-engineer'],
    motto: "A single monolithic prompt fails at complex tasks. Multi-agent systems succeed by isolating state and strictly scoping roles.",
    problemStatement: "Giving one agent 40 tools results in confused tool selections, context window overflow, and catastrophic hallucinations. Production architectures decompose monolithic agents into specialized sub-agents (e.g. Researcher, Coder, Verifier) coordinated through Supervisor or Swarm topologies with structured handoff schemas.",
    coreConcepts: [
      {
        title: "Supervisor vs. Swarm Topologies",
        summary: "Centralized coordination versus peer-to-peer agent delegation.",
        content: [
          "Supervisor / Router Pattern: A central lead agent receives the user goal, decomposes it into sub-tasks, delegates to specialized sub-agents, and reviews their outputs.",
          "Swarm / Handoff Pattern (e.g. OpenAI Swarm): Sub-agents dynamically transfer control to peer agents by returning a `transfer_to_agent_name` tool call. Each agent has its own scoped prompt and tool belt.",
          "Context Quarantine: Sub-agents run in isolated conversation contexts. Only the finalized summary or structured artifact is passed back to the supervisor, preventing context pollution."
        ],
        diagram: `User Request
  │
  ▼
[Supervisor Agent] (Coordinates & validates)
  ├──► [Research Agent] (Web search & documentation tools) ──► Returns clean Markdown summary
  ├──► [Coding Agent] (AST & file editing tools) ────────────► Returns git diff patch
  └──► [Verifier Agent] (Test runner sandbox) ───────────────► Returns Pass/Fail test log`
      },
      {
        title: "Handoff State Protocols & Schemas",
        summary: "How state is communicated safely across agent boundaries.",
        content: [
          "Transfer Function Contract: `transfer_to_verifier(context_summary: str, artifact_path: str)`.",
          "Shared Message Board / Blackboards: Agents post updates to a shared persistent board while maintaining independent working memory buffers."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Pure Python Swarm Handoff Pattern from Scratch",
      description: "Implementing lightweight agent handoffs using function returns and scoped tools without external frameworks.",
      code: `class Agent:
    def __init__(self, name, instructions, tools):
        self.name = name
        self.instructions = instructions
        self.tools = tools

def transfer_to_billing():
    return billing_agent

def transfer_to_tech():
    return tech_agent

triage_agent = Agent("Triage", "Classify customer intent", {"to_billing": transfer_to_billing, "to_tech": transfer_to_tech})
billing_agent = Agent("Billing", "Handle refunds and invoices", {"refund": lambda: "Refund processed"})
tech_agent = Agent("TechSupport", "Diagnose server errors", {"check_logs": lambda: "Logs healthy"})

def run_swarm(current_agent, user_message):
    print(f"[{current_agent.name}] received: '{user_message}'")
    if "refund" in user_message.lower():
        # Agent decides to hand off to billing
        next_agent = current_agent.tools["to_billing"]()
        print(f"-> Handoff from {current_agent.name} to {next_agent.name}")
        return next_agent, next_agent.tools["refund"]()
    return current_agent, "Handled by triage."

final_agent, result = run_swarm(triage_agent, "I need a refund on my last invoice")
print("Outcome:", result)`
    },
    productionPitfalls: [
      "Creating cyclic handoff loops between Agent A and Agent B (e.g. Researcher asks Coder, Coder asks Researcher indefinitely).",
      "Passing entire bloated conversation histories during handoffs, blowing up the child agent's context window.",
      "Failing to designate a single agent with final authority to terminate the interaction."
    ],
    keyTakeaways: [
      "Use Multi-Agent patterns to quarantine context and keep tool sets small and focused (< 8 tools per agent).",
      "Supervisor topologies provide strong auditability; Swarm handoffs provide agile conversational transitions.",
      "Always enforce max handoff depth caps to prevent ping-pong loops."
    ],
    quiz: [
      {
        question: "What is the primary advantage of isolating context between specialized sub-agents in a multi-agent system?",
        options: [
          "It prevents context dilution and hallucinations by ensuring each sub-agent only sees information relevant to its specific domain",
          "It reduces network bandwidth to zero",
          "It allows running models without internet access",
          "It converts all prompts into Python code"
        ],
        correctIndex: 0,
        explanation: "By keeping sub-agent contexts quarantined, agents are not distracted by irrelevant intermediate tool outputs or instructions from other domains."
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Multi-Agent Handoff Depth & Loop Guard",
        subtitle: "Core DSA: Finite State Machine & Maximum Recursion Depth",
        problemStatement: "Implement `execute_handoff_chain(start_agent: str, transition_table: dict[str, str], max_depth: int = 4) -> tuple[list[str], bool]` that executes agent transitions, detects any repetitive cycles, and terminates cleanly when reaching a terminal state or when `max_depth` is exceeded.",
        starterCode: `def execute_handoff_chain(start: str, transitions: dict[str, str], max_depth: int = 4) -> tuple[list[str], bool]:
    # TODO: Track chain and detect loops
    pass`,
        solutionCode: `def execute_handoff_chain(start: str, transitions: dict[str, str], max_depth: int = 4) -> tuple[list[str], bool]:
    chain = [start]
    curr = start
    for _ in range(max_depth):
        nxt = transitions.get(curr)
        if not nxt:
            return chain, True # Reached terminal agent successfully
        if nxt in chain:
            chain.append(nxt)
            return chain, False # Cycle detected!
        chain.append(nxt)
        curr = nxt
    return chain, False # Max depth exceeded`,
        testCases: [
          {
            input: 'start="Triage", transitions={"Triage": "Billing", "Billing": "Triage"}',
            expectedOutput: '(["Triage", "Billing", "Triage"], False)',
            explanation: "Cycle detected when Billing transitions back to Triage."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Sub-Agent Context Leaking Outage",
        subtitle: "Production Systems Bug: Child agent reading parent agent's system credentials",
        problemStatement: "A parent supervisor agent held administrative database connection strings in its system prompt. When spawning a child web scraper agent, it naively copied `messages=parent.messages`. The web scraper encountered an indirect prompt injection that extracted the parent's system credentials. Architect the sanitized handoff payload.",
        starterCode: `# Buggy inheritance:
# child_agent.run(messages=parent_agent.messages)`,
        solutionCode: `def spawn_isolated_child_agent(child_type: str, task_brief: str) -> dict:
    # Strictly isolate child system prompt and context:
    child_system_prompts = {
        "scraper": "You are a web scraper. You have access only to fetch_url. Output text only."
    }
    # Pass ONLY the task brief, NEVER the parent message history or system prompt!
    return {
        "system": child_system_prompts[child_type],
        "messages": [{"role": "user", "content": task_brief}]
    }`,
        testCases: [
          {
            input: 'Child agent inspected by prompt injection attack',
            expectedOutput: 'Zero parent secrets or connection strings present in child context',
            explanation: "Context isolation enforces the principle of least privilege across sub-agents."
          }
        ]
      }
    }
  },
  {
    id: "20-code-execution-sandboxes-computer-use",
    number: "20",
    title: "Code Execution Sandboxes & Computer Use",
    moduleId: "agents",
    moduleName: "Agentic Loops, Sandboxes & Multi-Agent Systems",
    trackNumber: 3,
    readTime: "25 min",
    targetRoles: ['agent-architect', 'harness-engineer', 'ai-engineer'],
    motto: "Never trust an agent with your host machine. True autonomy requires ephemeral, network-isolated microVMs.",
    problemStatement: "Autonomous coding agents and GUI computer-use models (e.g. Anthropic Computer Use) generate arbitrary bash, Python, and OS mouse/keyboard actions. Running these actions on the host workstation risks accidental filesystem destruction, fork-bombs, cryptocurrency mining, and credential theft. Production architectures demand microVM sandboxing (E2B, gVisor, Firecracker).",
    coreConcepts: [
      {
        title: "The Sandbox Isolation Spectrum",
        summary: "Comparing isolation mechanisms from OS processes to microVMs.",
        content: [
          "Local Subprocess / chroot: Zero security. Trivial to escape via symlinks, kill parent processes, or read environment variables.",
          "Docker / Container Isolation: Good for development, but shares the Linux kernel with the host. Vulnerable to kernel privilege escalation CVEs.",
          "gVisor / Kata Containers: Intercepts and virtualizes syscalls in userspace, providing a robust security boundary with fast startup (< 100ms).",
          "MicroVMs (Firecracker / E2B): Dedicated guest kernels with hardware-assisted virtualization. Complete hypervisor-level isolation. Cold starts in ~150ms."
        ]
      },
      {
        title: "Computer Use & Headless Browser Instrumentation",
        summary: "Enabling agents to interact with graphical interfaces and live web pages.",
        content: [
          "CDP (Chrome DevTools Protocol) / Playwright: Controlling headless Chromium instances with accessibility tree snapshots rather than raw visual screenshots.",
          "Accessibility Trees (a11y): Converting DOM nodes into structured interactive coordinates (`click(node_id=42)`), slashing token costs by 80% compared to pixel streaming.",
          "Virtual Framebuffers (Xvfb): Running virtual display servers inside headless containers to capture screenshots and dispatch mouse clicks (`xdotool`)."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Ephemeral Container Execution Wrapper with Resource Ceilings in Python",
      description: "Running untrusted agent code with memory limits, CPU quotas, and timeout enforcement.",
      code: `import subprocess, tempfile, os

def execute_untrusted_python(code_snippet: str, timeout_sec: int = 5, max_mem_mb: int = 128):
    """
    Simulates sandboxed execution with strict resource constraints and timeouts.
    """
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code_snippet)
        temp_path = f.name
        
    try:
        # In production, wrapped via: docker run --rm -m 128m --cpus=0.5 --network=none
        cmd = ["python", temp_path]
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_sec
        )
        return {
            "stdout": res.stdout,
            "stderr": res.stderr,
            "exit_code": res.returncode,
            "status": "COMPLETED"
        }
    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out (CPU/Infinite Loop ceiling hit)", "status": "TIMEOUT"}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Test safe execution
print(execute_untrusted_python("print('Hello from sandbox!')"))
# Test infinite loop termination
print(execute_untrusted_python("while True: pass", timeout_sec=1))`
    },
    productionPitfalls: [
      "Granting unrestricted outbound internet access to execution sandboxes, allowing data exfiltration via curl/DNS.",
      "Mounting the host project root as a read-write volume into the sandbox, allowing agents to corrupt `.git` state.",
      "Not cleaning up stale microVM containers, causing disk space exhaustion on host nodes."
    ],
    keyTakeaways: [
      "Never execute agent-generated code directly on host OS runtimes.",
      "Use microVMs (E2B / Firecracker) or gVisor sandboxes with air-gapped network egress.",
      "For browser automation, prioritize accessibility trees over raw pixel coordinate clicks to optimize latency and token budgets."
    ],
    quiz: [
      {
        question: "Why are microVMs (like AWS Firecracker or E2B) preferred over traditional Docker containers for running untrusted agent-generated code?",
        options: [
          "MicroVMs run a dedicated isolated guest kernel, preventing host kernel exploit escapes",
          "MicroVMs make Python run 100x faster",
          "Docker containers do not support Python",
          "MicroVMs do not require RAM"
        ],
        correctIndex: 0,
        explanation: "Traditional Docker containers share the host operating system's kernel. A malicious script with a kernel exploit can escape the container. MicroVMs provide true hypervisor-level virtualization with independent guest kernels."
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Playwright Accessibility Tree Action Pruner",
        subtitle: "Core DSA: Tree Pruning & Interactive Node Extraction",
        problemStatement: "A full HTML DOM accessibility tree contains 5,000 nodes. Implement `prune_a11y_tree(node: dict) -> dict | None` that recursively prunes all static, non-interactive layout nodes (e.g. empty divs, non-clickable spans) and retains only nodes with roles: `button`, `link`, `input`, `textarea`, or with direct text children.",
        starterCode: `def prune_a11y_tree(node: dict) -> dict | None:
    # node: {"role": str, "name": str, "children": list[dict]}
    pass`,
        solutionCode: `def prune_a11y_tree(node: dict) -> dict | None:
    INTERACTIVE_ROLES = {"button", "link", "input", "textarea", "checkbox", "menuitem"}
    pruned_children = []
    for c in node.get("children", []):
        res = prune_a11y_tree(c)
        if res: pruned_children.append(res)
        
    is_interactive = node.get("role") in INTERACTIVE_ROLES
    has_text = bool(node.get("name", "").strip())
    
    if is_interactive or has_text or pruned_children:
        return {
            "role": node.get("role"),
            "name": node.get("name", ""),
            "children": pruned_children
        }
    return None`,
        testCases: [
          {
            input: 'Tree with 10 nested layout divs containing 1 button',
            expectedOutput: 'Pruned tree preserving only the button node and direct path',
            explanation: "Reduces token consumption by >80% when passing UI state to vision/text LLMs."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Fork-Bomb Sandbox Freeze Outage",
        subtitle: "Production Systems Bug: Agent executing recursive subprocesses exhausting host PID table",
        problemStatement: "An agent generated Python code containing `import os; [os.fork() for _ in range(100)]`. The host system froze, killing all active services on the server. Configure Linux cgroups to enforce strict `pids.max` and memory ceilings.",
        starterCode: `# VULNERABLE HOST RUNNER:
# subprocess.run(["python", script_path])`,
        solutionCode: `# Secure Linux Cgroup / Container Configuration:
# docker run --rm \\
#   --pids-limit 64 \\             # Prevents fork bombs from exhausting PID table
#   --memory 256m \\               # Strict memory limit
#   --cpus 1.0 \\                  # CPU throttle
#   --network none \\              # Complete network isolation
#   --read-only \\                 # Read-only root filesystem
#   --tmpfs /tmp:rw,noexec,nosuid  # Ephemeral /tmp directory with no execution flags`,
        testCases: [
          {
            input: 'Fork-bomb script executed inside container with --pids-limit 64',
            expectedOutput: 'Script terminated with BlockingIOError / Resource temporarily unavailable; host unaffected',
            explanation: "Kernel cgroup limits guarantee the host operating system remains stable."
          }
        ]
      }
    }
  }
];
