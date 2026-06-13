import { platformAppDefinition } from '@/platform/appDefinitions/platform';

export const platformDashboardContent = {
  loading: {
    page: 'Loading…',
  },
  branding: {
    defaultShopNameFallback: platformAppDefinition.displayName,
    logoSaveFailedFallback: 'Failed to save logo',
  },
  dashboard: {
    title: 'Dashboard',
    homeWelcome: 'Your Zenformed platform home. Open an app below or use the apps menu in the header.',
    aboutSectionTitle: platformAppDefinition.displayName,
    aboutSectionBody:
      'Zenformed platform shell — shared auth entry and account management for Zenformed apps.',
  },
  apps: {
    sectionTitle: 'Apps',
    comingSoonLabel: 'Coming soon',
  },
} as const;
