import { BUILDCORE_DOCS_PRODUCT, getDocsCategory, getDocsProduct } from '@/platform/docs/docsCatalog';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export const DOCS_ADMIN_PLACEHOLDER_ARTICLES: readonly DocsAdminArticle[] = [
  {
    id: 'admin-buildcore-create-project',
    editorId: 'create-first-project',
    articleKey: 'create-first-project',
    source: 'placeholder',
    slug: 'create-first-project',
    title: 'Create Your First Project',
    summary: 'Step-by-step guide to creating a project in BuildCore.',
    product: 'buildcore',
    category: 'getting-started',
    visibility: 'public',
    status: 'draft',
    tags: ['getting-started', 'projects'],
    estimatedReadTime: '6 min read',
    lastUpdated: '2026-03-10',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [
      {
        slug: 'welcome',
        title: 'Welcome to BuildCore',
        product: 'buildcore',
        category: 'getting-started',
      },
    ],
    previousArticle: {
      slug: 'welcome',
      title: 'Welcome to BuildCore',
      product: 'buildcore',
      category: 'getting-started',
    },
    content: '## Create Your First Project\n\nPlaceholder content for the authoring interface.',
  },
  {
    id: 'admin-buildcore-project-overview',
    editorId: 'project-overview',
    articleKey: 'project-overview',
    source: 'placeholder',
    slug: 'project-overview',
    title: 'Project Overview and Navigation',
    summary: 'Understand the project workspace, tabs, and key actions.',
    product: 'buildcore',
    category: 'projects',
    visibility: 'public',
    status: 'published',
    tags: ['projects', 'navigation'],
    estimatedReadTime: '5 min read',
    lastUpdated: '2026-03-08',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [],
    content: '## Project Overview\n\nPlaceholder content for the authoring interface.',
  },
  {
    id: 'admin-buildcore-customer-portal',
    editorId: 'customer-portal-overview',
    articleKey: 'customer-portal-overview',
    source: 'placeholder',
    slug: 'customer-portal-overview',
    title: 'Customer Portal Overview',
    summary: 'How customers access project updates, documents, and messages.',
    product: 'buildcore',
    category: 'customers',
    visibility: 'authenticated',
    status: 'draft',
    tags: ['customers', 'portal'],
    estimatedReadTime: '4 min read',
    lastUpdated: '2026-02-28',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [],
    content: '## Customer Portal\n\nPlaceholder content for the authoring interface.',
  },
  {
    id: 'admin-buildcore-workflow-stages',
    editorId: 'configure-workflow-stages',
    articleKey: 'configure-workflow-stages',
    source: 'placeholder',
    slug: 'configure-workflow-stages',
    title: 'Configure Workflow Stages',
    summary: 'Customize stages and task templates for your team process.',
    product: 'buildcore',
    category: 'workflow',
    visibility: 'public',
    status: 'published',
    tags: ['workflow', 'configuration'],
    estimatedReadTime: '7 min read',
    lastUpdated: '2026-03-01',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [],
    content: '## Workflow Stages\n\nPlaceholder content for the authoring interface.',
  },
  {
    id: 'admin-buildcore-budget-basics',
    editorId: 'budget-basics',
    articleKey: 'budget-basics',
    source: 'placeholder',
    slug: 'budget-basics',
    title: 'Budget Basics',
    summary: 'Introduce budget lines, estimates, and tracking project costs.',
    product: 'buildcore',
    category: 'budget',
    visibility: 'public',
    status: 'published',
    tags: ['budget', 'finance'],
    estimatedReadTime: '8 min read',
    lastUpdated: '2026-02-20',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [],
    content: '## Budget Basics\n\nPlaceholder content for the authoring interface.',
  },
  {
    id: 'admin-buildcore-invite-team',
    editorId: 'invite-team-members',
    articleKey: 'invite-team-members',
    source: 'placeholder',
    slug: 'invite-team-members',
    title: 'Invite Team Members',
    summary: 'Add users to your organization and assign BuildCore access.',
    product: 'buildcore',
    category: 'permissions',
    visibility: 'authenticated',
    status: 'draft',
    tags: ['permissions', 'team'],
    estimatedReadTime: '5 min read',
    lastUpdated: '2026-03-05',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [],
    content: '## Invite Team Members\n\nPlaceholder content for the authoring interface.',
  },
  {
    id: 'admin-buildcore-release-1-5',
    editorId: 'buildcore-1-5-release-notes',
    articleKey: 'buildcore-1-5-release-notes',
    source: 'placeholder',
    slug: 'buildcore-1-5',
    title: 'BuildCore 1.5 Release Notes',
    summary: 'Bulk actions, zip radius filter, and other improvements in BuildCore 1.5.',
    product: 'buildcore',
    category: 'release-notes',
    visibility: 'public',
    status: 'published',
    tags: ['release-notes'],
    estimatedReadTime: '3 min read',
    lastUpdated: '2026-03-12',
    author: 'Zenformed Documentation',
    authorContext: '',
    relatedArticles: [],
    content: '## BuildCore 1.5\n\nPlaceholder release notes content for the authoring interface.',
  },
];

export function getDocsAdminProductOptions(): readonly {
  slug: DocsProductSlug;
  name: string;
}[] {
  return [{ slug: BUILDCORE_DOCS_PRODUCT.slug, name: BUILDCORE_DOCS_PRODUCT.name }];
}

export function getDocsAdminCategoryOptions(
  productSlug: DocsProductSlug,
): readonly { slug: DocsCategorySlug; title: string }[] {
  return getDocsProduct(productSlug).categories.map((category) => ({
    slug: category.slug,
    title: category.title,
  }));
}

export function getDocsAdminCategoryTitle(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
): string {
  return getDocsCategory(productSlug, categorySlug)?.title ?? categorySlug;
}

export function getDocsAdminProductName(productSlug: DocsProductSlug): string {
  return getDocsProduct(productSlug).name;
}
