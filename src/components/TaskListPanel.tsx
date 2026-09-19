import { type RefObject } from 'react';
import { Icon } from './Icon';
import { PrioritySelect } from './PrioritySelect';
import { TaskItem } from './TaskItem';
import type { Filters, Priority, SortOrder, Status, Task } from '../utils/tasks';

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
  counts: Record<Status, number>;
  visibleTasks: Task[];
  tasksCount: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onSave: (id: string, title: string, priority: Priority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  deletedTask: Task | null;
  onUndoDelete: () => void;
}

export function TaskListPanel({
  totalCount, filters, onFiltersChange, sort, onSortChange, searchRef, titleRef,
  hasFilters, onClearFilters, counts, visibleTasks, tasksCount,
  editingId, onEdit, onSave, onToggle, onDelete, deletedTask, onUndoDelete,
}: Props) {
  return <section className="panel tasks-panel" aria-labelledby="tasks-heading">
    <div className="tasks-heading"><div className="section-heading"><span className="heading-icon"><Icon name="list" /></span><h2 id="tasks-heading">Your tasks</h2><span className="total-badge">{totalCount}</span></div><span className="section-note">A clear list. A clearer mind.</span></div>
    <div className="toolbar">
      <div className="field search-field"><label htmlFor="task-search">Search tasks</label><div className="search-input"><Icon name="search" /><input ref={searchRef} id="task-search" type="search" placeholder="Search tasks by title…" value={filters.search} onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })} autoComplete="off" /></div></div>
      <PrioritySelect id="filter-priority" label="Filter by priority" value={filters.priority} onChange={(value) => onFiltersChange({ ...filters, priority: value })} allowAll />
      <div className="field sort-field"><label htmlFor="task-sort">Sort by</label><select id="task-sort" value={sort} onChange={(event) => onSortChange(event.target.value as SortOrder)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Highest priority</option></select></div>
    </div>
    <div className="filter-row"><div className="status-filters" role="group" aria-label="Filter by status">{(['All', 'Active', 'Completed'] as const).map((status) => <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => onFiltersChange({ ...filters, status })}>{status}<span>{counts[status]}</span></button>)}</div>{hasFilters && <button type="button" className="text-button clear-button" onClick={onClearFilters}><Icon name="close" />Clear filters</button>}<p className="results-count" role="status">Showing {visibleTasks.length} of {tasksCount} tasks</p></div>

    {visibleTasks.length ? <ul className="task-list">{visibleTasks.map((task) => <TaskItem key={task.id} task={task} editing={editingId === task.id} onEdit={onEdit} onSave={onSave} onToggle={onToggle} onDelete={onDelete} />)}</ul> : <div className="empty-state"><span className="empty-icon"><Icon name={tasksCount ? 'search' : 'list'} /><span className="empty-mini"><Icon name={tasksCount ? 'search' : 'check'} /></span></span><h3>{tasksCount ? 'No tasks match your search or filters.' : 'A fresh start. Add your first task.'}</h3><p>{tasksCount ? 'Try a different search, or make a little more room.' : 'Big things start with one small step. What’s yours?'}</p>{tasksCount ? <button type="button" className="button secondary" onClick={onClearFilters}>Clear filters<Icon name="arrow" /></button> : <button type="button" className="text-button" onClick={() => titleRef.current?.focus()}>Let’s make a start<Icon name="arrow" /></button>}</div>}
    {deletedTask && <div className="undo-bar"><span>Task deleted.</span><button type="button" className="text-button" onClick={onUndoDelete}><Icon name="undo" />Undo deletion</button></div>}
    <div className="list-bottom"><Icon name="check" /><span>Less overwhelm. More getting things done.</span></div>
  </section>;
}
