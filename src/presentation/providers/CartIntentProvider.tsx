'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { CartCheckoutIntent } from '@/platform/cart/cartIntentTypes';
import {
  clearCartIntentStorage,
  readCartIntentFromStorage,
  writeCartIntentToStorage,
} from '@/platform/cart/cartIntentStorage';

export type CartIntentContextValue = {
  readonly intent: CartCheckoutIntent | null;
  readonly hydrated: boolean;
  readonly saveIntent: (intent: CartCheckoutIntent) => void;
  readonly clearIntent: () => void;
};

const CartIntentContext = createContext<CartIntentContextValue | null>(null);

export type CartIntentProviderProps = {
  readonly children: ReactNode;
};

export function CartIntentProvider({ children }: CartIntentProviderProps): ReactElement {
  const [intent, setIntent] = useState<CartCheckoutIntent | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIntent(readCartIntentFromStorage());
    setHydrated(true);
  }, []);

  const saveIntent = useCallback((next: CartCheckoutIntent) => {
    writeCartIntentToStorage(next);
    setIntent(next);
  }, []);

  const clearIntent = useCallback(() => {
    clearCartIntentStorage();
    setIntent(null);
  }, []);

  const value = useMemo<CartIntentContextValue>(
    () => ({
      intent,
      hydrated,
      saveIntent,
      clearIntent,
    }),
    [intent, hydrated, saveIntent, clearIntent]
  );

  return <CartIntentContext.Provider value={value}>{children}</CartIntentContext.Provider>;
}

export function useCartIntent(): CartIntentContextValue {
  const context = useContext(CartIntentContext);
  if (context == null) {
    throw new Error('useCartIntent must be used within CartIntentProvider');
  }
  return context;
}
