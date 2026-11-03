/** @type {import('next').NextConfig} */
const nextConfig = {
  // Booking requires live API routes (Supabase), so the site now deploys as
  // a full Next.js app on Vercel rather than a static export.

  // Photos are pre-compressed to responsive WebP by
  // `scripts/optimize-images.mjs` and served from /public; the <Photo>
  // component emits a plain <img srcset>, so Image Optimization stays off.
  images: { unoptimized: true },

  // Emit `about/index.html` rather than `about.html` — friendlier on most
  // static hosts. Anchor-only nav here, but keep it consistent for the future.
  trailingSlash: true,

  reactStrictMode: true,

  // Linting is a separate `npm run lint` step — a style warning shouldn't
  // block a deploy. Type errors still fail the build.
  eslint: { ignoreDuringBuilds: true },

  // Security headers. Other sites may not frame any page (the home page
  // frames /3d/courtyard.html itself, which 'self' allows), and the staff
  // pages may not be framed at all. Referrer-Policy keeps the Paystack
  // ?reference= on the confirmation page from leaking to other sites.
  // When two rules set the same header, the later one wins, so /admin/
  // comes last.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
