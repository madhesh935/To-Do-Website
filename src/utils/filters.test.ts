import { describe, expect, it } from 'vitest';
import { getVisibleTasks } from './filters';
import type { Task } from '../types';

const tasks: Task[] = [
  { id: 'beta', title: 'Review brief', priority: 'Low', completed: false, createdAt: 2 },
  { id: 'alpha', title: 'Review design', priority: 'High', completed: true, createdAt: 2 },
  { id: 'gamma', title: 'Send brief', priority: 'Medium', completed: false, createdAt: 1 },
];

describe('getVisibleTasks', () => {
  it('combines search, status, and priority without mutating the source', () => {
    const before = JSON.stringify(tasks);
    expect(getVisibleTasks(tasks, { search: 'REVIEW', status: 'Completed', priority: 'High' }, 'newest').map((task) => task.id)).toEqual(['alpha']);
    expect(getVisibleTasks(tasks, { search: 'REVIEW', status: 'Active', priority: 'High' }, 'newest')).toEqual([]);
    expect(JSON.stringify(tasks)).toBe(before);
  });

  it('sorts with deterministic tie breakers', () => {
    const filters = { search: '', status: 'All', priority: 'All' } as const;
    expect(getVisibleTasks(tasks, filters, 'newest').map((task) => task.id)).toEqual(['alpha', 'beta', 'gamma']);
    expect(getVisibleTasks(tasks, filters, 'oldest').map((task) => task.id)).toEqual(['gamma', 'alpha', 'beta']);
    expect(getVisibleTasks(tasks, filters, 'priority').map((task) => task.priority)).toEqual(['High', 'Medium', 'Low']);
  });
});
