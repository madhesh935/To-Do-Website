import { PRIORITIES, type Priority, type PriorityFilter } from '../../types';

interface Props {
  id: string;
  label: string;
  value: PriorityFilter;
  onChange: (priority: PriorityFilter) => void;
  allowAll?: boolean;
}

export function PrioritySelect({ id, label, value, onChange, allowAll = false }: Props) {
  return (
    <div className="field priority-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as PriorityFilter)}>
        {allowAll && <option value="All">All Priorities</option>}
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>{priority}</option>
        ))}
      </select>
    </div>
  );
}

export type { Priority };
