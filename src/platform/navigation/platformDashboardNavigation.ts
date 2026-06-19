import { platformAppDefinition } from '@/platform/appDefinitions/platform';



export const platformDashboardNavigation = {

  apis: {

    branding: '/api/branding',

    brandingLogo: '/api/branding/logo',

    usersMeSettings: '/api/internal/users-me-settings',

    membershipContext: '/api/internal/organizations-me-membership-context',

    organizationMembers: '/api/internal/organizations-me-members',

    organizationMemberRole: '/api/internal/organizations-me-members',

    organizationInvites: '/api/internal/organizations-me-invites',

    organizationSeats: '/api/internal/organizations-me-seats',

    organizationAppAccess: '/api/internal/organizations-me-app-access',

    organizationAppEntitlements: '/api/internal/apps/entitlements',

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

    appsLauncher: {

      triggerAriaLabel: 'Open apps',

      popoverAriaLabel: 'Zenformed apps',

    },

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

    title: 'Settings',

    closeAriaLabel: 'Close settings',

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


