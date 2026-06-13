'use client';

import type { ReactElement } from 'react';
import { PLATFORM_APPS, type PlatformAppEntry } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import pageStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformAppListProps = {
  readonly variant: 'cards' | 'popover';
  readonly onNavigate?: () => void;
};

function AppCard({ app, onNavigate }: { app: PlatformAppEntry; onNavigate?: () => void }): ReactElement {
  const isLive = app.status === 'live' && app.href != null;

  if (isLive) {
    return (
      <a
        href={app.href}
        className={pageStyles.appCard}
        onClick={() => onNavigate?.()}
      >
        <h3 className={pageStyles.appCardTitle}>{app.name}</h3>
        <p className={pageStyles.appCardDescription}>{app.description}</p>
      </a>
    );
  }

  return (
    <div className={`${pageStyles.appCard} ${pageStyles.appCardDisabled}`} aria-disabled="true">
      <h3 className={pageStyles.appCardTitle}>{app.name}</h3>
      <p className={pageStyles.appCardDescription}>{app.description}</p>
      <span className={pageStyles.appComingSoon}>{content.apps.comingSoonLabel}</span>
    </div>
  );
}

function AppPopoverRow({ app, onNavigate }: { app: PlatformAppEntry; onNavigate?: () => void }): ReactElement {
  const isLive = app.status === 'live' && app.href != null;

  if (isLive) {
    return (
      <a
        href={app.href}
        className={pageStyles.appsPopoverRow}
        role="menuitem"
        onClick={() => onNavigate?.()}
      >
        <span className={pageStyles.appsPopoverRowName}>{app.name}</span>
        <span className={pageStyles.appsPopoverRowDescription}>{app.description}</span>
      </a>
    );
  }

  return (
    <div className={`${pageStyles.appsPopoverRow} ${pageStyles.appsPopoverRowDisabled}`} role="menuitem">
      <span className={pageStyles.appsPopoverRowName}>{app.name}</span>
      <span className={pageStyles.appsPopoverRowMeta}>{content.apps.comingSoonLabel}</span>
    </div>
  );
}

export function PlatformAppList({ variant, onNavigate }: PlatformAppListProps): ReactElement {
  if (variant === 'popover') {
    return (
      <div className={pageStyles.appsPopoverList}>
        {PLATFORM_APPS.map((app) => (
          <AppPopoverRow key={app.id} app={app} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className={pageStyles.appCardGrid}>
      {PLATFORM_APPS.map((app) => (
        <AppCard key={app.id} app={app} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
