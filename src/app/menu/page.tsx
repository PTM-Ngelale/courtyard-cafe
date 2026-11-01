import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { MenuMark, MARK_LABELS } from '@/components/MenuGroup';
import { DrinkCard } from '@/components/DrinkCard';
import { MenuTabs } from '@/components/MenuTabs';
import type { MenuMark as MenuMarkKind } from '@/data/menu';
import { DRINKS, MENU_SECTIONS } from '@/data/menu-layout';
import { hoursSummary } from '@/data/site';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'The Courtyard Cafe menu: all-day breakfast, rice and local favourites, pasta, burgers, sharing platters, coffee, milkshakes, mocktails and cocktails. Prices in naira.',
  alternates: { canonical: '/menu/' },
};

export default function MenuPage() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="section menu-intro" data-reveal>
          <p className="kicker">The Courtyard Cafe</p>
          <h1>Menu</h1>
          <p className="menu-intro__lede">
            Everything we cook and pour. {hoursSummary.hero}.
          </p>
          <nav className="menu-intro__jump" aria-label="Jump to">
            <a href="#food">Food</a>
            <a href="#drinks">Drinks</a>
            <Button href="/book/" variant="primary">
              Order now
            </Button>
          </nav>
        </section>

        <section id="food" className="section section--bordered">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Kitchen</p>
              <h2>Food</h2>
            </div>
            <p className="section-subline">{hoursSummary.kitchen}</p>
          </div>
          <MenuTabs sections={MENU_SECTIONS} />
          <p className="menu-legend" data-reveal>
            {(Object.keys(MARK_LABELS) as MenuMarkKind[]).map((mark) => (
              <span key={mark}>
                <MenuMark mark={mark} />
                {MARK_LABELS[mark]}
              </span>
            ))}
          </p>
        </section>

        <section id="drinks" className="section drinks">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Bar</p>
              <h2>Drinks</h2>
            </div>
            <p className="section-subline">{hoursSummary.bar}</p>
          </div>
          <div className="drinks-grid">
            {DRINKS.map((group) => (
              <DrinkCard key={group.title} group={group} />
            ))}
          </div>
          <div className="menu-order" data-reveal>
            <p>Living in Reef Court Estate? We&apos;ll bring it to your door today.</p>
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
