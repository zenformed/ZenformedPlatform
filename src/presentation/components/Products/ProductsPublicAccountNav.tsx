'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { platformDashboardNavigation as dashboardNav } from '@/platform/navigation/platformDashboardNavigation';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { parseUserSettingsEnvelopeJson } from '@/infrastructure/coreApi/parseResponse';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from '../../../../app/products/products.module.css';

function PersonIcon(): ReactElement {
  return (
    <svg
      className={styles.accountNavPersonIcon}
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="3.5" fill="currentColor" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon(): ReactElement {
  return (
    <svg
      className={styles.accountNavChevron}
      viewBox="0 0 16 16"
      width={12}
      height={12}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveAccountFirstName(
  settingsFirstName: string | null,
  userMetadata: unknown,
  email: string | null | undefined
): string {
  const fromSettings = settingsFirstName?.trim();
  if (fromSettings) return fromSettings;

  if (userMetadata != null && typeof userMetadata === 'object') {
    const firstName = (userMetadata as Record<string, unknown>).first_name;
    if (typeof firstName === 'string' && firstName.trim() !== '') {
      return firstName.trim();
    }
  }

  const normalizedEmail = email?.trim() ?? '';
  if (normalizedEmail) {
    const localPart = normalizedEmail.split('@')[0]?.trim();
    if (localPart) return localPart;
  }

  return 'Account';
}

export function ProductsPublicAccountNav(): ReactElement {
  const pathname = usePathname();
  const { session, user, loading } = useSaaSProfile();
  const { signOut } = usePlatformAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = session?.access_token?.trim() ?? '';
    if (!token) {
      setFirstName(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(dashboardNav.apis.usersMeSettings, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok || cancelled) return;
        const json: unknown = await res.json();
        const parsed = parseUserSettingsEnvelopeJson(json);
        if (!cancelled) {
          setFirstName(parsed?.settings.firstName ?? null);
        }
      } catch {
        if (!cancelled) setFirstName(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent): void => {
      if (menuRef.current != null && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  if (loading) {
    return <span className={styles.accountNavPlaceholder} aria-hidden />;
  }

  if (session == null || user == null) {
    return (
      <Link href={nav.routes.login} className={styles.headerLink}>
        Sign in
      </Link>
    );
  }

  const displayName = resolveAccountFirstName(firstName, user.user_metadata, user.email);

  return (
    <div className={styles.accountNavWrap} ref={menuRef}>
      <button
        type="button"
        className={styles.accountNavPill}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <PersonIcon />
        <span className={styles.accountNavName}>{displayName}</span>
        <ChevronDownIcon />
      </button>
      {menuOpen ? (
        <div className={styles.accountNavMenu} role="menu">
          <Link
            href={dashboardNav.routes.dashboard}
            className={styles.accountNavMenuItem}
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <button
            type="button"
            className={styles.accountNavMenuItem}
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              void signOut({ redirectTo: pathname ?? nav.routes.products });
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
