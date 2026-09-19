import { createContext, useContext, type ReactNode } from 'react';
import { useTaskStore } from '../hooks';
import type { Task, TaskStatistics } from '../types';

interface TaskContextValue {
  tasks: Task[];
  blocked: boolean;
  saveFailed: boolean;
  statistics: TaskStatistics;
  commit: (next: Task[]) => boolean;
  retrySave: () => boolean;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const store = useTaskStore();
  return <TaskContext.Provider value={store}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const value = useContext(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider');
  return value;
}
