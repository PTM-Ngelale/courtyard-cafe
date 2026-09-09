/**
 * Single source of truth for business / contact details.
 *
 * Address, phone number and opening hours are the cafe's real details.
 * Still to replace before launch: the email address, the real Instagram URL,
 * and `site.url` (the production domain).
 */

export const site = {
  name: "The Courtyard Cafe",
  shortName: "The Courtyard",
  tagline: "Where every moment blooms",
  description:
    "A café and kitchen in Port Harcourt — long breakfasts, easy lunches, and something cold in a tall glass. Have a look at the full food and drinks menu.",
  // Production domain — drives canonical links and Open Graph URLs.
  url: "https://www.thecourtyard.ng",
};

export const contact = {
  addressLines: ["Reef Court Estate", "Port Harcourt", "Nigeria"],
  // Structured pieces for JSON-LD.
  streetAddress: "Reef Court Estate",
  addressLocality: "Port Harcourt",
  addressRegion: "Rivers",
  addressCountry: "NG",
  phoneDisplay: "0704 900 4617",
  phoneHref: "tel:+2347049004617",
  email: "",
  instagramUrl:
    "https://www.instagram.com/thecourtyardcafeph?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==",
  instagramHandle: "@thecourtyardcafe",
};

/** Short lines that paraphrase the hours in prose. Keep in sync with `hours`. */
export const hoursSummary = {
  hero: "Open every day until 10pm",
  kitchen: "All prices in naira. Breakfast is served all day.",
  bar: "Coffee from the moment we open. Cocktails from noon.",
};

export const hours: { d: string; h: string }[] = [
  { d: "Monday – Saturday", h: "8:30am – 10pm" },
  { d: "Sunday", h: "11am – 10pm" },
];

/**
 * schema.org openingHoursSpecification, derived from `hours` above.
 * Mon–Sat 08:30–22:00, Sun 11:00–22:00.
 */
export const openingHoursSpecification = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "08:30",
    closes: "22:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Sunday",
    opens: "11:00",
    closes: "22:00",
  },
];
