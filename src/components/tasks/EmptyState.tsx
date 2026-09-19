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
      <img
        className="empty-illustration"
        src="./empty.svg"
        srcSet="./empty.svg 1x, ./empty.svg 2x"
        sizes="64px"
        width="64"
        height="64"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <h3>{hasTasks ? 'No tasks match your search or filters.' : 'A fresh start. Add your first task.'}</h3>
      <p>
        {hasTasks
          ? 'Try a different search, or make a little more room.'
          : 'Enter a task title, choose High, Medium, or Low priority, then add the task.'}
      </p>
      {hasTasks ? (
        <button type="button" className="button secondary" onClick={onClearFilters}>
          Clear filters<Icon name="arrow" />
        </button>
      ) : (
        <button type="button" className="text-button" onClick={() => titleRef.current?.focus()}>
          Let’s make a start<Icon name="arrow" />
        </button>
      )}
    </div>
  );
}
