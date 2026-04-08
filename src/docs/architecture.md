# Architecture

## Tech Stack

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

## Directory Structure

```
src/
├── assets/
│   └── style/
│       └── variables.scss          # GitHub color tokens (light + dark)
│
├── components/                     # Shared/reusable components
│
├── layout/
│   ├── AppLayout.tsx               # Main layout wrapper
│   ├── AppSidebar.tsx              # Sidebar with nav + collapse
│   ├── AppHeader.tsx               # Top header bar
│   ├── AppBreadcrumb.tsx           # Breadcrumb nav
│   └── withLayout.tsx              # HOC — wraps pages with layout
│
├── pages/
│   ├── login/                      # Login page
│   ├── codebaseQA/                 # Codebase Q&A screen
│   ├── prReview/                   # PR Review screen
│   │   ├── index.tsx
│   │   ├── PRReportModal.tsx       # Review report modal
│   │   └── ApplyFixModal.tsx       # Fix application modal
│   ├── debugAgent/                 # Debug Agent screen
│   ├── testGenerator/              # Test Generator screen
│   ├── documentation/              # Documentation screen
│   ├── teamMode/                   # Team Mode screen
│   ├── repoIntelligence/           # Repo Intelligence screen
│   ├── architectureGraph/          # Architecture Graph screen
│   └── profile/                    # User profile screen
│
├── services/
│   ├── api.ts                      # Unified API object (all services)
│   ├── paths.ts                    # All API endpoint paths
│   ├── request.ts                  # Axios instance + 401 interceptor
│   ├── agents.ts                   # Agent API calls
│   ├── profile.ts                  # Profile + repo API calls
│   └── auth.ts                     # Auth API calls
│
├── store/
│   ├── index.ts                    # Redux store
│   └── slices/
│       └── sidebarSlice.ts         # Sidebar collapse state
│
├── locales/
│   ├── en.json                     # English translations
│   └── tr.json                     # Turkish translations
│
└── utils/
    ├── languageColors.ts            # GitHub language color map
    └── timeAgo.ts                   # Relative time formatter
```

---

## Request Flow

```
User action
      │
      ▼
Page component
      │
      ▼
api.agents.someMethod(token, ...)
      │  (src/services/api.ts)
      ▼
request.post/get(paths.someEndpoint, payload)
      │  (src/services/request.ts — Axios instance)
      ▼
Backend API (http://localhost:8000)
      │
      ▼
{ data, error } returned to component
      │
      ├── error → toast.error(error)
      └── data  → setState / render
```

### Axios Interceptor

`src/services/request.ts` intercepts every response:

```typescript
instance.interceptors.response.use(
    (response) => ({ data: response.data, error: null }),
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('dt-token')
            window.location.href = '/login'
        }
        return { data: null, error: error.response?.data?.message ?? 'Something went wrong' }
    }
)
```

All API calls return `{ data, error }` — no try/catch needed in components.

---

## State Management

Redux is used only for global UI state. Server data stays local in component `useState`.

| Slice | State | Used by |
|-------|-------|---------|
| `sidebarSlice` | `collapsed: boolean` | `AppSidebar`, `AppLayout` |

---

## Theming

**Light mode:** SCSS variables (`$gh-light-*`) defined in `src/assets/style/variables.scss`

**Dark mode:** Tailwind `@apply dark:` directives with custom GitHub color tokens registered in `tailwind.config.js` under `theme.extend.colors`

**Toggle:** `document.documentElement.classList.toggle('dark')` — persisted in `localStorage`

---

## Styling Pattern

All pages use BEM-structured SCSS with a matching `index.scss`:

```scss
// index.scss
@import '../../assets/style/variables';

.page-name {
    // light mode with SCSS variables
    color: $gh-light-text-primary;

    // dark mode with Tailwind @apply
    @apply dark:text-gh-text-primary;

    &__child {
        // ...
    }
}
```

Inline styles are only used for dynamic values (e.g. `getLanguageColor(language)` dot colors).

---

## i18n Pattern

All UI strings come from translation files. Keys are namespaced per screen:

```json
// en.json
{
  "teamMode": {
    "title": "Team Mode",
    "runTeam": "Run Team",
    "agents_codebase": "Codebase Analysis"
  }
}
```

```typescript
// component
const { t } = useTranslation()
<Text>{t('teamMode.title')}</Text>
```

---

## SSE (Server-Sent Events)

Team Mode uses `EventSource` for real-time streaming:

```typescript
const es = api.agents.teamModeStream(token, owner, repo, selectedAgents)

es.addEventListener('agent_start', (e) => { ... })
es.addEventListener('agent_done',  (e) => { ... })
es.addEventListener('complete',    (e) => { es.close() })
es.addEventListener('error',       (e) => { es.close() })
```

`EventSource` is created in `src/services/agents.ts` with token and params as query strings.