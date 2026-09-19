import { type RefObject } from 'react';
import { STATUS_FILTERS } from '../../constants';
import type { Filters, PriorityFilter, SortOrder, StatusFilter } from '../../types';
import { Icon } from '../common/Icon';
import { PrioritySelect } from '../common/PrioritySelect';

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
              placeholder="Search tasks by title…"
              value={filters.search}
              onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
              autoComplete="off"
            />
          </div>
        </div>
        <PrioritySelect
          id="filter-priority"
          label="Filter by priority"
          value={filters.priority}
          onChange={(value) => onFiltersChange({ ...filters, priority: value as PriorityFilter })}
          allowAll
        />
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
        <div className="status-filters" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filters.status === status}
              onClick={() => onFiltersChange({ ...filters, status })}
            >
              {status}
              <span>{counts[status]}</span>
            </button>
          ))}
        </div>
        {hasFilters && (
          <button type="button" className="text-button clear-button" onClick={onClearFilters}>
            <Icon name="close" />Clear filters
          </button>
        )}
        <p className="results-count" role="status">Showing {visibleCount} of {tasksCount} tasks</p>
      </div>
    </div>
  );
}
