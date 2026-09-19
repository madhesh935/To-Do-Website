import { expect, test } from '@playwright/test';
import { getStatistics, getVisibleTasks, isTask, type Task } from '../src/utils/tasks';

const tasks: Task[] = [
  { id: 'beta', title: 'Review brief', priority: 'Low', completed: false, createdAt: 2 },
  { id: 'alpha', title: 'Review design', priority: 'High', completed: true, createdAt: 2 },
  { id: 'gamma', title: 'Send brief', priority: 'Medium', completed: false, createdAt: 1 },
];

test('statistics are derived, rounded, and handle zero and full completion', () => {
  expect(getStatistics([])).toEqual({ total: 0, completed: 0, pending: 0, percentage: 0 });
  expect(getStatistics(tasks)).toEqual({ total: 3, completed: 1, pending: 2, percentage: 33 });
  expect(getStatistics(tasks.map((task) => ({ ...task, completed: true }))).percentage).toBe(100);
});

test('filtering combines search, status, and priority without changing the source', () => {
  const before = JSON.stringify(tasks);
  expect(getVisibleTasks(tasks, { search: 'REVIEW', status: 'Completed', priority: 'High' }, 'newest').map((task) => task.id)).toEqual(['alpha']);
  expect(getVisibleTasks(tasks, { search: 'REVIEW', status: 'Active', priority: 'High' }, 'newest')).toEqual([]);
  expect(JSON.stringify(tasks)).toBe(before);
});

test('all sorting modes use deterministic tie breakers and preserve the original array', () => {
  const filters = { search: '', status: 'All', priority: 'All' } as const;
  expect(getVisibleTasks(tasks, filters, 'newest').map((task) => task.id)).toEqual(['alpha', 'beta', 'gamma']);
  expect(getVisibleTasks(tasks, filters, 'oldest').map((task) => task.id)).toEqual(['gamma', 'alpha', 'beta']);
  expect(getVisibleTasks(tasks, filters, 'priority').map((task) => task.priority)).toEqual(['High', 'Medium', 'Low']);
  expect(tasks.map((task) => task.id)).toEqual(['beta', 'alpha', 'gamma']);
});

test('restoration rejects invalid fields, empty titles, and invalid timestamps', () => {
  expect(isTask(tasks[0])).toBe(true);
  for (const invalid of [null, [], {}, { ...tasks[0], id: '' }, { ...tasks[0], title: '  ' }, { ...tasks[0], priority: 'Urgent' }, { ...tasks[0], completed: 'yes' }, { ...tasks[0], createdAt: Infinity }, { ...tasks[0], createdAt: -1 }]) {
    expect(isTask(invalid)).toBe(false);
  }
});
