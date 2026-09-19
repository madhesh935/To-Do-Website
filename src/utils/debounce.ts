/**
 * Returns a trailing debounce wrapper. Used for resize observers and similar
 * high-frequency events — search filtering stays synchronous so results update
 * on every keystroke.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): ((...args: Args) => void) & { cancel: () => void } {
  let timer = 0;
  const wrapped = ((...args: Args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  }) as ((...args: Args) => void) & { cancel: () => void };
  wrapped.cancel = () => window.clearTimeout(timer);
  return wrapped;
}
