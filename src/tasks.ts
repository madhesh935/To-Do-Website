export const TASKS_KEY = 'focuslist.tasks.v1';
export const THEME_KEY = 'focuslist.theme.v1';
export const priorities = ['High', 'Medium', 'Low'] as const;
export type Priority = (typeof priorities)[number];
export type Status = 'All' | 'Active' | 'Completed';
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
  status: Status;
  priority: Priority | 'All';
}

export interface LoadResult {
  tasks: Task[];
  blocked: boolean;
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return typeof task.id === 'string' && task.id.trim().length > 0
    && typeof task.title === 'string' && task.title.trim().length > 0
    && priorities.includes(task.priority as Priority)
    && typeof task.completed === 'boolean'
    && typeof task.createdAt === 'number' && Number.isFinite(task.createdAt)
    && task.createdAt >= 0 && task.createdAt <= 8.64e15;
}

export function loadTasks(): LoadResult {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return { tasks: [], blocked: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isTask)
      || new Set(parsed.map((task: Task) => task.id)).size !== parsed.length) {
      return { tasks: [], blocked: true };
    }
    return { tasks: parsed, blocked: false };
  } catch {
    return { tasks: [], blocked: true };
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function getStatistics(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  return { total, completed, pending: total - completed, percentage: total ? Math.round(completed / total * 100) : 0 };
}

export function getVisibleTasks(tasks: Task[], filters: Filters, sort: SortOrder): Task[] {
  const search = filters.search.toLocaleLowerCase();
  const ranks: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  return tasks.filter((task) => task.title.toLocaleLowerCase().includes(search)
    && (filters.status === 'All' || task.completed === (filters.status === 'Completed'))
    && (filters.priority === 'All' || task.priority === filters.priority))
    .sort((first, second) => {
      const priorityDifference = sort === 'priority' ? ranks[first.priority] - ranks[second.priority] : 0;
      const timeDifference = sort === 'oldest' ? first.createdAt - second.createdAt : second.createdAt - first.createdAt;
      return priorityDifference || timeDifference || (first.id < second.id ? -1 : first.id > second.id ? 1 : 0);
    });
}
