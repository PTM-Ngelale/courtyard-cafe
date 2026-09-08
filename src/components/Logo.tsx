/* eslint-disable @next/next/no-img-element -- static export serves pre-optimised WebP; next/image's optimiser is unavailable */

/**
 * The cafe's mark. `dark` (ink) is used on every light ground — header, hero,
 * footer; `light` (cream) is for dark grounds. Source is a 482×482 alpha PNG
 * reconstructed from a photo of the cafe's sign; swap in a vector if one exists.
 */

const LOGO_WIDTHS = [128, 256] as const;

interface LogoProps {
  variant?: 'dark' | 'light';
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function Logo({
  variant = 'dark',
  alt = '',
  sizes,
  priority = false,
  className,
}: LogoProps) {
  const name = variant === 'dark' ? 'logo-dark' : 'logo-light';
  const srcSet = LOGO_WIDTHS.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ');
  return (
    <img
      src={`/img/${name}-256.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={256}
      height={256}
      alt={alt}
      className={className}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
