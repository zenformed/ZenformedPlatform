'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import styles from './products.module.css';

export default function ProductsPage(): ReactElement {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link href={nav.routes.dashboard} className={styles.backLink}>
          ← Back to dashboard
        </Link>
        <h1 className={styles.title}>{content.products.pageTitle}</h1>
        <ul className={styles.list}>
          {PLATFORM_APPS.map((product) => (
            <li key={product.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <h2 className={styles.itemTitle}>{product.name}</h2>
                <span className={styles.itemTagline}>{product.tagline}</span>
              </div>
              <p className={styles.itemDescription}>{product.description}</p>
              {product.status === 'live' ? (
                <span className={styles.actionPrimary}>{content.products.viewPlansAction}</span>
              ) : (
                <span className={styles.actionDisabled}>{content.products.comingSoonAction}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
