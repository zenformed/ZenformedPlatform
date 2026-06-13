'use client';

import type { ReactElement } from 'react';
import { PLATFORM_APPS, type PlatformAppEntry, type PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { usePlatformAppLaunch } from '@/presentation/hooks/usePlatformAppLaunch';
import pageStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformAppListProps = {
  readonly variant: 'cards' | 'popover';
  readonly onNavigate?: () => void;
};

function isLaunchableApp(app: PlatformAppEntry): boolean {
  return app.status === 'live' && app.launchTarget != null;
}

function isHrefApp(app: PlatformAppEntry): boolean {
  return app.status === 'live' && app.href != null;
}

type AppActionProps = {
  app: PlatformAppEntry;
  onNavigate?: () => void;
  launchApp: (targetApp: PlatformAppId, returnPath?: string) => Promise<void>;
  launchingAppId: string | null;
};

function AppCard({ app, onNavigate, launchApp, launchingAppId }: AppActionProps): ReactElement {
  const isLaunching = launchingAppId === app.id;

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={pageStyles.appCard}
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        <h3 className={pageStyles.appCardTitle}>{app.name}</h3>
        <p className={pageStyles.appCardDescription}>{app.description}</p>
        {isLaunching ? <span className={pageStyles.appComingSoon}>Opening…</span> : null}
      </button>
    );
  }

  if (isHrefApp(app)) {
    return (
      <a href={app.href} className={pageStyles.appCard} onClick={() => onNavigate?.()}>
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

function AppPopoverRow({ app, onNavigate, launchApp, launchingAppId }: AppActionProps): ReactElement {
  const isLaunching = launchingAppId === app.id;

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={pageStyles.appsPopoverRow}
        role="menuitem"
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        <span className={pageStyles.appsPopoverRowName}>{app.name}</span>
        <span className={pageStyles.appsPopoverRowDescription}>
          {isLaunching ? 'Opening…' : app.description}
        </span>
      </button>
    );
  }

  if (isHrefApp(app)) {
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
  const { launchApp, launchingAppId, launchError } = usePlatformAppLaunch();

  const list =
    variant === 'popover'
      ? PLATFORM_APPS.map((app) => (
          <AppPopoverRow
            key={app.id}
            app={app}
            onNavigate={onNavigate}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
          />
        ))
      : PLATFORM_APPS.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onNavigate={onNavigate}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
          />
        ));

  if (variant === 'popover') {
    return (
      <div className={pageStyles.appsPopoverList}>
        {launchError ? <p className={pageStyles.appsLaunchError}>{launchError}</p> : null}
        {list}
      </div>
    );
  }

  return (
    <div>
      {launchError ? <p className={pageStyles.appsLaunchError}>{launchError}</p> : null}
      <div className={pageStyles.appCardGrid}>{list}</div>
    </div>
  );
}
