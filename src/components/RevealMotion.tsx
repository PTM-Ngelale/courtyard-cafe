"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Toggles `is-visible` on `[data-reveal]` / `[data-reveal-stagger]` elements as
 * they enter the viewport. Runs in an effect (after hydration) so it can't
 * cause a hydration mismatch — the server HTML stays pristine and the class is
 * only added on the client.
 *
 * The hide-until-revealed CSS is gated on `reveal-ready`, which the inline
 * script in layout.tsx adds before first paint (and skips under reduced
 * motion). If it isn't there, this component does nothing and every section
 * is already in its final state.
 *
 * It lives in the root layout, which stays mounted across client-side
 * navigation, so it re-scans on every route change. Otherwise a page reached
 * by a <Link> (e.g. "Back to The Courtyard" after paying) keeps its sections
 * hidden until a full reload.
 */
export function RevealMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (!document.documentElement.classList.contains("reveal-ready")) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal-stagger]"),
    );

    const io = new IntersectionObserver(
      (entries) => {
        // Elements that arrive in the same frame (a row of menu groups or
        // drink cards) step in reading order instead of landing as one slab.
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return ra.top - rb.top || ra.left - rb.left;
          });

        arriving.forEach((el, i) => {
          if (i > 0) el.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
          el.classList.add("is-visible");
          io.unobserve(el);
        });
      },
      // threshold 0: trigger as soon as the top edge clears the bottom margin,
      // so tall elements never sit invisible while the reader scrolls past.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    // Anything already on screen (the hero) reveals right away; the rest waits
    // for the observer so it can't lag a frame behind the first paint.
    const vh = window.innerHeight;
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    }

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
