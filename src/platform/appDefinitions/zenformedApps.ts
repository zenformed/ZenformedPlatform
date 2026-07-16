import type { ZenformedAppRegistryEntry } from '@zenformed/core/dashboard-shell';
import type { ZenformedEcosystemAppIconId } from '@zenformed/core/dashboard-shell';
import { launcherAppIconSrc } from '@/platform/assets/platformAppIcon';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';

function withPublicLauncherIcon(
  id: ZenformedEcosystemAppIconId,
  entry: ZenformedAppRegistryEntry
): ZenformedAppRegistryEntry {
  const iconSrc = launcherAppIconSrc(id);
  return iconSrc ? { ...entry, iconSrc } : entry;
}

/** Cross-app registry for the shared Zenformed apps launcher (Platform shell). */
export const PLATFORM_ZENFORMED_APPS: readonly ZenformedAppRegistryEntry[] = [
  withPublicLauncherIcon('platform', {
    id: 'platform',
    name: 'Zenformed Home',
    description: 'Platform home, account, and organization settings.',
    href: platformAppDefinition.dashboardRoute ?? '/dashboard',
    status: 'live',
  }),
  withPublicLauncherIcon('buildcore', {
    id: 'buildcore',
    name: 'BuildCore',
    description: 'Construction project management and CRM.',
    launchTarget: 'buildcore',
    status: 'live',
  }),
  withPublicLauncherIcon('forgecore', {
    id: 'forgecore',
    name: 'ForgeCore',
    description: 'Shop operations and work orders.',
    status: 'coming_soon',
  }),
  withPublicLauncherIcon('formcore', {
    id: 'formcore',
    name: 'FormCore',
    description: 'Forms and workflow automation.',
    status: 'coming_soon',
  }),
  withPublicLauncherIcon('analyticscore', {
    id: 'analyticscore',
    name: 'AnalyticsCore',
    description: 'Dashboards, KPIs, and reporting across Zenformed apps.',
    status: 'coming_soon',
  }),
];
