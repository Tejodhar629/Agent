# Frontend Architecture & UI Layout Design: AgentForge Console
**Author:** Lead Frontend Architect  
**Status:** Approved / Core Specification  
**Target Stack:** React.js / Next.js (App Router), Tailwind CSS, TypeScript, WebSockets (native/Socket.io), Xterm.js, Monaco Editor

---

## 1. Executive Summary & UI/UX Principles

The **AgentForge Console** is the web control center for our enterprise-grade multi-agent collaborative workspace. Unlike standard chatbots that operate in single-turn conversational bubbles, AgentForge requires a **high-concurrency, multi-pane real-time cockpit** that mirrors a modern Integrated Development Environment (IDE) merged with an interactive project management platform.

### Core UI/UX Objectives:
1. **Observe and Intervene (Transparency + Guardrails):** The interface must make agent "thought loops" completely transparent. It must allow humans to easily audit, pause, rollback, and edit execution paths before agents run destructive actions.
2. **Context Integrity (The Dual-Pane Concept):** Keep the user's focus unified. The left pane concentrates on the **logical orchestration flow** (agent dialogue, thoughts, task graphs), while the right pane focuses on the **physical output** (code file tree, editors, sandboxed terminal, resource metrics).
3. **Sub-Second Real-Time Feedback:** Agent activities, file creations, and command line streams must render in the UI with sub-200ms latency to make the autonomous system feel alive, responsive, and trustworthy.
4. **Enterprise-Grade Aesthetics & Accessibility:** A highly polished, developer-centric "dark-mode first" dashboard built on Tailwind CSS, supporting fully responsive layout adaptations, keyboard shortcuts, and ARIA-compliant screen reading structures.

---

## 2. Technology Stack Selection & Rationale

| Layer | Chosen Technology | Version / Spec | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | v14.2+ (TypeScript) | Native support for React Server Components (RSC) to render static elements fast, optimized routing, and simple API route endpoints. |
| **Styling** | **Tailwind CSS** | v3.4+ | Fast utility-first styling, consistent spacing scale, easily customizable theme configs, and native light/dark mode triggers. |
| **UI Components** | **Radix UI Primitives** | Headless primitives | WAI-ARIA compliant, unstyled components ensuring perfect accessibility for dropdowns, tabs, dialogs, and sliders. |
| **WebSocket Client**| **Socket.io-client** / Native | v4.7+ | Seamless client-side implementation of event-driven, real-time message streams with automatic fallback, ping/pong, and reconnection hooks. |
| **Code Editor** | **Monaco Editor** | `@monaco-editor/react` | The engine behind VS Code. Delivers native syntax highlighting, autocomplete, code folding, and side-by-side diff viewers. |
| **Terminal Sandbox**| **Xterm.js** | v5.3+ | Industry standard for rendering terminal streams. Handles ANSI escape codes, terminal resizing, scrollback buffers, and theme matching. |
| **Node Graph** | **React Flow** | v11.10+ | Provides highly customizable interactive canvasses for rendering Task Directed Acyclic Graphs (DAGs) with custom node styling. |
| **Data Fetching** | **TanStack Query** | v5+ (React Query) | Handles caching of HTTP requests (e.g. Agent templates list), optimistic updates, and cache invalidation hooks. |
| **Icons** | **Lucide React** | Latest | Modern, lightweight, and consistently-proportioned icon set optimized for dense technical dashboards. |

---

## 3. Directory Structure & Architecture

To maintain clear separation of concerns, the frontend directory structure leverages Next.js App Router patterns. All source files are kept inside the `/src` folder, with decoupled modules for hooks, context, state, and individual views.

```
frontend/
├── public/                 # Static assets (images, logos, fonts)
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── layout.tsx      # Root layout, theme provider, global CSS
│   │   ├── page.tsx        # Landing / Dashboard Redirector
│   │   ├── dashboard/      # Project Dashboard (Workspace list)
│   │   │   └── page.tsx
│   │   └── workspace/      # Core Interactive Workspace
│   │       └── [projectId]/
│   │           └── page.tsx # Real-Time Dual-Pane Panel
│   ├── components/         # Shared Reusable UI Components
│   │   ├── ui/             # Atomic Design Elements (Button, Input, Card)
│   │   ├── squad/          # Squad Builder & Agent Registry Components
│   │   ├── workspace/      # Pane-specific UI Modules
│   │   │   ├── LeftPane.tsx
│   │   │   ├── RightPane.tsx
│   │   │   ├── AgentChat.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── MonacoViewer.tsx
│   │   │   └── TerminalEmulator.tsx
│   │   ├── dag/            # Task Graph Visualizer Components
│   │   └── guardrails/     # HITL, Diff Tool, and Cost meters
│   ├── context/            # Global React Contexts
│   │   ├── WebSocketContext.tsx # Handles Socket connection and event routing
│   │   ├── WorkspaceContext.tsx # Manages files, active tab, active agent tasks
│   │   └── ThemeContext.tsx     # Light/Dark configuration
│   ├── hooks/              # Custom React Hooks
│   │   ├── useWebSocket.ts # Simple hook for component-level socket triggers
│   │   ├── useLocalStorage.ts
│   │   └── useWorkspaceData.ts  # Fetches file contents and project lists
│   ├── services/           # HTTP API client integrations (Axios/Fetch wrapper)
│   ├── types/              # Unified TypeScript definitions
│   │   ├── agent.d.ts      # Agent profiles, Squad structures
│   │   ├── websocket.d.ts  # Stream event payloads
│   │   └── workspace.d.ts  # Tasks, Files, Projects, Budgets
│   └── styles/
│       └── globals.css     # Tailwinds directives and custom animations
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. UI Layout Mockups & Component Composition

### A. The Core Workspace Dashboard Layout (`/workspace/[projectId]`)

The central workspace interface is constructed using a full-viewport (`h-screen overflow-hidden`), split-pane layout. It is divided into an **Interactive Header**, a collapsible **Sidebar Navigation**, and the main **Dual-Pane Sandbox Screen** separated by a draggable partition resizer.

```
+------------------------------------------------------------------------------------------------------------------------+
|  [AgentForge logo] | Project: Scaffold API Service (ID: proj-4889)    | Spend: $0.42 / $5.00 Limit [========]  | (HITL: OK)  |
+------------------------------------------------------------------------------------------------------------------------+
| (S) |  LEFT PANE (Orchestration & Logic)                   |  RIGHT PANE (Physical Artifacts & Execution)              |
| I  |  +-------------------------------------------------+  |  +---------------------+-------------------------------+  |
| D  |  |  Tabs: [ Agent Chat ]  [ Task DAG Graph ]       |  |  | [Files]             | Code Editor: /src/main.py     |  |
| E  |  +-------------------------------------------------+  |  | 📁 src/             | 1  from fastapi import FastAPI|  |
| B  |  |                                                 |  |  |  📄 main.py         | 2  app = FastAPI()            |  |
| A  |  | 🤖 [Manager]: Parsing user prompt...            |  |  |  📄 database.py     | 3                             |  |
| R  |  | ⚙️ [WebSearch]: Querying FastAPI guides...       |  |  | 📁 tests/           | 4  @app.get("/")              |  |
|    |  | 💻 [Developer]: Writing main.py...              |  |  |  📄 test_api.py     | 5  def read_root():           |  |
| o  |  |                                                 |  |  | 📄 requirements.txt | 6      return {"msg": "Hello"} |  |
| p  |  | 🚨 HITL GATE: Developer wants to write main.py  |  |  +---------------------+-------------------------------+  |
| t  |  |  [ View Git Diff - Side-by-Side Review ]        |  |  | Sandbox Terminal (Xterm.js)                            |  |
| i  |  |  [ Approve Change ]  [ Rewrite Prompt ]         |  |  | $ pytest tests/                                       |  |
| o  |  |                                                 |  |  | tests/test_api.py .                      [PASSED 100%] |  |
| n  |  |                                                 |  |  | $                                                     |  |
| s  |  +-------------------------------------------------+  |  +-------------------------------------------------------+  |
+------------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Component Breakdown & Functional Designs

### 5.1. Header: Status & Governance Bar
The global header provides continuous, critical oversight over the system's operational parameters, active session budgets, and security statuses.

* **Key Elements:**
  - **Project Name & Status Badge:** Displays the active project name, accompanied by dynamic state badges: `INITIALIZING`, `EXECUTING`, `PAUSED`, `AWAITING_APPROVAL`, `COMPLETED`, or `FAILED`.
  - **Token Burn & Budget Progress Meter:** A real-time visual progress bar tracking USD expenditure. If the spend nears the hard ceiling (e.g. 80% of $5.00 limit), the bar shifts colors (`green` -> `yellow` -> `red`).
  - **Model Route Allocation Indicators:** Mini-meters displaying the percentage of queries routed to premium models (e.g. Claude 3.5 Sonnet) versus cost-effective SLMs (e.g. Llama 3.1 8B).
  - **Global Pause/Resume Engine Button:** Instantly pauses all active worker queues. When paused, sends an interrupt signal to the backend, freezing the Temporal orchestrator in its current state.

```tsx
// React Component Mock: Header.tsx
import React from 'react';
import { Play, Pause, AlertTriangle, Cpu } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  status: 'ACTIVE' | 'PAUSED' | 'AWAITING_APPROVAL' | 'COMPLETED';
  currentSpend: number;
  budgetLimit: number;
  onToggleStatus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  status,
  currentSpend,
  budgetLimit,
  onToggleStatus
}) => {
  const spendPct = (currentSpend / budgetLimit) * 100;
  const isAwaiting = status === 'AWAITING_APPROVAL';

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between text-slate-200 select-none">
      <div className="flex items-center space-x-3">
        <div className="font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
          AgentForge
        </div>
        <span className="text-slate-600">/</span>
        <h1 className="font-semibold text-sm max-w-xs truncate">{projectName}</h1>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
          status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
          status === 'PAUSED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
          isAwaiting ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
          'bg-slate-800 text-slate-400'
        }`}>
          {status}
        </span>
      </div>

      {/* Resource Allocation & Cost Meter */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Spend</div>
            <div className="text-xs font-mono font-semibold">${currentSpend.toFixed(2)} / ${budgetLimit.toFixed(2)}</div>
          </div>
          <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                spendPct > 85 ? 'bg-rose-500' : spendPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${spendPct}%` }}
            />
          </div>
        </div>

        {/* Global Controls */}
        <button
          onClick={onToggleStatus}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            status === 'ACTIVE' 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {status === 'ACTIVE' ? (
            <>
              <Pause size={13} />
              <span>Pause Project</span>
            </>
          ) : (
            <>
              <Play size={13} />
              <span>Resume Project</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
```

---

### 5.2. Left Pane: Orchestration & Dialogue Control
The Left Pane is the logical control deck, offering two main tabbed interfaces: **Agent Chat (Dialogue Stream)** and the **Task DAG Graph**.

#### Component 1: Agent Chat & Thought Stream
This panel streams the continuous conversational loop and execution logs of all active agents.

* **Design Pattern (Thought Accordion):** To prevent "prompt bloat" and UI clutter, raw agent internal reasoning steps (CoT/planning) are rendered inside dark, expandable collapsibles labelled with "Agent Thinking Logs". The main conversational area displays only the final, concrete agent outputs and tool invocation summaries.
* **Persona Highlights:** Each agent is clearly color-coded using distinct Tailwind borders and avatars:
  - `Manager Agent`: Purple (`indigo-500`)
  - `Developer Agent`: Blue (`sky-500`)
  - `Researcher Agent`: Yellow (`amber-500`)
  - `QA Tester Agent`: Green (`emerald-500`)
* **Tool Call Visualizers:** When an agent invokes a tool (e.g. `write_file(filename="main.py", ...)`), it renders as an interactive pill with a spin animation and a sub-badge displaying the system's execution response status.

```tsx
// React Component Mock: AgentChat.tsx
import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  agentName: string;
  role: 'Manager' | 'Developer' | 'Researcher' | 'QA' | 'System';
  message: string;
  thoughtLog?: string;
  toolCall?: { name: string; args: string; status: 'RUNNING' | 'SUCCESS' | 'ERROR' };
  timestamp: string;
}

export const AgentChat: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAgentColor = (role: string) => {
    switch (role) {
      case 'Manager': return 'border-l-4 border-indigo-500 bg-indigo-950/20';
      case 'Developer': return 'border-l-4 border-sky-500 bg-sky-950/20';
      case 'Researcher': return 'border-l-4 border-amber-500 bg-amber-950/20';
      case 'QA': return 'border-l-4 border-emerald-500 bg-emerald-950/20';
      default: return 'border-l-4 border-slate-600 bg-slate-800/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/60 overflow-y-auto px-4 py-3 space-y-4 font-sans text-slate-300">
      {messages.map((msg) => (
        <div key={msg.id} className={`p-3 rounded-r-lg border-y border-r border-slate-900 ${getAgentColor(msg.role)}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs tracking-wide text-slate-200">{msg.agentName}</span>
            <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
          </div>

          {/* Thought Accordion (Renders CoT planning safely tucked away) */}
          {msg.thoughtLog && (
            <details className="mb-2 bg-slate-900/60 rounded border border-slate-800 group">
              <summary className="px-2 py-1.5 text-xs text-slate-400 font-mono font-semibold flex items-center cursor-pointer hover:text-slate-200 select-none">
                <ChevronRight size={12} className="mr-1 group-open:rotate-90 transition-transform" />
                <span>Internal Thought Chain</span>
              </summary>
              <div className="p-2 border-t border-slate-800 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-950">
                {msg.thoughtLog}
              </div>
            </details>
          )}

          {/* Core Dialogue Output */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</div>

          {/* Tool Call Indicator Pill */}
          {msg.toolCall && (
            <div className="mt-2.5 flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2 font-mono text-slate-400">
                <Terminal size={12} className="text-indigo-400 animate-pulse" />
                <span>tool:</span>
                <span className="text-slate-200 font-semibold">{msg.toolCall.name}</span>
                <span className="text-slate-500 text-[10px]">({msg.toolCall.args})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                msg.toolCall.status === 'RUNNING' ? 'bg-amber-950/40 text-amber-400 animate-pulse' :
                msg.toolCall.status === 'SUCCESS' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
              }`}>
                {msg.toolCall.status}
              </span>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
```

#### Component 2: Interactive Task DAG Visualizer
When clicked, this tab shifts from the chat history to a structural layout mapping the sub-tasks defined during prompt decomposition.

* **Implementation Details:** Utilizing **React Flow** to render tasks as physical nodes.
* **Visual States Mapping:**
  - `PENDING` (Gray node, dotted border): Dependencies are not met.
  - `RUNNING` (Blue glowing node, spinning indicator): Assigned worker is executing.
  - `SUCCEEDED` (Green node, checkmark icon): Task is complete, artifacts committed.
  - `FAILED` (Red node, alert icon): Worker encountered an unresolvable error. Can be manually retried.
* **Edges:** Rendered as clean, directional paths with animated arrows showing flow of dependent data.

---

### 5.3. Right Pane: Visual Artifacts, Code, & Shell Runtimes
The Right Pane displays the outputs, containing tabs for the **Shared Directory Tree + Code Viewer** and the **Ephemereal Terminal sandbox**.

#### Component 1: Visual Workspace File Explorer & Monaco Editor
Provides real-time directory indexing and structural file previewing.

* **Directory Explorer (Left Sub-panel, 20% width):** Renders a file list representing the workspace. Features icon badges based on file types (`Folder`, `Python`, `JSON`, `Markdown`, `JS/TS`). When file additions or edits occur via agent actions, affected folders flash with brief green highlights.
* **Monaco Editor Wrapper (Right Sub-panel, 80% width):** Displays code contents of selected files using native VS Code mechanics.
  - **Read-Only / Lock Mode:** Code displays as read-only while agents are writing or editing to prevent file corruption.
  - **Auto-Sync:** Reloads automatically when the workspace server emits a `file_changed` WebSocket message.

#### Component 2: Ephemeral Terminal Sandbox (Xterm.js)
Displays live stderr/stdout command runs (e.g. running unit tests, executing database migrations, testing compilers).

* **Architecture Pattern:** Xterm.js binds directly to a dedicated WebSocket namespace (`/ws/projects/{projectId}/terminal`). It receives standard ANSI strings and converts them to colorized terminal strings.
* **Control Gate:** The terminal is read-only for standard users during agent processes. However, when execution halts or enters a "Human Shell Mode," users can click into Xterm.js and input CLI prompts directly into the isolated sandbox environment.

---

### 5.4. Human-in-the-Loop (HITL) & Interactive Diff Review Panel
The primary safety valve of AgentForge. It overrides active layouts whenever high-risk tools are triggered (such as file modifications, destructive updates, or network calls), demanding structural user approval.

```
+-------------------------------------------------------------------------------------------------------------------+
|  🚨 HUMAN APPROVAL MANDATORY: PROJECT-4889 REQUESTS DESTRUCTIVE WRITE                                              |
+-------------------------------------------------------------------------------------------------------------------+
| Agent [Developer] wants to modify file: /src/database.py                                                          |
| Reason: "Refactor Database connection pool to handle parallel connections gracefully."                           |
+-------------------------------------------------------------------------------------------------------------------+
|  LINE BY LINE DIFFERENTIAL REVIEW:                                                                                |
|  - ORIGINAL: database.py (Line 12)                  |  + PROPOSED AMENDMENTS                                      |
|  11  db_url = "sqlite:///company.db"                 |  11  db_url = "postgresql://root:secret@postgres:5432/db"    |
|  12  engine = create_engine(db_url)                 |  12  engine = create_engine(db_url, pool_size=20, max_...     |
|  13  SessionLocal = sessionmaker(bind=engine)       |  13  SessionLocal = sessionmaker(bind=engine)                 |
+-------------------------------------------------------------------------------------------------------------------+
| [Option A: Approve Changes]       | [Option B: Reject Action]        | [Option C: Rewrite Prompt Input]            |
| (Executes change and releases     | (Cancels step, returns error     | (User writes instruction to make the agent) |
|  execution hold)                  |  code to the Agent context)      | (rewrite file code with edits)              |
+-------------------------------------------------------------------------------------------------------------------+
```

```tsx
// React Component Mock: DiffApprovalModal.tsx
import React, { useState } from 'react';
import { ShieldAlert, Check, X, RefreshCw } from 'lucide-react';

interface DiffProps {
  filename: string;
  agentName: string;
  originalCode: string;
  proposedCode: string;
  onApprove: () => void;
  onReject: () => void;
  onRewrite: (newInstructions: string) => void;
}

export const DiffApprovalModal: React.FC<DiffProps> = ({
  filename,
  agentName,
  originalCode,
  proposedCode,
  onApprove,
  onReject,
  onRewrite
}) => {
  const [rewriteText, setRewriteText] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-rose-950/20 text-slate-200">
          <div className="p-1.5 rounded-full bg-rose-950 text-rose-500 border border-rose-800 animate-pulse">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm">Human Approval Required</h2>
            <p className="text-xs text-slate-400">Agent <span className="text-sky-400 font-mono font-semibold">{agentName}</span> is requesting to overwrite <span className="text-slate-200 font-mono font-semibold">{filename}</span></p>
          </div>
        </div>

        {/* Diff Screen Viewport */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4 font-mono text-xs leading-relaxed bg-slate-950/50">
          {/* Left Side: Original Code (Deletions) */}
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-md">
            <div className="text-slate-500 font-sans font-bold text-[10px] uppercase mb-2 border-b border-slate-900 pb-1">Original Source</div>
            <pre className="whitespace-pre-wrap text-rose-400/90">
              {originalCode.split('\n').map((line, i) => (
                <div key={i} className="hover:bg-rose-950/10 py-0.5 select-none">
                  <span className="inline-block w-8 text-slate-600 mr-2 border-r border-slate-900 text-right pr-2">{i+1}</span>
                  - {line}
                </div>
              ))}
            </pre>
          </div>

          {/* Right Side: Proposed Changes (Additions) */}
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-md">
            <div className="text-slate-500 font-sans font-bold text-[10px] uppercase mb-2 border-b border-slate-900 pb-1">Proposed Update</div>
            <pre className="whitespace-pre-wrap text-emerald-400/90">
              {proposedCode.split('\n').map((line, i) => (
                <div key={i} className="hover:bg-emerald-950/10 py-0.5">
                  <span className="inline-block w-8 text-slate-600 mr-2 border-r border-slate-900 text-right pr-2">{i+1}</span>
                  + {line}
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Dynamic Controls Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col space-y-4">
          {isRewriting ? (
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-400">Specify rewrite instructions for {agentName}:</label>
              <textarea
                value={rewriteText}
                onChange={(e) => setRewriteText(e.target.value)}
                placeholder="e.g. 'Use connection pooling parameters with maximum pool limit set to 50 and add a try-except around database initialization.'"
                className="w-full h-20 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsRewriting(false)} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">Cancel</button>
                <button onClick={() => onRewrite(rewriteText)} className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1">
                  <RefreshCw size={12} className="animate-spin-slow" />
                  <span>Send Refinement Prompt</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsRewriting(true)} 
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold hover:underline"
              >
                Need changes? Rewrite instructions...
              </button>
              <div className="flex space-x-3">
                <button 
                  onClick={onReject} 
                  className="px-4 py-2 rounded bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <X size={14} />
                  <span>Deny Write</span>
                </button>
                <button 
                  onClick={onApprove} 
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Check size={14} />
                  <span>Approve & Execute</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 6. WebSocket Protocol & State Management

To synchronize the dynamic components across multiple active workers without locking the UI, AgentForge utilizes an event-driven global state management layer powered by **React Context** and **WebSockets**.

### 6.1. The WebSocket Lifecycle Management
The application boots a persistent client connection inside the `/src/context/WebSocketContext.tsx`.

1. **Connection Init (`/ws/projects/{projectId}`):** Initiated with headers supplying the User ID and authentication JWT payload.
2. **Subscription Routing:** Once initialized, the client listens to structural events mapping to key UI widgets.
3. **Optimistic Updating & Fallbacks:** Real-time data increments (e.g. budget cost increments or task statuses) update local states optimistically. If a reconnect occurs, the context triggers a standard REST fetch `/api/projects/{projectId}/state` to synchronize back to the master DB state without causing double UI triggers.

### 6.2. System-wide WebSocket Messaging Schema

The WebSocket channel emits and receives structural JSON event frames containing clear `event` qualifiers and schema wrappers.

```json
/* Event 1: Server pushes dynamic agent reasoning output */
{
  "event": "agent_thought",
  "project_id": "proj-4889",
  "payload": {
    "agent_name": "Developer Agent",
    "role": "Developer",
    "thought_chain": "Determined that the module 'tests/test_api.py' is missing. Initiating task execution loop to mock requests.",
    "timestamp": "2024-10-24T12:00:15.123Z"
  }
}

/* Event 2: Server broadcasts file tree adjustments */
{
  "event": "file_changed",
  "project_id": "proj-4889",
  "payload": {
    "action": "CREATE",
    "filepath": "src/database.py",
    "content_preview": "import os\nfrom sqlalchemy import...",
    "updated_at": "2024-10-24T12:01:02.990Z"
  }
}

/* Event 3: Server triggers Human-in-the-Loop Intercept Gate */
{
  "event": "hitl_request",
  "project_id": "proj-4889",
  "payload": {
    "request_id": "hitl-9011-abc",
    "agent_name": "QA Tester Agent",
    "tool_requested": "execute_command",
    "arguments": "rm -rf .cache && pytest",
    "original_code": null,
    "proposed_code": null,
    "reason": "Executing cache flushing command before booting up pytest unit suite.",
    "timestamp": "2024-10-24T12:04:15.400Z"
  }
}

/* Event 4: Client responds to Human-in-the-Loop request */
{
  "event": "hitl_response",
  "project_id": "proj-4889",
  "payload": {
    "request_id": "hitl-9011-abc",
    "decision": "REWRITE", // APPROVED, DENIED, REWRITE
    "rewrite_instructions": "Do not remove raw cache using rm -rf. Run simple python caching invalidation instead."
  }
}
```

---

## 7. Dynamic Squad Builder & Agent Registry Interface

Administrators and developers configure operational squads through the **Agent Registry Panel** (`/dashboard/registry`). This UI acts as the configuration dock where agent personas are sculpted and saved.

```
+---------------------------------------------------------------------------------------------------------+
| [Back to Dashboard]  |  SQUAD BUILDER & AGENT PERSONA REGISTRY                                           |
+---------------------------------------------------------------------------------------------------------+
| ACTIVE TEAM SQUAD (Drag cards to re-arrange hierarchy)                                                  |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+         |
|  | 👑 Manager Agent   |  | 💻 Developer Agent |  | ⚙️ Researcher Agent |  | 🧪 QA Tester Agent |  [+]    |
|  | Model: GPT-4o      |  | Model: Llama-3 70B |  | Model: GPT-4o-mini |  | Model: Sonnet 3.5  |  ADD    |
|  | Tools: TaskDecomp  |  | Tools: Write,Read  |  | Tools: WebSearch   |  | Tools: RunTest,Read|  AGENT  |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+         |
+---------------------------------------------------------------------------------------------------------+
| PERSONA CONFIGURATION CABINET (Selected: Developer Agent)                                              |
|                                                                                                         |
| Name: [ Developer Agent      ]   LLM Core: [ Llama-3-70b-Instruct  v ]  Temp: [ 0.2 ] --------o---       |
|                                                                                                         |
| System Prompt / Backstory:                                                                              |
| +-----------------------------------------------------------------------------------------------------+ |
| | You are a senior backend systems software developer. Your goal is to write clean, secure, and       | |
| | heavily-tested production software code conforming to exact specifications.                         | |
| +-----------------------------------------------------------------------------------------------------+ |
|                                                                                                         |
| AUTHORIZED SQUAD TOOL CABINET: (Toggle permissions)                                                     |
| [x] File Write/Edit     [x] File Read              [ ] Execute Web Search   [ ] Database Delete Schema |
| [x] Execute Test CLI    [ ] Network Socket Connect [ ] Shell Root Access    [x] AST Code Compiler Check|
+---------------------------------------------------------------------------------------------------------+
|                                                                          [ Save Persona Configurations ]|
+---------------------------------------------------------------------------------------------------------+
```

---

## 8. Non-Functional UI Specifications

### 8.1. Responsive Design Adaptation
While the multi-pane console is optimized for screen layouts above 1280px (Laptops & Large Monitors), the interface scales responsively to support mobile and tablet notifications or manual approvals:
- **Tablet (768px - 1024px):** Sidebars collapse into overlay slide-drawers. Left and Right panes transition into a swipeable carousel tab layout (Tab A: Chat & Orchestration / Tab B: Workspace Directory & Editor).
- **Mobile (Below 768px):** Terminal, Monaco Editor, and DAG viewer are hidden. The interface adapts into a clean, prioritized **Approval Stream Deck**, allowing managers on-the-go to receive push notifications of HITL gates, review small git diffs, and approve or reject steps immediately from their phones.

### 8.2. Performance & Memory Leak Safeguards
Because the AgentForge console receives high volumes of WebSocket data streams continuously:
- **Virtual Scrolling:** Chat and log panels implement virtualized viewport wrappers (e.g. `@tanstack/react-virtual`). This limits standard browser DOM nodes from ballooning and prevents browser crashes under massive agent cycle loops.
- **Log Buffering:** Xterm.js terminal interfaces are configured with a strict `scrollback` limit of 2,000 lines. Excess lines are safely pruned from browser memory.
- **WebSocket Debouncing:** Progress meters and token cost monitors are throttled inside the React state wrapper using a 300ms repaint interval, reducing UI repaints from multiple concurrent WebSocket streams.

### 8.3. Core Accessibility (a11y) Compliances
- **Keyboard Navigation:** High-speed keyboard shortcuts are integrated to toggle critical features:
  - `Ctrl + Space`: Global Pause/Resume execution toggle.
  - `Ctrl + Tab`: Swap focal panel focus (Chat Pane -> Monaco Editor -> Terminal).
  - `Shift + A`: Quick approve current HITL diff request.
  - `Shift + D`: Quick deny current HITL diff request.
- **Color Contrast:** Themes conform strictly to **WCAG AA color compliance standards**, requiring a minimum contrast ratio of 4.5:1 on text nodes, preventing ocular fatigue during prolonged system debugging.
