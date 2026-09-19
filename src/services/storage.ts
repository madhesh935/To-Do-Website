import { TASKS_KEY, THEME_KEY } from '../constants';
import type { LoadResult, Task, ThemeName } from '../types';
import { isTask } from '../utils/validation';

/**
 * Reads the task list from Local Storage.
 * Invalid payloads are not overwritten; the caller shows a recovery path instead.
 */
export function loadTasks(): LoadResult {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return { tasks: [], blocked: false };
    const parsed: unknown = JSON.parse(raw);
    if (
      !Array.isArray(parsed)
      || !parsed.every(isTask)
      || new Set(parsed.map((task: Task) => task.id)).size !== parsed.length
    ) {
      return { tasks: [], blocked: true };
    }
    return { tasks: parsed, blocked: false };
  } catch {
    return { tasks: [], blocked: true };
  }
}

/** Persists the task list. Returns false when storage is unavailable or full. */
export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function loadTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* private mode */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: ThemeName): boolean {
  try {
    localStorage.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
