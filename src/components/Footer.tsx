/* eslint-disable @next/next/no-img-element -- static export serves the pre-optimised WebP wordmark directly */
import { Logo } from "./Logo";
import { contact, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo alt="" sizes="34px" />
          <span>{site.tagline}</span>
        </div>
        <div className="site-footer__links">
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer me"
          >
            Instagram
          </a>
          <a href="#menu">Menu</a>
          <a href="#visit">Contact</a>
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
        </div>
      </div>

      <a
        className="site-footer__credit"
        href="https://nanotekai.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Powered by</span>
        <img
          src="/img/nanotek-logo-360.webp"
          srcSet="/img/nanotek-logo-180.webp 180w, /img/nanotek-logo-360.webp 360w"
          sizes="76px"
          width={360}
          height={76}
          alt="Nanotek"
          loading="lazy"
          decoding="async"
        />
      </a>
    </footer>
  );
}
