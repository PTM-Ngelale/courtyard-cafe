/**
 * The Courtyard as a live 3D model (public/3d/courtyard.html, by NanoTek).
 * Loads lazily and only animates while it is on screen. The static export
 * uses trailing slashes, so Vercel serves the file at the clean URL /3d/courtyard/.
 */
export function Venue3D() {
  return (
    <div className="venue3d" data-reveal>
      <iframe
        src="/3d/courtyard/"
        title="3D model of The Courtyard: the cafe with the kitchen behind it, the umbrella patio, the lawn and the thatched bush bar"
        loading="lazy"
      />
    </div>
  );
}
