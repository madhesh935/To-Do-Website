import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Icon } from './components/Icon';
import { PrioritySelect } from './components/PrioritySelect';
import { TaskItem } from './components/TaskItem';
import { getStatistics, getVisibleTasks, THEME_KEY, type Filters, type Priority, type SortOrder, type Status, type Task } from './tasks';
import { useTaskStore } from './useTaskStore';

const defaultFilters: Filters = { search: '', status: 'All', priority: 'All' };

function readTheme(): 'light' | 'dark' {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export default function App() {
  const { tasks, blocked, saveFailed, commit, retrySave } = useTaskStore();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [titleError, setTitleError] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortOrder>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState({ text: '', sequence: 0, success: true });
  const [confirmRecovery, setConfirmRecovery] = useState(false);
  const [theme, setTheme] = useState(readTheme);
  const [themeSaveFailed, setThemeSaveFailed] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const statistics = useMemo(() => getStatistics(tasks), [tasks]);
  const visibleTasks = useMemo(() => getVisibleTasks(tasks, filters, sort), [tasks, filters, sort]);
  const hasFilters = Boolean(filters.search || filters.status !== 'All' || filters.priority !== 'All');
  const date = new Date();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151420' : '#f7f6fc');
  }, [theme]);

  useEffect(() => {
    if (!notification.text) return;
    const timeout = setTimeout(() => setNotification((current) => ({ ...current, text: '' })), 5000);
    return () => clearTimeout(timeout);
  }, [notification]);

  function announce(text: string, success = true) {
    setNotification((current) => ({ text, sequence: current.sequence + 1, success }));
  }

  function focusTask(id?: string, checkbox = false) {
    requestAnimationFrame(() => {
      const row = id ? document.querySelector(`[data-task-id="${CSS.escape(id)}"]`) : null;
      const control = row?.querySelector<HTMLElement>(checkbox ? 'input[type="checkbox"]' : 'button');
      (control ?? searchRef.current)?.focus();
    });
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) { setTitleError(true); titleRef.current?.focus(); return; }
    const task: Task = { id: crypto.randomUUID(), title: title.trim(), priority, completed: false, createdAt: Date.now() };
    const saved = commit([...tasks, task]);
    setTitle('');
    setTitleError(false);
    titleRef.current?.focus();
    announce(saved ? 'Task added.' : 'Task added for this session only. Changes could not be saved.', saved);
  }

  function toggleTask(id: string) {
    const task = tasks.find((item) => item.id === id)!;
    const saved = commit(tasks.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
    announce(saved ? (task.completed ? 'Task marked active.' : 'Task completed. Nicely done!') : 'Task updated for this session only. Changes could not be saved.', saved);
    if (filters.status !== 'All') {
      const index = visibleTasks.findIndex((item) => item.id === id);
      focusTask((visibleTasks[index + 1] ?? visibleTasks[index - 1])?.id, true);
    }
  }

  function saveEdit(id: string, nextTitle: string, nextPriority: Priority) {
    const saved = commit(tasks.map((task) => task.id === id ? { ...task, title: nextTitle, priority: nextPriority } : task));
    setEditingId(null);
    announce(saved ? 'Changes saved.' : 'Changes applied for this session only. Changes could not be saved.', saved);
    focusTask(id);
  }

  function deleteTask(id: string) {
    const task = tasks.find((item) => item.id === id)!;
    const index = visibleTasks.findIndex((item) => item.id === id);
    const saved = commit(tasks.filter((item) => item.id !== id));
    setDeletedTask(task);
    if (editingId === id) setEditingId(null);
    announce(saved ? 'Task deleted.' : 'Task deleted for this session only. Changes could not be saved.', saved);
    focusTask((visibleTasks[index + 1] ?? visibleTasks[index - 1])?.id);
  }

  function undoDelete() {
    if (!deletedTask || tasks.some((task) => task.id === deletedTask.id)) return;
    const saved = commit([...tasks, deletedTask]);
    setDeletedTask(null);
    announce(saved ? 'Task restored.' : 'Task restored for this session only. Changes could not be saved.', saved);
    focusTask(deletedTask.id);
  }

  function clearFilters() {
    setFilters(defaultFilters);
    searchRef.current?.focus();
  }

  function changeTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); setThemeSaveFailed(false); }
    catch { setThemeSaveFailed(true); announce('Theme changed for this session. Your preference could not be saved.', false); }
  }

  function recoverStorage() {
    const saved = retrySave();
    if (saved) setConfirmRecovery(false);
    announce(saved ? 'Your tasks are now saved in this browser.' : 'Changes could not be saved. Your session tasks are still here.', saved);
    if (saved) titleRef.current?.focus();
  }

  const counts: Record<Status, number> = { All: statistics.total, Active: statistics.pending, Completed: statistics.completed };

  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <header className="site-header">
      <div className="header-inner">
        <div className="brand"><span className="brand-mark"><Icon name="check" /></span><div><span className="brand-name">FocusList<span className="brand-dot">.</span></span><p>Plan your day. Prioritize what matters.</p></div></div>
        <div className="header-tools"><time dateTime={date.toLocaleDateString('en-CA')}><Icon name="calendar" />{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</time><span className="header-divider" /><button className="icon-button theme-toggle" type="button" onClick={changeTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button></div>
      </div>
    </header>

    <main id="main" className="page-shell" tabIndex={-1}>
      <section className="introduction" aria-labelledby="page-title"><div><p className="eyebrow">A LITTLE CLARITY FOR YOUR DAY</p><h1 id="page-title">Make room for what matters.</h1><p className="intro-subtitle">One task at a time.</p></div><span className="intro-note"><Icon name="spark" className="little-spark" /> Small steps. Real progress.</span></section>

      <section className="statistics" aria-label="Task statistics">
        <div className="stat-card"><div className="stat-top"><span>Total Tasks</span><span className="stat-icon violet"><Icon name="list" /></span></div><strong data-testid="total-count">{statistics.total}</strong><span className="stat-caption">Everything on your list</span></div>
        <div className="stat-card"><div className="stat-top"><span>Completed Tasks</span><span className="stat-icon green"><Icon name="circle-check" /></span></div><strong data-testid="completed-count">{statistics.completed}</strong><span className="stat-caption">Little wins, adding up</span></div>
        <div className="stat-card"><div className="stat-top"><span>Pending Tasks</span><span className="stat-icon amber"><Icon name="clock" /></span></div><strong data-testid="pending-count">{statistics.pending}</strong><span className="stat-caption">Ready when you are</span></div>
        <div className="stat-card progress-card"><div className="stat-top"><span>Completion</span><span className="stat-icon violet"><Icon name="chart" /></span></div><strong>{statistics.percentage}<span className="percent-sign">%</span></strong><progress aria-label="Task completion" max="100" value={statistics.percentage} /><span className="stat-caption">{statistics.total > 0 && statistics.percentage === 100 ? 'All done. Take a well-earned break.' : 'Every checkmark counts'}</span></div>
      </section>

      {(blocked || saveFailed) && <section className="storage-warning" aria-label="Storage warning">
        <div><strong>{blocked ? 'Your saved data needs attention.' : 'Changes could not be saved.'}</strong><p>{blocked ? 'Saved tasks could not be read. The original data has not been overwritten. You can keep working in this session, or replace it with your current tasks.' : 'Your tasks are safe in this session, but may be lost on refresh. Storage may be full or unavailable. Free some space or allow browser storage, then try again.'}</p></div>
        {blocked ? (confirmRecovery ? <div className="recovery-confirm"><p>Replace the original saved data with these {tasks.length} tasks? This cannot be undone.</p><div className="recovery-actions"><button className="button primary" onClick={recoverStorage}>Replace and save current tasks</button><button className="button secondary" onClick={() => setConfirmRecovery(false)}>Keep original</button></div></div> : <button className="button secondary" onClick={() => setConfirmRecovery(true)}>Replace saved data</button>) : <button className="button secondary" onClick={recoverStorage}>Retry saving</button>}
      </section>}

      <section className="panel add-panel" aria-labelledby="add-heading">
        <div className="section-heading"><span className="heading-icon"><Icon name="plus" /></span><h2 id="add-heading">What’s on your mind?</h2><span className="section-note">Turn an intention into a next step.</span></div>
        <form className="add-form" onSubmit={addTask} noValidate>
          <div className="field title-field"><label htmlFor="task-title">Task title</label><input ref={titleRef} id="task-title" placeholder="What do you need to do?" value={title} onChange={(event) => { setTitle(event.target.value); setTitleError(false); }} aria-invalid={titleError} aria-describedby={titleError ? 'title-error' : undefined} autoComplete="off" />{titleError && <p id="title-error" className="field-error" role="alert">Please enter a task title.</p>}</div>
          <PrioritySelect id="task-priority" label="Priority" value={priority} onChange={(value) => setPriority(value as Priority)} />
          <button className="button primary add-button" type="submit"><Icon name="plus" />Add Task</button>
        </form>
      </section>

      <section className="panel tasks-panel" aria-labelledby="tasks-heading">
        <div className="tasks-heading"><div className="section-heading"><span className="heading-icon"><Icon name="list" /></span><h2 id="tasks-heading">Your tasks</h2><span className="total-badge">{statistics.total}</span></div><span className="section-note">A clear list. A clearer mind.</span></div>
        <div className="toolbar">
          <div className="field search-field"><label htmlFor="task-search">Search tasks</label><div className="search-input"><Icon name="search" /><input ref={searchRef} id="task-search" type="search" placeholder="Search tasks by title…" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} autoComplete="off" /></div></div>
          <PrioritySelect id="filter-priority" label="Filter by priority" value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value })} allowAll />
          <div className="field sort-field"><label htmlFor="task-sort">Sort by</label><select id="task-sort" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Highest priority</option></select></div>
        </div>
        <div className="filter-row"><div className="status-filters" role="group" aria-label="Filter by status">{(['All', 'Active', 'Completed'] as const).map((status) => <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => setFilters({ ...filters, status })}>{status}<span>{counts[status]}</span></button>)}</div>{hasFilters && <button type="button" className="text-button clear-button" onClick={clearFilters}><Icon name="close" />Clear filters</button>}<p className="results-count" role="status">Showing {visibleTasks.length} of {tasks.length} tasks</p></div>

        {visibleTasks.length ? <ul className="task-list">{visibleTasks.map((task) => <TaskItem key={task.id} task={task} editing={editingId === task.id} onEdit={setEditingId} onSave={saveEdit} onToggle={toggleTask} onDelete={deleteTask} />)}</ul> : <div className="empty-state"><span className="empty-icon"><Icon name={tasks.length ? 'search' : 'list'} /><span className="empty-mini"><Icon name={tasks.length ? 'search' : 'check'} /></span></span><h3>{tasks.length ? 'No tasks match your search or filters.' : 'A fresh start. Add your first task.'}</h3><p>{tasks.length ? 'Try a different search, or make a little more room.' : 'Big things start with one small step. What’s yours?'}</p>{tasks.length ? <button type="button" className="button secondary" onClick={clearFilters}>Clear filters<Icon name="arrow" /></button> : <button type="button" className="text-button" onClick={() => titleRef.current?.focus()}>Let’s make a start<Icon name="arrow" /></button>}</div>}
        {deletedTask && <div className="undo-bar"><span>Task deleted.</span><button type="button" className="text-button" onClick={undoDelete}><Icon name="undo" />Undo deletion</button></div>}
        <div className="list-bottom"><Icon name="check" /><span>Less overwhelm. More getting things done.</span></div>
      </section>

      <footer className="site-footer"><p><Icon name="lock" /><span>{blocked || saveFailed ? 'Your current changes are not saved.' : 'Tasks are saved in this browser.'}<span className="footer-detail"> Only on this website. No account, no cloud.</span></span></p><span className="footer-brand">A little focus goes a long way.</span>{themeSaveFailed && <p className="theme-warning">Theme preference could not be saved.</p>}</footer>
    </main>
    <div className={`notification${notification.text ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notification.text && <span key={notification.sequence}><Icon name={notification.success ? 'circle-check' : 'warning'} />{notification.text}</span>}</div>
  </>;
}
