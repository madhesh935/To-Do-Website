import { PRIORITY_RANK } from '../constants';
import type { Filters, SortOrder, Task } from '../types';

/**
 * Returns a new array of tasks that match search, status, and priority filters,
 * sorted without mutating the source collection.
 */
export function getVisibleTasks(tasks: Task[], filters: Filters, sort: SortOrder): Task[] {
  const search = filters.search.toLocaleLowerCase();
  return tasks
    .filter((task) => task.title.toLocaleLowerCase().includes(search)
      && (filters.status === 'All' || task.completed === (filters.status === 'Completed'))
      && (filters.priority === 'All' || task.priority === filters.priority))
    .sort((first, second) => {
      const priorityDifference = sort === 'priority'
        ? PRIORITY_RANK[first.priority] - PRIORITY_RANK[second.priority]
        : 0;
      const timeDifference = sort === 'oldest'
        ? first.createdAt - second.createdAt
        : second.createdAt - first.createdAt;
      return priorityDifference || timeDifference || (first.id < second.id ? -1 : first.id > second.id ? 1 : 0);
    });
}
