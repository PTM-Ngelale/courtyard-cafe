import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { initializeTransaction } from '@/lib/paystack';
import { MAX_QUANTITY, orderItemsById } from '@/lib/order-menu';
import { DELIVERY_FEE_NAIRA, deliveryTimeProblem } from '@/lib/delivery';

/**
 * Starts a delivery order: checks everything again on the server (prices come
 * from the menu here, never from the browser), saves the order as
 * "awaiting_payment", and returns the Paystack checkout URL to redirect to.
 * The order only reaches the staff dashboard once Paystack confirms payment.
 */

interface CheckoutBody {
  customer_name?: unknown;
  customer_phone?: unknown;
  customer_email?: unknown;
  street_id?: unknown;
  house_number?: unknown;
  preferred_time?: unknown;
  notes?: unknown;
  items?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CheckoutBody | null;
  if (!body) return bad('Invalid request');

  const name = typeof body.customer_name === 'string' ? body.customer_name.trim() : '';
  const phone = typeof body.customer_phone === 'string' ? body.customer_phone.trim() : '';
  const email = typeof body.customer_email === 'string' ? body.customer_email.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 300) : '';
  const streetId = typeof body.street_id === 'number' ? body.street_id : NaN;
  const house = typeof body.house_number === 'string' ? body.house_number.trim() : '';

  if (!name || name.length > 80) return bad('Enter your name');
  if (phone.replace(/\D/g, '').length < 10 || phone.length > 20) return bad('Enter a valid phone number');
  if (!EMAIL_RE.test(email) || email.length > 120) return bad('Enter a valid email for your receipt');
  if (!Number.isInteger(streetId) || !house) return bad('Choose your street and house');

  const when = new Date(typeof body.preferred_time === 'string' ? body.preferred_time : '');
  const timeProblem = deliveryTimeProblem(when);
  if (timeProblem) return bad(timeProblem);

  // Price the order from the menu; the browser only says what and how many.
  if (!Array.isArray(body.items) || body.items.length === 0) return bad('Your order is empty');
  const lines: { id: string; name: string; group: string; quantity: number; price_naira: number }[] = [];
  for (const raw of body.items as { id?: unknown; quantity?: unknown }[]) {
    const item = typeof raw?.id === 'string' ? orderItemsById.get(raw.id) : undefined;
    const quantity = raw?.quantity;
    if (!item) return bad('Something in your order is no longer on the menu');
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > MAX_QUANTITY) {
      return bad('Check the quantities in your order');
    }
    if (lines.some((l) => l.id === item.id)) return bad('Check the items in your order');
    lines.push({ id: item.id, name: item.name, group: item.group, quantity: quantity as number, price_naira: item.priceNaira });
  }
  const subtotal = lines.reduce((sum, l) => sum + l.price_naira * l.quantity, 0);
  const totalKobo = (subtotal + DELIVERY_FEE_NAIRA) * 100;

  const supabase = createServiceClient();

  const { data: address } = await supabase
    .from('reef_court_addresses')
    .select('house_number, estate_streets(street_name)')
    .eq('street_id', streetId)
    .eq('house_number', house)
    .maybeSingle<{ house_number: string; estate_streets: { street_name: string } | null }>();
  const streetName = address?.estate_streets?.street_name;
  if (!address || !streetName) return bad('That address is not in Reef Court Estate');

  const reference = `CTY-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`.toUpperCase();

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      street_id: streetId,
      street_name: streetName,
      house_number: house,
      preferred_time: when.toISOString(),
      notes: notes || null,
      items: lines,
      subtotal_naira: subtotal,
      delivery_fee_naira: DELIVERY_FEE_NAIRA,
      total_kobo: totalKobo,
      status: 'awaiting_payment',
      payment_reference: reference,
    })
    .select('id')
    .single();

  if (insertError || !booking) {
    console.error('Checkout insert failed:', insertError);
    return NextResponse.json({ error: 'Could not start your order. Please try again.' }, { status: 500 });
  }

  const siteUrl = process.env.SITE_URL || req.nextUrl.origin;
  try {
    const url = await initializeTransaction({
      email,
      amountKobo: totalKobo,
      reference,
      callbackUrl: `${siteUrl}/book/confirmation/`,
      metadata: { booking_id: booking.id, address: `${house} ${streetName}` },
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    // No payment was started, so don't leave a dead order behind.
    await supabase.from('bookings').delete().eq('id', booking.id);
    return NextResponse.json({ error: 'Payment is unavailable right now. Please try again.' }, { status: 502 });
  }
}
