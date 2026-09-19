import { lazy, Suspense, type ReactNode } from 'react';
import { useViewportHeight } from '../../hooks';
import { SkipLink } from '../common/SkipLink';
import SiteFooter from './SiteFooter';
import { SiteHeader } from './SiteHeader';

const PerformanceProbe = lazy(() => import('../common/PerformanceProbe'));

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  useViewportHeight();
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="page-shell" tabIndex={-1}>{children}</main>
      <SiteFooter />
      <Suspense fallback={null}>
        <PerformanceProbe />
      </Suspense>
    </>
  );
}
