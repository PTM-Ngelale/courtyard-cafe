/** Lagos-time helpers for the staff dashboard (WAT is UTC+1 all year). */

const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-11-01" for the Lagos calendar day an instant falls on. */
export const lagosYmd = (date: Date) =>
  new Date(date.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);

/** The instants a Lagos calendar day starts and ends. */
export function lagosDayRange(ymd: string) {
  const start = new Date(`${ymd}T00:00:00+01:00`);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

export const shiftYmd = (ymd: string, days: number) =>
  lagosYmd(new Date(new Date(`${ymd}T12:00:00+01:00`).getTime() + days * DAY_MS));

export function dayLabel(ymd: string, today: string) {
  if (ymd === today) return 'Today';
  if (ymd === shiftYmd(today, -1)) return 'Yesterday';
  return new Date(`${ymd}T12:00:00+01:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Africa/Lagos',
  });
}

export const clock = (iso: string) =>
  new Date(iso)
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Lagos',
    })
    .replace(' ', '')
    .toLowerCase();

function span(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export type DueTone = 'late' | 'soon' | 'later';

/** "in 25 min" / "12 min late", and how urgent that is. */
export function dueIn(iso: string, now: number): { text: string; tone: DueTone } {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60000);
  if (minutes < 0) return { text: `${span(-minutes)} late`, tone: 'late' };
  if (minutes === 0) return { text: 'due now', tone: 'soon' };
  return { text: `in ${span(minutes)}`, tone: minutes <= 20 ? 'soon' : 'later' };
}

export function ago(iso: string, now: number) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  return minutes === 0 ? 'just now' : `${span(minutes)} ago`;
}
