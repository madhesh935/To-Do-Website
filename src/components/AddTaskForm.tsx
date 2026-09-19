import { type FormEvent, type RefObject } from 'react';
import { Icon } from './Icon';
import { PrioritySelect } from './PrioritySelect';
import type { Priority } from '../utils/tasks';

interface Props {
  titleRef: RefObject<HTMLInputElement | null>;
  title: string;
  onTitleChange: (value: string) => void;
  titleError: boolean;
  priority: Priority;
  onPriorityChange: (value: Priority) => void;
  onSubmit: (event: FormEvent) => void;
}

export function AddTaskForm({ titleRef, title, onTitleChange, titleError, priority, onPriorityChange, onSubmit }: Props) {
  return <section className="panel add-panel" aria-labelledby="add-heading">
    <div className="section-heading"><span className="heading-icon"><Icon name="plus" /></span><h2 id="add-heading">What’s on your mind?</h2><span className="section-note">Turn an intention into a next step.</span></div>
    <form className="add-form" onSubmit={onSubmit} noValidate>
      <div className="field title-field"><label htmlFor="task-title">Task title</label><input ref={titleRef} id="task-title" placeholder="What do you need to do?" value={title} onChange={(event) => onTitleChange(event.target.value)} aria-invalid={titleError} aria-describedby={titleError ? 'title-error' : undefined} autoComplete="off" />{titleError && <p id="title-error" className="field-error" role="alert">Please enter a task title.</p>}</div>
      <PrioritySelect id="task-priority" label="Priority" value={priority} onChange={(value) => onPriorityChange(value as Priority)} />
      <button className="button primary add-button" type="submit"><Icon name="plus" />Add Task</button>
    </form>
  </section>;
}
