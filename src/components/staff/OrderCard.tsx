'use client';

import { useState } from 'react';
import { formatNaira } from '@/lib/order-menu';
import { BACK, NEXT, STATUS_LABEL, type Order, type OrderStatus } from './types';
import { ago, clock, dueIn } from './time';

/** Nigerian numbers as wa.me wants them: 0803… or +234 803… -> 234803… */
export function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
}

interface Props {
  order: Order;
  now: number;
  fresh: boolean;
  busy: boolean;
  onMove: (order: Order, to: OrderStatus) => void;
  onPrint: (order: Order) => void;
}

export default function OrderCard({ order, now, fresh, busy, onMove, onPrint }: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const next = NEXT[order.status];
  const back = BACK[order.status];
  const open = order.status !== 'delivered' && order.status !== 'cancelled';
  const due = dueIn(order.preferred_time, now);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const total = order.total_kobo / 100;

  return (
    <article
      className={[
        'order',
        `order--${order.status}`,
        open && due.tone === 'late' ? 'order--late' : '',
        fresh ? 'order--fresh' : '',
      ].join(' ')}
      aria-label={`Order ${order.id} for ${order.customer_name}`}
    >
      <header className="order__head">
        <div className="order__due">
          <span className="order__time">
            <small>Due</small> {clock(order.preferred_time)}
          </span>
          {open ? (
            <span className={`order__countdown order__countdown--${due.tone}`}>{due.text}</span>
          ) : (
            <span className={`order__state order__state--${order.status}`}>
              {STATUS_LABEL[order.status]}
            </span>
          )}
        </div>
        <span className="order__num">#{order.id}</span>
      </header>

      <div className="order__who">
        <p className="order__name">
          {fresh && <span className="order__new-tag">New</span>}
          {order.customer_name}
        </p>
        <p className="order__addr">
          {order.house_number} {order.street_name}
        </p>
        <div className="order__contact">
          <a href={`tel:${order.customer_phone.replace(/\s/g, '')}`}>Call {order.customer_phone}</a>
          <a
            href={`https://wa.me/${whatsappNumber(order.customer_phone)}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <ul className="order__items">
        {order.items.map((item, i) => (
          <li key={`${item.id ?? item.name}-${i}`}>
            <span className="order__qty">{item.quantity}×</span>
            <span className="order__item">{item.name}</span>
            <span className="order__price">{formatNaira(item.price_naira * item.quantity)}</span>
          </li>
        ))}
      </ul>

      {order.notes && <p className="order__notes">{order.notes}</p>}

      <div className="order__total">
        <span>
          {itemCount} item{itemCount === 1 ? '' : 's'} · paid {ago(order.paid_at ?? order.created_at, now)}
        </span>
        <strong>{formatNaira(total)}</strong>
      </div>

      {confirmCancel ? (
        <div className="order__confirm" role="alert">
          <p>
            Cancel this order? The customer has paid {formatNaira(total)}. Refund it in Paystack
            (Transactions, reference <code>{order.payment_reference}</code>) and let them know.
          </p>
          <div className="order__actions">
            <button
              className="btn-s btn-s--danger"
              disabled={busy}
              onClick={() => {
                onMove(order, 'cancelled');
                setConfirmCancel(false);
              }}
            >
              Yes, cancel order
            </button>
            <button className="btn-s btn-s--quiet" onClick={() => setConfirmCancel(false)}>
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="order__actions">
          {next && (
            <button
              className={`btn-s btn-s--go btn-s--to-${next.to}`}
              disabled={busy}
              onClick={() => onMove(order, next.to)}
            >
              {next.label}
            </button>
          )}
          <div className="order__minor">
            {back && (
              <button className="btn-s btn-s--quiet" disabled={busy} onClick={() => onMove(order, back.to)}>
                {back.label}
              </button>
            )}
            <button className="btn-s btn-s--quiet" onClick={() => onPrint(order)}>
              Print
            </button>
            {open && (
              <button className="btn-s btn-s--quiet btn-s--warn" disabled={busy} onClick={() => setConfirmCancel(true)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/** A finished order (delivered or cancelled): one compact row. */
export function DoneRow({
  order,
  busy,
  onMove,
  onPrint,
}: {
  order: Order;
  busy: boolean;
  onMove: (order: Order, to: OrderStatus) => void;
  onPrint: (order: Order) => void;
}) {
  const back = BACK[order.status];
  return (
    <article className={`done-row done-row--${order.status}`} aria-label={`Order ${order.id} for ${order.customer_name}`}>
      <span className="done-row__time">{clock(order.preferred_time)}</span>
      <span className="done-row__who">
        <strong>
          #{order.id} {order.customer_name}
        </strong>
        <span>
          {order.house_number} {order.street_name}
        </span>
      </span>
      <span className={`done-row__state order__state--${order.status}`}>{STATUS_LABEL[order.status]}</span>
      <span className="done-row__total">{formatNaira(order.total_kobo / 100)}</span>
      <span className="done-row__actions">
        {back && (
          <button className="btn-s btn-s--quiet" disabled={busy} onClick={() => onMove(order, back.to)}>
            Undo
          </button>
        )}
        <button className="btn-s btn-s--quiet" onClick={() => onPrint(order)}>
          Print
        </button>
      </span>
    </article>
  );
}

/** The kitchen/rider slip, shown only when printing. */
export function PrintTicket({ order }: { order: Order }) {
  return (
    <div className="ticket">
      <p className="ticket__brand">The Courtyard Cafe · Delivery</p>
      <p className="ticket__big">#{order.id} · {clock(order.preferred_time)}</p>
      <p>
        <strong>{order.customer_name}</strong>
        <br />
        {order.house_number} {order.street_name}, Reef Court
        <br />
        {order.customer_phone}
      </p>
      <hr />
      <ul>
        {order.items.map((item, i) => (
          <li key={`${item.id ?? item.name}-${i}`}>
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatNaira(item.price_naira * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {order.notes && <p className="ticket__notes">Note: {order.notes}</p>}
      <hr />
      <p className="ticket__row">
        <span>Delivery</span>
        <span>{formatNaira(order.delivery_fee_naira)}</span>
      </p>
      <p className="ticket__row ticket__big">
        <span>PAID</span>
        <span>{formatNaira(order.total_kobo / 100)}</span>
      </p>
      <p className="ticket__ref">{order.payment_reference}</p>
    </div>
  );
}
