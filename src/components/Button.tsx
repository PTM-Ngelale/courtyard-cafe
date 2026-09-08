import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Outlined link-button — every "button" in this design is a link (menu anchor,
 * phone, email, nav CTA). Variants: primary (gold outline) | ghost (borderless).
 * On a dark ground, put `.on-dark` on an ancestor to retint (see globals.css).
 */
interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({
  href,
  variant = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');
  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}
