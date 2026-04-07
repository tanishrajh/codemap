# CodeMap 🧠 🛰️

### **Autonomous Codebase Intelligence & Architectural Visualization Engine**

CodeMap is a high-performance analysis platform that transforms raw source code into an interactive, 31st-century intelligence dashboard. By combining **deterministic graph theory** with **semantic AI reasoning**, CodeMap identifies structural rot, detects circular dependencies, and provides actionable refactoring strategies for modern engineering teams.

> "Making complex codebases readable, navigable, and maintainable again."

---

## 📑 **Executive Summary**
CodeMap doesn't just "look" at your code—it understands it. It builds a live dependency map, classifies modules into architectural layers, and acts as an autonomous agent that deep-dives into your project's most critical files to explain their purpose and risk.

- [Key Features](#-core-intelligence-features)
- [Intelligence Pipeline](#-intelligence-pipeline)
- [Tech Stack](#-the-tech-stack)
- [Getting Started](#-getting-started)
- [How To Use](#-how-to-use)

---

## 🔥 **Core Intelligence Features**

### 1. 📂 **Multi-Source Ingestion**
- **GitHub Sync**: Analyze any public repository instantly via URL.
- **Local Workspace**: Securely upload `.zip` archives for private, offline-first analysis.

### 2. 🕸️ **Deterministic Dependency Mapping**
- **Regex-Powered Parsing**: Deep scanning for `import`, `require`, and dynamic dependency patterns.
- **Node Centrality**: Automatically identifies the "Core Modules" that hold your system together.
- **Relationship Analysis**: Computes In-Degree (Impact) and Out-Degree (Complexity) for every single file.

### 3. 🔍 **Smart Search & Cinematic Navigation**
- **Real-time Autocomplete**: Find any module across thousands of lines of code.
- **Jump-to-File**: Seamlessly pans and zooms the 2D graph to center and highlight your selection.

### 4. 🔄 **Circular Dependency Detective**
- **Cycle Discovery**: Uses DFS algorithms to identify recursive import loops that cause memory leaks and build failures.
- **Path Visualization**: See the exact chain of files involved in the structural loop.

### 5. 🤖 **AI-Powered Semantic Layer (Gemini 2.0 Flash)**
- **Project Essence**: Automated high-level summarization of the repository's value proposition.
- **Module Intelligence**: "Examine Purpose" reads raw source code to explain a file's role in plain language.
- **Refactoring Strategy**: Generates a prioritized plan to pay down technical debt.

### 6. 📤 **Professional Export Suite**
- **Data Portability**: Export your entire analysis (nodes, edges, metrics) as **JSON**.
- **Issue Tracking**: Download your architectural bug ledger as a **CSV** for Jira or spreadsheet tracking.
- **Neobrutalist UI**: A dedicated, high-contrast export menu for rapid reporting.

---

## 🏗️ **Intelligence Pipeline**

CodeMap executes a **7-stage autonomous loop** during every analysis:

1. **Orientation**: Interprets your "Analysis Goal" to tune the heuristic engine.
2. **Ingestion**: Securely downloads and extracts the repository source.
3. **Traversal**: Recursively walks the tree, prioritizing code over noise (`node_modules`, etc.).
4. **Logic Graph**: Builds the directed edges and calculates node importance.
5. **Categorization**: Classifies files into UI, Backend, Logic, Utility, or Config layers.
6. **Critic Engine**: Scans for 5+ structural anti-patterns and performance bottlenecks.
7. **Reporting**: Compiles the interactive dashboard and prioritized "Action Plan."

---

## 🛠️ **The Tech Stack**

### **The Frontend (Visual Excellence)**
- **React 19** + **Vite 8**: Ultra-fast hot reloading and state management.
- **Tailwind CSS 3**: Utility-first styling for the Neobrutalist design system.
- **react-force-graph-2d**: D3-powered physics simulation for large-scale graphs.
- **Framer Motion 12**: Smooth, cinematic UI transitions.

### **The Backend (Core Engine)**
- **Node.js 18+** + **Express 4**: Robust API orchestration.
- **Axios**: Intelligent API communication with self-healing retries.
- **AdmZip**: High-speed local archive processing.
- **Google Gemini 2.0**: The "brain" behind the semantic reasoning features.

---

## 🚀 **Getting Started**

### **1. Clone & Install**
```bash
git clone https://github.com/tanishrajh/CodeMap.git
cd CodeMap
```

### **2. Configure Backend**
Create a `backend/.env` file:
```env
GEMINI_API_KEY=your_google_ai_studio_key
PORT=3000
```
```bash
cd backend && npm install && npm run dev
```

### **3. Launch Presentation**
```bash
cd frontend && npm install && npm run dev
```
Open `http://localhost:5173` to begin your architectural journey.

---

## 💡 **How To Use**

1. **Connect**: Input a GitHub URL or upload a ZIP.
2. **Target**: Optional—tell the agent to focus on `"performance"` or `"structure"`.
3. **Explore**: Use the 2D physics graph to find "spaghetti" clusters.
4. **Inspect**: Click a node to see its details in the right side panel.
5. **Solve**: Use the **Action Plan** tab to see the most critical files to refactor first.
6. **Export**: Save your findings to share with the engineering team.

### Examine Any File's Purpose
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
