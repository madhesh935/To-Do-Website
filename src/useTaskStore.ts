import { useState } from 'react';
import { loadTasks, saveTasks, type Task } from './tasks';

export function useTaskStore() {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState(initial.tasks);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [saveFailed, setSaveFailed] = useState(false);

  function commit(next: Task[]) {
    setTasks(next);
    if (blocked) return false;
    const saved = saveTasks(next);
    setSaveFailed(!saved);
    return saved;
  }

  function retrySave() {
    const saved = saveTasks(tasks);
    setSaveFailed(!saved);
    if (saved) setBlocked(false);
    return saved;
  }

  return { tasks, blocked, saveFailed, commit, retrySave };
}
