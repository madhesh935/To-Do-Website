import { Icon } from '../common/Icon';
import { useTasks, useThemeContext } from '../../context';

export default function SiteFooter() {
  const { blocked, saveFailed } = useTasks();
  const { themeSaveFailed } = useThemeContext();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          <Icon name="lock" />
          <span>
            {blocked || saveFailed ? 'Current changes are not saved.' : 'Tasks are saved in this browser.'}
            <span className="footer-detail"> No account. No server. Local Storage only.</span>
          </span>
        </p>
        <p className="keyboard-legend">
          <Icon name="keyboard" />
          <span><kbd>/</kbd> search · <kbd>N</kbd> new task</span>
        </p>
        {themeSaveFailed && <p className="theme-warning">Theme preference could not be saved.</p>}
      </div>
    </footer>
  );
}
