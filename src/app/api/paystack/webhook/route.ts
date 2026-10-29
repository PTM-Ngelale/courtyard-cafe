import { NextRequest, NextResponse } from 'next/server';
import { confirmPaidBooking, isPaystackSignature } from '@/lib/paystack';

/**
 * Paystack calls this when a payment succeeds, so an order is confirmed even
 * if the customer closes the tab before returning to the site. Set its URL,
 * https://<site>/api/paystack/webhook/ (keep the trailing slash: the site
 * redirects slashless URLs and Paystack doesn't follow redirects), under
 * Settings > API Keys & Webhooks in the Paystack dashboard.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!isPaystackSignature(raw, req.headers.get('x-paystack-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  if (event.event === 'charge.success' && event.data?.reference) {
    const result = await confirmPaidBooking(event.data.reference);
    if (result.state !== 'paid' && result.state !== 'not_found') {
      console.error('Webhook could not confirm booking', event.data.reference, result.state);
    }
  }

  // Always 200 once the signature checks out, or Paystack keeps retrying.
  return NextResponse.json({ received: true });
}
