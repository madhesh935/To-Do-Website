import type { RefObject } from 'react';
import { Icon } from '../common/Icon';

interface Props {
  hasTasks: boolean;
  onClearFilters: () => void;
  titleRef: RefObject<HTMLInputElement | null>;
}

export function EmptyState({ hasTasks, onClearFilters, titleRef }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={hasTasks ? 'search' : 'list'} />
      </span>
      <h3>{hasTasks ? 'No tasks match your search or filters.' : 'No tasks yet. Add your first task.'}</h3>
      <p>
        {hasTasks
          ? 'Try a different title, status, or priority.'
          : 'Enter a task title above, choose a priority, and press Add Task.'}
      </p>
      {hasTasks ? (
        <button type="button" className="button secondary" onClick={onClearFilters}>
          Clear filters<Icon name="arrow" />
        </button>
      ) : (
        <button type="button" className="text-button" onClick={() => titleRef.current?.focus()}>
          Focus the task title field<Icon name="arrow" />
        </button>
      )}
    </div>
  );
}
