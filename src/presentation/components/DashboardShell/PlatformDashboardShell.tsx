'use client';

import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  pickAppsLauncherClassNames,
  pickDashboardPageLoadingClassNames,
  pickHeaderShellClassNames,
  useZenformedAppLaunch,
  useZenformedShellUserDisplay,
  ZenformedAppList,
  ZenformedAppsLauncher,
  ZenformedCollapsibleSidebarShell,
  ZenformedDashboardAppShell,
  ZenformedDashboardPageLoading,
  ZenformedSidebarAppsTriggerChrome,
  type ZenformedAccountMenuLabels,
  type ZenformedAppRegistryEntry,
} from '@zenformed/core/dashboard-shell';
import {
  formatPlanDisplayName,
  resolveAppEntitlementBadges,
} from '@zenformed/core/organization-settings';
import { SettingsIcon, ShopIcon, CameraIcon, SignOutIcon, AppsIcon } from '@/platform/icons/platformDashboardShellIcons';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { PLATFORM_ZENFORMED_APPS } from '@/platform/appDefinitions/zenformedApps';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import type { UsePlatformDashboardResult } from '@/presentation/features/platformDashboard/usePlatformDashboard';
import { PlatformDashboardModals } from '@/presentation/components/DashboardShell/PlatformDashboardModals';
import { PlatformSettingsDrawer } from '@/presentation/components/DashboardShell/PlatformSettingsDrawer';
import { buildPlatformSidebarSections } from '@/presentation/components/DashboardShell/buildPlatformSidebarSections';
import { PlatformSidebarTeamSection } from '@/presentation/components/DashboardShell/PlatformSidebarTeamSection';
import { PlatformSidebarCartRow } from '@/presentation/components/DashboardShell/PlatformSidebarCartRow';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { usePlatformProductEntitlements } from '@/presentation/hooks/usePlatformProductEntitlements';
import {
  partitionPlatformAppsByOwnership,
  countActivePlatformSubscriptions,
  enrichMyAppsWithEntitlementBadges,
} from '@/presentation/features/platformDashboard/platformDashboardProducts';
import { PlatformAvailableProductsGrid } from '@/presentation/components/DashboardShell/PlatformAvailableProductsGrid';
import { PlatformDashboardPanelAction } from '@/presentation/components/DashboardShell/PlatformDashboardPanelAction';
import { PlatformDashboardAppsBillingSection } from '@/presentation/components/DashboardShell/PlatformDashboardAppsBillingSection';
import { PlatformDashboardTeamMembersSection } from '@/presentation/components/DashboardShell/PlatformDashboardTeamMembersSection';
import {
  formatPlatformDashboardActiveSubscriptions,
  formatPlatformDashboardSeatsUsed,
  usePlatformOrganizationWorkspaceSummary,
} from '@/presentation/hooks/usePlatformOrganizationWorkspaceSummary';
import { resolvePlatformAccountMenuUser } from '@/platform/auth/resolvePlatformAccountMenuUser';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import { useTheme } from '@/presentation/providers/ThemeProvider';
import { usePlatformNotificationsConfig } from '@/presentation/features/notifications/usePlatformNotificationsConfig';
import shellStyles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';
import pageStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';
import appsStyles from './platformCollapsibleApps.module.css';

const headerShellClassNames = pickHeaderShellClassNames(shellStyles);
const appsLauncherClassNames = pickAppsLauncherClassNames(appsStyles);
const pageAppsClassNames = pickAppsLauncherClassNames(pageStyles);
const pageLoadingClassNames = pickDashboardPageLoadingClassNames(shellStyles);

const accountMenuLabels: ZenformedAccountMenuLabels = {
  menuTriggerAriaLabel: nav.header.account.menuTriggerAriaLabel,
  planAriaLabelPrefix: nav.header.account.planAriaLabelPrefix,
  adminBadgeLabel: nav.header.account.adminBadgeLabel,
  roleAriaLabelPrefix: 'Role:',
  profilePhotoChangeTitle: nav.header.account.profilePhotoChange.title,
  profilePhotoChangeAriaLabel: nav.header.account.profilePhotoChange.ariaLabel,
  settingsButtonLabel: nav.header.account.settingsButton.label,
  signOutButtonLabel: nav.header.account.signOutButton.label,
};

const appsLauncherLabels = {
  triggerAriaLabel: nav.header.appsLauncher.triggerAriaLabel,
  popoverAriaLabel: nav.header.appsLauncher.popoverAriaLabel,
  appsSectionTitle: content.apps.sectionTitle,
  accountSectionTitle: 'Account',
  accountHomeLabel: 'Zenformed Home',
};

export type PlatformDashboardShellProps = {
  dash: UsePlatformDashboardResult;
  /** When set, replaces the default dashboard home content inside the chrome. */
  children?: ReactNode;
};

export function PlatformDashboardShell({
  dash,
  children,
}: PlatformDashboardShellProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { session, user: saasUser } = useSaaSProfile();
  const [appsOpen, setAppsOpen] = useState(false);
  const notifications = usePlatformNotificationsConfig(dash.getAccessToken);
  const themeLabel = theme === 'dark' ? 'Light Mode' : 'Dark Mode';

  const { ownedAppIds, entitlementsByApp, isLoading: entitlementsLoading, error: entitlementsError } =
    usePlatformProductEntitlements(session?.access_token);
  const { myApps, availableProducts } = partitionPlatformAppsByOwnership(ownedAppIds);
  const myAppsWithBadges = enrichMyAppsWithEntitlementBadges(myApps, entitlementsByApp);
  const activeSubscriptionsCount = countActivePlatformSubscriptions(ownedAppIds);
  const activeSubscriptionsDisplay = formatPlatformDashboardActiveSubscriptions(
    activeSubscriptionsCount,
    entitlementsLoading
  );
  const organizationDisplayName =
    dash.brandingLoading && !dash.shopName
      ? content.loading.page
      : dash.shopName || content.branding.defaultShopNameFallback;
  const organizationSummary = usePlatformOrganizationWorkspaceSummary(
    dash.getAccessToken,
    !dash.authLoading
  );
  const seatsUsedDisplay = formatPlatformDashboardSeatsUsed(
    organizationSummary.activeMemberCount,
    organizationSummary.seatLimit,
    organizationSummary.isLoading
  );

  const { launchApp, launchingAppId, launchError } = useZenformedAppLaunch({
    launchApiUrl: '/api/internal/app-launch',
    getAccessToken: () => session?.access_token ?? null,
  });

  const accountUser = useMemo(() => {
    if (dash.user == null) return null;
    return resolvePlatformAccountMenuUser(dash.user.email, saasUser?.user_metadata);
  }, [dash.user, saasUser?.user_metadata]);

  const accountDisplayName = useZenformedShellUserDisplay({
    settingsApiUrl: nav.apis.usersMeSettings,
    getAccessToken: dash.getAccessToken,
    sessionUserId: dash.user?.id ?? session?.user?.id ?? null,
    user: accountUser,
    enabled: accountUser != null,
  });

  const teamContent = useMemo(
    () => (
      <PlatformSidebarTeamSection
        getAccessToken={dash.getAccessToken}
        enabled={!dash.authLoading}
      />
    ),
    [dash.authLoading, dash.getAccessToken]
  );

  const onSidebarSelect = useCallback(
    (id: 'home' | 'apps') => {
      dash.setSidebarNav(id);
      if (id === 'home') {
        router.push(nav.routes.dashboard);
      }
    },
    [dash, router]
  );

  const sidebarActiveId =
    pathname?.startsWith(nav.routes.notifications) ? 'home' : dash.sidebarNav;

  const sections = useMemo(
    () =>
      buildPlatformSidebarSections({
        activeId: sidebarActiveId,
        onSelect: onSidebarSelect,
        teamContent,
      }),
    [onSidebarSelect, sidebarActiveId, teamContent]
  );

  const appIconSrc = platformAppIconSrc();
  const appDisplayName = platformAppDefinition.displayName;

  const launcherApps = useMemo((): readonly ZenformedAppRegistryEntry[] => {
    return PLATFORM_ZENFORMED_APPS.map((app) => {
      if (app.id === 'platform') {
        return {
          ...app,
          entitlementBadges: {
            planLabel: 'Account',
            planBadgeVariant: 'default',
            statusLabel: 'Active',
            statusBadgeVariant: 'active',
          },
        };
      }

      if (app.status === 'coming_soon') {
        return app;
      }

      const entitlement = entitlementsByApp[app.id as PlatformAppId];
      if (
        entitlement?.owned &&
        entitlement.planSlug != null &&
        entitlement.entitlementStatus != null
      ) {
        return {
          ...app,
          entitlementBadges: resolveAppEntitlementBadges(
            app.id,
            entitlement.planSlug,
            entitlement.entitlementStatus
          ),
        };
      }

      if (entitlement?.owned && entitlement.planSlug != null) {
        return {
          ...app,
          entitlementBadges: {
            planLabel: formatPlanDisplayName(app.id, entitlement.planSlug),
            planBadgeVariant: 'default',
            statusLabel: 'Active',
            statusBadgeVariant: 'active',
          },
        };
      }

      return app;
    });
  }, [entitlementsByApp]);

  const appsTrigger = ({
    open,
    onClick,
    ariaLabel,
  }: {
    readonly open: boolean;
    readonly onClick: () => void;
    readonly ariaLabel: string;
  }) => (
    <button
      type="button"
      data-zenformed-sidebar-apps-trigger
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-haspopup="menu"
      title={appDisplayName}
    >
      <ZenformedSidebarAppsTriggerChrome
        open={open}
        appName={appDisplayName}
        appTier={null}
        appBadges={{
          planLabel: 'Account',
          planBadgeVariant: 'default',
          statusLabel: 'Active',
          statusBadgeVariant: 'active',
        }}
        appIcon={
          appIconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={appIconSrc} alt="" width={32} height={32} />
          ) : null
        }
      />
    </button>
  );

  const appsSwitcher = (
    <ZenformedAppsLauncher
      apps={launcherApps}
      classNames={appsLauncherClassNames}
      labels={appsLauncherLabels}
      launchApp={launchApp}
      launchingAppId={launchingAppId}
      launchError={launchError}
      appsIcon={<AppsIcon />}
      showAccountSection={false}
      popoverLayout="sidebarList"
      currentAppId="platform"
      onOpenChange={setAppsOpen}
      renderTrigger={appsTrigger}
    />
  );

  if (dash.authLoading) {
    return (
      <ZenformedDashboardPageLoading
        classNames={pageLoadingClassNames}
        message={content.loading.page}
      />
    );
  }

  const railDisplayName =
    accountDisplayName.trim() || accountUser?.email?.trim() || '';

  const homeContent = (
    <div className={pageStyles.dashboardContent}>
      <div className={pageStyles.dashboardLayout}>
        <div className={pageStyles.dashboardLeftColumn}>
          <header className={pageStyles.dashboardPanel}>
            <h1 className={`${pageStyles.dashboardHeadingBar} ${pageStyles.dashboardPageTitle}`}>
              {content.dashboard.accountTitle}
            </h1>
            <div className={pageStyles.dashboardPanelBody}>
              <p className={pageStyles.dashboardPageSubtitle}>{content.dashboard.accountSubtitle}</p>
              <dl className={pageStyles.dashboardSummaryMetrics}>
                <div className={pageStyles.dashboardSummaryMetric}>
                  <dt className={pageStyles.dashboardSummaryMetricLabel}>
                    {content.dashboard.organizationLabel}
                  </dt>
                  <dd
                    className={`${pageStyles.dashboardSummaryMetricValue} ${pageStyles.dashboardSummaryMetricValueText}`}
                  >
                    {organizationDisplayName}
                  </dd>
                </div>
                <div className={pageStyles.dashboardSummaryMetric}>
                  <dt className={pageStyles.dashboardSummaryMetricLabel}>
                    {content.dashboard.activeSubscriptionsLabel}
                  </dt>
                  <dd className={pageStyles.dashboardSummaryMetricValue}>
                    {activeSubscriptionsDisplay}
                  </dd>
                </div>
                <div className={pageStyles.dashboardSummaryMetric}>
                  <dt className={pageStyles.dashboardSummaryMetricLabel}>
                    {content.dashboard.seatsUsedLabel}
                  </dt>
                  <dd className={pageStyles.dashboardSummaryMetricValue}>{seatsUsedDisplay}</dd>
                </div>
              </dl>
              <PlatformDashboardPanelAction
                icon={<SettingsIcon />}
                label={content.dashboard.manageAccountAction}
                onClick={() => {
                  requestAnimationFrame(() => dash.openSettings('account'));
                }}
              />
            </div>
          </header>

          <section className={pageStyles.dashboardPanel}>
            <h2 className={`${pageStyles.dashboardHeadingBar} ${pageStyles.dashboardSectionTitle}`}>
              {content.apps.myAppsSectionTitle}
            </h2>
            <div className={pageStyles.dashboardPanelBody}>
              {entitlementsLoading ? (
                <p className={pageStyles.appsSectionHint}>{content.apps.loadingApps}</p>
              ) : entitlementsError ? (
                <p className={pageStyles.appsLaunchError} role="alert">
                  {entitlementsError}
                </p>
              ) : (
                <>
                  {myApps.length === 0 ? (
                    <p className={pageStyles.myAppsEmptyState}>{content.apps.myAppsEmptyState}</p>
                  ) : (
                    <ZenformedAppList
                      apps={myAppsWithBadges}
                      classNames={pageAppsClassNames}
                      labels={appsLauncherLabels}
                      variant="cards"
                      launchApp={launchApp}
                      launchingAppId={launchingAppId}
                      launchError={launchError}
                    />
                  )}
                  <PlatformDashboardPanelAction
                    icon={<ShopIcon />}
                    label={content.apps.browseProductsAction}
                    href="/products"
                  />
                </>
              )}
            </div>
          </section>

          <PlatformDashboardTeamMembersSection
            summary={organizationSummary}
            onManageTeamMembers={() => dash.openSettings('teamMembers')}
          />

          <PlatformDashboardAppsBillingSection
            summary={organizationSummary}
            activeSubscriptionsCount={activeSubscriptionsCount}
            activeSubscriptionsLoading={entitlementsLoading}
            onManageBilling={() => dash.openSettings('appsBilling')}
          />
        </div>

        <div className={pageStyles.dashboardRightColumn}>
          <section className={`${pageStyles.dashboardPanel} ${pageStyles.availableProductsPanel}`}>
            <h1 className={pageStyles.availableProductsTitle}>
              {content.apps.availableProductsSectionTitle}
            </h1>
            <div className={pageStyles.dashboardPanelBody}>
              {entitlementsLoading ? (
                <p className={pageStyles.appsSectionHint}>{content.apps.loadingApps}</p>
              ) : (
                <>
                  <PlatformAvailableProductsGrid products={availableProducts} />
                  <p className={pageStyles.availableProductsDevelopmentNotice} role="status">
                    <span className={pageStyles.availableProductsDevelopmentNoticeMark} aria-hidden>
                      !
                    </span>
                    {content.products.developmentNotice}
                  </p>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <ZenformedDashboardAppShell classNames={{ appLayout: shellStyles.appLayout }}>
      <ZenformedCollapsibleSidebarShell
        appName={appDisplayName}
        appIconSrc={appIconSrc}
        organizationName={dash.shopName || null}
        appsSwitcher={appsSwitcher}
        sections={sections}
        notifications={notifications}
        otherLeading={({ showLabel }) => <PlatformSidebarCartRow showLabel={showLabel} />}
        themeControl={<ThemeToggle />}
        themeLabel={themeLabel}
        otherSectionLabel="Other"
        otherSectionCollapsedLabel="OTHER"
        holdExpanded={appsOpen}
        sidebarAriaLabel={nav.sidebar.ariaLabel}
        settings={{
          label: 'Settings',
          icon: <SettingsIcon />,
          onSelect: () => {
            requestAnimationFrame(() => dash.openSettings('account'));
          },
        }}
        account={
          accountUser == null
            ? null
            : {
                user: accountUser,
                userDisplayName: railDisplayName,
                userEmail: accountUser.email,
                avatarUrl: null,
                avatarLoading: false,
                organizationRoleLabel: dash.organizationRoleLabel,
                labels: accountMenuLabels,
                classNames: headerShellClassNames,
                onOpenSettings: () => {
                  requestAnimationFrame(() => dash.openSettings('account'));
                },
                onRequestSignOutConfirm: () => dash.setSignOutModalOpen(true),
                onRequestProfilePhotoModal: () => dash.setProfilePhotoModalOpen(true),
                profilePhotoChangeEnabled: false,
                showSettingsButton: false,
                signOutIcon: <SignOutIcon className={headerShellClassNames.accountMenuBtnIcon} />,
                profilePhotoCameraIcon: <CameraIcon />,
              }
        }
      >
        <main className={shellStyles.mainContent}>
          <div className={shellStyles.listViewWrap}>{children != null ? children : homeContent}</div>
        </main>
      </ZenformedCollapsibleSidebarShell>

      <PlatformSettingsDrawer
        open={dash.settingsOpen}
        onClose={dash.closeSettings}
        initialCategory={dash.settingsInitialCategory}
        getAccessToken={dash.getAccessToken}
        shellContext={{
          userEmail: dash.user?.email ?? null,
          organizationName: dash.shopName ?? null,
          logoUrl: dash.logoUrl ?? null,
        }}
      />

      <PlatformDashboardModals
        signOut={{
          isOpen: dash.signOutModalOpen,
          onClose: () => dash.setSignOutModalOpen(false),
          onConfirm: async () => {
            await dash.signOut();
          },
        }}
        profilePhoto={null}
      />
    </ZenformedDashboardAppShell>
  );
}
