import { useCallback, useState } from 'react';
import { loadTasks, saveTasks, type Task } from '../utils/tasks';

export function useTaskStore() {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState(initial.tasks);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [saveFailed, setSaveFailed] = useState(false);

  const commit = useCallback((next: Task[]) => {
    setTasks(next);
    if (blocked) return false;
    const saved = saveTasks(next);
    setSaveFailed(!saved);
    return saved;
  }, [blocked]);

  const retrySave = useCallback(() => {
    const saved = saveTasks(tasks);
    setSaveFailed(!saved);
    if (saved) setBlocked(false);
    return saved;
  }, [tasks]);

  return { tasks, blocked, saveFailed, commit, retrySave };
}
