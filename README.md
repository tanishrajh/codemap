# CodeMap 🧠 🛰️

### **Deterministic Codebase Analysis & Architectural Visualization Engine**

CodeMap is a high-performance analysis platform that transforms raw source code into an interactive dependency map. It uses **Graph Theory** and **Static Analysis** to identify structural rot, detect circular dependencies, and provide a clear bird's-eye view of any JavaScript, TypeScript, or Python project.

**No AI, No API Keys, No Latency. Just pure structural code intelligence.**

---

## 📑 **Executive Summary**
CodeMap builds a live dependency graph and classifies modules into architectural layers. It is designed for developers who need to understand a new codebase instantly or identify critical technical debt in existing projects.

- **[Core Features](#-core-features)**
- **[Intelligence Pipeline](#-intelligence-pipeline)**
- **[Tech Stack](#-the-tech-stack)**
- **[Setup Guide](#-setup-guide)**

---

## 🔥 **Core Features**

### 1. 📂 **Multi-Source Ingestion**
- **GitHub Sync**: Analyze any public repository instantly via URL.
- **Local Workspace**: Securely upload `.zip` archives for private, offline analysis.

### 2. 🕸️ **Deterministic Dependency Mapping**
- **Deep Scanning**: Maps `import`, `require`, and dynamic dependency patterns.
- **Relationship Analysis**: Computes In-Degree (Impact) and Out-Degree (Complexity) for every single file.
- **Centrality Detection**: Identifies the "Core Modules" that the rest of your system depends on.

### 3. 🔍 **Smart Search & Jump**
- **Real-time Autocomplete**: Find any module across thousands of files instantly.
- **Cinematic Zoom**: Seamlessly pans and zooms the 2D graph to highlight your selection.

### 4. 🔄 **Circular Dependency Detective**
- **Cycle Discovery**: Identifies recursive import loops (A → B → A) that cause memory leaks and runtime issues.
- **Visual Chains**: See the exact path of files involved in a structural loop in the **BUGS** tab.

### 5. 📤 **Professional Export Suite**
- **JSON Data**: Export your entire analysis (nodes, edges, metrics) for archival.
- **CSV Ledger**: Download your architectural bug list for Jira or spreadsheet tracking.

---

## 🏗️ **Intelligence Pipeline**

CodeMap executes a **6-stage autonomous loop** during every analysis:

1. **Ingestion**: Securely downloads and extracts the repository source.
2. **Traversal**: Recursively walks the tree, prioritizing code over noise (`node_modules`, etc.).
3. **Logic Graph**: Builds directed edges and calculates node importance based on imports.
4. **Categorization**: Classifies modules into **UI**, **Backend**, **Logic**, **Utility**, or **Config** layers.
5. **Critic Engine**: Scans for structural anti-patterns, complexity hotspots, and cycles.
6. **Reporting**: Compiles the interactive dashboard and interactive file tree.

---

## 🛠️ **The Tech Stack**

### **The Frontend (Visuals)**
- **React 19** + **Vite 8**: Ultra-fast hot-reloading dashboard.
- **Tailwind CSS 3**: Neobrutalist design system with high-contrast styling.
- **react-force-graph-2d**: D3-powered physics simulation.

### **The Backend (Engine)**
- **Node.js 18+** + **Express 4**: Robust API orchestration.
- **AdmZip**: High-speed local archive processing.
- **Axios**: Intelligent fetching for GitHub repository ingestion.

---

## 🚀 **Setup Guide**

Follow these steps to run CodeMap locally. **Note: No API keys or `.env` files are required.**

### **1. Clone the Repository**
```bash
git clone https://github.com/tanishrajh/CodeMap.git
cd CodeMap
```

### **2. Start the Backend**
The backend serves the analysis engine and repository parser.
```bash
cd backend
npm install
npm run dev
```
*The server will run on `http://localhost:3000`.*

### **3. Start the Frontend**
Open a **new terminal window** to run the dashboard.
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will run on `http://localhost:5173`.*

### **4. Access CodeMap**
Open your browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

---

## 💡 **How To Use**

1. **Connect**: Input a GitHub URL or upload a ZIP.
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
