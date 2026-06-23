export const platformAdminContent = {
  title: 'Zenformed Admin',
  subtitle: 'Internal operations dashboard',
  loading: 'Loading admin data…',
  accessDeniedTitle: 'Access denied',
  accessDeniedMessage: 'This area is restricted to Zenformed platform staff.',
  backToDashboard: 'Back to dashboard',
  empty: 'No results found.',
  error: 'Unable to load admin data.',
  pagination: {
    previous: 'Previous',
    next: 'Next',
    pageLabel: (page: number, totalPages: number) => `Page ${page} of ${totalPages}`,
  },
  filters: {
    searchPlaceholder: 'Search…',
    allProducts: 'All products',
    allStatuses: 'All statuses',
    allPlans: 'All plans',
  },
  products: [
    { value: 'all', label: 'All products' },
    { value: 'buildcore', label: 'BuildCore' },
    { value: 'forgecore', label: 'ForgeCore' },
    { value: 'formcore', label: 'FormCore' },
    { value: 'analyticscore', label: 'AnalyticsCore' },
  ],
  subscriptionStatuses: [
    { value: 'all', label: 'All statuses' },
    { value: 'trialing', label: 'Trialing' },
    { value: 'active', label: 'Active' },
    { value: 'past_due', label: 'Past due' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'incomplete', label: 'Incomplete' },
  ],
  plans: [
    { value: 'all', label: 'All plans' },
    { value: 'starter', label: 'Starter' },
    { value: 'growth', label: 'Growth' },
    { value: 'pro', label: 'Pro' },
  ],
  accountOwners: {
    title: 'Account Owners',
    subtitle: 'Customers who own one or more organizations',
    columns: {
      email: 'Owner Email',
      ownerName: 'Owner Name',
      organizationsOwned: 'Organizations Owned',
      productsOwned: 'Products Owned',
      subscriptionStatus: 'Subscription Status',
      lastLoginAt: 'Last Login',
      createdAt: 'Created Date',
    },
  },
  accountOwnerDetail: {
    backToList: 'Back to account owners',
    summaryTitle: 'Owner Summary',
    organizationsTitle: 'Organizations',
    membersTitle: 'Members',
    fields: {
      email: 'Owner Email',
      name: 'Name',
      createdAt: 'Created Date',
      lastLoginAt: 'Last Login',
      organizationsOwned: 'Organizations Owned',
      productsOwned: 'Products Owned',
      subscriptionSummary: 'Subscription Summary',
      totalStorageUsed: 'Total Storage Across Owned Organizations',
    },
    organizationColumns: {
      name: 'Organization Name',
      createdAt: 'Created Date',
      subscriptionStatus: 'Subscription Status',
      products: 'Products',
      memberCount: 'Member Count',
      storageUsed: 'Storage Usage',
    },
    memberColumns: {
      email: 'Email',
      name: 'Name',
      role: 'Role',
      membershipStatus: 'Membership Status',
      joinedAt: 'Joined Date',
      lastLoginAt: 'Last Login',
    },
  },
  organizations: {
    title: 'Organizations',
    columns: {
      name: 'Organization',
      ownerEmail: 'Owner Email',
      memberCount: 'Member Count',
      products: 'Products',
      subscriptionStatus: 'Subscription Status',
      createdAt: 'Created Date',
      storageUsed: 'Storage Used',
    },
    detail: {
      backToList: 'Back to organizations',
      summaryTitle: 'Organization Summary',
      storageTitle: 'Storage Usage',
      storageRows: {
        buildCoreDocuments: 'BuildCore Documents',
        buildCoreProjectPhotos: 'BuildCore Project Photos',
        organizationBranding: 'Organization Branding',
        userAvatars: 'User Avatars',
        total: 'Total Storage',
      },
      fields: {
        name: 'Organization',
        ownerEmail: 'Owner Email',
        memberCount: 'Member Count',
        products: 'Products',
        subscriptionStatus: 'Subscription Status',
        createdAt: 'Created Date',
        storageUsed: 'BuildCore Storage Counter',
      },
      limitationsTitle: 'Storage notes',
    },
  },
  subscriptions: {
    title: 'Subscriptions',
    columns: {
      organizationName: 'Organization',
      products: 'Products',
      status: 'Status',
      billingCycle: 'Billing Cycle',
      trialEnd: 'Trial End',
      renewalDate: 'Renewal Date',
      cancelAtPeriodEnd: 'Cancel At Period End',
    },
  },
} as const;

export function formatAdminDate(value: string | null): string {
  if (value == null || value.trim() === '') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAdminProducts(values: readonly string[]): string {
  if (values.length === 0) return '—';
  return values.join(', ');
}

export function formatAdminStatus(value: string | null): string {
  if (value == null || value.trim() === '') return 'None';
  return value.replace(/_/g, ' ');
}

export function formatAdminStorageBytes(value: number | null): string {
  if (value == null || value < 0) return '—';
  if (value === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const decimals = unitIndex >= 3 ? 1 : size >= 10 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}
