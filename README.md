<p align="center">
  <img src="./banner.png" alt="DevCrew Banner" width="100%" />
</p>

<h1 align="center">DevCrew — AI Dev Team Frontend</h1>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18+-blue.svg" alt="React"/></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-5+-purple.svg" alt="Vite"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5+-blue.svg" alt="TypeScript"/></a>
  <a href="https://ant.design"><img src="https://img.shields.io/badge/Ant%20Design-5+-red.svg" alt="Ant Design"/></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3+-cyan.svg" alt="Tailwind"/></a>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
</p>

<p align="center">
  React + TypeScript frontend for the DevCrew AI Dev Team platform — featuring codebase Q&A, PR review, debugging, test generation, documentation, team mode, and architecture graph screens.
</p>

---

## 🎬 Demo

<p align="center">
  <img src="./demo.gif" alt="DevCrew Demo" width="100%" />
</p>

---

## ✨ Features

| Screen | Description |
|--------|-------------|
| **Codebase Q&A** | Ask natural language questions about any GitHub repo |
| **PR Review** | Review open PRs and apply fix suggestions with one click |
| **Debug Agent** | Analyze error messages and get root cause + code fix |
| **Test Generator** | Generate unit, edge case, and integration tests for any file |
| **Documentation** | Generate README, API reference, and architecture docs |
| **Team Mode** | Run multiple agents in parallel with real-time SSE progress |
| **Architecture Graph** | Interactive dependency graph built from AST analysis |
| **Repo Intelligence** | Module health, bug hotspots, contributors, and activity feed |

---

## 📸 Screenshots

### 🔍 Codebase Q&A
<p align="center">
  <img src="./screenshots/codebase-qa.png" alt="Codebase Q&A" width="100%" />
</p>

Ask natural language questions about any GitHub repository. The agent indexes your codebase using RAG (Retrieval-Augmented Generation), finds the most relevant files, and returns accurate, context-aware answers. Great for onboarding, exploring unfamiliar codebases, or quickly locating logic across a large project.

---

### 🔀 PR Review
<p align="center">
  <img src="./screenshots/pr-review.png" alt="PR Review" width="100%" />
</p>

Select any open pull request and get an instant AI-powered code review. The agent analyzes the diff, identifies bugs, security issues, and code quality problems, assigns a risk score, and generates fix suggestions. You can apply the suggested fixes directly to the PR branch with one click.

---

### 🐛 Debug Agent
<p align="center">
  <img src="./screenshots/debugging.png" alt="Debug Agent" width="100%" />
</p>

Paste an error message or stack trace and let the agent find the root cause. It searches the codebase for relevant files, explains what went wrong, suggests a fix, and can open a pull request with the applied changes — all without leaving the platform.

---

### 🧪 Test Generator
<p align="center">
  <img src="./screenshots/test-generator.png" alt="Test Generator" width="100%" />
</p>

Select a file from your repository and generate unit, edge case, and integration tests automatically. The agent reads the actual file content, understands the logic, and produces ready-to-run test code with estimated coverage. Supports Jest (TypeScript/JavaScript) and pytest (Python).

---

### 📄 Documentation
<p align="center">
  <img src="./screenshots/documentation.png" alt="Documentation" width="100%" />
</p>

Generate README files, API references, or architecture documentation for any file or the whole repository. The agent reads the source code and produces clean, structured markdown that you can review and publish directly to your repo.

---

### 🤝 Team Mode
<p align="center">
  <img src="./screenshots/team-mode.png" alt="Team Mode" width="100%" />
</p>

Run multiple AI agents simultaneously on your repository. Select any combination of agents (Codebase, PR Review, Test, Documentation) and watch them execute in a real-time pipeline via SSE streaming. When all agents finish, an aggregator produces a unified health score and a prioritized action plan for your project.

---

### 🗺 Architecture Graph
<p align="center">
  <img src="./screenshots/architecture-graph.png" alt="Architecture Graph" width="100%" />
</p>

Visualize your project's dependency graph as an interactive node-based diagram. The agent performs static analysis on your repository files (Python and TypeScript/JavaScript), extracts import relationships, and renders them using ReactFlow with dagre layout. Nodes are color-coded by type: service, database, external, and middleware.

---

### 📊 Repo Intelligence
<p align="center">
  <img src="./screenshots/repo-intelligence.png" alt="Repo Intelligence" width="100%" />
</p>

Get a real-time health overview of your repository. Displays key metrics including open PRs, bug counts, total commits, and a risk score. Shows the most frequently changed modules, bug hotspots, recent activity feed, and top contributors — all fetched live from the GitHub API.

---

## ⚡ Quick Start

**Prerequisites:** Node.js 18+, running DevCrew backend

```bash
# 1. Clone
git clone <REPO_URL>
cd <REPO_NAME>

# 2. Install dependencies
npm install

# 3. Create .env file in the project root
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 4. Start
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> Make sure the [DevCrew backend](https://github.com/emektarkubra/devcrew-backend) is running on `http://localhost:8000` before starting the frontend.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔑 GitHub OAuth Setup

Authentication is handled entirely by the backend via GitHub OAuth. You do not need to configure anything in the frontend — just make sure the backend is set up with a valid GitHub OAuth App.

To create one:
1. Go to [GitHub → Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:8000/auth/github/callback`
4. Copy the **Client ID** and **Client Secret** into the backend `.env`

---

## 🔗 Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| UI Library | Ant Design 5 |
| Styling | SCSS (BEM) + Tailwind CSS |
| State | Redux Toolkit |
| HTTP | Axios |
| Routing | React Router |
| i18n | react-i18next (EN + TR) |
| Graph | ReactFlow + dagre |
| Charts | ECharts for React |
| Streaming | EventSource (SSE) |

---

## 🆘 Troubleshooting

**Blank page after login**
- Check `VITE_API_BASE_URL` in `.env` — should point to running backend
- Open browser DevTools → Network tab for failed requests

**GitHub login redirects to error**
- Verify backend `FRONTEND_URL=http://localhost:5173` in backend `.env`
- Check GitHub OAuth App callback URL matches backend

**SSE stream not updating (Team Mode)**
- Make sure browser isn't blocking EventSource connections
- Check backend logs for streaming errors

---

## 🙌 Contributing

1. Open an issue describing the change
2. Fork → create a feature branch
3. Open a PR with screenshots if UI changes are included

---

<p align="center">Built with ❤️ by the DevCrew Team</p>