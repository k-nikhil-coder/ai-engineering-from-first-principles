import type { Chapter } from '../../types/curriculum';

export const MODULE_6_CHAPTERS: Chapter[] = [
  {
    id: "30-repository-context-claudemd-ast",
    number: "30",
    title: "Repository Context, CLAUDE.md & AST Indexing",
    moduleId: "harness",
    moduleName: "Agentic Coding & Harness Engineering",
    trackNumber: 6,
    readTime: "24 min",
    targetRoles: ['harness-engineer', 'agent-architect', 'ai-engineer'],
    motto: "A coding agent is only as good as its harness. Raw model intelligence without repository ground truth produces synthetic hallucinations.",
    problemStatement: "When dropped into a 500,000-line enterprise monorepo, coding agents (like Claude Code, Cursor, Devin, or custom harnesses) will either blow up their context window reading unrelated files or hallucinate non-existent internal utility functions. Mastering repository context architecture—via hierarchical `CLAUDE.md` rules, Tree-sitter Abstract Syntax Tree (AST) repo maps, Git worktree isolation, and context compaction—is the foundation of harness engineering.",
    coreConcepts: [
      {
        title: "Hierarchical Agent Rules: The CLAUDE.md / AGENTS.md Architecture",
        summary: "Grounding autonomous models with project-specific invariants, build commands, and negative constraints.",
        content: [
          "Root Rulebook (`CLAUDE.md` / `AGENTS.md`): Located at repo root. Declares package manager commands (`pnpm test`, `cargo build`), code style rules, test runner conventions, and banned operations (e.g. 'Never edit `schema.prisma` directly').",
          "Subdirectory Overrides: Scoped rulebooks inside nested directories (e.g. `packages/billing/CLAUDE.md`) that activate only when the agent edits files in that subtree.",
          "Deterministic Anchoring: Rules must be written as concise imperative commandments, not conversational suggestions."
        ],
        diagram: `Repository Root
  ├── CLAUDE.md (Root invariants: lint commands, test rules, banned edits)
  ├── src/
  │   ├── core/
  │   └── billing/
  │       ├── CLAUDE.md (Subtree rules: Stripe idempotency requirements)
  │       └── service.ts
  └── .git/worktrees/ (Isolated branch copies for parallel sub-agents)`
      },
      {
        title: "Tree-sitter AST Repo Maps & Symbol Graphs",
        summary: "Providing the model with structural codebase orientation without loading raw file contents.",
        content: [
          "AST Parsing (Tree-sitter): Parses code into syntax trees to extract top-level class names, function signatures, exported types, and docstrings.",
          "PageRank on Symbol Graphs: Constructs a dependency graph of which symbols call which functions. Ranks the most important central symbols in the repo to include in the agent's system prompt.",
          "Git Worktree Isolation: Rather than allowing agents to execute git checkout on the user's active working copy, the harness creates independent git worktrees in `.git/worktrees/agent-branch`, allowing concurrent sub-agents to compile and run tests in parallel without file collisions."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Pure Python Tree-sitter Style Symbol Extractor & Repo Map Generator",
      description: "Extracting function signatures, classes, and method outlines to construct a lightweight repository map for agent context.",
      code: `import ast

def generate_repo_map(python_code: str, filename: str) -> str:
    """
    Parses Python code into an AST and generates a concise symbol outline.
    """
    try:
        tree = ast.parse(python_code)
    except SyntaxError:
        return f"{filename}: [Syntax Error - Could not parse]"

    outline = [f"# File: {filename}"]
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            outline.append(f"class {node.name}:")
            for item in node.body:
                if isinstance(item, ast.FunctionDef):
                    args = [a.arg for a in item.args.args]
                    outline.append(f"    def {item.name}({', '.join(args)}): ...")
        elif isinstance(node, ast.FunctionDef):
            args = [a.arg for a in node.args.args]
            outline.append(f"def {node.name}({', '.join(args)}): ...")

    return "\\n".join(outline)

sample_code = """
class StripePaymentGateway:
    def __init__(self, api_key: str):
        self.api_key = api_key
    def charge_customer(self, customer_id: str, amount: int) -> bool:
        # 50 lines of complex transaction logic
        pass

def calculate_vat(subtotal: float, country: str) -> float:
    return subtotal * 0.20
"""

print(generate_repo_map(sample_code, "src/billing/gateway.py"))`
    },
    productionPitfalls: [
      "Dumping full repository file trees into context; a 10,000-file listing consumes 80,000 tokens before the agent even reads a line of code.",
      "Writing verbose 2,000-word `CLAUDE.md` files; instructions must be punchy and strictly under 500 words to prevent attention decay.",
      "Allowing multiple parallel agents to edit the same shared directory simultaneously without git worktree isolation."
    ],
    keyTakeaways: [
      "Hierarchical `CLAUDE.md` files provide authoritative repository guidelines and build instructions.",
      "AST symbol maps orient the agent across large repositories using less than 2% of the token budget of raw files.",
      "Use Git worktrees (`git worktree add`) to isolate parallel coding agents."
    ],
    quiz: [
      {
        question: "Why are Tree-sitter AST repo maps used in agentic coding harnesses instead of passing raw code files?",
        options: [
          "They extract high-level function and class signatures, giving the agent global codebase orientation while consuming 98% fewer tokens",
          "Tree-sitter encrypts code for privacy",
          "LLMs cannot read raw source code",
          "It compiles Python into C++"
        ],
        correctIndex: 0,
        explanation: "AST repo maps provide a compact structural summary of available classes, methods, and types across the entire repository, fitting in a few hundred tokens rather than hundreds of thousands."
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Git Worktree Parallel Workspace Allocator",
        subtitle: "Core DSA: Resource Pool Allocation & Path Isolation",
        problemStatement: "Implement `WorktreeManager.acquire_workspace(task_id: str) -> str` and `release_workspace(task_id: str)` which allocates isolated branch worktrees under `.worktrees/task_{id}`, prevents concurrent write collisions, and cleans up detached heads.",
        starterCode: `class WorktreeManager:
    def __init__(self, repo_root: str):
        pass`,
        solutionCode: `import os, shutil

class WorktreeManager:
    def __init__(self, repo_root: str):
        self.root = repo_root
        self.active = {} # task_id -> path
        
    def acquire_workspace(self, task_id: str) -> str:
        if task_id in self.active:
            return self.active[task_id]
        path = os.path.join(self.root, ".worktrees", f"agent_{task_id}")
        os.makedirs(path, exist_ok=True)
        # In production: subprocess.run(["git", "worktree", "add", "-b", f"task-{task_id}", path, "HEAD"])
        self.active[task_id] = path
        return path
        
    def release_workspace(self, task_id: str):
        path = self.active.pop(task_id, None)
        if path and os.path.exists(path):
            # In production: subprocess.run(["git", "worktree", "remove", "--force", path])
            shutil.rmtree(path, ignore_errors=True)`,
        testCases: [
          {
            input: 'Concurrent tasks task_1 and task_2 acquire workspaces',
            expectedOutput: 'Distinct isolated filesystem paths returned (.worktrees/agent_task_1 and _2)',
            explanation: "Guarantees parallel sub-agents never overwrite each other's in-progress file edits."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Agent /clear vs /compact Context Trap",
        subtitle: "Production Systems Bug: Agent losing critical repo map context after running /clear",
        problemStatement: "A user observed that after running `/clear` to recover from a context overflow, the agent started hallucinating file paths and forgot the project build commands. Redesign the reset lifecycle so that `/clear` purges conversation history but automatically re-injects the root `CLAUDE.md` and Tree-sitter repo map.",
        starterCode: `# Flaky reset:
# def on_clear(): conversation_history.clear() # Completely wipes rules!`,
        solutionCode: `# Production Fix: Context Lifecycle Reset Architecture
class AgentSessionContext:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.pinned_system_context = self.load_invariants()
        self.turns = []
        
    def load_invariants(self) -> str:
        # Always read root CLAUDE.md and fresh AST summary
        rules = open(f"{self.repo_path}/CLAUDE.md").read() if os.path.exists(f"{self.repo_path}/CLAUDE.md") else ""
        return f"[SYSTEM RULES]\\n{rules}"
        
    def reset_clear(self):
        # Purge conversational turns, but PRESERVE pinned system invariants:
        self.turns = [{"role": "system", "content": self.pinned_system_context}]`,
        testCases: [
          {
            input: 'reset_clear() invoked',
            expectedOutput: 'Chat history purged to 0 turns; CLAUDE.md system invariants retained at turn 0',
            explanation: "Guarantees the agent never operates in an unanchored zero-rules state."
          }
        ]
      }
    }
  },
  {
    id: "31-lifecycle-hooks-custom-skills-headless-cicd",
    number: "31",
    title: "Lifecycle Hooks, Custom Skills & Headless CI/CD",
    moduleId: "harness",
    moduleName: "Agentic Coding & Harness Engineering",
    trackNumber: 6,
    readTime: "25 min",
    targetRoles: ['harness-engineer', 'agent-architect', 'ai-engineer'],
    motto: "The difference between an interactive chatbot and an autonomous software engine is headless execution and deterministic lifecycle hooks.",
    problemStatement: "Interactive coding agents (like Claude Code or Cursor) are powerful for human-in-the-loop pair programming. But running agents autonomously in CI/CD pipelines (e.g. automated PR reviews, automated dependency upgrades, self-healing production alerts) requires non-interactive CLI execution (`claude -p`), deterministic lifecycle hooks (`PreToolUse`, `PostToolUse`), and custom skill definitions.",
    coreConcepts: [
      {
        title: "Deterministic Agent Lifecycle Hooks",
        summary: "Injecting hard programmatic policies before and after model tool executions.",
        content: [
          "PreToolUse Hook: Runs before the model executes a tool. Can inspect tool arguments, block dangerous actions (e.g. `rm -rf`), or modify arguments (e.g. enforcing dry-run flags).",
          "PostToolUse Hook: Runs after a tool executes. Inspects stdout, checks for formatting errors, runs automated linters (e.g. `ruff` or `eslint`), and feeds compiler errors back to the model as observations.",
          "Stop Hook: Runs when the model attempts to finish a task. Verifies that test suites pass before allowing the agent to exit with code 0."
        ],
        diagram: `Model emits Tool Call: edit_file("src/api.ts", diff)
  │
  ▼
[PreToolUse Hook] ──► Blocked if protected branch or forbidden path!
  │ Approved
  ▼
Host Runtime executes file edit
  │ Output / Diff
  ▼
[PostToolUse Hook] ──► Automatically runs: eslint src/api.ts
  │ If linter fails: Inject error string into model observation for self-healing!
  ▼
Model observes lint results & fixes syntax immediately`
      },
      {
        title: "Reusable Skills & Headless CI/CD Execution",
        summary: "Packaging domain knowledge into reusable markdown skill files and non-interactive scripts.",
        content: [
          "Custom Skills (`SKILL.md`): Markdown documentation with YAML frontmatter defining instructions, schemas, and script references that the agent loads dynamically when relevant.",
          "Headless Non-Interactive CLI (`claude -p 'Fix issue #402' --output-format json`): Runs agent workflows in GitHub Actions, GitLab CI, or Kubernetes CronJobs with zero human intervention.",
          "Automated Pull Request Engineering: Agent checks out branch, inspects issue, writes code, executes tests, and opens a GitHub PR with generated changelogs."
        ]
      }
    ],
    codeImplementation: {
      language: "python",
      title: "Production Agent Lifecycle Hook Pipeline in Pure Python",
      description: "A deterministic middleware pipeline executing PreToolUse, PostToolUse, and Stop verification gates.",
      code: `class AgentHookPipeline:
    def __init__(self):
        self.pre_hooks = []
        self.post_hooks = []
        
    def add_pre_tool_hook(self, fn):
        self.pre_hooks.append(fn)
        
    def add_post_tool_hook(self, fn):
        self.post_hooks.append(fn)

    def execute_tool_safely(self, tool_name, args, tool_fn):
        # 1. Run PreToolUse Hooks (Can abort or modify)
        for hook in self.pre_hooks:
            allowed, reason = hook(tool_name, args)
            if not allowed:
                return {"status": "BLOCKED", "error": f"PreToolUse Hook Rejection: {reason}"}
                
        # 2. Execute underlying function
        result = tool_fn(**args)
        
        # 3. Run PostToolUse Hooks (Can append lint feedback or verify)
        for hook in self.post_hooks:
            result = hook(tool_name, args, result)
            
        return {"status": "SUCCESS", "output": result}

pipeline = AgentHookPipeline()
# Guard 1: Block writing to .env files
pipeline.add_pre_tool_hook(lambda name, args: (False, "Writing to .env forbidden") if ".env" in str(args) else (True, "OK"))
# Guard 2: Post linter
pipeline.add_post_tool_hook(lambda name, args, res: f"{res} [LINT CHECK: PASSED]")

print(pipeline.execute_tool_safely("edit", {"path": ".env"}, lambda path: "edited"))
print(pipeline.execute_tool_safely("edit", {"path": "src/main.py"}, lambda path: "file updated"))`
    },
    productionPitfalls: [
      "Running headless agents in CI with write access to production database credentials.",
      "Allowing headless agents to auto-merge pull requests without automated test suites and human code review approval.",
      "Failing to set hard cost and timeout limits in CI workflows, resulting in $500 GitHub Action runner bills."
    ],
    keyTakeaways: [
      "Lifecycle hooks (`PreToolUse`, `PostToolUse`) enforce deterministic software guardrails around stochastic models.",
      "Headless CLI execution enables embedding agentic coding into standard DevOps and CI/CD pipelines.",
      "Package reusable workflows into `SKILL.md` files for instant cross-project skill transfer."
    ],
    quiz: [
      {
        question: "What is the primary function of a `PostToolUse` lifecycle hook in an agentic coding harness?",
        options: [
          "It inspects tool output, runs deterministic checks (like linters or typecheckers), and injects diagnostic feedback back into the model before the next turn",
          "It reboots the operating system",
          "It deletes the git repository",
          "It converts TypeScript into Java"
        ],
        correctIndex: 0,
        explanation: "PostToolUse hooks run automatically after tool execution to validate syntax, run linters (like eslint or ruff), and feed any compiler errors directly back to the model for self-healing."
      }
    ],
    simulatorType: 'react-loop',
    labs: {
      problemA: {
        title: "Algorithmic Lab: Non-Interactive Headless Tool Call Pipeline",
        subtitle: "Core DSA: Middleware Pipeline Pattern & Exit Code Propagation",
        problemStatement: "Implement a headless agent runner `run_headless_turn(prompt: str, tool_registry: dict, hooks: list) -> tuple[int, str]` that executes a single turn in CI/CD, returns exit code 0 on successful goal completion, or exit code 1 if any pre-hook blocks execution.",
        starterCode: `def run_headless_turn(prompt: str, tool_registry: dict, hooks: list) -> tuple[int, str]:
    # TODO: Implement headless execution
    pass`,
        solutionCode: `def run_headless_turn(prompt: str, tool_registry: dict, hooks: list) -> tuple[int, str]:
    for h in hooks:
        ok, err = h(prompt)
        if not ok:
            return 1, f"CI Pipeline Blocked: {err}"
    return 0, "CI Agent Task Completed Successfully."`,
        testCases: [
          {
            input: 'Hook checks banned files; prompt touches safe files',
            expectedOutput: '(0, "CI Agent Task Completed Successfully.")',
            explanation: "Clean exit code 0 enables GitHub Actions to proceed."
          }
        ]
      },
      problemB: {
        title: "Production Systems Debugging: The Infinite CI Auto-Fix PR Loop",
        subtitle: "Production Systems Bug: Headless agent re-triggering its own GitHub Actions workflow",
        problemStatement: "A headless PR review agent pushed code fixes back to a PR. The git push triggered the GitHub Actions CI pipeline, which spawned the agent again, creating an infinite loop of 40 automated commits in 10 minutes. Fix the workflow with `[skip ci]` commit messages and actor bot filtering.",
        starterCode: `# Buggy git push in CI:
# git commit -m "Auto-fix lint errors"
# git push origin head`,
        solutionCode: `# Fix: Add [skip ci] and actor check in GitHub Actions workflow:
# name: Agent PR Auto-Fix
# on:
#   pull_request:
# jobs:
#   auto-fix:
#     if: github.actor != 'github-actions[bot]' && github.actor != 'agent-bot'
#     steps:
#       - run: git commit -m "Auto-fix lint errors [skip ci]"`,
        testCases: [
          {
            input: 'Bot commits with [skip ci] and actor filtering enabled',
            expectedOutput: 'Workflow executes once and halts; zero recursive workflow cascades.',
            explanation: "Prevents headless agent workflows from re-triggering themselves indefinitely."
          }
        ]
      }
    }
  }
];
