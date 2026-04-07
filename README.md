# CodeMap 🧠 🛰️

### Autonomous Goal-Driven Codebase Intelligence Agent

CodeMap is a full-stack codebase analysis and visualization platform that combines **deterministic graph theory** with **LLM-powered semantic reasoning** (Google Gemini) to provide deep, actionable architectural insights for any JavaScript/TypeScript/Python repository.

It doesn't just lint your code — it builds a full dependency graph, classifies every file into architectural layers, detects structural anti-patterns, generates a prioritized refactoring plan, and lets you ask an AI to explain what any file actually does.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Backend Deep Dive](#-backend-deep-dive)
- [Frontend Deep Dive](#-frontend-deep-dive)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [How To Use](#-how-to-use)
- [Troubleshooting](#-troubleshooting)

---

## 🔥 Key Features

### 1. Multi-Source Repository Ingestion
- **GitHub Mode**: Paste any public GitHub repo URL. CodeMap downloads the ZIP archive (tries `main` branch, falls back to `master`), extracts it, and begins analysis.
- **Local Upload Mode**: Upload a `.zip` of any local project for private, offline-capable analysis.

### 2. Intelligent File Traversal & Parsing
- Recursively walks the extracted directory tree.
- Filters files by supported extensions: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.json`.
- Excludes noise directories: `node_modules`, `.git`, `dist`, `build`, `.vscode`, `.idea`.
- Caps at **50 files** (prioritizing `src/` and code files) and **200KB per file** to keep analysis fast.
- Reads the project's `README.md` for automated summarization.

### 3. Dependency Graph Construction
- Parses every file's content using regex to detect `import ... from '...'` and `require('...')` statements.
- Resolves relative paths and tries common extensions (`.js`, `.jsx`, `.ts`, `.tsx`, `/index.js`, etc.).
- Builds a directed graph with **nodes** (files) and **edges** (import relationships).
- Computes **In-Degree** (how many files import this one) and **Out-Degree** (how many files this one imports) for every node.
- Identifies the **Top 10 Core Modules** — the most-imported files in the project.

### 4. Automatic File Classification
Files are categorized into architectural layers using a 3-tier priority system:
| Priority | Method | Categories |
|----------|--------|-----------|
| 1 (Highest) | Filename match | `app.js`, `main.tsx`, `index.js` → **Core Logic**; `config.json`, `.env` → **Config** |
| 2 | Folder match | `components/`, `pages/` → **UI**; `api/`, `routes/`, `services/` → **Backend**; `utils/` → **Utility**; `data/` → **Data** |
| 3 (Fallback) | Extension | `.json` → **Data**; `.js`/`.ts`/`.py` → **Core Logic** |

### 5. Deterministic Issue Detection Engine
The Insight Engine scans every node and flags structural problems:

| Issue Type | Severity | Trigger Condition |
|-----------|----------|-------------------|
| **Complexity** | 🔴 HIGH | File > 15KB OR total degree ≥ 6 |
| **Core Module Risk** | 🔴 HIGH | In-degree ≥ 4 OR highest in-degree in project |
| **Coupling** | 🟡 MEDIUM | In-degree ≥ 2 AND out-degree ≥ 2 |
| **Utility Complexity** | 🟡 MEDIUM | Category is Utility AND size > 5KB |
| **Unused / Isolated** | 🟢 LOW | In-degree = 0 (potential dead code) |

### 6. Goal-Driven Strategy System
Users can type a natural-language goal (e.g., "optimize performance", "improve structure"). CodeMap maps keywords to one of four strategies:

| Strategy | Keywords | Priority Issue Types |
|----------|----------|---------------------|
| ⚡ **PERFORMANCE** | performance, speed, optimize, fast, slow, bottleneck | Complexity, Core Module Risk |
| 🏗️ **STRUCTURE** | structure, architecture, modular, organize, layout | Coupling, Unused |
| ✨ **QUALITY** | quality, clean, maintain, refactor, debt, improve | Complexity, Coupling, Utility Complexity, Unused |
| 🔍 **GENERAL** | (default) | All issues equally weighted |

The strategy **reorders** (not removes) issues and insights to surface the most relevant items first.

### 7. Prioritized Action Plan
Every detected issue is scored using a composite formula:

```
priorityScore = severityScore + impactBonus + sizeBonus
```

- `severityScore`: HIGH=3, MEDIUM=2, LOW=1
- `impactBonus`: inDegree > 5 → +3, > 2 → +2, else → +1
- `sizeBonus`: fileSize > 15KB → +1

Items are sorted by `priorityScore` descending, then by severity for ties.

### 8. Recommended Starting Point Engine
From the action plan, CodeMap identifies the **single best file** to fix first and provides 3 structural reasons why (severity level, consumer count, file size, coupling status).

### 9. Focused Re-Analysis (Agent Loop)
CodeMap performs a **second-stage deep inspection** on the top 2 most critical files from the action plan:
- Checks for bidirectional coupling patterns.
- Detects violation of Single Responsibility Principle.
- Flags oversized files with category-specific advice (e.g., "Move state management outside UI components").
- Generates per-file observations and refactoring suggestions.

### 10. Node-Level Impact Analysis
Every graph node is tagged with an impact level:
- **HIGH**: In-degree > 5 ("core dependency, affects multiple modules")
- **MEDIUM**: In-degree > 2 ("affects several parts of the system")
- **LOW**: In-degree ≤ 2 ("limited impact on the rest of the system")

### 11. LLM-Powered Intelligence Layer (Gemini 2.0 Flash)
Advanced semantic reasoning features, lazy-loaded and context-aware:

| Feature | Description |
|---------|-------------|
| **Project Essence** | Synthesizes README and repo stats into a professional elevator pitch. |
| **Refactor Plan** | Generates a step-by-step strategy to improve codebase health. |
| **Issue Explainer** | Explains structural risks and technical debt in plain language. |
| **Module Intelligence** | Reverse-engineers any file's role and purpose from source code. |
| **Action Advice** | Provides senior-level guidance for prioritized refactoring tasks. |

All features include **dynamic, context-aware fallbacks** and a **Self-Healing Resilience** system (automatic exponential backoff for API 429 quota limits).

### 12. 🤖 Agentic Behavior & Autonomous Loop
CodeMap operates as a **dynamic agent**, not just a static script. Its analysis follows an autonomous loop inspired by the OODA (Observe, Orient, Decide, Act) cycle:

1.  **Autonomous Orientation**: The **Planner Agent** interprets your natural language goal (e.g., "optimize for speed") and dynamically weights the entire analysis engine to focus on relevant anti-patterns.
2.  **Multi-Stage Pipeline**:
    *   **Phase 1 (Global Analysis)**: Ingester/Parser/Analyzer agents build the macro-scale dependency graph.
    *   **Phase 2 (Architectural Judgment)**: The Classifier and Critic agents categorize modules and detect structural violations.
    *   **Phase 3 (Autonomous Deep-Dive)**: The agent **observes** its own findings, **decides** which 2 modules are the most critical "black boxes," and performs a second-stage deep inspection on them without user intervention.
3.  **Contextual Reasoning**: The agent "reads" source code snippets and README data to build a semantic understanding of the project's essence, rather than just relying on file counts.

### 13. Interactive 2D Physics Graph
- Powered by `react-force-graph-2d` with D3 physics simulation.
- Nodes scaled by **importance** (centrality) and colored by **architectural layer**.
- High-importance labels appear automatically when zooming in.

### 14. Analysis History & Persistence
- Tracks up to **10 recent analyses** in local storage.
- Quick-access dropdown in the sidebar to resume work on previous repos.
- Syncs state across sessions for seamless repository switching.

### 15. Consolidated Intelligence Dashboard
A streamlined 3-tab interface designed for high-impact decision making:
- **Overview**: AI Project Essence, repository health grid, and interactive file tree.
- **Issues**: All detected architectural risks with AI-powered deep reasoning.
- **Action Plan**: Merged view of prioritized fixes, deep-dive focused analysis, quick wins, and the AI Refactor Plan.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)              │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │LeftPanel │  │ CenterPanel  │  │     RightPanel         │ │
│  │          │  │              │  │(Intelligence Dashboard) │ │
│  │• Mode/URL│  │• Force Graph │  │                        │ │
│  │• History  │  │• Legend      │  │• Overview (Summary/Tree)│ │
│  │• Goal     │  │• Node Select │  │• Issues (+AI Reason)   │ │
│  │• Logs     │  │              │  │• Action Plan (+AI Plan)│ │
│  └──────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ JSON API
┌─────────────────────▼───────────────────────────────────────┐
│                     BACKEND (Express.js)                    │
│                                                             │
│  Controllers: analyze, project-summary, refactor-plan,      │
│               explain, explain-file, explain-action         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Services Layer                      │   │
│  │                                                       │   │
│  │  repo/fileService  → Ingestion & Traversal            │   │
│  │  graphService      → Dependency Graph & Import Map    │   │
│  │  insightService    → Issue Engine & Action Planning   │   │
│  │  llmService        → Gemini 2.0-Flash Integration     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS 3 | Modern styling |
| Framer Motion 12 | Smooth animations |
| react-force-graph-2d | Visualization |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 18+ | Runtime |
| Express 4 | Web server |
| Axios | API communication |
| AdmZip | Repository extraction |

---

## 📁 Project Structure

```
CodeMap/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route logic for analysis & AI
│   │   ├── routes/           # Endpoint definitions
│   │   └── services/         # Core logic (Graph, AI, Ingestion)
│   └── uploads/              # Temp storage for analyzed ZIPs
├── frontend/
│   └── src/
│       ├── components/       # UI (Panels, Logs, Graph)
│       └── App.jsx           # State & History management
└── README.md
```

---

## 🔬 Backend Deep Dive

### Analysis Pipeline (Single Request Flow)
When a user clicks "Analyze", the backend executes a **7-phase pipeline** in sequence:

1. **Strategy Interpretation** (`strategyService.getStrategy`): Parses the goal text and selects PERFORMANCE / STRUCTURE / QUALITY / GENERAL.
2. **Ingestion** (`repoService`): Downloads from GitHub or extracts a local ZIP into `uploads/extracted/`.
3. **File Traversal** (`fileService.traverseDirectory`): Walks the tree, reads contents (up to 200KB each), detects README.
4. **Graph Construction** (`graphService.buildGraph`): Regex-based import detection → directed edge list → in/out degree computation → importance level assignment (top 20% = HIGH, next 30% = MEDIUM, rest = LOW).
5. **Classification** (`classificationService.classifyNodes`): 3-tier categorization into Core Logic / UI / Backend / Utility / Config / Data.
6. **Insight Engine** (`insightService.analyze`): Scans all nodes for 5 issue types, generates positive insights, and produces improvement suggestions.
7. **Strategy Application** (`strategyService.applyStrategy`): Reorders issues based on the selected strategy's priority types.

Post-pipeline, three additional computations run:
- **Action Plan Generation**: Composite scoring of all issues.
- **Starting Point Selection**: Identifies the highest-leverage fix target.
- **Focused Re-Analysis**: Deep inspection of the top 2 critical files.

### LLM Endpoints
All three LLM endpoints follow the same pattern:
1. Validate input → 2. Read API key from env → 3. Build prompt → 4. Call Gemini API → 5. Parse response → 6. Return explanation (or deterministic fallback).

---

## 🎨 Frontend Deep Dive

### Layout
The UI is a **3-panel layout** filling the full viewport:
- **Left Panel (320px)**: Mode switcher, URL/file input, goal textarea, agent logs, analyze button.
- **Center Panel (flex-1)**: The interactive force graph.
- **Right Panel (scrollable)**: 6 tabbed views of analysis results.

### Right Panel Tabs
| Tab | Content |
|-----|---------|
| **Overview** | Health stats grid, README summary, file tree, strategy context |
| **Issues** | All detected issues sorted by severity, each expandable with AI explanation |
| **Action Plan** | Prioritized refactoring list with severity badges, impact counts, and AI refactoring advice |
| **Focused** | Deep-dive observations and suggestions for the top 2 critical files |
| **Node Detail** | Appears when clicking a graph node — shows file metrics, category, impact level, and **Source Code Viewer** with AI module intelligence. |

### 16. Circular Dependency Detective 🔄
- **DFS-Based Analysis**: Automatically detects import loops (e.g., A → B → A) that cause architectural rot.
- **Path Chain Visualization**: Displays the exact loop sequence in the **BUGS** tab.
- **High Severity Flagging**: Marks cycles as critical structural risks.

### 17. Smart Search & Jump 🔍
- **Real-time Autocomplete**: Search for any file in the repository via a Neobrutalist search bar.
- **Cinematic Navigation**: Smoothly **Pans and Zooms** the graph to center the selected file instantly.
- **Auto-Focuser**: Selecting a search result automatically updates all intelligence dashboards for that file.

### 18. Dependency Export 📤
- **Snapshot Support**: Download high-quality PNG images of your dependency graphs (currently under refinement).
- **Data Portability**: Export full analysis reports as **JSON** for sharing or archival.
- **Issue Tracking**: Export the architectural bugs ledger as a **CSV** for spreadsheet or Jira tracking.
- **Context-Aware UI**: Floating Neobrutalist export menu in the bottom-left corner.

### State Management
All state lives in `App.jsx` and is passed via props:
- `response`: The full backend analysis payload.
- `selectedNode`: The currently highlighted graph node ID.
- `loading`: Controls loading spinners and agent log animation.

---

## 📡 API Reference

### `POST /api/analyze`
Main analysis endpoint. Accepts both JSON (GitHub mode) and multipart form data (local upload).

**GitHub mode:**
```json
{
  "type": "github",
  "repoUrl": "https://github.com/user/repo",
  "goal": "performance"
}
```

**Local mode:** `multipart/form-data` with fields `type=local`, `goal`, and file attachment.

**Response:** Full analysis payload including `nodes`, `edges`, `coreModules`, `issues`, `insights`, `improvements`, `actionPlan`, `startingPoint`, `focusedAnalysis`, `projectOverview`, `strategy`.

### `POST /api/explain`
```json
{ "issue": { "message": "...", "file": "...", "inDegree": 3, "outDegree": 2, "category": "Core Logic" } }
```
Returns: `{ "explanation": "..." }`

### `POST /api/explain-action`
```json
{ "actionItem": { "file": "...", "message": "...", "severity": "HIGH", "impact": 5, "category": "Backend" } }
```
Returns: `{ "explanation": "..." }`

### `POST /api/explain-file`
```json
{ "fileName": "App.jsx", "relativePath": "src/App.jsx", "category": "Core Logic", "inDegree": 4, "outDegree": 3 }
```
Returns: `{ "explanation": "..." }`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **Gemini API Key** (free): Get one at [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/tanishrajh/CodeMap.git
cd CodeMap
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
Start the server:
```bash
npm run dev
```
The backend runs on `http://localhost:3000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 💡 How To Use

### Step 1: Choose Your Source
- **GitHub**: Paste a public repo URL (e.g., `https://github.com/facebook/react`).
- **Local**: Click "Local" and upload a `.zip` file of your project.

### Step 2: Set a Goal (Optional)
Type a natural language goal like `"optimize performance"`, `"improve structure"`, or `"clean up code quality"`. This tunes which issues are surfaced first.

### Step 3: Click "Analyze"
Watch the **Agent Activity Logs** trace each phase in real time. The analysis typically completes in 3-10 seconds depending on repository size.

### Step 4: Explore the Graph
- **Click any node** to see its details in the right panel.
- **Drag nodes** to rearrange the layout.
- **Scroll to zoom** in/out. Labels appear on important nodes when zoomed in.
- **Click the background** to deselect.

### Step 5: Browse the Tabs
- **Overview**: Get the big picture — file count, dependency density, README summary.
- **Issues**: Click any issue card to expand it and see the AI explanation.
- **Action Plan**: See the top refactoring targets. Click "Refactor Advice" for AI-powered guidance.
- **Focused Analysis**: Read the deep-dive on the 2 most critical files.

### Step 6: Examine Any File's Purpose
Click a node in the graph → scroll down in the right panel → click **"Examine Purpose ✨"** → the AI reads the file's code and explains what it does, its role, and how it interacts with the rest of the system.

---

## 🛠️ Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Blank explanation / fallback text | API key missing or expired | Check `backend/.env` has a valid `GEMINI_API_KEY` |
| "File not found on disk" | Path sync lost between sessions | Click "Analyze" again to re-ingest the repository |
| 429 Too Many Requests | Gemini free-tier rate limit (15 RPM) | Wait 60 seconds between rapid "Examine Purpose" clicks |
| Backend won't start on port 3000 | Port already in use | Run `npx kill-port 3000` or change `PORT` in `.env` |
| GitHub repo fails to download | Repo is private or URL is invalid | Use "Local Upload" mode instead, or check the URL |
| Graph is empty after analysis | Repo has no supported file types | CodeMap supports `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.json` |

---

## 📄 License

ISC

---

*Built to make codebases readable again.* 
