# FocusList architecture

FocusList is a frontend-only React application. There is no backend, API, or remote database. Persistence uses the browser Local Storage API through a dedicated data layer.

## Layers

```
Presentation   src/pages, src/components, src/components/layout
State          src/context (React Context + Provider), src/hooks
Domain         src/utils (pure filtering, statistics, validation)
Data           src/services/storage.ts (Local Storage read/write)
State store    src/store/taskReducer.ts (pure useReducer)
Contracts      src/types, src/constants
```

- **UI components** never call `localStorage` directly. They dispatch through `TaskProvider` / `useTasks`.
- **Theme** is a separate context (`ThemeProvider`) so presentation can toggle color scheme without touching task state.
- **Task mutations** go through `useTaskStore`, which uses `useReducer` and a `commit` function that attempts to persist, then reports success/failure.
- **Filtering and statistics** are pure functions. They are unit-tested in Vitest and do not import React.
- **Styles** are split by concern (`tokens`, `base`, `layout`, `components`, `responsive`) with cascade layers. Task rows also use a CSS module for containment.

## Data model

Each task has a UUID, title, priority (`High` | `Medium` | `Low`), completion flag, and creation timestamp. Invalid stored payloads are not overwritten; a recovery banner is shown instead.

## Responsive strategy

Layout is mobile-first. Breakpoints include 320, 375, 480, 576, 640, 768, 992, 1024, 1200, 1280, and 1440. From 1024px the statistics rail becomes a sticky sidebar. Task rows reflow below 480px so title, priority, and actions remain usable.
