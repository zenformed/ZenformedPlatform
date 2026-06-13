'use client';

import type { ReactElement } from 'react';
import {
  platformDashboardNavigation as nav,
  type PlatformSidebarNavId,
} from '@/platform/navigation/platformDashboardNavigation';
import { AppsIcon, HomeIcon } from '@/platform/icons/platformDashboardShellIcons';
import styles from './PlatformSidebar.module.css';

const SIDEBAR_ICONS: Record<PlatformSidebarNavId, () => ReactElement> = {
  home: HomeIcon,
  apps: AppsIcon,
};

export type PlatformSidebarProps = {
  activeId: PlatformSidebarNavId;
  onSelect: (id: PlatformSidebarNavId) => void;
  children?: React.ReactNode;
};

export function PlatformSidebar({
  activeId,
  onSelect,
  children,
}: PlatformSidebarProps): ReactElement {
  const { ariaLabel, items } = nav.sidebar;

  return (
    <nav className={styles.sidebar} aria-label={ariaLabel}>
      {children ? <div className={styles.sidebarLogoSlot}>{children}</div> : null}
      {items.map((item) => {
        const Icon = SIDEBAR_ICONS[item.id];
        const isAppsStub = item.id === 'apps';
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.btn} ${activeId === item.id ? styles.btnActive : ''}`}
            onClick={() => onSelect(item.id)}
            aria-pressed={activeId === item.id}
            aria-label={item.label}
            title={item.title}
            disabled={isAppsStub}
          >
            <Icon />
          </button>
        );
      })}
    </nav>
  );
}
