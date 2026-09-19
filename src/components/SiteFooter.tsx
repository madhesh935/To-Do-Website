import { Icon } from './Icon';

interface Props {
  blocked: boolean;
  saveFailed: boolean;
  themeSaveFailed: boolean;
}

export function SiteFooter({ blocked, saveFailed, themeSaveFailed }: Props) {
  return <footer className="site-footer"><p><Icon name="lock" /><span>{blocked || saveFailed ? 'Your current changes are not saved.' : 'Tasks are saved in this browser.'}<span className="footer-detail"> Only on this website. No account, no cloud.</span></span></p><span className="footer-brand">A little focus goes a long way.</span>{themeSaveFailed && <p className="theme-warning">Theme preference could not be saved.</p>}</footer>;
}
