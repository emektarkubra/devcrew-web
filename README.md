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

## 📸 Screenshots

<p align="center">
  <img src="./screenshots/codebase-qa.png" alt="Codebase Q&A" width="100%" />
  <br/><em>Codebase Q&A</em>
</p>

<p align="center">
  <img src="./screenshots/pr-review.png" alt="PR Review" width="100%" />
  <br/><em>PR Review</em>
</p>

<p align="center">
  <img src="./screenshots/team-mode.png" alt="Team Mode" width="100%" />
  <br/><em>Team Mode</em>
</p>

<p align="center">
  <img src="./screenshots/architecture-graph.png" alt="Architecture Graph" width="100%" />
  <br/><em>Architecture Graph</em>
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

## ⚡ Quick Start

**Prerequisites:** Node.js 18+, running DevCrew backend

```bash
# 1. Clone
git clone <REPO_URL>
cd <REPO_NAME>

# 2. Install dependencies
npm install

# 3. Environment
cp .env.example .env
# Edit .env with your backend URL

# 4. Start
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> Make sure the [DevCrew backend](../devcrew-be/README.md) is running on `http://localhost:8000` before starting the frontend.

---

## 🔐 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

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