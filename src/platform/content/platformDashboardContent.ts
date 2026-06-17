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
    accountTitle: 'My Account',
    accountSubtitle:
      'Manage your applications, organization, team members, subscriptions, and billing from one place.',
    organizationLabel: 'Organization',
    applicationsOwnedLabel: 'Applications Owned',
    seatsUsedLabel: 'Seats Used',
    aboutSectionTitle: platformAppDefinition.displayName,
    aboutSectionBody:
      'Zenformed platform shell — shared auth entry and account management for Zenformed apps.',
  },
  apps: {
    sectionTitle: 'Apps',
    myAppsSectionTitle: 'My Apps',
    availableProductsSectionTitle: 'Available Products',
    myAppsEmptyState: "You don't have any active applications yet.",
    browseProductsAction: 'Browse Products',
    loadingApps: 'Loading your apps…',
    comingSoonLabel: 'Coming soon',
  },
  products: {
    pageTitle: 'Products',
    statusLive: 'Live',
    statusLiveBadge: 'Live',
    statusComingSoon: 'Coming Soon',
    viewPlansAction: 'View Plans',
    comingSoonAction: 'Coming Soon',
  },
  teamMembers: {
    sectionTitle: 'Team Members',
    activeMembersLabel: 'Active Members',
    pendingInvitesLabel: 'Pending Invites',
    seatsAvailableLabel: 'Seats Available',
    manageAction: 'Manage Team Members',
  },
  appsBilling: {
    sectionTitle: 'Apps & Billing',
    currentPlanLabel: 'Current Plan',
    subscriptionStatusLabel: 'Subscription Status',
    renewalDateLabel: 'Renewal Date',
    renewalDateUnavailable: '—',
    placeholder: 'Billing information will appear here once subscriptions are enabled.',
    manageAction: 'Manage Billing',
  },
} as const;
