import { encodeDocsAdminArticleKey } from '@/platform/docs/docsAdminArticleKey';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsContentPlanStatus = 'not_started' | 'draft' | 'published';

export type DocsContentPlanItemDefinition = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly categorySlug: DocsCategorySlug;
};

export type DocsContentPlanGroupDefinition = {
  readonly id: string;
  readonly title: string;
  readonly items: readonly DocsContentPlanItemDefinition[];
};

export type DocsContentPlanItem = DocsContentPlanItemDefinition & {
  readonly categoryLabel: string;
  readonly status: DocsContentPlanStatus;
  readonly editorId?: string;
};

export type DocsContentPlanGroup = {
  readonly id: string;
  readonly title: string;
  readonly items: readonly DocsContentPlanItem[];
};

const BUILDCORE_PRODUCT: DocsProductSlug = 'buildcore';

/**
 * First recommended BuildCore articles, derived from generated product context
 * (`docs/generated/buildcore.context.json`) and `DOCUMENTATION_SYSTEM.md`.
 */
export const BUILDCORE_DOCS_CONTENT_PLAN: readonly DocsContentPlanGroupDefinition[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      {
        slug: 'welcome',
        title: 'Welcome to BuildCore',
        summary:
          'Introduce BuildCore as the construction and trades CRM inside Zenformed and what the Projects dashboard is for.',
        categorySlug: 'getting-started',
      },
      {
        slug: 'open-buildcore-from-zenformed',
        title: 'Open BuildCore from Zenformed',
        summary:
          'Use the apps launcher and account menu to open BuildCore from your Zenformed organization.',
        categorySlug: 'getting-started',
      },
      {
        slug: 'navigate-buildcore',
        title: 'Navigate BuildCore',
        summary:
          'Tour the sidebar (Projects, Reports, Teams, Workflow Settings), header search, and New project action.',
        categorySlug: 'getting-started',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    items: [
      {
        slug: 'create-project',
        title: 'Create a Project',
        summary:
          'Walk through the New project modal fields—customer name, contact details, stage, priority, address, and assignment.',
        categorySlug: 'projects',
      },
      {
        slug: 'parent-projects',
        title: 'Parent and Child Projects',
        summary:
          'Explain parent projects, subprojects, and when to use the Subprojects section on project detail.',
        categorySlug: 'projects',
      },
      {
        slug: 'project-detail-overview',
        title: 'Project Detail Overview',
        summary:
          'Describe project information, payments, workflow tasks, documents, and accountability sections on a project page.',
        categorySlug: 'projects',
      },
      {
        slug: 'search-and-filter-projects',
        title: 'Search and Filter Projects',
        summary:
          'Use header search and stage, priority, and status filters on the Projects list.',
        categorySlug: 'projects',
      },
    ],
  },
  {
    id: 'workflow',
    title: 'Workflow',
    items: [
      {
        slug: 'workflow-settings-overview',
        title: 'Workflow Settings Overview',
        summary:
          'Open Organization / Workflow Settings and explain the Workflow Stages and Customer Task Alerts tabs.',
        categorySlug: 'workflow',
      },
      {
        slug: 'configure-workflow-stages',
        title: 'Configure Workflow Stages',
        summary:
          'Customize the default pipeline from New Lead through Complete for your organization.',
        categorySlug: 'workflow',
      },
      {
        slug: 'workflow-tasks',
        title: 'Manage Workflow Tasks',
        summary:
          'Work with tasks on a project’s Workflow tasks section, including stage progression and assignments.',
        categorySlug: 'workflow',
      },
      {
        slug: 'customer-task-alerts',
        title: 'Customer Task Alerts',
        summary:
          'Configure customer reminders linked to workflow tasks from Workflow Settings.',
        categorySlug: 'workflow',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    items: [
      {
        slug: 'project-documents',
        title: 'Project Documents',
        summary:
          'Upload and manage files on the Documents section of a project or subproject.',
        categorySlug: 'documents',
      },
      {
        slug: 'organize-project-documents',
        title: 'Organize Project Documents',
        summary:
          'Keep project files organized and accessible from the project Documents tab.',
        categorySlug: 'documents',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {
        slug: 'project-financials',
        title: 'Project Financials Overview',
        summary:
          'Introduce the Payments section on project detail and how financials relate to milestones.',
        categorySlug: 'payments',
      },
      {
        slug: 'track-revenue-and-balance',
        title: 'Track Revenue, Collected, and Balance',
        summary:
          'Explain revenue, collected amounts, and remaining balance on project financials.',
        categorySlug: 'payments',
      },
    ],
  },
  {
    id: 'budget',
    title: 'Budget',
    items: [
      {
        slug: 'budget-basics',
        title: 'Budget Basics',
        summary:
          'Introduce budget entries, estimates, and tracking costs on the project Budget section.',
        categorySlug: 'budget',
      },
      {
        slug: 'manage-budget-entries',
        title: 'Manage Budget Entries',
        summary:
          'Add, edit, and review budget line items for a project or subproject.',
        categorySlug: 'budget',
      },
    ],
  },
  {
    id: 'teams',
    title: 'Teams',
    items: [
      {
        slug: 'teams-overview',
        title: 'Teams Overview',
        summary:
          'Open the Teams sidebar page and explain how organization teams are organized in BuildCore.',
        categorySlug: 'settings',
      },
      {
        slug: 'invite-team-members',
        title: 'Invite Team Members',
        summary:
          'Add users to your organization and assign BuildCore access for team collaboration.',
        categorySlug: 'permissions',
      },
    ],
  },
  {
    id: 'permissions',
    title: 'Permissions',
    items: [
      {
        slug: 'role-based-access',
        title: 'Role-Based Access in BuildCore',
        summary:
          'Describe how roles and permissions control what members can view and change.',
        categorySlug: 'permissions',
      },
      {
        slug: 'workflow-task-permissions',
        title: 'Workflow Task Permissions',
        summary:
          'Explain who can view or complete workflow tasks based on assignment and organization access.',
        categorySlug: 'permissions',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    items: [
      {
        slug: 'crm-reports-overview',
        title: 'CRM Reports Overview',
        summary:
          'Access organization reports from the Reports sidebar page (CRM / Reports).',
        categorySlug: 'reports',
      },
      {
        slug: 'export-organization-data',
        title: 'Export Organization Data',
        summary:
          'Download or share report outputs from BuildCore reports for offline analysis.',
        categorySlug: 'reports',
      },
    ],
  },
];

function findPlanArticle(
  articles: readonly DocsAdminArticle[],
  item: DocsContentPlanItemDefinition,
): DocsAdminArticle | undefined {
  return articles.find(
    (article) =>
      article.product === BUILDCORE_PRODUCT &&
      article.category === item.categorySlug &&
      article.slug === item.slug,
  );
}

export function resolveDocsContentPlanItem(
  articles: readonly DocsAdminArticle[],
  group: DocsContentPlanGroupDefinition,
  item: DocsContentPlanItemDefinition,
): DocsContentPlanItem {
  const match = findPlanArticle(articles, item);

  if (match == null) {
    return {
      ...item,
      categoryLabel: group.title,
      status: 'not_started',
    };
  }

  return {
    ...item,
    categoryLabel: group.title,
    status: match.status,
    editorId: match.editorId,
  };
}

export function resolveBuildCoreDocsContentPlan(
  articles: readonly DocsAdminArticle[],
): readonly DocsContentPlanGroup[] {
  return BUILDCORE_DOCS_CONTENT_PLAN.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => resolveDocsContentPlanItem(articles, group, item)),
  }));
}

export function buildDocsContentPlanEditorId(
  item: Pick<DocsContentPlanItemDefinition, 'categorySlug' | 'slug'>,
): string {
  return encodeDocsAdminArticleKey(BUILDCORE_PRODUCT, item.categorySlug, item.slug);
}
