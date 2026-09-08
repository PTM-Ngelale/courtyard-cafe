/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site is fully static — export a plain HTML/CSS/JS bundle to `out/`.
  output: 'export',

  // Static export can't use the Next Image Optimization server. Photos are
  // pre-compressed to responsive WebP by `scripts/optimize-images.mjs` and
  // served from /public; the <Photo> component emits a plain <img srcset>.
  images: { unoptimized: true },

  // Emit `about/index.html` rather than `about.html` — friendlier on most
  // static hosts. Anchor-only nav here, but keep it consistent for the future.
  trailingSlash: true,

  reactStrictMode: true,

  // Linting is a separate `npm run lint` step — a style warning shouldn't
  // block a deploy. Type errors still fail the build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
