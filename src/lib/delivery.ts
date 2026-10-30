/**
 * Delivery rules for Reef Court Estate orders, shared by the order form (to
 * offer time slots) and the checkout API (to enforce them).
 *
 * Times are Lagos time (WAT, UTC+1 all year, no daylight saving), whatever
 * timezone the customer's phone is set to.
 */

/** Flat delivery charge added to every order. Confirm with the cafe. */
export const DELIVERY_FEE_NAIRA = 0;

/** Earliest delivery is this long after the order is placed. */
export const MIN_LEAD_MINUTES = 30;

const SLOT_MINUTES = 30;
/** Last delivery this long before closing, so the kitchen isn't cooking at close. */
const LAST_DELIVERY_BEFORE_CLOSE = 30;
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

/** Opening hours by weekday (0 = Sunday), in minutes after midnight. Matches `hours` in site.ts. */
const OPENING: Record<number, { open: number; close: number }> = {
  0: { open: 11 * 60, close: 22 * 60 },
  1: { open: 8 * 60 + 30, close: 22 * 60 },
  2: { open: 8 * 60 + 30, close: 22 * 60 },
  3: { open: 8 * 60 + 30, close: 22 * 60 },
  4: { open: 8 * 60 + 30, close: 22 * 60 },
  5: { open: 8 * 60 + 30, close: 22 * 60 },
  6: { open: 8 * 60 + 30, close: 22 * 60 },
};

/** The Lagos calendar date and minute-of-day of an instant. */
function lagosParts(date: Date) {
  const shifted = new Date(date.getTime() + LAGOS_OFFSET_MS);
  return {
    ymd: shifted.toISOString().slice(0, 10),
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

function lagosInstant(ymd: string, minutes: number) {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return new Date(`${ymd}T${hh}:${mm}:00+01:00`);
}

export interface DeliverySlot {
  /** ISO timestamp sent to the server. */
  value: string;
  /** "2:30pm" */
  label: string;
}

export function formatLagosTime(date: Date) {
  const { minutes } = lagosParts(date);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

/** Today's remaining delivery slots, every 30 minutes until the last delivery. */
export function deliverySlots(now: Date = new Date()): DeliverySlot[] {
  const { ymd, weekday, minutes } = lagosParts(now);
  const { open, close } = OPENING[weekday];
  const earliest = Math.max(open + MIN_LEAD_MINUTES, minutes + MIN_LEAD_MINUTES);
  const first = Math.ceil(earliest / SLOT_MINUTES) * SLOT_MINUTES;

  const slots: DeliverySlot[] = [];
  for (let t = first; t <= close - LAST_DELIVERY_BEFORE_CLOSE; t += SLOT_MINUTES) {
    const at = lagosInstant(ymd, t);
    slots.push({ value: at.toISOString(), label: formatLagosTime(at) });
  }
  return slots;
}

/** Why a requested delivery time can't be used, or null when it's fine. */
export function deliveryTimeProblem(requested: Date, now: Date = new Date()): string | null {
  if (Number.isNaN(requested.getTime())) return 'Choose a delivery time';
  if (requested.getTime() < now.getTime() + (MIN_LEAD_MINUTES - 1) * 60_000) {
    return `Delivery needs at least ${MIN_LEAD_MINUTES} minutes' notice`;
  }
  const req = lagosParts(requested);
  if (req.ymd !== lagosParts(now).ymd) return 'We only deliver today';
  const { open, close } = OPENING[req.weekday];
  if (req.minutes < open || req.minutes > close - LAST_DELIVERY_BEFORE_CLOSE) return "That's outside our opening hours";
  return null;
}
