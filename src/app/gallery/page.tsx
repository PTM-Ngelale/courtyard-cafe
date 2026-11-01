import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Photo } from '@/components/Photo';
import { GALLERY } from '@/data/gallery';
import { contact } from '@/data/site';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Food, drinks and the courtyard itself at The Courtyard Cafe, Port Harcourt.',
  alternates: { canonical: '/gallery/' },
};

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="section menu-intro" data-reveal>
          <p className="kicker">On the pass</p>
          <h1>Gallery</h1>
          <p className="menu-intro__lede">
            Some of what comes out of our kitchen. We post more on Instagram.
          </p>
          <nav className="menu-intro__jump" aria-label="More">
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer me">
              {contact.instagramHandle}
            </a>
            <Button href="/menu/" variant="ghost">
              See the menu
            </Button>
          </nav>
        </section>

        <section className="section section--bordered">
          <ul className="gallery-page" data-reveal-stagger>
            {GALLERY.map((photo, i) => (
              <li key={photo.name} className={i === 0 ? 'gallery-page__item is-wide' : 'gallery-page__item'}>
                <figure>
                  <Photo
                    name={photo.name}
                    alt={photo.alt}
                    sizes={
                      i === 0
                        ? '(max-width: 700px) 92vw, 64vw'
                        : '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw'
                    }
                    priority={i < 2}
                  />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <div className="menu-order" data-reveal>
            <p>Hungry now? Reef Court Estate residents can order to their door.</p>
            <Button href="/book/" variant="primary">
              Order now
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
