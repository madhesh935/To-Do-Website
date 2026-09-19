# FocusList

Frontend-only daily task manager. Create, complete, edit, delete, search, and filter tasks by status and priority. Data stays in this browser via Local Storage — no backend, no account, no cloud database.

**Live app:** https://front-theta-roan.vercel.app

## Features

- Add a task by entering a **task title** and choosing **High**, **Medium**, or **Low** priority.
- Mark tasks completed or active, edit title and priority inline, and delete with undo.
- Search by title. Filter by **All / Active / Completed** and by priority. The list updates from the live task data.
- Statistics for **Total Tasks**, **Completed Tasks**, and **Pending Tasks**, plus a completion percentage. These ignore search filters so they always reflect the full list.
- Tasks persist after refresh. Light and dark themes persist separately.
- Keyboard: `/` focuses search, `N` focuses the new-task field, `Esc` cancels an edit.

## Tech stack

- React 19 + TypeScript
- Vite (React vendor chunk, CSS code splitting, minified production build)
- Layered CSS with design tokens and mobile-first breakpoints from 320px to 1440px+
- Vitest for domain logic, ESLint for static checks
- Vercel static hosting with immutable caching on hashed assets

## Run locally

Requires Node.js 22.12+ (or 24 LTS) and npm.

```sh
npm ci
npm run dev
```

Development: http://127.0.0.1:5173

```sh
npm test
npm run lint
npm run build
npm run preview
```

Production preview: http://127.0.0.1:4173. Serve `dist/` with any static web server. Do not open `index.html` with `file://`.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/CHANGELOG.md](docs/CHANGELOG.md).

```
src/
├── App.tsx                 # root: providers already wrap this from main.tsx
├── pages/                  # HomePage owns filters, callbacks, and section wiring
├── components/
│   ├── common/             # Icon, ErrorBoundary, toast, shared controls
│   ├── layout/             # header, footer, page shell
│   ├── stats/              # Total / Completed / Pending statistics
│   ├── composer/           # add-task form
│   ├── tasks/              # filters, list, row editor, empty state
│   └── storage/            # Local Storage recovery banner
├── context/                # TaskProvider + ThemeProvider (React Context)
├── hooks/                  # useTaskStore (useReducer), debounce, media query, theme
├── services/               # Local Storage read/write
├── types/                  # Task, Filters, Priority
├── constants/              # storage keys, breakpoints, defaults
├── utils/                  # pure filter / sort / statistics / validation
└── styles/                 # tokens, base, layout, components, responsive
```

## Storage

- Tasks: `focuslist.tasks.v1`
- Theme: `focuslist.theme.v1`

Malformed data is left untouched. A banner offers an explicit replace action. Write failures keep session tasks and offer retry. Local Storage is per browser profile and origin. Filters reset on refresh.

## Accessibility

Skip link, labeled controls, visible `:focus-visible` rings, `aria-live` toasts, `aria-pressed` filters, 44px touch targets, reduced-motion support, and forced-colors fallbacks. Decorative icons are hidden from assistive tech.
