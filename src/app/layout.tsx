import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site, contact, openingHoursSpecification } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const TITLE = `${site.name} — Café & Kitchen, Port Harcourt`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: TITLE,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: TITLE,
    description: site.description,
    url: site.url,
    locale: "en_NG",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: site.name },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: site.description,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ef",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/og-image.jpg`,
  slogan: site.tagline,
  servesCuisine: ["Breakfast", "West African", "Cafe", "Cocktails"],
  priceRange: "₦₦",
  telephone: contact.phoneDisplay,
  email: contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.streetAddress,
    addressLocality: contact.addressLocality,
    addressRegion: contact.addressRegion,
    addressCountry: contact.addressCountry,
  },
  openingHoursSpecification,
  sameAs: [contact.instagramUrl],
  hasMenu: `${site.url}/#menu`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
