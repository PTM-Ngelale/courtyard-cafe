import { createHmac, timingSafeEqual } from 'crypto';
import { createServiceClient } from '@/lib/supabase-server';

/**
 * Paystack, server side only (API route handlers and Server Components).
 * Never import this from a Client Component: it reads PAYSTACK_SECRET_KEY.
 *
 * Flow: /api/checkout starts a transaction and sends the customer to
 * Paystack's checkout page. Paystack then sends them back to
 * /book/confirmation and also calls /api/paystack/webhook. Both call
 * `confirmPaidBooking`, which asks Paystack itself whether the payment went
 * through, so neither trusts what the browser says.
 */

const API = 'https://api.paystack.co';

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set');
  return key;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<string> {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status || !body.data?.authorization_url) {
    throw new Error(`Paystack initialize failed: ${res.status} ${body?.message ?? ''}`);
  }
  return body.data.authorization_url as string;
}

async function verifyTransaction(reference: string) {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status) return null;
  return body.data as { status: string; amount: number; currency: string; reference: string };
}

/** True when a webhook body really came from Paystack. */
export function isPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac('sha512', secretKey()).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type ConfirmResult =
  | { state: 'paid'; booking: PaidBooking }
  | { state: 'unpaid' | 'not_found' | 'mismatch' };

export interface PaidBooking {
  id: number;
  customer_name: string;
  street_name: string;
  house_number: string;
  preferred_time: string;
  items: { name: string; quantity: number; price_naira: number }[];
  total_kobo: number;
  status: string;
}

/**
 * Mark a booking paid once Paystack confirms the full amount. Safe to call
 * more than once for the same reference (the return page and the webhook
 * both do): only a booking still awaiting payment is moved to "confirmed".
 */
export async function confirmPaidBooking(reference: string): Promise<ConfirmResult> {
  const supabase = createServiceClient();
  const columns =
    'id, customer_name, street_name, house_number, preferred_time, items, total_kobo, status';

  const { data: booking } = await supabase
    .from('bookings')
    .select(columns)
    .eq('payment_reference', reference)
    .maybeSingle<PaidBooking>();
  if (!booking) return { state: 'not_found' };
  if (booking.status !== 'awaiting_payment') return { state: 'paid', booking };

  const tx = await verifyTransaction(reference);
  if (!tx || tx.status !== 'success') return { state: 'unpaid' };
  if (tx.currency !== 'NGN' || tx.amount !== booking.total_kobo) {
    console.error('Paystack amount mismatch', { reference, paid: tx.amount, due: booking.total_kobo });
    return { state: 'mismatch' };
  }

  const { data: updated } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('payment_reference', reference)
    .eq('status', 'awaiting_payment')
    .select(columns)
    .maybeSingle<PaidBooking>();

  // Lost a race with the other caller: it already confirmed this booking.
  return { state: 'paid', booking: updated ?? { ...booking, status: 'confirmed' } };
}
