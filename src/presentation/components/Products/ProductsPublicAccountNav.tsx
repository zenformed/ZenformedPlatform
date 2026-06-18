'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { resolveAccountMenuDisplayName } from '@zenformed/core/dashboard-shell';
import { platformDashboardNavigation as dashboardNav } from '@/platform/navigation/platformDashboardNavigation';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { resolvePlatformAccountMenuUser } from '@/platform/auth/resolvePlatformAccountMenuUser';
import { parseUserSettingsEnvelopeJson } from '@/infrastructure/coreApi/parseResponse';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { PlatformCartNavButton } from '@/presentation/components/Cart/PlatformCartNavButton';
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

export function ProductsPublicAccountNav(): ReactElement {
  const pathname = usePathname();
  const { session, user, loading } = useSaaSProfile();
  const { signOut } = usePlatformAuth();
  const [settingsFirstName, setSettingsFirstName] = useState<string | null>(null);
  const [settingsLastName, setSettingsLastName] = useState<string | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = session?.access_token?.trim() ?? '';
    if (!token) {
      setSettingsFirstName(null);
      setSettingsLastName(null);
      setSettingsReady(false);
      return;
    }

    let cancelled = false;
    setSettingsReady(false);

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
          setSettingsFirstName(parsed?.settings.firstName ?? null);
          setSettingsLastName(parsed?.settings.lastName ?? null);
        }
      } catch {
        if (!cancelled) {
          setSettingsFirstName(null);
          setSettingsLastName(null);
        }
      } finally {
        if (!cancelled) {
          setSettingsReady(true);
        }
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

  const displayName = useMemo(() => {
    if (user?.email == null) return '';
    const identity = resolvePlatformAccountMenuUser(user.email, user.user_metadata);
    return resolveAccountMenuDisplayName({
      ...identity,
      firstName: settingsFirstName ?? identity.firstName ?? null,
      lastName: settingsLastName ?? identity.lastName ?? null,
    });
  }, [settingsFirstName, settingsLastName, user]);

  const canShowName = displayName !== '' || settingsReady;

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

  return (
    <>
      <PlatformCartNavButton />
      <div className={styles.accountNavWrap} ref={menuRef}>
        <button
          type="button"
          className={styles.accountNavPill}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={canShowName && displayName ? `Account menu, ${displayName}` : 'Account menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PersonIcon />
          {canShowName ? (
            <span className={styles.accountNavName}>{displayName || 'Account'}</span>
          ) : (
            <span className={styles.accountNavNamePending} aria-hidden />
          )}
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
    </>
  );
}
