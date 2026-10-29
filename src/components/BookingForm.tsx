'use client';

import { useEffect, useMemo, useState } from 'react';
import { MAX_QUANTITY, formatNaira, orderGroups, orderItemsById } from '@/lib/order-menu';
import { DELIVERY_FEE_NAIRA, deliverySlots, type DeliverySlot } from '@/lib/delivery';

/**
 * Delivery order form for Reef Court Estate residents, all in the browser:
 * pick items, give an address and a time, then pay on Paystack's checkout
 * page. /api/checkout re-checks and re-prices everything before payment.
 */

interface Street {
  id: number;
  street_name: string;
}

type Cart = Record<string, number>;

const CART_KEY = 'courtyard-cart';

function loadCart(): Cart {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    const parsed = raw ? (JSON.parse(raw) as Cart) : {};
    // Drop anything that's left the menu since the cart was saved.
    return Object.fromEntries(Object.entries(parsed).filter(([id]) => orderItemsById.has(id)));
  } catch {
    return {};
  }
}

function saveCart(cart: Cart) {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Private mode or storage blocked: the cart just won't survive a reload.
  }
}

export default function BookingForm() {
  const [step, setStep] = useState<'menu' | 'details'>('menu');
  const [cart, setCart] = useState<Cart>({});
  const [groupIndex, setGroupIndex] = useState(0);

  const [details, setDetails] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    house_number: '',
    preferred_time: '',
    notes: '',
  });
  const [streetId, setStreetId] = useState<number | ''>('');
  const [streets, setStreets] = useState<Street[]>([]);
  const [houses, setHouses] = useState<string[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);

  const [loadingHouses, setLoadingHouses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCart(loadCart());
    setSlots(deliverySlots());
  }, []);

  useEffect(() => {
    fetch('/api/validate-address/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'streets' }),
    })
      .then((res) => res.json())
      .then((data) => setStreets(data.streets || []))
      .catch(() => setError("Couldn't load the estate streets. Refresh to try again."));
  }, []);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => ({ item: orderItemsById.get(id)!, quantity }))
        .filter((l) => l.item && l.quantity > 0),
    [cart],
  );
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.item.priceNaira * l.quantity, 0);
  const total = subtotal + DELIVERY_FEE_NAIRA;

  const setQuantity = (id: string, quantity: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(quantity, MAX_QUANTITY);
      saveCart(next);
      return next;
    });
  };

  const handleStreetChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setStreetId(Number.isNaN(id) ? '' : id);
    setDetails((prev) => ({ ...prev, house_number: '' }));
    setHouses([]);
    if (Number.isNaN(id)) return;

    setLoadingHouses(true);
    try {
      const res = await fetch('/api/validate-address/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'houses', street_id: id }),
      });
      const data = await res.json();
      setHouses(data.houses?.map((h: { house_number: string }) => h.house_number) || []);
    } catch {
      setError("Couldn't load house numbers. Try choosing the street again.");
    } finally {
      setLoadingHouses(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!details.customer_name.trim()) return setError('Enter your name');
    if (details.customer_phone.replace(/\D/g, '').length < 10) return setError('Enter a valid phone number');
    if (!streetId || !details.house_number) return setError('Choose your street and house');
    if (!details.preferred_time) return setError('Choose a delivery time');

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...details,
          street_id: streetId,
          items: lines.map((l) => ({ id: l.item.id, quantity: l.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('No connection. Check your internet and try again.');
      setSubmitting(false);
    }
  };

  if (step === 'menu') {
    const group = orderGroups[groupIndex];
    return (
      <div className="order-menu">
        <div className="order-tabs" role="tablist" aria-label="Menu sections">
          {orderGroups.map((g, i) => (
            <button
              key={g.title}
              type="button"
              role="tab"
              aria-selected={i === groupIndex}
              className={`order-tab${i === groupIndex ? ' is-active' : ''}`}
              onClick={() => setGroupIndex(i)}
            >
              {g.title}
            </button>
          ))}
        </div>

        <ul className="order-items">
          {group.items.map((item) => {
            const quantity = cart[item.id] ?? 0;
            return (
              <li key={item.id} className="order-item">
                <div className="order-item__text">
                  <span className="order-item__name">{item.name}</span>
                  {item.description && <span className="order-item__desc">{item.description}</span>}
                  <span className="order-item__price">{formatNaira(item.priceNaira)}</span>
                </div>
                {quantity === 0 ? (
                  <button type="button" className="order-add" onClick={() => setQuantity(item.id, 1)}>
                    Add
                  </button>
                ) : (
                  <div className="order-stepper" aria-label={`${item.name} quantity`}>
                    <button type="button" aria-label="One less" onClick={() => setQuantity(item.id, quantity - 1)}>
                      −
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      aria-label="One more"
                      disabled={quantity >= MAX_QUANTITY}
                      onClick={() => setQuantity(item.id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="order-bar">
          <span>
            {itemCount === 0 ? 'Nothing added yet' : `${itemCount} item${itemCount === 1 ? '' : 's'} · ${formatNaira(subtotal)}`}
          </span>
          <button
            type="button"
            className="booking-submit"
            disabled={itemCount === 0 || slots.length === 0}
            onClick={() => {
              setStep('details');
              window.scrollTo({ top: 0 });
            }}
          >
            Continue
          </button>
        </div>
        {slots.length === 0 && (
          <p className="booking-hint order-closed">
            Delivery is closed for today. You can still browse the menu.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="booking-form">
      <button type="button" className="order-back" onClick={() => setStep('menu')}>
        ← Edit order
      </button>

      <div className="order-receipt">
        <ul>
          {lines.map((l) => (
            <li key={l.item.id}>
              <span>
                {l.quantity} × {l.item.name}
              </span>
              <span>{formatNaira(l.item.priceNaira * l.quantity)}</span>
            </li>
          ))}
          {DELIVERY_FEE_NAIRA > 0 && (
            <li>
              <span>Delivery</span>
              <span>{formatNaira(DELIVERY_FEE_NAIRA)}</span>
            </li>
          )}
        </ul>
        <p className="order-receipt__total">
          <span>Total</span>
          <span>{formatNaira(total)}</span>
        </p>
      </div>

      {error && <div className="booking-error">{error}</div>}

      <div className="booking-field">
        <label htmlFor="customer_name">Name</label>
        <input
          id="customer_name"
          type="text"
          autoComplete="name"
          value={details.customer_name}
          onChange={(e) => setDetails((prev) => ({ ...prev, customer_name: e.target.value }))}
          required
        />
      </div>

      <div className="booking-field">
        <label htmlFor="customer_phone">Phone number</label>
        <input
          id="customer_phone"
          type="tel"
          autoComplete="tel"
          value={details.customer_phone}
          onChange={(e) => setDetails((prev) => ({ ...prev, customer_phone: e.target.value }))}
          placeholder="0803 000 0000"
          required
        />
      </div>

      <div className="booking-field">
        <label htmlFor="customer_email">Email</label>
        <input
          id="customer_email"
          type="email"
          autoComplete="email"
          value={details.customer_email}
          onChange={(e) => setDetails((prev) => ({ ...prev, customer_email: e.target.value }))}
          required
        />
        <p className="booking-hint">Paystack sends your receipt here.</p>
      </div>

      <div className="booking-field">
        <label htmlFor="street_id">Street</label>
        <select id="street_id" value={streetId} onChange={handleStreetChange} required>
          <option value="">Select street</option>
          {streets.map((street) => (
            <option key={street.id} value={street.id}>
              {street.street_name}
            </option>
          ))}
        </select>
      </div>

      <div className="booking-field">
        <label htmlFor="house_number">House number</label>
        <select
          id="house_number"
          value={details.house_number}
          onChange={(e) => setDetails((prev) => ({ ...prev, house_number: e.target.value }))}
          disabled={!streetId || houses.length === 0}
          required
        >
          <option value="">{loadingHouses ? 'Loading…' : 'Select house'}</option>
          {houses.map((house) => (
            <option key={house} value={house}>
              {house}
            </option>
          ))}
        </select>
      </div>

      <div className="booking-field">
        <label htmlFor="preferred_time">Delivery time (today)</label>
        <select
          id="preferred_time"
          value={details.preferred_time}
          onChange={(e) => setDetails((prev) => ({ ...prev, preferred_time: e.target.value }))}
          required
        >
          <option value="">Select a time</option>
          {slots.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>

      <div className="booking-field">
        <label htmlFor="notes">Notes (optional)</label>
        <input
          id="notes"
          type="text"
          maxLength={300}
          value={details.notes}
          onChange={(e) => setDetails((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Eggs scrambled, no onions…"
        />
      </div>

      <button type="submit" disabled={submitting} className="booking-submit">
        {submitting ? 'Opening Paystack…' : `Pay ${formatNaira(total)}`}
      </button>

      <p className="booking-footnote">
        Only Reef Court Estate residents can order. Same-day delivery only.
      </p>
    </form>
  );
}
