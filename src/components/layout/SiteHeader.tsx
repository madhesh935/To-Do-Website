import { Icon } from '../common/Icon';
import { useThemeContext } from '../../context';
import { useMediaQuery } from '../../hooks';

export function SiteHeader() {
  const { theme, toggleTheme } = useThemeContext();
  const compactDate = useMediaQuery('(max-width: 479px)');
  const date = new Date();

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><Icon name="check" /></span>
          <div>
            <span className="brand-name">FocusList</span>
            <p>Daily tasks, kept in this browser.</p>
          </div>
        </div>
        <div className="header-tools">
          <time dateTime={date.toLocaleDateString('en-CA')}>
            <Icon name="calendar" />
            {date.toLocaleDateString(undefined, compactDate
              ? { month: 'short', day: 'numeric' }
              : { weekday: 'long', month: 'short', day: 'numeric' })}
          </time>
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} />
          </button>
        </div>
      </div>
    </header>
  );
}
