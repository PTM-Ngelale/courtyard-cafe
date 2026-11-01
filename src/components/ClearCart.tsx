'use client';

import { useEffect } from 'react';

/** Where the order form keeps the cart (this tab only). */
export const CART_KEY = 'courtyard-cart';

/** Empties the saved cart. Rendered on the confirmation page once payment is confirmed. */
export default function ClearCart() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(CART_KEY);
    } catch {
      // Storage blocked: nothing was saved, so nothing to clear.
    }
  }, []);
  return null;
}
