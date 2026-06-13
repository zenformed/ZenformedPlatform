import { platformAppDefinition } from '@/platform/appDefinitions/platform';

export type PlatformSettingsSectionId = 'about';

export const platformDashboardSettingsSections = [
  { id: 'about' as const, label: 'About', groupId: 'settings-tabs' as const },
] as const;

export const platformDashboardSettingsTab = {
  about: platformDashboardSettingsSections[0],
} as const;

export const platformDashboardNavigation = {
  apis: {
    branding: '/api/branding',
  },
  routes: {
    dashboard: platformAppDefinition.dashboardRoute ?? '/dashboard',
    home: '/',
  },
  sidebar: {
    ariaLabel: 'Platform navigation',
    items: [
      { id: 'home' as const, label: 'Home', title: 'Home' },
      { id: 'apps' as const, label: 'Apps', title: 'Apps (coming soon)' },
    ],
  },
  header: {
    account: {
      menuTriggerAriaLabel: 'Account menu',
      planAriaLabelPrefix: 'Plan:',
      adminBadgeLabel: 'Admin',
      companyLogoChange: {
        title: 'Change company logo',
        ariaLabel: 'Change company logo',
      },
      profilePhotoChange: {
        title: 'Change profile photo',
        ariaLabel: 'Change profile photo',
      },
      settingsButton: {
        label: 'Settings',
      },
      signOutButton: {
        label: 'Sign out',
      },
    },
  },
  settingsDrawer: {
    id: 'zenformed-platform-settings-drawer',
    title: 'Settings',
    closeAriaLabel: 'Close settings',
    groups: [{ id: 'settings-tabs' as const }],
    sections: platformDashboardSettingsSections,
  },
  modals: {
    signOut: {
      title: 'Sign out?',
      message: 'You will need to sign in again to access Zenformed.',
      confirmLabel: 'Sign out',
      cancelLabel: 'Cancel',
    },
  },
} as const;

export type PlatformSidebarNavId = (typeof platformDashboardNavigation.sidebar.items)[number]['id'];
