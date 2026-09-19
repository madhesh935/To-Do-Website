# FocusList

A calm, responsive daily task manager. React + TypeScript + Vite, plain CSS, and no runtime dependencies beyond React. No backend, account, cloud service, remote fonts, or analytics.

**Live app:** https://front-theta-roan.vercel.app

## Tech stack

- **React 19 + TypeScript** — component UI and static typing throughout.
- **Vite** — dev server and production bundling, with a separate `react` vendor chunk and `es2020` build target for smaller, cacheable output.
- **Plain CSS** (`src/styles.css`) — cascade layers (`tokens`, `base`, `components`, `responsive`), CSS custom properties for theming, and breakpoints from 360px up to 1600px+.
- **Vercel** — static hosting with immutable caching on hashed assets (`vercel.json`).

## Run locally

Requires Node.js 22.12+ (or 24 LTS) and npm.

```sh
npm ci
npm run dev
```

Development: http://127.0.0.1:5173

```sh
npm run build
npm run preview
```

Production preview: http://127.0.0.1:4173. The build command performs strict TypeScript checking and creates `dist/`. Serve the contents of `dist/` with any static web server; do not open `index.html` directly using `file://`. Assets use relative paths, so subdirectory hosting is supported. There is no server-side code or environment configuration.

## Features

- Add trimmed task titles with High, Medium, or Low priority; blank titles have accessible inline validation.
- Native completion checkboxes, inline title/priority editing, deletion, and undo of the latest deletion. Duplicate titles remain independent.
- Case-insensitive search combined with status and priority filters; clear filters and live result counts.
- Newest, oldest, and highest-priority sorting with deterministic ID tie-breakers.
- Global total/completed/pending statistics and rounded completion progress, independent of filters.
- Persistent light/dark themes, localized date, responsive layouts, keyboard focus indicators, accessible announcements, and reduced-motion support.
- Enter submits forms; Escape cancels editing. Focus returns to a sensible control after every task action.

## Storage and recovery

Tasks use `focuslist.tasks.v1`; the theme uses `focuslist.theme.v1`. Tasks contain a stable UUID, plain-text title, priority, completion flag, and numeric creation timestamp. New users start empty. Data is validated before use, including duplicate-ID detection.

No initial save runs on page load. Malformed, invalid, or unreadable data is left untouched. A visible warning offers an explicit, two-step replacement action; until then, changes remain in memory. Replacing saved data is irreversible. Write failures retain session tasks, show a warning instead of a successful-save message, and offer **Retry saving**.

Local Storage is specific to this browser profile and exact website origin (including port). Development and preview therefore have separate task lists. Clearing site data or changing devices does not carry tasks over. Undo lasts until the next deletion or page refresh and restores the original ID and metadata. Filters and sorting reset on refresh. Simultaneous-tab synchronization is not implemented: the last tab to save wins. Storage-blocked session changes cannot survive closing or refreshing the page.

## Architecture

The app follows a small, conventional separation of concerns rather than one flat file:

```
src/
├── App.tsx                 # composition root: owns state, derives data, wires callbacks to sections
├── components/             # one focused, presentational component per page section
│   ├── SiteHeader.tsx       # brand, date, theme toggle
│   ├── TaskStatistics.tsx   # total/completed/pending/progress cards
│   ├── StorageWarning.tsx   # blocked/failed-save recovery banner
│   ├── AddTaskForm.tsx      # new-task form
│   ├── TaskListPanel.tsx    # search, filters, sort, task list, empty state, undo
│   ├── SiteFooter.tsx
│   ├── NotificationToast.tsx
│   ├── TaskItem.tsx         # a single task row + its inline editor (memoized)
│   ├── PrioritySelect.tsx
│   └── Icon.tsx             # memoized SVG icon set
├── hooks/
│   └── useTaskStore.ts      # the one custom hook that owns task state + guarded localStorage persistence
├── utils/
│   └── tasks.ts             # pure functions: types, validation, filtering, sorting, statistics
└── styles.css                # design tokens, theming, and responsive layout (cascade layers)
```

- **State** lives in one place (`useTaskStore`); `App.tsx` composes it with local UI state (form fields, filters, notifications) and passes plain callbacks down to each section component — none of the section components read or write persistence directly.
- **Logic is pure**: everything in `utils/tasks.ts` (validation, filtering, sorting, statistics) is a pure function with no React or DOM dependency.
- **No god component**: the page used to be one ~180-line component rendering the entire tree; it's now split into one component per visual section (header, stats, add-form, task list, footer, toast), each independently readable and testable, with `App.tsx` left responsible only for state and wiring.
- **Components are presentational and memoized**: `TaskItem` and `Icon` are wrapped in `React.memo`, and every handler passed down from `App.tsx` is wrapped in `useCallback`, so unrelated state changes (typing in the search box, a toast timing out) don't re-render every row in the task list.
- **No global state library**: the task list is small and single-page, so a Context/Redux/Zustand layer would add indirection without a real benefit here — the custom-hook boundary already isolates persistence concerns from the UI.
