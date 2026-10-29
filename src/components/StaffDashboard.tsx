'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { formatNaira } from '@/lib/order-menu';

interface Booking {
  id: number;
  customer_name: string;
  customer_phone: string;
  street_id: number;
  street_name: string;
  house_number: string;
  preferred_time: string;
  notes: string | null;
  items: { name: string; quantity: number; price_naira: number }[];
  total_kobo: number;
  status: 'awaiting_payment' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  created_at: string;
}

// Checkouts that haven't been paid yet never reach the kitchen.
const isPaid = (b: Booking) => b.status !== 'awaiting_payment';

const byTime = (a: Booking, b: Booking) => a.preferred_time.localeCompare(b.preferred_time);

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function StaffLogin({ onSignedIn }: { onSignedIn: (session: Session) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError || !data.session) {
      setError('Invalid email or password.');
      return;
    }

    onSignedIn(data.session);
  };

  return (
    <div className="dashboard-login">
      <h1>Staff Sign In</h1>
      {error && <div className="dashboard-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="staff-email">Email</label>
        <input
          id="staff-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="staff-password">Password</label>
        <input
          id="staff-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function StaffDashboard() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchBookings = async () => {
      try {
        const { data, error: fetchError } = await supabaseBrowser
          .from('bookings')
          .select('*')
          .neq('status', 'awaiting_payment')
          .order('preferred_time', { ascending: true });

        if (fetchError) throw fetchError;
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const channel = supabaseBrowser
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as Booking;
            if (!isPaid(row)) return;
            // A paid order arrives as an UPDATE (awaiting_payment -> confirmed),
            // so add it if it isn't on screen yet.
            setBookings((prev) =>
              prev.some((b) => b.id === row.id)
                ? prev.map((b) => (b.id === row.id ? { ...b, ...row } : b))
                : [...prev, row].sort(byTime)
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session]);

  const updateStatus = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const { error: updateError } = await supabaseBrowser
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setBookings([]);
  };

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Lagos',
    });

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Lagos',
    });

  if (session === undefined) {
    return null;
  }

  if (!session) {
    return <StaffLogin onSignedIn={setSession} />;
  }

  if (loading) {
    return <p className="dashboard-empty">Loading orders…</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Order Dashboard</h1>
          <p>{bookings.filter((b) => b.status === 'confirmed').length} new orders</p>
        </div>
        <button className="dashboard-signout" onClick={signOut}>
          Sign Out
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {bookings.length === 0 ? (
        <div className="dashboard-empty">No orders yet</div>
      ) : (
        <div className="dashboard-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="dashboard-card">
              <div className="dashboard-card-top">
                <div>
                  <h3>{booking.customer_name}</h3>
                  <p>
                    {booking.house_number} {booking.street_name}
                  </p>
                </div>
                <span className={`dashboard-badge dashboard-badge--${booking.status}`}>
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </span>
              </div>

              <div className="dashboard-meta">
                <div>
                  <div className="dashboard-meta-label">Phone</div>
                  <div className="dashboard-meta-value">{booking.customer_phone}</div>
                </div>
                <div>
                  <div className="dashboard-meta-label">Deliver at</div>
                  <div className="dashboard-meta-value">
                    {formatTime(booking.preferred_time)} ({formatDate(booking.preferred_time)})
                  </div>
                </div>
                <div>
                  <div className="dashboard-meta-label">Ordered</div>
                  <div className="dashboard-meta-value">{formatTime(booking.created_at)}</div>
                </div>
              </div>

              <ul className="dashboard-items">
                {(booking.items ?? []).map((item) => (
                  <li key={item.name + item.price_naira}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatNaira(item.price_naira * item.quantity)}</span>
                  </li>
                ))}
                <li className="dashboard-items__total">
                  <span>Paid</span>
                  <span>{formatNaira(booking.total_kobo / 100)}</span>
                </li>
              </ul>
              {booking.notes && <p className="dashboard-notes">Note: {booking.notes}</p>}

              <div className="dashboard-actions">
                {booking.status === 'confirmed' && (
                  <button
                    className="action-preparing"
                    onClick={() => updateStatus(booking.id, 'preparing')}
                    disabled={updatingId === booking.id}
                  >
                    Start Preparing
                  </button>
                )}
                {booking.status === 'preparing' && (
                  <button
                    className="action-ready"
                    onClick={() => updateStatus(booking.id, 'ready')}
                    disabled={updatingId === booking.id}
                  >
                    Mark Ready
                  </button>
                )}
                {booking.status === 'ready' && (
                  <button
                    className="action-delivered"
                    onClick={() => updateStatus(booking.id, 'delivered')}
                    disabled={updatingId === booking.id}
                  >
                    Mark Delivered
                  </button>
                )}
                {booking.status !== 'delivered' && booking.status !== 'cancelled' && (
                  <button
                    className="action-cancel"
                    onClick={() => updateStatus(booking.id, 'cancelled')}
                    disabled={updatingId === booking.id}
                  >
                    Cancel
                  </button>
                )}
                {(booking.status === 'delivered' || booking.status === 'cancelled') && (
                  <span className="done">{STATUS_LABEL[booking.status]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
