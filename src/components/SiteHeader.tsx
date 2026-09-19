import { Icon } from './Icon';

interface Props {
  date: Date;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function SiteHeader({ date, theme, onToggleTheme }: Props) {
  return <header className="site-header">
    <div className="header-inner">
      <div className="brand"><span className="brand-mark"><Icon name="check" /></span><div><span className="brand-name">FocusList<span className="brand-dot">.</span></span><p>Plan your day. Prioritize what matters.</p></div></div>
      <div className="header-tools"><time dateTime={date.toLocaleDateString('en-CA')}><Icon name="calendar" />{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</time><span className="header-divider" /><button className="icon-button theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button></div>
    </div>
  </header>;
}
