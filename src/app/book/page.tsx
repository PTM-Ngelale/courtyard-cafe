import type { Metadata } from 'next';
import BookingForm from '@/components/BookingForm';
import './booking.css';

export const metadata: Metadata = {
  title: 'Order Delivery',
  robots: { index: false },
};

export default function BookPage() {
  return (
    <main className="booking-page">
      <h1>Order delivery</h1>
      <p>Same-day delivery to Reef Court Estate homes. Pay securely with Paystack.</p>
      <BookingForm />
    </main>
  );
}
