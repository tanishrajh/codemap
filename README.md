# CodeMap

### Deterministic Codebase Analysis & Architectural Visualization Engine

CodeMap is a high-performance static analysis platform designed to transform raw source code into an interactive dependency graph. Utilizing graph theory algorithms, the engine maps structural architecture, identifies recursive import loops (circular dependencies), and exposes technical debt across JavaScript, TypeScript, and Python repositories—all running entirely locally without reliance on external APIs.

---

## Executive Summary

CodeMap constructs a live directed graph and categorizes source modules into distinct architectural layers. It serves as an auditing tool for software engineers needing immediate architectural comprehension or technical debt identification in complex codebases.

## Core Features

### 1. Multi-Source Ingestion
- **GitHub Synchronization**: Instantly analyze public repositories via URL.
- **Local Workspace**: Securely parse uploaded `.zip` archives for private, offline analysis.

### 2. Deterministic Dependency Mapping
- **Deep Scanning**: Traces standard `import`, `require`, and dynamic module dependency patterns.
- **Relationship Analysis**: Computes In-Degree (architectural impact) and Out-Degree (module complexity) metrics for all tracked files.
- **Centrality Detection**: Computationally isolates the core structural modules of the application.

### 3. Interactive Visualization & Search
- **Real-time Autocomplete**: Search and index nodes across large-scale codebases instantly.
- **Cinematic Rendering**: High-performance D3 physics simulation with automatic panning and highlighting.

### 4. Circular Dependency Detection
- **Cycle Discovery**: Recursively detects import loops (A → B → A) known to induce memory leaks and runtime failures.
- **Visual Auditing**: Highlights the explicit file chains responsible for structural loops.

### 5. Professional Export Suite
- **JSON Data**: Export complete graph structures (nodes, edges, metrics) for subsequent auditing.
- **CSV Ledger**: Download tabular reports of architectural bottlenecks for issue tracking (e.g., Jira).

---

## Intelligence Pipeline

During execution, CodeMap processes repositories through a 6-stage autonomous pipeline:

1. **Ingestion**: Securely downloads and extracts repository archives.
2. **Traversal**: Recursively walks the directory tree, excluding non-source directories (e.g., `node_modules`).
3. **Logic Graph**: Constructs directed edges and calculates node importance based on dependency frequencies.
4. **Categorization**: Classifies modules into logical layers (UI, Backend, Logic, Utility, Config).
5. **Critic Engine**: Scans for structural anti-patterns and complexity hotspots.
6. **Reporting**: Compiles the data for the interactive frontend dashboard.

---

## Technology Stack

### Frontend Architecture
- **Framework**: React 19 + Vite 8 (Hot-reloading dashboard)
- **Styling**: Tailwind CSS 3
- **Visualization**: `react-force-graph-2d` (D3-powered physics simulation)

### Backend Engine
- **Runtime**: Node.js 18+ + Express 4
- **Archive Processing**: `adm-zip` for high-speed local extraction
- **Network Requests**: `axios` for GitHub repository ingestion

---

## Local Deployment Guide

Follow these instructions to deploy CodeMap locally. Note: No API keys or `.env` configurations are required.

### 1. Clone the Repository
```bash
git clone https://github.com/tanishrajh/CodeMap.git
cd CodeMap
```

### 2. Initialize the Backend Engine
The backend serves the analysis logic and file parsing utilities.
```bash
cd backend
npm install
npm run dev
```
*The server initializes on port `3000`.*

### 3. Initialize the Frontend Dashboard
Open a new terminal window to serve the client interface.
```bash
cd frontend
npm install
npm run dev
```
*The dashboard initializes on port `5173`.*

### 4. Access the Platform
Navigate your web browser to `http://localhost:5173`.

---

## Troubleshooting

| Problem | Cause | Resolution |
|---------|-------|----------|
| "File not found on disk" | Path synchronization lost between sessions. | Initiate a new analysis to re-ingest the repository. |
| Backend fails to start (Port 3000) | Port already bound to another process. | Terminate the process (e.g., `npx kill-port 3000`) or adjust the port configuration. |
| GitHub repository fails to download | Repository is private or URL is malformed. | Utilize the Local Upload feature with a `.zip` archive. |
| Graph renders empty | No supported files found in repository. | CodeMap currently supports `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, and `.json`. |

---

## License

ISC License
