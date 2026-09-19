import { priorities, type Priority } from '../utils/tasks';

interface Props {
  id: string;
  label: string;
  value: Priority | 'All';
  onChange: (priority: Priority | 'All') => void;
  allowAll?: boolean;
}

export function PrioritySelect({ id, label, value, onChange, allowAll = false }: Props) {
  return <div className="field priority-field">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value as Priority | 'All')}>
      {allowAll && <option value="All">All Priorities</option>}
      {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
    </select>
  </div>;
}
