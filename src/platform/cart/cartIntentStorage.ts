import { parseCartCheckoutIntent, type CartCheckoutIntent } from '@/platform/cart/cartIntentTypes';

export const CART_INTENT_STORAGE_KEY = 'zenformed-platform_cart-intent';

export function readCartIntentFromStorage(): CartCheckoutIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CART_INTENT_STORAGE_KEY);
    if (raw == null || raw.trim() === '') return null;
    return parseCartCheckoutIntent(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeCartIntentToStorage(intent: CartCheckoutIntent): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_INTENT_STORAGE_KEY, JSON.stringify(intent));
}

export function clearCartIntentStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CART_INTENT_STORAGE_KEY);
}
