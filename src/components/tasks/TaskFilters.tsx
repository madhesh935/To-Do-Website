import { type RefObject, startTransition } from 'react';
import { STATUS_FILTERS } from '../../constants';
import { PRIORITIES, type Filters, type PriorityFilter, type SortOrder, type StatusFilter } from '../../types';
import { Icon } from '../common/Icon';

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  hasFilters: boolean;
  onClearFilters: () => void;
  counts: Record<StatusFilter, number>;
  visibleCount: number;
  tasksCount: number;
}

export function TaskFilters({
  filters, onFiltersChange, sort, onSortChange, searchRef,
  hasFilters, onClearFilters, counts, visibleCount, tasksCount,
}: Props) {
  return (
    <div className="task-controls">
      <div className="toolbar">
        <div className="field search-field">
          <label htmlFor="task-search">Search tasks</label>
          <div className="search-input">
            <Icon name="search" />
            <input
              ref={searchRef}
              id="task-search"
              type="search"
              placeholder="Search tasks by title"
              value={filters.search}
              onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="field sort-field">
          <label htmlFor="task-sort">Sort by</label>
          <select id="task-sort" value={sort} onChange={(event) => onSortChange(event.target.value as SortOrder)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Highest priority</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <nav className="status-filters" aria-label="Filter by status">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filters.status === status}
              onClick={() => startTransition(() => onFiltersChange({ ...filters, status }))}
            >
              {status}
              <span>{counts[status]}</span>
            </button>
          ))}
        </nav>
        {hasFilters && (
          <button type="button" className="text-button clear-button" onClick={onClearFilters}>
            <Icon name="close" />Clear filters
          </button>
        )}
        <p className="results-count" role="status">Showing {visibleCount} of {tasksCount} tasks</p>
      </div>

      <fieldset className="priority-filters">
        <legend>Filter by priority</legend>
        {(['All', ...PRIORITIES] as const).map((priority) => (
          <button
            key={priority}
            type="button"
            className={`chip chip-${priority.toLowerCase()}`}
            aria-pressed={filters.priority === priority}
            onClick={() => startTransition(() => onFiltersChange({ ...filters, priority: priority as PriorityFilter }))}
          >
            {priority === 'All' ? 'All priorities' : priority}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
