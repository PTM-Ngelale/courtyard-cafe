import type { Metadata } from 'next';
import Link from 'next/link';
import { confirmPaidBooking } from '@/lib/paystack';
import { formatNaira } from '@/lib/order-menu';
import { formatLagosTime } from '@/lib/delivery';
import { contact } from '@/data/site';
import '../booking.css';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  robots: { index: false },
};

// Paystack sends the customer here as /book/confirmation?reference=...
// (also ?trxref=...). The payment is checked with Paystack on every visit.
export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = (params.reference || params.trxref || '').slice(0, 64);
  const result = reference ? await confirmPaidBooking(reference) : { state: 'not_found' as const };

  if (result.state === 'paid') {
    const b = result.booking;
    return (
      <main className="booking-page">
        <div className="booking-success">
          <h2>Order confirmed</h2>
          <p>
            Thanks, {b.customer_name.split(' ')[0]}. We&rsquo;ll deliver to {b.house_number}{' '}
            {b.street_name} at about {formatLagosTime(new Date(b.preferred_time))}.
          </p>
        </div>

        <div className="order-receipt">
          <ul>
            {b.items.map((item) => (
              <li key={item.name + item.price_naira}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatNaira(item.price_naira * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="order-receipt__total">
            <span>Paid</span>
            <span>{formatNaira(b.total_kobo / 100)}</span>
          </p>
          <p className="booking-hint">
            Reference {reference}. Questions? Call{' '}
            <a href={contact.phoneHref}>{contact.phoneDisplay}</a>.
          </p>
        </div>

        <p className="booking-footnote">
          <Link href="/">Back to The Courtyard</Link>
        </p>
      </main>
    );
  }

  const message =
    result.state === 'unpaid'
      ? "Your payment didn't go through, so nothing was charged. You can try again."
      : result.state === 'mismatch'
        ? `We couldn't match your payment to this order. Please call us on ${contact.phoneDisplay} with reference ${reference}.`
        : "We couldn't find that order.";

  return (
    <main className="booking-page">
      <h1>Order not confirmed</h1>
      <div className="booking-error">{message}</div>
      <p className="booking-footnote">
        <Link href="/book/">Start a new order</Link>
      </p>
    </main>
  );
}
