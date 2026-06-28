'use client';

import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  pickDashboardLayoutClassNames,
  ZenformedDashboardAppShell,
} from '@zenformed/core/dashboard-shell';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import { platformNavigation } from '@/platform/navigation/platformNavigation';
import shellStyles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';
import adminStyles from './admin.module.css';

const layoutClassNames = pickDashboardLayoutClassNames(shellStyles);

export function PlatformAdminShell({ children }: { children: ReactNode }): ReactElement {
  const pathname = usePathname();
  const isDocsArticleEditor = /^\/admin\/docs\/articles\/[^/]+$/.test(pathname ?? '');

  return (
    <ZenformedDashboardAppShell classNames={{ appLayout: layoutClassNames.appLayout }}>
      <div className={adminStyles.adminShell}>
        <header className={adminStyles.adminHeaderBar}>
          <div>
            <h1 className={adminStyles.adminHeaderTitle}>{content.title}</h1>
            <p className={adminStyles.adminHeaderMeta}>{content.subtitle}</p>
          </div>
          <Link href={platformNavigation.routes.dashboard} className={adminStyles.adminHeaderLink}>
            {content.backToDashboard}
          </Link>
        </header>
        <div className={adminStyles.adminLayoutRow}>
          <aside className={adminStyles.adminSidebar}>
            <nav className={adminStyles.adminNav} aria-label="Admin navigation">
              {nav.navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${adminStyles.adminNavLink} ${isActive ? adminStyles.adminNavLinkActive : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main
            className={`${adminStyles.adminMain} ${isDocsArticleEditor ? adminStyles.adminMainDocsArticleEditor : ''}`}
          >
            {children}
          </main>
        </div>
      </div>
    </ZenformedDashboardAppShell>
  );
}
