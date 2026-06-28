import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import type { DocsProductIconRef } from '@/platform/docs/docsTypes';
import productStyles from '../../../../app/products/products.module.css';
import styles from '../../../../app/docs/docs.module.css';

export type DocsProductIconProps = {
  readonly icon: DocsProductIconRef;
  readonly name: string;
};

export function DocsProductIcon({ icon, name }: DocsProductIconProps): ReactElement {
  if (icon.type === 'platform') {
    const iconSrc = platformAppIconSrc();
    if (iconSrc) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={iconSrc}
          alt=""
          className={styles.docsHeroProductIcon}
          width={48}
          height={48}
        />
      );
    }

    return (
      <span
        className={`${productStyles.indexCardIconFallback} ${styles.docsHeroProductIcon}`}
        aria-hidden
      >
        Z
      </span>
    );
  }

  const product = PLATFORM_APPS.find((app) => app.id === icon.appId);
  const iconSrc =
    product?.iconSrc?.trim() ||
    (product != null ? resolveZenformedAppIconSrc(product) : undefined);

  if (iconSrc) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={iconSrc}
        alt=""
        className={styles.docsHeroProductIcon}
        width={48}
        height={48}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={`${productStyles.indexCardIconFallback} ${styles.docsHeroProductIcon}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}
