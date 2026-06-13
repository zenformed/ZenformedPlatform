'use client';

import { type ReactElement } from 'react';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import styles from './dashboard.module.css';

export default function DashboardPage(): ReactElement {
  const { user, signOut } = usePlatformAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <ThemeToggle />
      </header>
      <main className={styles.main}>
        <p className={styles.greeting}>
          Signed in as <strong>{user?.email ?? 'unknown'}</strong>
        </p>
        <p className={styles.note}>App launcher and account management coming soon.</p>
        <button type="button" className={styles.signOut} onClick={() => void signOut()}>
          Sign out
        </button>
      </main>
    </div>
  );
}
