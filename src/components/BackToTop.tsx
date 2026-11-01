'use client';

import { useEffect, useState } from 'react';

/**
 * Round "back to top" button, bottom-right. Shows once the visitor has
 * scrolled about a screen and a half down. Scrolls smoothly (instantly under
 * reduced motion) and moves keyboard focus to the header so tabbing carries
 * on from the top. Rendered by the Footer, so it's on home, menu and gallery.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setShow(window.scrollY > window.innerHeight * 1.5));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('.site-header__brand')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className={`back-to-top${show ? ' is-shown' : ''}`}
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
