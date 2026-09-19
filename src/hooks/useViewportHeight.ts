import { useEffect } from 'react';
import { debounce } from '../utils';

/** Keeps a --vh token in sync with the visual viewport using a debounced resize listener. */
export function useViewportHeight() {
  useEffect(() => {
    const setHeight = debounce(() => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }, 100);
    setHeight();
    window.addEventListener('resize', setHeight, { passive: true });
    return () => {
      setHeight.cancel();
      window.removeEventListener('resize', setHeight);
    };
  }, []);
}
