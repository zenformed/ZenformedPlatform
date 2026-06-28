export const platformAdminNavigation = {
  basePath: '/admin',
  routes: {
    home: '/admin',
    accountOwners: '/admin/users',
    accountOwnerDetail: (userId: string) => `/admin/users/${userId}`,
    organizations: '/admin/organizations',
    organizationDetail: (organizationId: string) => `/admin/organizations/${organizationId}`,
    subscriptions: '/admin/subscriptions',
    docs: '/admin/docs',
    docsArticleEditor: (editorId: string) => `/admin/docs/articles/${editorId}`,
  },
  api: {
    me: '/api/admin/me',
    accountOwners: '/api/admin/users',
    accountOwnerDetail: (userId: string) => `/api/admin/users/${userId}`,
    organizations: '/api/admin/organizations',
    organizationDetail: (organizationId: string) => `/api/admin/organizations/${organizationId}`,
    subscriptions: '/api/admin/subscriptions',
  },
  navItems: [
    { id: 'accountOwners', href: '/admin/users', label: 'Account Owners' },
    { id: 'organizations', href: '/admin/organizations', label: 'Organizations' },
    { id: 'subscriptions', href: '/admin/subscriptions', label: 'Subscriptions' },
    { id: 'docs', href: '/admin/docs', label: 'Documentation' },
  ],
} as const;

export type PlatformAdminNavId = (typeof platformAdminNavigation.navItems)[number]['id'];
