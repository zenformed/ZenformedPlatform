'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { useCartIntent } from '@/presentation/providers/CartIntentProvider';
import styles from './platformCartNav.module.css';

function CartIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true" focusable="false">
      <path
        d="M6 6h15l-1.5 9h-12L6 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 6 5 3H2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.25" fill="currentColor" />
      <circle cx="18" cy="20" r="1.25" fill="currentColor" />
    </svg>
  );
}

function resolveCartItemCount(intent: unknown): number {
  return intent == null ? 0 : 1;
}

export function PlatformCartNavButton(): ReactElement | null {
  const { intent, hydrated } = useCartIntent();

  if (!hydrated) return null;

  const itemCount = resolveCartItemCount(intent);
  if (itemCount === 0) return null;

  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;

  return (
    <Link
      href={nav.routes.cart}
      className={styles.link}
      aria-label={`Cart, ${itemLabel}`}
    >
      <span className={styles.icon}>
        <CartIcon />
      </span>
      <span className={styles.badge} aria-hidden="true">
        {itemCount}
      </span>
    </Link>
  );
}
