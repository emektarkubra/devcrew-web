# Screens

Overview of every screen in DevCrew — what it does, how it works, and key implementation details.

---

## Login

**Path:** `src/pages/login/`

GitHub OAuth flow:

```
User clicks "Sign in with GitHub"
        │
        ▼
Redirect to backend → GET /auth/github
        │
        ▼
GitHub OAuth consent screen
        │
        ▼
GitHub redirects to backend callback
        │
        ▼
Backend returns JWT token
        │
        ▼
Frontend stores token in localStorage ('dt-token')
        │
        ▼
Redirect to main app
```

---

## Codebase Q&A

**Path:** `src/pages/codebaseQA/`

```
User selects repo + types question
        │
        ▼
api.agents.codebaseQA(token, owner, repo, query)
        │
        ▼
POST /agents/codebase-qa
        │
        ▼
Response: { answer, sources[] }
        │
        ▼
Answer rendered in chat-style UI
Source files listed below answer
        │
        ▼
History loaded on mount → POST /agents/codebase-qa/history
History click → restores previous query + answer
```

**Key details:**
- First query for a repo triggers auto-indexing on the backend (~30s for large repos)
- History is fetched per repo on mount

---

## PR Review

**Path:** `src/pages/prReview/`

```
User selects repo → open PRs listed
        │
        ▼
User clicks "Review PR"
        │
        ▼
POST /agents/pr-review → review report
        │
        ▼
PRReportModal opens
  ├── issues list with severity tags
  ├── suggestions list
  └── score badge
        │
        └── User clicks "Apply Fixes"
                │
                ▼
        POST /agents/pr-review/generate-fixes
                │
                ▼
        ApplyFixModal opens — shows original/fixed diffs
                │
                ▼
        User confirms → POST /agents/pr-review/apply-fixes
                │
                ▼
        Fixes committed directly to PR branch via GitHub API
```

**Key details:**
- `PRReportModal` and `ApplyFixModal` are separate component files
- Fix application commits directly to the PR branch — no manual copy-paste needed

---

## Debug Agent

**Path:** `src/pages/debugAgent/`

```
User selects repo + pastes error message + (optional) code
        │
        ▼
POST /agents/debug
        │
        ▼
Response: { root_cause, explanation, solution, code_fix }
        │
        ▼
Result rendered in structured cards:
  ├── Root Cause
  ├── Explanation
  ├── Solution
  └── Code Fix (syntax highlighted)
        │
        ▼
History loaded on mount → POST /agents/debug/history
```

---

## Test Generator

**Path:** `src/pages/testGenerator/`

```
User selects repo → file list loaded (filtered by TESTABLE_EXTENSIONS)
        │
        ▼
User selects target file + framework
        │
        ▼
POST /agents/test-generator
        │
        ▼
Response: { tests[], unitCount, edgeCount, integrationCount, coverage }
        │
        ▼
Tests rendered in collapsible list
  ├── type badge (unit / edge / integration)
  ├── description
  └── code block (copyable)
        │
        ▼
History loaded on mount → POST /agents/test-generator/history
History click → restores test results (maps testCount field)
```

**Key details:**
- File dropdown only shows files matching `TESTABLE_EXTENSIONS` — config and spec files are excluded
- Supported frameworks: `pytest`, `jest`, `mocha`, `rspec`, `junit`

---

## Documentation Agent

**Path:** `src/pages/documentation/`

```
User selects repo + doc type (readme | api | architecture)
        │
        ▼
POST /agents/documentation
        │
        ▼
Response: { markdown, doc_type }
        │
        ▼
Markdown rendered with syntax highlighting
Download button → saves as .md file
        │
        ▼
History loaded on mount → POST /agents/documentation/history
```

---

## Team Mode

**Path:** `src/pages/teamMode/`

```
User selects repo + agents (multi-select)
        │
        ▼
"Run Team" clicked
        │
        ▼
EventSource opened → GET /agents/team-mode/stream
        │
        ▼
SSE events update pipeline UI in real time:
  agent_start → step icon shows spinner
  agent_done  → step icon shows checkmark + elapsed time
  complete    → health report rendered
        │
        ▼
Health Report:
  ├── Health score (0-100)
  ├── PRs reviewed
  ├── Tests generated
  ├── Docs generated
  ├── Summary text
  └── Top actions list
        │
        ▼
Outputs section: Collapse panels per agent (summary + actions)
        │
        ▼
History loaded on mount → POST /agents/team-mode/history
History click → restores full run results
```

**Key details:**
- Pipeline shows real-time running/done/waiting state per agent with colored step icons
- Each agent has a color: blue (codebase), purple (PR review), green (test), orange (docs)
- History is user-wide (not per repo) — fetched once on mount, refreshed after each run

---

## Architecture Graph

**Path:** `src/pages/architectureGraph/`

```
User selects repo (first repo auto-selected)
        │
        ▼
GET /agents/architecture?owner=...&repo=...
        │
        ▼
Response: { nodes[], edges[] }
        │
        ▼
applyLayout(nodes, edges) — dagre hierarchical layout
        │
        ▼
ReactFlow renders interactive graph:
  ├── Node colors by type (blue=service, green=database, orange=external, purple=middleware)
  ├── Animated edges for service/middleware connections
  └── MiniMap for navigation
        │
        ▼
Filter select → hides nodes not matching selected type
        │
        ▼
Node click → Drawer opens:
  ├── Type + language tags
  ├── File path
  ├── Description (LLM-generated)
  └── Connections list (→ outgoing, ← incoming)
```

**Key details:**
- Layout uses `dagre` — nodes are positioned automatically based on edge relationships
- `applyLayout()` runs client-side after API response
- Download PNG button exports the graph as an image

---

## Repo Intelligence

**Path:** `src/pages/repoIntelligence/`

```
User selects repo (first repo auto-selected)
        │
        ▼
Mock data rendered (backend not yet connected):
  ├── Metric cards: total bugs, avg coverage, open PRs, commits, risk score
  ├── Module Health: file list with bug rate + coverage progress bars
  ├── Bug Hotspots: top files by bug count
  ├── Recent Activity: commit/PR/bug/review feed
  └── Contributors: commit + PR counts with progress bars
```

**Key details:**
- All data is currently mock — backend integration is planned
- Repo select changes the subtitle but data stays mock
- Sort by bug rate / coverage / changes is client-side on mock data

---

## Profile

**Path:** `src/pages/profile/`

```
GET /profile → user info (avatar, username, email)
GET /repos/stats → repo statistics
        │
        ▼
Profile card: avatar + username + email
Stats cards: total repos, languages, activity
Repo list with language dots and visibility badges
```