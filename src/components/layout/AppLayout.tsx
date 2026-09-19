import { lazy, Suspense, type ReactNode } from 'react';
import { SkipLink } from '../common/SkipLink';
import { SiteHeader } from './SiteHeader';

const SiteFooter = lazy(() => import('./SiteFooter'));

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="page-shell" tabIndex={-1}>{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
