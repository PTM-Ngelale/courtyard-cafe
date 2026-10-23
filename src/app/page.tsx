import { Fragment } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { MenuMark, MARK_LABELS } from "@/components/MenuGroup";
import { DrinkCard } from "@/components/DrinkCard";
import { Photo } from "@/components/Photo";
import { Logo } from "@/components/Logo";
import { Venue3D } from "@/components/Venue3D";
import { foodGroups, drinkGroups, foodSections, drinkOrder, type MenuMark as MenuMarkKind } from "@/data/menu";
import { MenuTabs, type MenuSection } from "@/components/MenuTabs";
import { contact, hours, hoursSummary } from "@/data/site";

const GALLERY: {
  name: "pasta" | "springrolls" | "wings" | "breakfast" | "milkshake";
  alt: string;
}[] = [
  { name: "pasta", alt: "Asun pasta" },
  { name: "springrolls", alt: "Spring rolls and samosa with pepper dip" },
  { name: "wings", alt: "Honey glazed wings" },
  { name: "breakfast", alt: "English breakfast" },
  { name: "milkshake", alt: "Strawberry milkshake" },
];

// Food groups arranged into the site's tabs; anything unassigned joins the last tab so no dish disappears.
const MENU_SECTIONS: MenuSection[] = (() => {
  const byTitle = new Map(foodGroups.map((g) => [g.title, g]));
  const sections = foodSections.map((s) => ({
    id: s.id,
    label: s.label,
    groups: s.groups.flatMap((t) => {
      const g = byTitle.get(t);
      byTitle.delete(t);
      return g ? [g] : [];
    }),
  }));
  sections[sections.length - 1].groups.push(...byTitle.values());
  return sections;
})();

const DRINKS = [...drinkGroups].sort(
  (a, b) => (drinkOrder.indexOf(a.title) + 1 || 99) - (drinkOrder.indexOf(b.title) + 1 || 99),
);

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="top">
        {/* ===================== Hero ===================== */}
        <section className="hero">
          <div className="hero__glow" aria-hidden="true" />

          <div className="hero__text" data-reveal-stagger>
            <Logo
              className="hero__mark"
              alt=""
              sizes="(max-width: 700px) 92px, 124px"
              priority
            />
            <p className="hero__eyebrow">Café &amp; Kitchen · Port Harcourt</p>
            <h1>Where every moment blooms</h1>
            <p className="hero__lede">
              Long breakfasts, easy lunches, and something tall and cold for the
              afternoon. We&apos;re here from morning till late.
            </p>
            <div className="hero__actions">
              <Button href="#menu" variant="primary">
                See the menu
              </Button>
              <Button href="#visit" variant="ghost">
                Find us
              </Button>
            </div>
            <div className="hero__meta">
              <span>{hoursSummary.hero}</span>
            </div>
          </div>

          <div className="hero__photos" data-reveal>
            <figure className="hero__photo">
              <Photo
                name="breakfast"
                alt="English breakfast"
                sizes="(max-width: 700px) 45vw, 28vw"
                priority
              />
            </figure>
            <figure className="hero__photo hero__photo--offset">
              <Photo
                name="milkshake"
                alt="Strawberry milkshake"
                sizes="(max-width: 700px) 45vw, 28vw"
                priority
              />
            </figure>
          </div>
        </section>

        {/* ===================== About ===================== */}
        <section
          id="about"
          className="section section--bordered about"
          data-reveal
        >
          <div className="about__text">
            <p className="kicker">The cafe</p>
            <h2 className="about__title">
              A green corner of Port Harcourt, built for long meals
            </h2>
            <p className="prose">
              We started out as a small kitchen — a few tables, far too many
              ferns. It still feels like that. The food takes its time, the
              coffee is made properly, and it stays quiet enough to hear the
              person sitting across from you.
            </p>
            <p className="prose">
              Breakfast runs all morning. Lunch is mostly the comfort food we
              grew up on — smoky jollof, asun fried rice, yamarita — alongside
              the burgers and pasta people keep coming back for.
            </p>
            <div className="about__tags">
              <Tag variant="accent">All-day breakfast</Tag>
              <Tag variant="outline">Fresh pastries</Tag>
              <Tag variant="outline">Cocktails &amp; mocktails</Tag>
              <Tag variant="outline">Free wifi</Tag>
            </div>
          </div>
          <figure className="about__photo">
            <Photo
              name="wings"
              alt="Honey glazed wings with sweet potato fries"
              sizes="(max-width: 700px) 90vw, 44vw"
            />
          </figure>
        </section>

        {/* ===================== Food menu ===================== */}
        <section id="menu" className="section section--bordered" data-reveal>
          <div className="section-head">
            <div>
              <p className="kicker">Kitchen</p>
              <h2>Food menu</h2>
            </div>
            <p className="section-subline">{hoursSummary.kitchen}</p>
          </div>
          <MenuTabs sections={MENU_SECTIONS} />
          <p className="menu-legend">
            {(Object.keys(MARK_LABELS) as MenuMarkKind[]).map((mark) => (
              <span key={mark}>
                <MenuMark mark={mark} />
                {MARK_LABELS[mark]}
              </span>
            ))}
          </p>
        </section>

        {/* ===================== Drinks ===================== */}
        <section id="drinks" className="section drinks" data-reveal>
          <div className="section-head">
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
        </section>

        {/* ===================== Gallery ===================== */}
        <section id="gallery" className="section section--bordered">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">On the pass</p>
              <h2>From the courtyard</h2>
            </div>
            <a
              className="gallery__link"
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer me"
            >
              {contact.instagramHandle} →
            </a>
          </div>
          <div className="gallery-grid" data-reveal-stagger>
            {GALLERY.map((photo, i) => (
              <figure className="gallery__figure" key={`${photo.name}-${i}`}>
                <Photo
                  name={photo.name}
                  alt={photo.alt}
                  sizes="(max-width: 560px) 90vw, (max-width: 900px) 45vw, 22vw"
                />
              </figure>
            ))}
          </div>
        </section>

        {/* ===================== The space (3D) ===================== */}
        <section id="space" className="section section--bordered space" aria-labelledby="space-title">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">The space</p>
              <h2 id="space-title">Find your spot</h2>
            </div>
            <p className="section-subline">
              The cafe, the umbrellas on the patio, the lawn or the bush bar.
            </p>
          </div>
          <Venue3D />
        </section>

        {/* ===================== Visit (dark band) ===================== */}
        <section id="visit" className="section visit on-dark" data-reveal>
          <div className="visit__intro">
            <p className="kicker visit__kicker">Visit</p>
            <h2 className="visit__title">Come sit under the ferns</h2>
            <p className="visit__prose">
              Walk in any time. If you&apos;re a group of six or more, or you
              want the whole courtyard for an evening, give us a call first.
            </p>
            <div className="visit__actions">
              <Button href={contact.phoneHref} variant="primary">
                {contact.phoneDisplay}
              </Button>
              {contact.email ? (
                <Button href={`mailto:${contact.email}`} variant="ghost">
                  {contact.email}
                </Button>
              ) : null}
              <Button
                href={contact.instagramUrl}
                variant="ghost"
                target="_blank"
                rel="noopener noreferrer me"
              >
                <svg
                  viewBox="0 0 256 256"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="36" y="36" width="184" height="184" rx="48" />
                  <circle cx="128" cy="128" r="40" />
                  <circle
                    cx="180"
                    cy="75.9"
                    r="10"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
                {contact.instagramHandle}
              </Button>
            </div>
          </div>

          <div className="visit__details">
            <div>
              <h3 className="visit__label">Hours</h3>
              {hours.map((row) => (
                <div className="visit__hours-row" key={row.d}>
                  <span className="visit__day">{row.d}</span>
                  <span className="visit__time">{row.h}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="visit__label">Address</h3>
              <p className="visit__address">
                {contact.addressLines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
