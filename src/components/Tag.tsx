import type { ReactNode } from 'react';

/** Pill tag. Variant: accent (filled) | outline. */
export function Tag({
  variant = 'outline',
  children,
}: {
  variant?: 'accent' | 'outline';
  children: ReactNode;
}) {
  return <span className={`tag tag--${variant}`}>{children}</span>;
}
