export type PlatformAppId = 'buildcore' | 'forgecore' | 'formcore' | 'analyticscore';

export type PlatformAppStatus = 'live' | 'coming_soon';

export type PlatformAppEntry = {
  readonly id: PlatformAppId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly iconSrc?: string;
  readonly launchTarget?: PlatformAppId;
  readonly href?: string;
  readonly status: PlatformAppStatus;
};

export const PLATFORM_APPS: readonly PlatformAppEntry[] = [
  {
    id: 'buildcore',
    name: 'BuildCore',
    tagline: 'Construction CRM',
    description:
      'CRM and project management for construction teams — from lead to invoice.',
    features: ['Leads & Contacts', 'Projects & Tasks', 'Team Coordination', 'Customer Portal'],
    launchTarget: 'buildcore',
    status: 'live',
  },
  {
    id: 'forgecore',
    name: 'ForgeCore',
    tagline: 'Manufacturing ERP',
    description: 'Operations for fabricators and manufacturers — inventory through production.',
    features: ['Inventory & Suppliers', 'Purchase Orders', 'Fabrication Workflows', 'Quote to Production'],
    status: 'coming_soon',
  },
  {
    id: 'formcore',
    name: 'FormCore',
    tagline: 'Forms & Document Automation',
    description: 'Digital forms, documents, and approval workflows for your organization.',
    features: ['Custom Forms', 'PDF Generation', 'E-Signatures', 'Approval Workflows', 'Mobile Capture'],
    status: 'coming_soon',
  },
  {
    id: 'analyticscore',
    name: 'AnalyticsCore',
    tagline: 'Business Intelligence',
    description:
      'Dashboards, KPIs, and reporting across your Zenformed apps — turn operational data into actionable insight.',
    features: [
      'Executive dashboard',
      'Revenue analytics',
      'Profit analytics',
      'Project performance reporting',
      'Pipeline reporting',
    ],
    iconSrc: '/zenformed-app-icons/analyticscore.png',
    status: 'coming_soon',
  },
];
