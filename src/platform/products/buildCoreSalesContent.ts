export type BuildCoreBenefitIconId = 'projects' | 'portal' | 'budgets' | 'reporting';

export type BuildCoreBenefitCard = {
  readonly icon: BuildCoreBenefitIconId;
  readonly title: string;
  readonly description: string;
};

export type BuildCoreScreenshotCard = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Public path under /public when product screenshots are available. */
  readonly imageSrc?: string;
  readonly imageAlt?: string;
};

export type BuildCoreFaqItem = {
  readonly question: string;
  readonly answer: string;
};

export const BUILDCORE_SALES_HERO = {
  headline: 'Run every project from one place',
  subheadline:
    'Keep projects, customers, workflow, budgets, payments, and reporting connected—so your team spends less time chasing updates and more time delivering jobs.',
  trustItems: [
    'Unlimited project photos',
    'Documents',
    'Customer uploads included',
  ] as const,
};

export const BUILDCORE_SALES_BENEFITS: readonly BuildCoreBenefitCard[] = [
  {
    icon: 'projects',
    title: 'Projects & Subprojects',
    description: 'Track every job from estimate to completion without losing context between phases.',
  },
  {
    icon: 'portal',
    title: 'Customer Side Portal',
    description: 'Give customers a clear place to upload documents, respond to requests, and stay on schedule.',
  },
  {
    icon: 'budgets',
    title: 'Budgets & Payments',
    description: 'See costs, invoices, and collections together so profitability stays visible on every job.',
  },
  {
    icon: 'reporting',
    title: 'Realtime Reporting',
    description: 'Review MTD, YTD, and all-time performance without exporting spreadsheets.',
  },
];

export const BUILDCORE_SALES_SCREENSHOTS: readonly BuildCoreScreenshotCard[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Executive overview of active projects, tasks, and financial health.',
    imageSrc: '/buildcore-sales/dashboard.png',
    imageAlt: 'BuildCore dashboard overview',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Organize jobs, subprojects, milestones, and team assignments.',
    imageSrc: '/buildcore-sales/projects.png',
    imageAlt: 'BuildCore projects view',
  },
  {
    id: 'workflow',
    title: 'Workflow',
    description: 'Coordinate tasks, customer uploads, and field updates in one place.',
    imageSrc: '/buildcore-sales/workflow.png',
    imageAlt: 'BuildCore workflow tasks',
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'MTD, YTD, and all-time reporting for projects and profitability.',
    imageSrc: '/buildcore-sales/reports.png',
    imageAlt: 'BuildCore reporting view',
  },
];

export type BuildCoreWhyFeatureItem = {
  readonly title: string;
  readonly description: string;
};

export const BUILDCORE_SALES_WHY_SECTION = {
  title: 'Built specifically for construction teams',
  intro:
    'BuildCore was designed around the way construction businesses actually operate—from first customer contact through project completion and payment collection.',
  items: [
    {
      title: 'Track projects and subprojects in one place',
      description:
        'Keep parent projects, subprojects, milestones, and deliverables organized from start to finish.',
    },
    {
      title: 'Assign work and monitor progress',
      description: 'Know exactly what needs attention and where every project stands.',
    },
    {
      title: 'Collect documents from customers',
      description:
        'Allow customers to upload files, photos, approvals, and required documentation.',
    },
    {
      title: 'Manage budgets and payments',
      description: 'Track project value, collections, costs, and profitability in real time.',
    },
    {
      title: 'Keep your team aligned',
      description:
        'Assign tasks, due dates, and responsibilities without relying on spreadsheets.',
    },
    {
      title: 'Generate executive reports',
      description: 'Review MTD, YTD, and all-time performance across projects and operations.',
    },
    {
      title: 'Maintain a complete project history',
      description:
        'Keep communication, documents, workflow activity, and financial records together.',
    },
    {
      title: 'Scale as your company grows',
      description: 'Add users, projects, and customers without changing systems.',
    },
  ] as const satisfies readonly BuildCoreWhyFeatureItem[],
};

export const BUILDCORE_SALES_FAQ: readonly BuildCoreFaqItem[] = [
  {
    question: 'Why BuildCore instead of spreadsheets?',
    answer:
      'Spreadsheets can store information, but they cannot manage customer uploads, workflow approvals, project progress, budgets, payments, and team collaboration in one place.',
  },
  {
    question: 'Can I upgrade later?',
    answer:
      'Yes. Upgrade or switch plans anytime from your organization billing settings. Upgrades take effect immediately with prorated billing.',
  },
  {
    question: 'How many users can I add?',
    answer:
      'Each plan includes a set number of seats. Starter includes 3 seats, Growth includes 10, and Pro includes 25. You can invite team members from your organization settings.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'You can cancel at the end of your billing period. Your organization keeps access until the current period ends, and you will not be charged again unless you reactivate.',
  },
  {
    question: 'Do customers need accounts?',
    answer:
      'Customers use the BuildCore customer portal with secure links for uploads and assigned tasks. They do not need full Zenformed accounts.',
  },
  {
    question: 'Can I import existing projects?',
    answer:
      'Contact our team for onboarding assistance. We can help you plan migration from spreadsheets or legacy tools as you roll out BuildCore.',
  },
  {
    question: 'Is support included?',
    answer:
      'All plans include email support. Growth includes priority email support, and Pro includes priority support with onboarding assistance.',
  },
];

export const BUILDCORE_SALES_FINAL_CTA = {
  headline: 'Ready to run your construction business from one place?',
  supportText:
    'Bring projects, customers, budgets, payments, and reporting together in BuildCore—so your team can focus on building, not chasing information.',
};

export const BUILDCORE_PRICING_SECTION_ID = 'buildcore-pricing';
