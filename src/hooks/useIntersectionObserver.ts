import { useEffect, useState, type RefObject } from 'react';

/** Observes when an element enters the viewport for deferred visual work. */
export function useIntersectionObserver(ref: RefObject<Element | null>) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting || entry.intersectionRatio > 0);
    }, { threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}
