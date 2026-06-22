'use client';

import type { ReactElement } from 'react';
import {
  mapProductOwnershipList,
  type ProductOwnershipInput,
} from '@/presentation/components/Admin/productOwnershipDisplay';
import adminStyles from './admin.module.css';

export type ProductOwnershipListProps = {
  items: readonly ProductOwnershipInput[];
  emptyLabel?: string;
};

function tierBadgeClassName(item: ReturnType<typeof mapProductOwnershipList>[number]): string {
  const base = adminStyles.productTierBadge;
  if (item.showStatusBadge) {
    switch (item.tierStatusBadgeVariant) {
      case 'trial':
        return `${base} ${adminStyles.productTierBadgeTrial}`;
      case 'active':
        return `${base} ${adminStyles.productTierBadgeActive}`;
      default:
        return `${base} ${adminStyles.productTierBadgeInactive}`;
    }
  }

  switch (item.tierPlanBadgeVariant) {
    case 'starter':
      return `${base} ${adminStyles.productTierBadgeStarter}`;
    case 'growth':
      return `${base} ${adminStyles.productTierBadgeGrowth}`;
    case 'pro':
      return `${base} ${adminStyles.productTierBadgePro}`;
    case 'standard':
      return `${base} ${adminStyles.productTierBadgeStandard}`;
    default:
      return `${base} ${adminStyles.productTierBadgeDefault}`;
  }
}

export function ProductOwnershipList({
  items,
  emptyLabel = '—',
}: ProductOwnershipListProps): ReactElement {
  if (items.length === 0) {
    return <span className={adminStyles.productOwnershipEmpty}>{emptyLabel}</span>;
  }

  const displayItems = mapProductOwnershipList(items);

  return (
    <ul className={adminStyles.productOwnershipList}>
      {displayItems.map((item) => (
        <li key={item.productSlug} className={adminStyles.productOwnershipRow}>
          <span className={adminStyles.productOwnershipIdentity}>
            {item.iconSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.iconSrc}
                alt=""
                width={20}
                height={20}
                className={adminStyles.productOwnershipIcon}
              />
            ) : (
              <span className={adminStyles.productOwnershipIconFallback} aria-hidden="true">
                {item.productName.charAt(0)}
              </span>
            )}
            <span className={adminStyles.productOwnershipName}>{item.productName}</span>
          </span>
          <span className={tierBadgeClassName(item)}>{item.tierLabel}</span>
        </li>
      ))}
    </ul>
  );
}
