import { useCallback, useMemo, useReducer } from 'react';
import { loadTasks, saveTasks } from '../services';
import type { Task } from '../types';
import { getStatistics } from '../utils';

interface StoreState {
  tasks: Task[];
  blocked: boolean;
  saveFailed: boolean;
}

type StoreAction =
  | { type: 'commit'; tasks: Task[]; saved: boolean }
  | { type: 'retry'; saved: boolean };

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'commit':
      return { ...state, tasks: action.tasks, saveFailed: !action.saved && !state.blocked };
    case 'retry':
      return { ...state, saveFailed: !action.saved, blocked: action.saved ? false : state.blocked };
    default:
      return state;
  }
}

function persist(tasks: Task[], blocked: boolean): boolean {
  if (blocked) return false;
  return saveTasks(tasks);
}

/** Owns the task collection and guarded Local Storage writes. */
export function useTaskStore() {
  const initial = useMemo(() => loadTasks(), []);
  const [state, dispatch] = useReducer(reducer, {
    tasks: initial.tasks,
    blocked: initial.blocked,
    saveFailed: false,
  });

  const commit = useCallback((next: Task[]) => {
    const saved = persist(next, state.blocked);
    dispatch({ type: 'commit', tasks: next, saved });
    return saved;
  }, [state.blocked]);

  const retrySave = useCallback(() => {
    const saved = saveTasks(state.tasks);
    dispatch({ type: 'retry', saved });
    return saved;
  }, [state.tasks]);

  const statistics = useMemo(() => getStatistics(state.tasks), [state.tasks]);

  return {
    tasks: state.tasks,
    blocked: state.blocked,
    saveFailed: state.saveFailed,
    statistics,
    commit,
    retrySave,
  };
}
