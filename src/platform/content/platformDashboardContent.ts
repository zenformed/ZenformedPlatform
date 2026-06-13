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
    placeholderCardTitle: 'Welcome',
    placeholderCardBody: 'Your Zenformed platform home. App launcher coming soon.',
    aboutSectionTitle: platformAppDefinition.displayName,
    aboutSectionBody:
      'Zenformed platform shell — shared auth entry and account management for Zenformed apps.',
  },
} as const;
