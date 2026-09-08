import { Logo } from './Logo';
import { contact, site } from '@/data/site';

export function Footer() {
  return (
    <footer className="site-footer">
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
    </footer>
  );
}
