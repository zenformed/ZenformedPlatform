'use client';

import type { ReactElement, ReactNode } from 'react';
import { Card } from '@/presentation/components/Card/Card';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import styles from './platformAuthPage.module.css';

export type PlatformAuthPageShellProps = {
  readonly cardTitle: string;
  readonly children: ReactNode;
  readonly loading?: boolean;
  readonly loadingMessage?: string;
};

export function PlatformAuthPageShell({
  cardTitle,
  children,
  loading = false,
  loadingMessage = 'Loading…',
}: PlatformAuthPageShellProps): ReactElement {
  return (
    <div className={styles.page}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>
      <div className={styles.brandBlock}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Zenformed" width={160} height={40} />
      </div>
      <Card title={cardTitle} className={styles.card}>
        {loading ? <p className={styles.loading}>{loadingMessage}</p> : children}
      </Card>
    </div>
  );
}
