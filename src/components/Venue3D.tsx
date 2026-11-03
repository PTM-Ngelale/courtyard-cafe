/**
 * The Courtyard as a live 3D model (public/3d/courtyard.html, by NanoTek).
 * Loads lazily and only animates while it is on screen.
 *
 * Point at the file itself. The clean URL /3d/courtyard/ only existed while
 * the site was a static export; as a full Next.js app it 404s.
 *
 * Sandboxed without allow-same-origin: the page pulls three.js from a CDN,
 * so it gets an opaque origin and can't read this site's storage (where the
 * staff dashboard keeps its Supabase login). allow-popups lets the NanoTek
 * credit link open in a normal tab.
 */
export function Venue3D() {
  return (
    <div className="venue3d" data-reveal>
      <iframe
        src="/3d/courtyard.html"
        title="3D model of The Courtyard: the cafe with the kitchen behind it, the umbrella patio, the lawn and the thatched bush bar"
        loading="lazy"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
