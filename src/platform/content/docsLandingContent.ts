import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { docsProductPath } from '@/platform/docs/docsTypes';

export type DocsCardId = 'my-account' | PlatformAppId;

export type DocsLandingCard = {
  readonly id: DocsCardId;
  readonly name: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly actionHref: string;
  readonly status: 'live' | 'coming_soon';
  readonly iconAppId?: PlatformAppId;
};

export type DocsRecentUpdate = {
  readonly id: string;
  readonly productLabel: string;
  readonly title: string;
  readonly accentColor: string;
  readonly date: string;
};

export type DocsPopularArticle = {
  readonly id: string;
  readonly title: string;
  readonly href: string;
};

export const DOCS_LANDING_CARDS: readonly DocsLandingCard[] = [
  {
    id: 'my-account',
    name: 'My Account',
    description: 'Manage your account, organizations, billing, and platform settings.',
    actionLabel: 'View Documentation',
    actionHref: '#',
    status: 'live',
  },
  {
    id: 'buildcore',
    name: 'BuildCore',
    description: 'Construction CRM for managing projects, teams, and finances.',
    actionLabel: 'View Documentation',
    actionHref: docsProductPath('buildcore'),
    status: 'live',
    iconAppId: 'buildcore',
  },
  {
    id: 'forgecore',
    name: 'ForgeCore',
    description: 'Manufacturing ERP for fabricators and manufacturers.',
    actionLabel: 'Preview Documentation',
    actionHref: '#',
    status: 'coming_soon',
    iconAppId: 'forgecore',
  },
  {
    id: 'formcore',
    name: 'FormCore',
    description: 'Forms & Document Automation for your organization.',
    actionLabel: 'Preview Documentation',
    actionHref: '#',
    status: 'coming_soon',
    iconAppId: 'formcore',
  },
  {
    id: 'analyticscore',
    name: 'AnalyticsCore',
    description: 'Business intelligence and reporting across all your apps.',
    actionLabel: 'Preview Documentation',
    actionHref: '#',
    status: 'coming_soon',
    iconAppId: 'analyticscore',
  },
];

export const DOCS_RECENT_UPDATES: readonly DocsRecentUpdate[] = [
  {
    id: 'buildcore-1-5',
    productLabel: 'BuildCore',
    title: 'BuildCore 1.5 — Bulk Actions, Zip Radius Filter & More',
    accentColor: '#2563eb',
    date: 'Mar 12, 2026',
  },
  {
    id: 'account-billing',
    productLabel: 'Account',
    title: 'Billing Improvements & Subscription Management',
    accentColor: '#119247',
    date: 'Feb 28, 2026',
  },
  {
    id: 'forgecore-inventory',
    productLabel: 'ForgeCore',
    title: 'Inventory Workflow Enhancements',
    accentColor: '#ea580c',
    date: 'Feb 14, 2026',
  },
];

export const DOCS_POPULAR_ARTICLES: readonly DocsPopularArticle[] = [
  {
    id: 'first-project',
    title: 'Creating Your First Project in BuildCore',
    href: '#',
  },
  {
    id: 'invite-team',
    title: 'Inviting Team Members to Your Organization',
    href: '#',
  },
  {
    id: 'permissions',
    title: 'Managing Permissions and Roles',
    href: '#',
  },
  {
    id: 'billing',
    title: 'Understanding Your Billing and Subscriptions',
    href: '#',
  },
];
