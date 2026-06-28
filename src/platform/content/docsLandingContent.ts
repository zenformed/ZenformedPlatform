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
