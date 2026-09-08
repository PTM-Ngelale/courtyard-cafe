"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { Button } from "./Button";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#menu", label: "Menu" },
  { href: "#drinks", label: "Drinks" },
  { href: "#gallery", label: "Gallery" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Collapse the mobile menu once the viewport grows past the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 641px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="site-header">
      <a className="site-header__brand" href="#top">
        <Logo alt="The Courtyard Cafe" sizes="38px" priority />
        <span className="site-header__wordmark">
          The Courtyard<span className="site-header__wordmark-suffix">&nbsp;Cafe</span>
        </span>
      </a>

      <button
        className="site-header__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="site-header__toggle-bar" aria-hidden="true" />
        <span className="site-header__toggle-bar" aria-hidden="true" />
      </button>

      <nav
        ref={navRef}
        id="site-nav"
        className={`site-header__nav${open ? " is-open" : ""}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        <Button href="#visit" variant="primary" className="site-header__cta">
          Visit us
        </Button>
      </nav>
    </header>
  );
}
