import { type RefObject } from 'react';
import type { Filters, Priority, SortOrder, StatusFilter, Task } from '../../types';
import { Icon } from '../common/Icon';
import { EmptyState } from './EmptyState';
import { TaskFilters } from './TaskFilters';
import { TaskItem } from './TaskItem';

interface Props {
  totalCount: number;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  titleRef: RefObject<HTMLInputElement | null>;
  hasFilters: boolean;
  onClearFilters: () => void;
  counts: Record<StatusFilter, number>;
  visibleTasks: Task[];
  tasksCount: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onSave: (id: string, title: string, priority: Priority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  deletedTask: Task | null;
  onUndoDelete: () => void;
  onClearCompleted: () => void;
  completedCount: number;
}

export default function TaskListPanel({
  totalCount, filters, onFiltersChange, sort, onSortChange, searchRef, titleRef,
  hasFilters, onClearFilters, counts, visibleTasks, tasksCount,
  editingId, onEdit, onSave, onToggle, onDelete, deletedTask, onUndoDelete,
  onClearCompleted, completedCount,
}: Props) {
  return (
    <section className="panel tasks-panel" aria-labelledby="tasks-heading">
      <div className="tasks-heading">
        <div className="section-heading">
          <span className="heading-icon"><Icon name="list" /></span>
          <h2 id="tasks-heading">Your tasks</h2>
          <span className="total-badge">{totalCount}</span>
        </div>
        {completedCount > 0 && (
          <button type="button" className="text-button" onClick={onClearCompleted}>
            Clear completed
          </button>
        )}
      </div>

      <TaskFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        sort={sort}
        onSortChange={onSortChange}
        searchRef={searchRef}
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        counts={counts}
        visibleCount={visibleTasks.length}
        tasksCount={tasksCount}
      />

      {visibleTasks.length ? (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              editing={editingId === task.id}
              onEdit={onEdit}
              onSave={onSave}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : (
        <EmptyState hasTasks={tasksCount > 0} onClearFilters={onClearFilters} titleRef={titleRef} />
      )}

      {deletedTask && (
        <div className="undo-bar">
          <span>Task deleted.</span>
          <button type="button" className="text-button" onClick={onUndoDelete}>
            <Icon name="undo" />Undo deletion
          </button>
        </div>
      )}
    </section>
  );
}
