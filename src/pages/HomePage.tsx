import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AddTaskForm } from '../components/composer/AddTaskForm';
import { NotificationToast } from '../components/common/NotificationToast';
import { AppLayout } from '../components/layout/AppLayout';
import { StorageWarning } from '../components/storage/StorageWarning';
import { TaskStatistics } from '../components/stats/TaskStatistics';
import TaskListPanel from '../components/tasks/TaskListPanel';
import { useTasks } from '../context';
import { DEFAULT_FILTERS, DEFAULT_SORT, TOAST_DURATION_MS } from '../constants';
import type { Filters, Priority, SortOrder, StatusFilter, Task } from '../types';
import { createTaskId, getVisibleTasks } from '../utils';

export default function HomePage() {
  const { tasks, blocked, saveFailed, statistics, commit, retrySave } = useTasks();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [titleError, setTitleError] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOrder>(DEFAULT_SORT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState({ text: '', sequence: 0, success: true });
  const [confirmRecovery, setConfirmRecovery] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const visibleTasks = useMemo(() => getVisibleTasks(tasks, filters, sort), [tasks, filters, sort]);
  const hasFilters = Boolean(filters.search || filters.status !== 'All' || filters.priority !== 'All');

  useEffect(() => {
    if (!notification.text) return;
    const timeout = window.setTimeout(() => setNotification((current) => ({ ...current, text: '' })), TOAST_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if ((event.key === 'n' || event.key === 'N') && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        titleRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    const task: Task = { id: createTaskId(), title: title.trim(), priority, completed: false, createdAt: Date.now() };
    const saved = commit([...tasks, task]);
    setTitle('');
    setTitleError(false);
    titleRef.current?.focus();
    announce(saved ? 'Task added.' : 'Task added for this session only. Changes could not be saved.', saved);
  }, [title, priority, tasks, commit, announce]);

  const toggleTask = useCallback((id: string) => {
    const task = tasks.find((item) => item.id === id)!;
    const saved = commit(tasks.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
    announce(saved ? (task.completed ? 'Task marked active.' : 'Task completed.') : 'Task updated for this session only. Changes could not be saved.', saved);
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
    startTransition(() => setFilters(DEFAULT_FILTERS));
    searchRef.current?.focus();
  }, []);

  const clearCompleted = useCallback(() => {
    const remaining = tasks.filter((task) => !task.completed);
    if (remaining.length === tasks.length) return;
    const saved = commit(remaining);
    announce(saved ? 'Completed tasks cleared.' : 'Completed tasks cleared for this session only.', saved);
  }, [tasks, commit, announce]);

  const recoverStorage = useCallback(() => {
    const saved = retrySave();
    if (saved) setConfirmRecovery(false);
    announce(saved ? 'Your tasks are now saved in this browser.' : 'Changes could not be saved. Your session tasks are still here.', saved);
    if (saved) titleRef.current?.focus();
  }, [retrySave, announce]);

  const counts: Record<StatusFilter, number> = {
    All: statistics.total,
    Active: statistics.pending,
    Completed: statistics.completed,
  };

  return (
    <AppLayout>
      <section className="introduction" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Today’s list</p>
          <h1 id="page-title">What needs your focus today?</h1>
          <p className="intro-subtitle">Add a title, set a priority, and keep work on one list.</p>
        </div>
      </section>

      <div className="workspace">
        <TaskStatistics statistics={statistics} />
        <div className="workspace-main">
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
            onClearCompleted={clearCompleted}
            completedCount={statistics.completed}
          />
        </div>
      </div>
      <NotificationToast notification={notification} />
    </AppLayout>
  );
}
