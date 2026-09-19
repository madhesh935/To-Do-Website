import type { Task, TaskStatistics } from '../types';

/** Derives dashboard statistics from the full task collection, ignoring filters. */
export function getStatistics(tasks: Task[]): TaskStatistics {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  return {
    total,
    completed,
    pending: total - completed,
    percentage: total ? Math.round((completed / total) * 100) : 0,
  };
}
