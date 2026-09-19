import type { Task } from '../types';

export interface StoreState {
  tasks: Task[];
  blocked: boolean;
  saveFailed: boolean;
}

export type StoreAction =
  | { type: 'commit'; tasks: Task[]; saved: boolean }
  | { type: 'retry'; saved: boolean };

/** Pure reducer for task persistence state. */
export function taskReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'commit':
      return { ...state, tasks: action.tasks, saveFailed: !action.saved && !state.blocked };
    case 'retry':
      return { ...state, saveFailed: !action.saved, blocked: action.saved ? false : state.blocked };
    default:
      return state;
  }
}
