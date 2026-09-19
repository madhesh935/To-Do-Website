import { PRIORITIES, type Task } from '../types';

/** Runtime guard used when hydrating Local Storage payloads. */
export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return typeof task.id === 'string' && task.id.trim().length > 0
    && typeof task.title === 'string' && task.title.trim().length > 0
    && PRIORITIES.includes(task.priority as Task['priority'])
    && typeof task.completed === 'boolean'
    && typeof task.createdAt === 'number' && Number.isFinite(task.createdAt)
    && task.createdAt >= 0 && task.createdAt <= 8.64e15;
}

export function createTaskId(): string {
  return crypto.randomUUID();
}
