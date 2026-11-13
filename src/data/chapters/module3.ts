import type { Chapter } from '../../types/curriculum';

export const MODULE_3_CHAPTERS: Chapter[] = [
  {
    id: "12-tool-calling-and-function-schemas",
    number: "12",
    title: "Tool Calling & Function Schemas",
    moduleId: "agents",
    moduleName: "Agentic Loops & Automations",
    readTime: "19 min",
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
            "definition": {
                "name": name,
                "description": description,
                "parameters": parameters
            },
            "func": func
        }
        
    def get_definitions(self):
        return [t["definition"] for t in self.tools.values()]
        
    def execute(self, tool_name, arguments_json):
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' does not exist in registry."}
            
        try:
            kwargs = json.loads(arguments_json) if isinstance(arguments_json, str) else arguments_json
            # Execute underlying Python function
            result = self.tools[tool_name]["func"](**kwargs)
            return {"status": "success", "result": result}
        except TypeError as e:
            return {"error": f"Invalid arguments supplied: {str(e)}"}
        except Exception as e:
            return {"error": f"Tool execution failed: {str(e)}"}

# Define a real tool
def query_weather(city: str, metric: bool = True):
    # Simulated weather lookup
    temp = 22 if metric else 72
    unit = "C" if metric else "F"
    return f"Current weather in {city}: {temp}°{unit}, Sunny"

# Register the tool
registry = ToolRegistry()
registry.register(
    name="query_weather",
    description="Retrieve live weather conditions for a given city.",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name, e.g. San Francisco"},
            "metric": {"type": "boolean", "description": "True for Celsius, False for Fahrenheit"}
        },
        "required": ["city"]
    },
    func=query_weather
)

# Simulate model outputting tool call payload
simulated_model_call = {
    "name": "query_weather",
    "arguments": '{"city": "Tokyo", "metric": true}'
}

# Host runtime dispatches call
observation = registry.execute(simulated_model_call["name"], simulated_model_call["arguments"])
print("Tool Execution Result to return to LLM:")
print(json.dumps(observation, indent=2))`
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
    ]
  },
  {
    id: "13-the-agent-execution-loop",
    number: "13",
    title: "The Agent Execution Loop: ReAct, Planning & Reflection",
    moduleId: "agents",
    moduleName: "Agentic Loops & Automations",
    readTime: "23 min",
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

    def mock_llm_call(self, messages):
        """
        Simulated LLM simulating Thought -> Action -> Final Answer.
        In production, replace with client.chat.completions.create().
        """
        turn = len([m for m in messages if m["role"] == "assistant"])
        if turn == 0:
            return {
                "thought": "I need to calculate the sales tax on $200 in California (8.25%).",
                "action": "calculator",
                "action_input": {"expression": "200 * 0.0825"}
            }
        else:
            # Observes result from previous turn
            last_obs = messages[-1]["content"]
            return {
                "thought": f"The calculated tax is {last_obs}. Now I can provide the final answer.",
                "final_answer": f"The sales tax on $200 is \${last_obs}."
            }

    def run(self, user_goal):
        print(f"=== Starting Agent Goal: '{user_goal}' ===")
        self.history.append({"role": "user", "content": user_goal})
        
        for iteration in range(1, self.max_iterations + 1):
            print(f"--- Iteration {iteration} ---")
            
            # Step 1: Model generates thought and action
            response = self.mock_llm_call(self.history)
            
            if "final_answer" in response:
                print(f"[FINAL ANSWER] {response['final_answer']}")
                return response["final_answer"]
                
            thought = response.get("thought", "")
            action = response.get("action")
            action_input = response.get("action_input", {})
            print(f"[THOUGHT] {thought}")
            print(f"[ACTION]  Execute '{action}' with {action_input}")
            
            # Cycle detection
            action_sig = f"{action}:{json.dumps(action_input, sort_keys=True)}"
            if action_sig in self.executed_actions:
                print("[WARNING] Cycle detected! Tool called with identical arguments.")
            self.executed_actions.add(action_sig)
            
            # Step 2: Execute Action
            if action in self.tools:
                obs = self.tools[action](**action_input)
            else:
                obs = f"Error: Tool '{action}' does not exist."
            print(f"[OBSERVATION] {obs}")
            
            # Step 3: Record observation in context
            self.history.append({"role": "assistant", "content": json.dumps(response)})
            self.history.append({"role": "tool", "content": str(obs)})
            
        print("[TERMINATED] Max iterations reached without final answer.")
        return None

# Provide tool
tools = {
    "calculator": lambda expression: str(eval(expression))
}

agent = SimpleReActAgent(tools, max_iterations=3)
agent.run("Calculate California sales tax on $200")`
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
    ]
  },
  {
    id: "14-model-context-protocol-mcp",
    number: "14",
    title: "Model Context Protocol (MCP) & Inter-Agent Standards",
    moduleId: "agents",
    moduleName: "Agentic Loops & Automations",
    readTime: "20 min",
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
import sys

class SimpleMCPServer:
    def __init__(self, name="demo-mcp-server", version="1.0.0"):
        self.name = name
        self.version = version
        self.tools = {}

    def register_tool(self, name, description, schema, handler):
        self.tools[name] = {
            "name": name,
            "description": description,
            "inputSchema": schema,
            "handler": handler
        }

    def handle_request(self, json_str):
        try:
            req = json.loads(json_str)
            req_id = req.get("id")
            method = req.get("method")
            params = req.get("params", {})

            # 1. MCP Initialization
            if method == "initialize":
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "serverInfo": {"name": self.name, "version": self.version},
                        "capabilities": {"tools": {}}
                    }
                }

            # 2. List available tools
            elif method == "tools/list":
                tool_list = [
                    {"name": t["name"], "description": t["description"], "inputSchema": t["inputSchema"]}
                    for t in self.tools.values()
                ]
                return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": tool_list}}

            # 3. Call tool
            elif method == "tools/call":
                t_name = params.get("name")
                args = params.get("arguments", {})
                if t_name not in self.tools:
                    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": "Tool not found"}}
                result_content = self.tools[t_name]["handler"](args)
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": [{"type": "text", "text": str(result_content)}]}
                }

            else:
                return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": "Method not supported"}}
        except Exception as e:
            return {"jsonrpc": "2.0", "id": None, "error": {"code": -32603, "message": str(e)}}

# Instantiate and test
server = SimpleMCPServer()
server.register_tool(
    name="get_system_time",
    description="Returns server timestamp",
    schema={"type": "object", "properties": {}},
    handler=lambda args: "2026-11-13T10:00:00Z"
)

# Test 'tools/list' request
sample_req = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
response = server.handle_request(sample_req)
print("MCP Server Response:\n", json.dumps(response, indent=2))`
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
    ]
  },
  {
    id: "15-deterministic-workflows-vs-agents",
    number: "15",
    title: "Deterministic Workflows vs. Stochastic Agents",
    moduleId: "agents",
    moduleName: "Agentic Loops & Automations",
    readTime: "18 min",
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
    """Deterministic routing state machine with LLM intent classification."""
    def __init__(self):
        self.state = "TRIAGE"
        
    def classify_intent(self, text):
        # Simulated LLM classification call (Temperature = 0)
        t = text.lower()
        if "bill" in t or "charge" in t or "refund" in t:
            return "BILLING"
        elif "bug" in t or "error" in t or "down" in t:
            return "TECH_SUPPORT"
        return "GENERAL"

    def run(self, user_ticket):
        print(f"Processing Ticket: '{user_ticket}'")
        
        # Step 1: Deterministic classification via LLM
        intent = self.classify_intent(user_ticket)
        print(f"[State: TRIAGE] Intent classified as: {intent}")
        
        # Step 2: Strict deterministic branching
        if intent == "BILLING":
            return self.handle_billing(user_ticket)
        elif intent == "TECH_SUPPORT":
            return self.handle_tech_support(user_ticket)
        else:
            return self.handle_general(user_ticket)
            
    def handle_billing(self, ticket):
        # Deterministic API check before LLM synthesis
        return "Routed to Billing Engine: Initiated automatic invoice lookup."
        
    def handle_tech_support(self, ticket):
        return "Routed to Engineering: Triggered diagnostic system log capture."
        
    def handle_general(self, ticket):
        return "Routed to FAQ Bot: Synthesizing help documentation."

engine = SupportWorkflowEngine()
print(engine.run("Why was my credit card charged twice yesterday?"))`
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
    ]
  },
  {
    id: "16-resilient-automations-durable-execution",
    number: "16",
    title: "Resilient Automations & Durable Execution",
    moduleId: "agents",
    moduleName: "Agentic Loops & Automations",
    readTime: "21 min",
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
      code: `import json

class DurableAgentStore:
    def __init__(self):
        # Simulated durable database (e.g. Postgres table)
        self.db = {}

    def save_checkpoint(self, task_id, step_num, state_data):
        self.db[task_id] = {
            "last_completed_step": step_num,
            "state": state_data,
            "status": "IN_PROGRESS"
        }
        print(f"[STORE] Persisted checkpoint for Task {task_id} at Step {step_num}")

    def load_checkpoint(self, task_id):
        return self.db.get(task_id, {"last_completed_step": 0, "state": {}, "status": "NEW"})

class DurableWorkflow:
    def __init__(self, store, task_id):
        self.store = store
        self.task_id = task_id

    def execute_step(self, step_num, name, action_fn, current_state):
        ckpt = self.store.load_checkpoint(self.task_id)
        if ckpt["last_completed_step"] >= step_num:
            print(f"[CACHE] Step {step_num} ('{name}') already completed. Reusing result.")
            return ckpt["state"][f"step_{step_num}"]

        print(f"[RUNNING] Executing Step {step_num}: '{name}'...")
        result = action_fn(current_state)
        current_state[f"step_{step_num}"] = result
        self.store.save_checkpoint(self.task_id, step_num, current_state)
        return result

# Example: 3-step automation
store = DurableAgentStore()
task_id = "job_492"

def step1_fetch(state): return {"data": "Customer records fetched"}
def step2_process(state): return {"processed": 42}
def step3_notify(state): return "Email dispatched"

# Run 1: Completes step 1 and 2, then simulates a container crash!
wf = DurableWorkflow(store, task_id)
state = {}
state["step_1"] = wf.execute_step(1, "Fetch Data", step1_fetch, state)
state["step_2"] = wf.execute_step(2, "Process Data", step2_process, state)
print("--- [CRASH SIMULATION] Process killed by Out-Of-Memory! ---\n")

# Run 2: New worker container spins up and resumes the exact same task
resumed_wf = DurableWorkflow(store, task_id)
resumed_ckpt = store.load_checkpoint(task_id)
resumed_state = resumed_ckpt["state"]

print(f"Resuming Task {task_id} from checkpoint...")
resumed_state["step_1"] = resumed_wf.execute_step(1, "Fetch Data", step1_fetch, resumed_state)
resumed_state["step_2"] = resumed_wf.execute_step(2, "Process Data", step2_process, resumed_state)
# Only step 3 actually executes!
resumed_state["step_3"] = resumed_wf.execute_step(3, "Notify Customer", step3_notify, resumed_state)
print("Task successfully completed!")`
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
    ]
  }
];
