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
    title: 'Zenformed Core',
    aboutSectionTitle: platformAppDefinition.displayName,
    aboutSectionBody:
      'Zenformed platform shell — shared auth entry and account management for Zenformed apps.',
  },
  apps: {
    sectionTitle: 'Apps',
    comingSoonLabel: 'Coming soon',
  },
} as const;
