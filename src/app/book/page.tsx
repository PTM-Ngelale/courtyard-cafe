import type { Metadata } from 'next';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import './booking.css';

export const metadata: Metadata = {
  title: 'Order Now',
  robots: { index: false },
};

export default function BookPage() {
  return (
    <main className="booking-page">
      <Link href="/" className="booking-home">
        ← The Courtyard
      </Link>
      <h1>Order now</h1>
      <p>Same-day delivery to Reef Court Estate homes. Pay securely with Paystack.</p>
      <BookingForm />
    </main>
  );
}
