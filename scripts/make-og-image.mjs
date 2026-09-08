/**
 * Generates public/og-image.jpg (1200×630) from the hero breakfast photo,
 * with a subtle dark gradient and the wordmark burned in so link unfurls
 * read as "The Courtyard Cafe".
 *
 * Run: node scripts/make-og-image.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(new URL(".", import.meta.url)));
const srcPhoto = path.join(root, "src/assets/img/breakfast.png");
const out = path.join(root, "public/og-image.jpg");

const W = 1200;
const H = 630;

const overlay = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1c2320" stop-opacity="0.15"/>
        <stop offset="60%" stop-color="#1c2320" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#1c2320" stop-opacity="0.82"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="72" y="${H - 118}" fill="#e8d3ab"
      font-family="Inter, Helvetica, Arial, sans-serif" font-size="26"
      letter-spacing="8" font-weight="500">CAFÉ &amp; KITCHEN · PORT HARCOURT</text>
    <text x="70" y="${H - 60}" fill="#fffdfc"
      font-family="Inter, Helvetica, Arial, sans-serif" font-size="64"
      letter-spacing="1" font-weight="500">The Courtyard Cafe</text>
  </svg>`,
);

await sharp(srcPhoto)
  .resize(W, H, { fit: "cover", position: "attention" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);

console.log("Wrote", path.relative(root, out));
