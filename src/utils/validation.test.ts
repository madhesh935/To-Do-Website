import { describe, expect, it } from 'vitest';
import { isTask } from './validation';
import type { Task } from '../types';

const valid: Task = { id: 'a', title: 'Plan', priority: 'High', completed: false, createdAt: 1 };

describe('isTask', () => {
  it('accepts complete tasks and rejects invalid payloads', () => {
    expect(isTask(valid)).toBe(true);
    for (const invalid of [null, [], {}, { ...valid, id: '' }, { ...valid, title: '  ' }, { ...valid, priority: 'Urgent' }, { ...valid, completed: 'yes' }, { ...valid, createdAt: Infinity }, { ...valid, createdAt: -1 }]) {
      expect(isTask(invalid)).toBe(false);
    }
  });
});
