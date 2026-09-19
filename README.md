# FocusList

A calm, responsive daily task manager. React + TypeScript + Vite, plain CSS, and no runtime dependencies beyond React. No backend, account, cloud service, remote fonts, or analytics. Nothing has been deployed.

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

Production preview: http://127.0.0.1:4173. The build command performs strict TypeScript checking and creates `dist/`. Serve the contents of `dist/` with any static web server; do not open `index.html` directly using `file://`. Assets use relative paths, so subdirectory hosting is supported. There is no server-side code or environment configuration. Deployment is intentionally left to you.

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

## Tests

```sh
npx playwright install chromium
npm test
```

Playwright starts a local development server automatically. Tests use isolated browser contexts, never your personal browser data. Chromium interaction tests cover creation, validation, duplicates, editing/canceling, completion, filtering, deletion/undo, sorting, refresh persistence, empty states, HTML-like titles, storage failures/recovery, keyboard focus, and themes. Pure tests cover statistics, validation, filtering, and deterministic sorting. Axe checks light/dark empty, populated, and editor states. Responsive tests capture screenshots at 320, 375, 768, and 1440 px, check overflow and touch controls, plus landscape and reduced-motion behavior.

To test the production build in PowerShell:

```powershell
npm run build
$env:FOCUSLIST_PREVIEW = '1'
npm test
Remove-Item Env:FOCUSLIST_PREVIEW
```

On macOS/Linux: `FOCUSLIST_PREVIEW=1 npm test` after building. View the report with `npx playwright show-report`; screenshots are in `test-results/`. Automated accessibility checks complement, but do not replace, manual assistive-technology testing.

## Source map

- `src/App.tsx` — task orchestration and dashboard.
- `src/tasks.ts` — types, validation, persistence helpers, filters, sorting, and statistics.
- `src/useTaskStore.ts` — authoritative task state and guarded persistence.
- `src/components/` — reusable SVG icons, priority select, task row, and inline editor.
- `src/styles.css` — semantic design tokens, theme, responsive layout, and focus/motion styles.
- `tests/` — browser acceptance and pure-logic tests.
