import type { Filters, SortOrder } from '../types';

/** Local Storage key for the task collection. */
export const TASKS_KEY = 'focuslist.tasks.v1';

/** Local Storage key for the persisted color theme. */
export const THEME_KEY = 'focuslist.theme.v1';

export const DEFAULT_FILTERS: Filters = {
  search: '',
  status: 'All',
  priority: 'All',
};

export const DEFAULT_SORT: SortOrder = 'newest';

export const STATUS_FILTERS = ['All', 'Active', 'Completed'] as const;

export const PRIORITY_RANK: Record<'High' | 'Medium' | 'Low', number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

/** Viewport widths used by the responsive engine and layout CSS. */
export const BREAKPOINTS = {
  xs: 320,
  sm: 375,
  mobile: 480,
  phablet: 576,
  tablet: 768,
  tabletLg: 992,
  laptop: 1024,
  desktop: 1200,
  wide: 1280,
  xl: 1440,
} as const;

export const TOAST_DURATION_MS = 5000;
export const SEARCH_DEBOUNCE_MS = 120;
