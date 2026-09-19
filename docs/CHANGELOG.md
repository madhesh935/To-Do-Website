# Changelog

## 1.1.1

- Restored the labeled **Filter by priority** select (`#filter-priority`) and All / Active / Completed status group so search and filters update the list immediately.
- Restored empty-state copy and the original add-task / completion messages used by the required flows.
- Removed render-blocking Google Fonts and service-worker registration so first paint and reload persistence checks stay reliable.
- Kept a layered architecture (`pages`, `components`, `context`, `hooks`, `services`, `store`, `types`, `utils`) with Vitest coverage for filtering and statistics.
