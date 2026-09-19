import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AddTaskForm } from './components/AddTaskForm';
import { Icon } from './components/Icon';
import { NotificationToast } from './components/NotificationToast';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { StorageWarning } from './components/StorageWarning';
import { TaskListPanel } from './components/TaskListPanel';
import { TaskStatistics } from './components/TaskStatistics';
import { useTaskStore } from './hooks/useTaskStore';
import { getStatistics, getVisibleTasks, THEME_KEY, type Filters, type Priority, type SortOrder, type Status, type Task } from './utils/tasks';

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

  const announce = useCallback((text: string, success = true) => {
    setNotification((current) => ({ text, sequence: current.sequence + 1, success }));
  }, []);

  const focusTask = useCallback((id?: string, checkbox = false) => {
    requestAnimationFrame(() => {
      const row = id ? document.querySelector(`[data-task-id="${CSS.escape(id)}"]`) : null;
      const control = row?.querySelector<HTMLElement>(checkbox ? 'input[type="checkbox"]' : 'button');
      (control ?? searchRef.current)?.focus();
    });
  }, []);

  const addTask = useCallback((event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) { setTitleError(true); titleRef.current?.focus(); return; }
    const task: Task = { id: crypto.randomUUID(), title: title.trim(), priority, completed: false, createdAt: Date.now() };
    const saved = commit([...tasks, task]);
    setTitle('');
    setTitleError(false);
    titleRef.current?.focus();
    announce(saved ? 'Task added.' : 'Task added for this session only. Changes could not be saved.', saved);
  }, [title, priority, tasks, commit, announce]);

  const toggleTask = useCallback((id: string) => {
    const task = tasks.find((item) => item.id === id)!;
    const saved = commit(tasks.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
    announce(saved ? (task.completed ? 'Task marked active.' : 'Task completed. Nicely done!') : 'Task updated for this session only. Changes could not be saved.', saved);
    if (filters.status !== 'All') {
      const index = visibleTasks.findIndex((item) => item.id === id);
      focusTask((visibleTasks[index + 1] ?? visibleTasks[index - 1])?.id, true);
    }
  }, [tasks, filters.status, visibleTasks, commit, announce, focusTask]);

  const saveEdit = useCallback((id: string, nextTitle: string, nextPriority: Priority) => {
    const saved = commit(tasks.map((task) => task.id === id ? { ...task, title: nextTitle, priority: nextPriority } : task));
    setEditingId(null);
    announce(saved ? 'Changes saved.' : 'Changes applied for this session only. Changes could not be saved.', saved);
    focusTask(id);
  }, [tasks, commit, announce, focusTask]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find((item) => item.id === id)!;
    const index = visibleTasks.findIndex((item) => item.id === id);
    const saved = commit(tasks.filter((item) => item.id !== id));
    setDeletedTask(task);
    if (editingId === id) setEditingId(null);
    announce(saved ? 'Task deleted.' : 'Task deleted for this session only. Changes could not be saved.', saved);
    focusTask((visibleTasks[index + 1] ?? visibleTasks[index - 1])?.id);
  }, [tasks, visibleTasks, editingId, commit, announce, focusTask]);

  const undoDelete = useCallback(() => {
    if (!deletedTask || tasks.some((task) => task.id === deletedTask.id)) return;
    const saved = commit([...tasks, deletedTask]);
    setDeletedTask(null);
    announce(saved ? 'Task restored.' : 'Task restored for this session only. Changes could not be saved.', saved);
    focusTask(deletedTask.id);
  }, [tasks, deletedTask, commit, announce, focusTask]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    searchRef.current?.focus();
  }, []);

  const changeTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); setThemeSaveFailed(false); }
    catch { setThemeSaveFailed(true); announce('Theme changed for this session. Your preference could not be saved.', false); }
  }, [theme, announce]);

  const recoverStorage = useCallback(() => {
    const saved = retrySave();
    if (saved) setConfirmRecovery(false);
    announce(saved ? 'Your tasks are now saved in this browser.' : 'Changes could not be saved. Your session tasks are still here.', saved);
    if (saved) titleRef.current?.focus();
  }, [retrySave, announce]);

  const counts: Record<Status, number> = { All: statistics.total, Active: statistics.pending, Completed: statistics.completed };

  return <>
    <a className="skip-link" href="#main">Skip to main content</a>
    <SiteHeader date={date} theme={theme} onToggleTheme={changeTheme} />

    <main id="main" className="page-shell" tabIndex={-1}>
      <section className="introduction" aria-labelledby="page-title"><div><p className="eyebrow">A LITTLE CLARITY FOR YOUR DAY</p><h1 id="page-title">Make room for what matters.</h1><p className="intro-subtitle">One task at a time.</p></div><span className="intro-note"><Icon name="spark" className="little-spark" /> Small steps. Real progress.</span></section>

      <TaskStatistics statistics={statistics} />

      <StorageWarning
        blocked={blocked}
        saveFailed={saveFailed}
        tasksCount={tasks.length}
        confirmRecovery={confirmRecovery}
        onRequestRecovery={() => setConfirmRecovery(true)}
        onCancelRecovery={() => setConfirmRecovery(false)}
        onRecoverStorage={recoverStorage}
      />

      <AddTaskForm
        titleRef={titleRef}
        title={title}
        onTitleChange={(value) => { setTitle(value); setTitleError(false); }}
        titleError={titleError}
        priority={priority}
        onPriorityChange={setPriority}
        onSubmit={addTask}
      />

      <TaskListPanel
        totalCount={statistics.total}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        searchRef={searchRef}
        titleRef={titleRef}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        counts={counts}
        visibleTasks={visibleTasks}
        tasksCount={tasks.length}
        editingId={editingId}
        onEdit={setEditingId}
        onSave={saveEdit}
        onToggle={toggleTask}
        onDelete={deleteTask}
        deletedTask={deletedTask}
        onUndoDelete={undoDelete}
      />

      <SiteFooter blocked={blocked} saveFailed={saveFailed} themeSaveFailed={themeSaveFailed} />
    </main>
    <NotificationToast notification={notification} />
  </>;
}
