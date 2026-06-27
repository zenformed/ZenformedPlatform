'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  PLATFORM_PUBLIC_NAV_ITEMS,
} from '@/platform/navigation/platformPublicNav';
import {
  resolvePlatformPublicNavId,
  shouldShowPlatformPublicNavMenu,
} from '@/platform/navigation/resolvePlatformPublicNavId';
import styles from '../../../../app/products/products.module.css';

function MoreIcon(): ReactElement {
  return (
    <svg
      className={styles.platformNavMenuIcon}
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="3" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="13" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function ProductsPublicNavMenu(): ReactElement | null {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeNavItem = resolvePlatformPublicNavId(pathname);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      if (menuRef.current != null && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  if (!shouldShowPlatformPublicNavMenu(pathname)) {
    return null;
  }

  return (
    <div className={styles.platformNavMenuWrap} ref={menuRef}>
      <button
        type="button"
        className={styles.platformNavMenuButton}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Platform navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MoreIcon />
      </button>
      {menuOpen ? (
        <div className={styles.platformNavMenu} role="menu">
          {PLATFORM_PUBLIC_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeNavItem;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={
                  isActive
                    ? `${styles.accountNavMenuItem} ${styles.platformNavMenuItemActive}`
                    : styles.accountNavMenuItem
                }
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
