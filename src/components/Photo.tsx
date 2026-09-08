/* eslint-disable @next/next/no-img-element -- static export serves pre-optimised WebP; next/image's optimiser is unavailable */

/**
 * Responsive photo. Sources are the pre-compressed WebP variants written to
 * /public/img by `scripts/optimize-images.mjs` (widths in PHOTO_WIDTHS).
 * The figure/box that wraps this controls the rendered size and aspect ratio;
 * the <img> just fills it with `object-fit: cover` (see globals.css).
 */

const PHOTO_WIDTHS = [400, 700, 1000, 1400] as const;

export type PhotoName =
  | 'breakfast'
  | 'milkshake'
  | 'wings'
  | 'pasta'
  | 'springrolls';

interface PhotoProps {
  name: PhotoName;
  alt: string;
  /** `sizes` attribute — describe the rendered width at each breakpoint. */
  sizes: string;
  /** Eager-load + high priority for above-the-fold images (the hero). */
  priority?: boolean;
  className?: string;
}

export function Photo({ name, alt, sizes, priority = false, className }: PhotoProps) {
  const srcSet = PHOTO_WIDTHS.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ');
  return (
    <img
      src={`/img/${name}-1000.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
