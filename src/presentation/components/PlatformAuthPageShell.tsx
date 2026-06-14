'use client';

import type { ReactElement, ReactNode } from 'react';
import { zenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { Card } from '@/presentation/components/Card/Card';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import styles from './platformAuthPage.module.css';

export type PlatformAuthPageShellProps = {
  readonly cardTitle: string;
  readonly children: ReactNode;
  readonly loading?: boolean;
  readonly loadingMessage?: string;
  /** Ecosystem app icon id from `@zenformed/core` catalog (default `platform`). */
  readonly brandIconId?: string;
  readonly brandName?: string;
};

export function PlatformAuthPageShell({
  cardTitle,
  children,
  loading = false,
  loadingMessage = 'Loading…',
  brandIconId = 'platform',
  brandName = platformAppDefinition.displayName,
}: PlatformAuthPageShellProps): ReactElement {
  const brandIconSrc = zenformedAppIconSrc(brandIconId);

  return (
    <div className={styles.page}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>
      <div className={styles.brandBlock}>
        {brandIconSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={brandIconSrc}
            alt=""
            className={styles.brandIcon}
            width={40}
            height={40}
          />
        ) : null}
        <span className={styles.brandName}>{brandName}</span>
      </div>
      <Card title={cardTitle} className={styles.card}>
        {loading ? <p className={styles.loading}>{loadingMessage}</p> : children}
      </Card>
    </div>
  );
}
