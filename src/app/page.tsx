import { Fragment } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { MenuGroup } from "@/components/MenuGroup";
import { DrinkCard } from "@/components/DrinkCard";
import { Photo } from "@/components/Photo";
import { Logo } from "@/components/Logo";
import { foodGroups, drinkGroups } from "@/data/menu";
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
              grew up on — dirty jollof, asun fried rice, yamarita — alongside
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
          <div className="menu-grid">
            {foodGroups.map((group) => (
              <MenuGroup key={group.title} group={group} />
            ))}
          </div>
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
            {drinkGroups.map((group) => (
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
              <Button href={`mailto:${contact.email}`} variant="ghost">
                {contact.email}
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
