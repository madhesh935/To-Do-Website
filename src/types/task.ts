/** Priority levels required by the FocusList brief. */
export const PRIORITIES = ['High', 'Medium', 'Low'] as const;

export type Priority = (typeof PRIORITIES)[number];

export type StatusFilter = 'All' | 'Active' | 'Completed';

export type PriorityFilter = Priority | 'All';

export type SortOrder = 'newest' | 'oldest' | 'priority';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

export interface Filters {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
}

export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export interface LoadResult {
  tasks: Task[];
  blocked: boolean;
}

export type ThemeName = 'light' | 'dark';
