export type OrderStatus =
  | 'awaiting_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  street_name: string;
  house_number: string;
  preferred_time: string;
  notes: string | null;
  items: { id?: string; name: string; group?: string; quantity: number; price_naira: number }[];
  subtotal_naira: number;
  delivery_fee_naira: number;
  total_kobo: number;
  status: OrderStatus;
  payment_reference: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export const ORDER_COLUMNS =
  'id, customer_name, customer_phone, customer_email, street_name, house_number, preferred_time, notes, items, subtotal_naira, delivery_fee_naira, total_kobo, status, payment_reference, paid_at, created_at, updated_at';

export type Lane = 'new' | 'preparing' | 'ready' | 'done';

export const LANES: { id: Lane; title: string; short: string; hint: string }[] = [
  { id: 'new', title: 'New', short: 'New', hint: 'Paid, not started' },
  { id: 'preparing', title: 'Preparing', short: 'Cooking', hint: 'In the kitchen' },
  { id: 'ready', title: 'Ready to send', short: 'Ready', hint: 'Waiting for a rider' },
  { id: 'done', title: 'Done', short: 'Done', hint: 'Delivered or cancelled' },
];

export function laneOf(status: OrderStatus): Lane | null {
  switch (status) {
    case 'confirmed':
      return 'new';
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'delivered':
    case 'cancelled':
      return 'done';
    default:
      return null; // awaiting_payment never reaches staff
  }
}

/** The one button that moves an order forward, and the step back if staff tapped too soon. */
export const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  confirmed: { to: 'preparing', label: 'Start preparing' },
  preparing: { to: 'ready', label: 'Ready to send' },
  ready: { to: 'delivered', label: 'Mark delivered' },
};

export const BACK: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  preparing: { to: 'confirmed', label: 'Back to new' },
  ready: { to: 'preparing', label: 'Back to preparing' },
  delivered: { to: 'ready', label: 'Undo delivered' },
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  confirmed: 'New',
  preparing: 'Preparing',
  ready: 'Ready to send',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
