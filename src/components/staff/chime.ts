/**
 * A short two-note chime for new orders, made with Web Audio so there's no
 * sound file to ship. Browsers only allow audio after the user has tapped the
 * page, so `unlockChime` runs on the first tap and on the "Sound" toggle.
 */

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export async function unlockChime() {
  const a = audio();
  if (a && a.state === 'suspended') await a.resume().catch(() => undefined);
  return a?.state === 'running';
}

export function chimeReady() {
  return ctx?.state === 'running';
}

export function playChime() {
  const a = audio();
  if (!a || a.state !== 'running') return;

  const notes = [
    { freq: 880, at: 0 },
    { freq: 1318.5, at: 0.16 },
    { freq: 880, at: 0.5 },
    { freq: 1318.5, at: 0.66 },
  ];
  for (const { freq, at } of notes) {
    const t = a.currentTime + at;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.42);
  }
}
