'use client';

import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  useMobileDrawerClose,
  ZenformedSidebarActionRow,
} from '@zenformed/core/dashboard-shell';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { useCartIntent } from '@/presentation/providers/CartIntentProvider';
import styles from './PlatformCollapsibleSidebar.module.css';

function CartIconWithBadge({ count }: { count: number }): ReactElement {
  return (
    <span className={styles.cartIconWrap}>
      <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden focusable="false">
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
      {count > 0 ? (
        <span className={styles.cartBadge} aria-hidden>
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </span>
  );
}

function resolveCartItemCount(intent: unknown): number {
  return intent == null ? 0 : 1;
}

export type PlatformSidebarCartRowProps = {
  readonly showLabel?: boolean;
};

/**
 * OTHER leading row: Cart — always visible above Notifications.
 * Badge shows when cart intent is present (badge count troubleshooting separate).
 */
export function PlatformSidebarCartRow({
  showLabel = true,
}: PlatformSidebarCartRowProps): ReactElement {
  const router = useRouter();
  const closeMobileDrawer = useMobileDrawerClose();
  const { intent, hydrated } = useCartIntent();

  const itemCount = hydrated ? resolveCartItemCount(intent) : 0;
  const itemLabel =
    itemCount === 0 ? 'Cart' : itemCount === 1 ? 'Cart, 1 item' : `Cart, ${itemCount} items`;

  return (
    <ZenformedSidebarActionRow
      asButton
      showLabel={showLabel}
      label="Cart"
      title="Cart"
      ariaLabel={itemLabel}
      icon={<CartIconWithBadge count={itemCount} />}
      onClick={() => {
        router.push(nav.routes.cart);
        closeMobileDrawer?.();
      }}
    />
  );
}
