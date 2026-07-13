'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { ProductsIndexGrid } from '@/presentation/components/Products/ProductsIndexGrid';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from '../../../../app/products/products.module.css';

const WHY_ZENFORMED_POINTS = [
  {
    title: 'One account',
    body: 'Sign in once and access every Zenformed application with the same identity.',
  },
  {
    title: 'One organization',
    body: 'Keep your company, team, and permissions in a shared workspace across products.',
  },
  {
    title: 'Multiple business applications',
    body: 'Run construction, operations, and analytics tools that grow with your business.',
  },
  {
    title: 'Shared billing & team management',
    body: 'Manage subscriptions, seats, and members from one platform instead of many portals.',
  },
] as const;

export function PlatformHomePageView(): ReactElement {
  const { session, loading } = useSaaSProfile();
  const isLoggedIn = !loading && session != null;
  const secondaryHref = isLoggedIn ? nav.routes.dashboard : nav.routes.login;
  const secondaryLabel = isLoggedIn ? 'Open Dashboard' : 'Sign In';
  const iconSrc = platformAppIconSrc();

  return (
    <ProductsPublicShell>
      <section className={styles.homeHero} aria-labelledby="platform-home-title">
        <div className={styles.homeHeroBrand}>
          {iconSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={iconSrc}
              alt=""
              className={styles.homeHeroBrandIcon}
              width={28}
              height={28}
            />
          ) : null}
          <span className={styles.homeHeroBrandName}>ZenCore</span>
        </div>
        <h1 id="platform-home-title" className={styles.homeHeroTitle}>
          Business software that works together
        </h1>
        <p className={styles.homeHeroIntro}>
          ZenCore is the shared platform for BuildCore and the rest of the Zenformed suite —
          one account, one organization, and applications designed to run side by side.
        </p>
        <div className={styles.homeHeroCtaRow}>
          <Link href={nav.routes.products} className={`${styles.salesCtaPrimary} ${styles.homeCtaLink}`}>
            View Products
          </Link>
          <Link href={secondaryHref} className={`${styles.salesCtaSecondary} ${styles.homeCtaLink}`}>
            {secondaryLabel}
          </Link>
        </div>
      </section>

      <section className={styles.homeSection} aria-labelledby="platform-home-products-title">
        <div className={styles.homeSectionHeader}>
          <h2 id="platform-home-products-title" className={styles.homeSectionTitle}>
            Products
          </h2>
          <p className={styles.homeSectionIntro}>
            Explore the Zenformed applications available for your organization.
          </p>
        </div>
        <ProductsIndexGrid />
      </section>

      <section className={styles.homeSection} aria-labelledby="platform-home-why-title">
        <div className={styles.homeSectionHeader}>
          <h2 id="platform-home-why-title" className={styles.homeSectionTitle}>
            Why Zenformed
          </h2>
          <p className={styles.homeSectionIntro}>
            Built as a platform first — so every product shares identity, teams, and billing.
          </p>
        </div>
        <ul className={styles.homeWhyGrid}>
          {WHY_ZENFORMED_POINTS.map((point) => (
            <li key={point.title} className={styles.homeWhyCard}>
              <h3 className={styles.homeWhyTitle}>{point.title}</h3>
              <p className={styles.homeWhyBody}>{point.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.homeFinalCta} aria-labelledby="platform-home-final-title">
        <h2 id="platform-home-final-title" className={styles.homeFinalCtaTitle}>
          Ready to get started?
        </h2>
        <p className={styles.homeFinalCtaIntro}>
          Browse the product suite or {isLoggedIn ? 'open your dashboard' : 'sign in to your account'}.
        </p>
        <div className={styles.homeHeroCtaRow}>
          <Link href={nav.routes.products} className={`${styles.salesCtaPrimary} ${styles.homeCtaLink}`}>
            View Products
          </Link>
          <Link href={secondaryHref} className={`${styles.salesCtaSecondary} ${styles.homeCtaLink}`}>
            {secondaryLabel}
          </Link>
        </div>
      </section>
    </ProductsPublicShell>
  );
}
