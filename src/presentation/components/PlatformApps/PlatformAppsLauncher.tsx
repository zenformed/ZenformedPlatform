'use client';

import type { ReactElement } from 'react';
import { useAccountMenuState } from '@zenformed/core/dashboard-shell';
import { AppsIcon } from '@/platform/icons/platformDashboardShellIcons';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import { PlatformAppList } from '@/presentation/components/PlatformApps/PlatformAppList';
import pageStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export function PlatformAppsLauncher(): ReactElement {
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState();

  return (
    <div className={pageStyles.appsLauncherWrap} ref={accountMenuRef}>
      <button
        type="button"
        className={pageStyles.appsLauncherTrigger}
        onClick={() => setAccountMenuOpen((open) => !open)}
        aria-label={nav.header.appsLauncher.triggerAriaLabel}
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
      >
        <span className={pageStyles.appsLauncherIcon} aria-hidden>
          <AppsIcon />
        </span>
      </button>
      {accountMenuOpen ? (
        <div
          className={pageStyles.appsPopover}
          role="menu"
          aria-label={nav.header.appsLauncher.popoverAriaLabel}
        >
          <PlatformAppList variant="popover" onNavigate={closeAccountMenu} />
        </div>
      ) : null}
    </div>
  );
}
