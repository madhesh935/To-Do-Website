import { Icon } from '../common/Icon';
import type { TaskStatistics as Stats } from '../../types';

interface Props {
  statistics: Stats;
}

export function TaskStatistics({ statistics }: Props) {
  return (
    <aside className="stats-rail" aria-label="Task statistics">
      <article className="stat-card">
        <div className="stat-top">
          <span>Total Tasks</span>
          <span className="stat-icon violet"><Icon name="list" /></span>
        </div>
        <strong data-testid="total-count">{statistics.total}</strong>
        <span className="stat-caption">Everything on your list</span>
      </article>
      <article className="stat-card">
        <div className="stat-top">
          <span>Completed Tasks</span>
          <span className="stat-icon green"><Icon name="circle-check" /></span>
        </div>
        <strong data-testid="completed-count">{statistics.completed}</strong>
        <span className="stat-caption">Finished and filed away</span>
      </article>
      <article className="stat-card">
        <div className="stat-top">
          <span>Pending Tasks</span>
          <span className="stat-icon amber"><Icon name="clock" /></span>
        </div>
        <strong data-testid="pending-count">{statistics.pending}</strong>
        <span className="stat-caption">Still needing your focus</span>
      </article>
      <article className="stat-card progress-card">
        <div className="stat-top">
          <span>Completion</span>
          <span className="stat-icon violet"><Icon name="chart" /></span>
        </div>
        <strong>{statistics.percentage}<span className="percent-sign">%</span></strong>
        <progress aria-label="Task completion" max="100" value={statistics.percentage} />
        <span className="stat-caption">
          {statistics.total > 0 && statistics.percentage === 100
            ? 'All done for now.'
            : 'Updates as you complete tasks'}
        </span>
      </article>
    </aside>
  );
}
