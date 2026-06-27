'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import {
  DOCS_LANDING_CARDS,
  type DocsCardId,
} from '@/platform/content/docsLandingContent';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import productStyles from '../../../../app/products/products.module.css';
import styles from '../../../../app/docs/docs.module.css';

const DOCS_CARD_CLASS: Record<DocsCardId, string> = {
  'my-account': productStyles.indexCardAccount,
  buildcore: productStyles.indexCardBuildcore,
  forgecore: productStyles.indexCardForgecore,
  formcore: productStyles.indexCardFormcore,
  analyticscore: productStyles.indexCardAnalyticscore,
};

function DocsCardIcon({ cardId, iconAppId }: { cardId: DocsCardId; iconAppId?: PlatformAppId }): ReactElement {
  if (cardId === 'my-account') {
    const iconSrc = platformAppIconSrc();
    if (iconSrc) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={iconSrc}
          alt=""
          className={productStyles.indexCardIcon}
          width={32}
          height={32}
        />
      );
    }
    return (
      <span className={productStyles.indexCardIconFallback} aria-hidden>
        Z
      </span>
    );
  }

  const product = PLATFORM_APPS.find((app) => app.id === iconAppId);
  const iconSrc =
    product?.iconSrc?.trim() ||
    (product != null ? resolveZenformedAppIconSrc(product) : undefined);

  if (iconSrc) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={iconSrc} alt="" className={productStyles.indexCardIcon} width={32} height={32} />
    );
  }

  const initial = product?.name.trim().charAt(0).toUpperCase() ?? '?';
  return (
    <span className={productStyles.indexCardIconFallback} aria-hidden>
      {initial}
    </span>
  );
}

export function DocsIndexGrid(): ReactElement {
  return (
    <div className={styles.docsGrid}>
      {DOCS_LANDING_CARDS.map((card) => {
        const isLive = card.status === 'live';
        const isPreview = card.actionLabel.startsWith('Preview');

        return (
          <article
            key={card.id}
            className={`${productStyles.indexCard} ${DOCS_CARD_CLASS[card.id]}`}
          >
            {!isLive ? (
              <span className={productStyles.indexCardBadgeSoon}>
                {content.products.statusComingSoon}
              </span>
            ) : null}
            <div className={productStyles.indexCardTitleRow}>
              <DocsCardIcon cardId={card.id} iconAppId={card.iconAppId} />
              <h2 className={productStyles.indexCardTitle}>{card.name}</h2>
            </div>
            <p className={productStyles.indexCardDescription}>{card.description}</p>
            <div className={productStyles.indexCardFooter}>
              {isPreview ? (
                <span className={productStyles.indexCardActionDisabled}>{card.actionLabel}</span>
              ) : (
                <Link href={card.actionHref} className={productStyles.indexCardAction}>
                  {card.actionLabel}
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
