/**
 * Pre-compresses the source photography into responsive WebP variants under
 * `public/img/`, so the static export can serve small images without the Next
 * Image Optimization server.
 *
 *   <name>-<width>.webp   for each width in PHOTO_WIDTHS
 *   logo-dark-<width>.webp for each width in LOGO_WIDTHS
 *
 * Idempotent: a variant is skipped when it already exists and is newer than
 * its source. Run: node scripts/optimize-images.mjs  (also wired to pre{dev,build})
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { mkdir, stat, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const srcDir = path.join(root, 'src/assets/img');
const outDir = path.join(root, 'public/img');

const PHOTO_WIDTHS = [400, 700, 1000, 1400];
const LOGO_WIDTHS = [128, 256];

const PHOTOS = ['breakfast', 'milkshake', 'wings', 'pasta', 'springrolls'];
const LOGOS = ['logo-dark', 'logo-light'];

async function newer(a, b) {
  try {
    const [sa, sb] = await Promise.all([stat(a), stat(b)]);
    return sa.mtimeMs >= sb.mtimeMs;
  } catch {
    return false;
  }
}

async function emit(name, widths, opts) {
  const src = path.join(srcDir, `${name}.png`);
  let made = 0;
  for (const w of widths) {
    const out = path.join(outDir, `${name}-${w}.webp`);
    if (await newer(out, src)) continue;
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp(opts)
      .toFile(out);
    made++;
  }
  return made;
}

await mkdir(outDir, { recursive: true });

let total = 0;
for (const name of PHOTOS) {
  total += await emit(name, PHOTO_WIDTHS, { quality: 72, effort: 5 });
}
for (const name of LOGOS) {
  total += await emit(name, LOGO_WIDTHS, { quality: 90, effort: 6 });
}

const files = (await readdir(outDir)).length;
console.log(
  total === 0
    ? `optimize-images: up to date (${files} variants in public/img/)`
    : `optimize-images: wrote ${total} variant(s) (${files} total in public/img/)`
);
