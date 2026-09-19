import { memo, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Priority, Task } from '../utils/tasks';
import { Icon } from './Icon';
import { PrioritySelect } from './PrioritySelect';

interface Props {
  task: Task;
  editing: boolean;
  onEdit: (id: string | null) => void;
  onSave: (id: string, title: string, priority: Priority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TaskEditor({ task, onCancel, onSave }: { task: Task; onCancel: () => void; onSave: Props['onSave'] }) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    onSave(task.id, title.trim(), priority);
  }

  return <form className="task-editor" onSubmit={submit} onKeyDown={(event) => {
    if (event.key === 'Escape') { event.preventDefault(); onCancel(); }
  }}>
    <div className="editor-heading"><Icon name="edit" /><span>Edit task</span><span className="editor-hint">A change of plans? No problem.</span></div>
    <div className="editor-fields">
      <div className="field">
        <label htmlFor={`edit-title-${task.id}`}>Task title</label>
        <input ref={inputRef} id={`edit-title-${task.id}`} value={title} onChange={(event) => { setTitle(event.target.value); setError(false); }} aria-invalid={error} aria-describedby={error ? `edit-error-${task.id}` : undefined} />
        {error && <p id={`edit-error-${task.id}`} className="field-error" role="alert">Please enter a task title.</p>}
      </div>
      <PrioritySelect id={`edit-priority-${task.id}`} label="Priority" value={priority} onChange={(value) => setPriority(value as Priority)} />
    </div>
    <div className="editor-actions"><button className="button primary" type="submit"><Icon name="check" />Save Changes</button><button className="button secondary" type="button" onClick={onCancel}>Cancel</button><span className="keyboard-hint">Esc to cancel</span></div>
  </form>;
}

export const TaskItem = memo(function TaskItem({ task, editing, onEdit, onSave, onToggle, onDelete }: Props) {
  const editRef = useRef<HTMLButtonElement>(null);

  function cancel() {
    onEdit(null);
    requestAnimationFrame(() => editRef.current?.focus());
  }

  return <li className={`task-item${task.completed ? ' is-completed' : ''}${editing ? ' is-editing' : ''}`} data-task-id={task.id}>
    {editing ? <TaskEditor task={task} onCancel={cancel} onSave={onSave} /> : <>
      <label className="task-check"><input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} aria-label={`Mark ${task.title} ${task.completed ? 'active' : 'completed'}`} /><span className="checkbox-visual"><Icon name="check" /></span></label>
      <div className="task-copy"><span className="task-title">{task.title}</span><span className="task-status"><span className="status-dot" />{task.completed ? 'Completed' : 'Active'}</span></div>
      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}><span />{task.priority}</span>
      <div className="task-actions"><button ref={editRef} type="button" className="icon-button" onClick={() => onEdit(task.id)} aria-label={`Edit ${task.title}`} title="Edit task"><Icon name="edit" /></button><button type="button" className="icon-button delete-button" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`} title="Delete task"><Icon name="trash" /></button></div>
    </>}
  </li>;
});
