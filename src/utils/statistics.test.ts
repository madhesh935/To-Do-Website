import { describe, expect, it } from 'vitest';
import { getStatistics } from './statistics';
import type { Task } from '../types';

const tasks: Task[] = [
  { id: 'a', title: 'One', priority: 'High', completed: true, createdAt: 1 },
  { id: 'b', title: 'Two', priority: 'Low', completed: false, createdAt: 2 },
  { id: 'c', title: 'Three', priority: 'Medium', completed: false, createdAt: 3 },
];

describe('getStatistics', () => {
  it('handles empty, partial, and full completion', () => {
    expect(getStatistics([])).toEqual({ total: 0, completed: 0, pending: 0, percentage: 0 });
    expect(getStatistics(tasks)).toEqual({ total: 3, completed: 1, pending: 2, percentage: 33 });
    expect(getStatistics(tasks.map((task) => ({ ...task, completed: true }))).percentage).toBe(100);
  });
});
