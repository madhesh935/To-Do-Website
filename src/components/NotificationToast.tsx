import { Icon } from './Icon';

interface Props {
  notification: { text: string; sequence: number; success: boolean };
}

export function NotificationToast({ notification }: Props) {
  return <div className={`notification${notification.text ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notification.text && <span key={notification.sequence}><Icon name={notification.success ? 'circle-check' : 'warning'} />{notification.text}</span>}</div>;
}
