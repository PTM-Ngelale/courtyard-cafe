'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { formatNaira } from '@/lib/order-menu';
import { Logo } from '@/components/Logo';
import OrderCard, { DoneRow, PrintTicket } from './staff/OrderCard';
import StaffLogin from './staff/StaffLogin';
import { chimeReady, playChime, unlockChime } from './staff/chime';
import { dayLabel, dueIn, lagosDayRange, lagosYmd, shiftYmd } from './staff/time';
import { LANES, ORDER_COLUMNS, laneOf, type Lane, type Order, type OrderStatus } from './staff/types';

/** While an order sits in New, ring again this often so it can't be missed. */
const REMIND_MS = 2 * 60 * 1000;
/** Re-fetch in the background in case a realtime message was missed (sleeping tablet, bad network). */
const POLL_MS = 60 * 1000;
const SOUND_KEY = 'courtyard-staff-sound';

type StaffCheck = 'checking' | 'staff' | 'not-staff';

export default function StaffDashboard() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [staff, setStaff] = useState<StaffCheck>('checking');

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    setStaff('checking');
    supabaseBrowser
      .from('staff')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        // Before reef-court-staff.sql has been run there is no staff table;
        // the database rules still decide what this account can see.
        if (error) setStaff('staff');
        else setStaff(data ? 'staff' : 'not-staff');
      });
  }, [userId]);

  if (session === undefined) return <p className="staff-wait">Loading…</p>;
  if (!session) return <StaffLogin />;
  if (staff === 'checking') return <p className="staff-wait">Checking your account…</p>;
  if (staff === 'not-staff') {
    return (
      <div className="staff-gate">
        <h1>Not on the staff list</h1>
        <p>
          {session.user.email} is signed in but isn&apos;t set up to see orders. Ask the manager to
          add you.
        </p>
        <button className="btn-s btn-s--quiet" onClick={() => supabaseBrowser.auth.signOut()}>
          Sign out
        </button>
      </div>
    );
  }
  return <Board email={session.user.email ?? ''} />;
}

function Board({ email }: { email: string }) {
  const [now, setNow] = useState(() => Date.now());
  const today = lagosYmd(new Date(now));
  const [day, setDay] = useState(today);
  const [orders, setOrders] = useState<Order[]>([]);
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading');
  const [live, setLive] = useState<boolean | null>(null); // null until the first connection attempt
  const [fresh, setFresh] = useState<Set<number>>(() => new Set());
  const [busy, setBusy] = useState<Set<number>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lane, setLane] = useState<Lane>('new');
  const [soundWanted, setSoundWanted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [printing, setPrinting] = useState<Order | null>(null);

  const dayRef = useRef(day);
  dayRef.current = day;
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  /** Paid order ids already seen, so only genuinely new ones ring. Null until the first load of today. */
  const known = useRef<Set<number> | null>(null);

  // --- New-order detection ---------------------------------------------------
  const noteArrivals = useCallback((rows: Order[]) => {
    if (dayRef.current !== lagosYmd(new Date())) return;
    const seen = known.current;
    const arrived = seen ? rows.filter((r) => r.status === 'confirmed' && !seen.has(r.id)) : [];
    known.current = new Set([...(seen ?? []), ...rows.map((r) => r.id)]);
    if (arrived.length) {
      setFresh((prev) => new Set([...prev, ...arrived.map((r) => r.id)]));
      setLane('new');
      if (soundRef.current) playChime();
    }
  }, []);

  // --- Loading ----------------------------------------------------------------
  const fetchDay = useCallback(
    async (ymd: string) => {
      const { start, end } = lagosDayRange(ymd);
      const { data, error } = await supabaseBrowser
        .from('bookings')
        .select(ORDER_COLUMNS)
        .neq('status', 'awaiting_payment')
        .gte('preferred_time', start.toISOString())
        .lt('preferred_time', end.toISOString())
        .order('preferred_time', { ascending: true });
      if (ymd !== dayRef.current) return; // staff switched day meanwhile
      if (error) {
        console.error('Loading orders failed', error);
        setLoad('error');
        return;
      }
      const rows = (data ?? []) as unknown as Order[];
      noteArrivals(rows);
      setOrders(rows);
      setLoad('ready');
    },
    [noteArrivals]
  );

  useEffect(() => {
    setLoad('loading');
    setOrders([]);
    void fetchDay(day);
  }, [day, fetchDay]);

  // Follow the calendar: if the board shows today when midnight passes, move to the new day.
  const prevToday = useRef(today);
  useEffect(() => {
    if (prevToday.current !== today) {
      if (dayRef.current === prevToday.current) setDay(today);
      prevToday.current = today;
    }
  }, [today]);

  // --- Realtime + safety nets ----------------------------------------------------
  useEffect(() => {
    const channel = supabaseBrowser
      .channel('staff-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((o) => o.id !== (payload.old as { id: number }).id));
          return;
        }
        const row = payload.new as Order;
        const onThisDay = lagosYmd(new Date(row.preferred_time)) === dayRef.current;
        if (!onThisDay || row.status === 'awaiting_payment') {
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
          return;
        }
        noteArrivals([row]);
        setOrders((prev) =>
          prev.some((o) => o.id === row.id)
            ? prev.map((o) => (o.id === row.id ? { ...o, ...row } : o))
            : [...prev, row]
        );
      })
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED');
        // (Re)connected: catch up on anything that happened while offline.
        if (status === 'SUBSCRIBED') void fetchDay(dayRef.current);
      });

    const poll = setInterval(() => void fetchDay(dayRef.current), POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 20 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
        void fetchDay(dayRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      void supabaseBrowser.removeChannel(channel);
      clearInterval(poll);
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchDay, noteArrivals]);

  // --- Sound -------------------------------------------------------------------
  useEffect(() => {
    let wanted = false;
    try {
      wanted = localStorage.getItem(SOUND_KEY) === 'on';
    } catch {}
    setSoundWanted(wanted);
    if (!wanted) return;
    // Browsers only allow sound after a tap on the page.
    const arm = () => void unlockChime().then(setSoundOn);
    window.addEventListener('pointerdown', arm, { once: true });
    return () => window.removeEventListener('pointerdown', arm);
  }, []);

  const toggleSound = async () => {
    const next = !(soundWanted && soundOn);
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {}
    setSoundWanted(next);
    if (next) {
      const ok = await unlockChime();
      setSoundOn(ok);
      if (ok) playChime();
      else setToast("This browser won't play sound. Keep the screen in view.");
    } else {
      setSoundOn(false);
    }
  };

  const newCount = orders.filter((o) => o.status === 'confirmed').length;
  const viewingToday = day === today;

  useEffect(() => {
    if (!soundOn || !viewingToday || newCount === 0) return;
    const id = setInterval(() => chimeReady() && playChime(), REMIND_MS);
    return () => clearInterval(id);
  }, [soundOn, viewingToday, newCount]);

  useEffect(() => {
    document.title = newCount && viewingToday ? `(${newCount}) New orders · Courtyard` : 'Orders · Courtyard';
  }, [newCount, viewingToday]);

  // --- Moving orders --------------------------------------------------------------
  const move = async (order: Order, to: OrderStatus) => {
    const from = order.status;
    const updated_at = new Date().toISOString();
    setBusy((b) => new Set(b).add(order.id));
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: to, updated_at } : o)));
    setFresh((f) => {
      const n = new Set(f);
      n.delete(order.id);
      return n;
    });

    const { data, error } = await supabaseBrowser
      .from('bookings')
      .update({ status: to, updated_at })
      .eq('id', order.id)
      .select('id');

    if (error || !data?.length) {
      console.error('Status update failed', error);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: from } : o)));
      setToast(`Couldn't update order #${order.id}. Check the connection and try again.`);
    }
    setBusy((b) => {
      const n = new Set(b);
      n.delete(order.id);
      return n;
    });
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  // --- Printing a slip -------------------------------------------------------------
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(null);
    window.addEventListener('afterprint', done, { once: true });
    const id = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('afterprint', done);
    };
  }, [printing]);

  // --- Derived views -----------------------------------------------------------------
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [
        `#${o.id}`,
        String(o.id),
        o.customer_name,
        o.customer_phone,
        `${o.house_number} ${o.street_name}`,
        o.payment_reference,
      ].some((v) => v.toLowerCase().includes(q))
    );
  }, [orders, query]);

  const lanes = useMemo(() => {
    const out: Record<Lane, Order[]> = { new: [], preparing: [], ready: [], done: [] };
    for (const o of visible) {
      const l = laneOf(o.status);
      if (l) out[l].push(o);
    }
    const byDue = (a: Order, b: Order) => a.preferred_time.localeCompare(b.preferred_time);
    out.new.sort(byDue);
    out.preparing.sort(byDue);
    out.ready.sort(byDue);
    out.done.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
    return out;
  }, [visible]);

  const stats = useMemo(() => {
    const kept = orders.filter((o) => o.status !== 'cancelled');
    const open = orders.filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status));
    return {
      orders: kept.length,
      revenue: kept.reduce((n, o) => n + o.total_kobo, 0) / 100,
      open: open.length,
      late: open.filter((o) => dueIn(o.preferred_time, now).tone === 'late').length,
      cancelled: orders.length - kept.length,
    };
  }, [orders, now]);

  return (
    <div className="staff">
      <header className="staff-bar">
        <Link href="/" className="staff-bar__brand" title="Back to the website">
          <Logo alt="" sizes="40px" className="staff-bar__logo" />
          <span>
            <small>The Courtyard Cafe</small>
            <strong>Delivery orders</strong>
          </span>
        </Link>
        <div className="staff-bar__right">
          <span
            className={`staff-live ${live ? 'is-live' : live === null ? 'is-wait' : ''}`}
            title={live ? 'New orders appear instantly' : 'Not live yet. Checking for new orders every minute.'}
          >
            <span className="staff-live__text">{live ? 'Live' : live === null ? 'Connecting' : 'Offline'}</span>
          </span>
          <button
            className={`btn-s ${soundWanted && soundOn ? 'btn-s--on' : 'btn-s--quiet'}`}
            onClick={toggleSound}
            aria-pressed={soundWanted && soundOn}
            aria-label={soundWanted && soundOn ? 'Sound on. Tap to mute.' : 'Sound off. Tap to turn on.'}
          >
            <SoundIcon on={soundWanted && soundOn} />
            <span className="staff-bar__label">{soundWanted && soundOn ? 'Sound on' : 'Sound off'}</span>
          </button>
          <button className="btn-s btn-s--quiet" title={email} onClick={() => supabaseBrowser.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {!(soundWanted && soundOn) && viewingToday && (
        <div className="staff-banner">
          <span>
            {soundWanted
              ? 'Sound was paused when the page reloaded.'
              : 'Turn on sound so this screen rings when a new order is paid.'}
          </span>
          <button className="btn-s btn-s--on" onClick={toggleSound}>
            {soundWanted ? 'Turn sound back on' : 'Turn on sound'}
          </button>
        </div>
      )}

      <div className="staff-tools">
        <div className="staff-day" role="group" aria-label="Which day">
          <button className="btn-s btn-s--quiet" aria-label="Previous day" onClick={() => setDay(shiftYmd(day, -1))}>
            ‹
          </button>
          <label className="staff-day__pick">
            <span>{dayLabel(day, today)}</span>
            <input
              type="date"
              value={day}
              max={today}
              onChange={(e) => e.target.value && setDay(e.target.value)}
              aria-label="Pick a day"
            />
          </label>
          <button
            className="btn-s btn-s--quiet"
            aria-label="Next day"
            disabled={day >= today}
            onClick={() => setDay(shiftYmd(day, 1))}
          >
            ›
          </button>
          {!viewingToday && (
            <button className="btn-s btn-s--quiet" onClick={() => setDay(today)}>
              Back to today
            </button>
          )}
        </div>
        <input
          className="staff-search"
          type="search"
          placeholder="Search name, phone, house, order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search orders"
        />
      </div>

      <dl className="staff-stats">
        <div>
          <dt>Orders</dt>
          <dd>{stats.orders}</dd>
        </div>
        <div>
          <dt>Takings</dt>
          <dd>{formatNaira(stats.revenue)}</dd>
        </div>
        <div>
          <dt>To deliver</dt>
          <dd>{stats.open}</dd>
        </div>
        <div className={stats.late ? 'is-late' : ''}>
          <dt>Late</dt>
          <dd>{stats.late}</dd>
        </div>
      </dl>

      {load === 'error' && (
        <div className="staff-error">
          Couldn&apos;t load orders. Check the internet connection.{' '}
          <button className="btn-s btn-s--quiet" onClick={() => void fetchDay(day)}>
            Try again
          </button>
        </div>
      )}

      <nav className="staff-tabs" aria-label="Order stages">
        {LANES.map((l) => (
          <button
            key={l.id}
            className={lane === l.id ? 'is-active' : ''}
            aria-pressed={lane === l.id}
            onClick={() => setLane(l.id)}
          >
            {l.short}
            <span className={`staff-count ${l.id === 'new' && lanes.new.length ? 'is-hot' : ''}`}>
              {lanes[l.id].length}
            </span>
          </button>
        ))}
      </nav>

      <div className="board">
        {LANES.map((l) => (
          <section key={l.id} className={`lane lane--${l.id} ${lane === l.id ? 'is-active' : ''}`} aria-label={l.title}>
            <h2 className="lane__head">
              {l.title}
              <span className={`staff-count ${l.id === 'new' && lanes.new.length ? 'is-hot' : ''}`}>
                {lanes[l.id].length}
              </span>
            </h2>
            <p className="lane__hint">{l.hint}</p>
            {load === 'loading' ? (
              <div className="lane__empty">Loading…</div>
            ) : lanes[l.id].length === 0 ? (
              <div className="lane__empty">
                {query ? 'No matches' : l.id === 'new' ? 'No new orders' : 'Nothing here'}
              </div>
            ) : (
              l.id === 'done' ? (
                <div className="done-list">
                  {lanes.done.map((o) => (
                    <DoneRow key={o.id} order={o} busy={busy.has(o.id)} onMove={move} onPrint={setPrinting} />
                  ))}
                </div>
              ) : (
              lanes[l.id].map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  now={now}
                  fresh={fresh.has(o.id) && o.status === 'confirmed'}
                  busy={busy.has(o.id)}
                  onMove={move}
                  onPrint={setPrinting}
                />
              ))
              )
            )}
          </section>
        ))}
      </div>

      {stats.cancelled > 0 && (
        <p className="staff-foot">
          {stats.cancelled} cancelled order{stats.cancelled === 1 ? '' : 's'} not counted in takings.
        </p>
      )}

      {toast && (
        <div className="staff-toast" role="status">
          {toast}
        </div>
      )}

      {printing && (
        <div className="print-only">
          <PrintTicket order={printing} />
        </div>
      )}
    </div>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <path d="m16 9 6 6m0-6-6 6" />
      )}
    </svg>
  );
}
