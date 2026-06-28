import fs from 'node:fs';
import path from 'node:path';
import type {
  BuildCoreDocsKnowledge,
  BuildCoreFormField,
  BuildCoreNavigationItem,
  BuildCorePipelineStage,
  BuildCoreRoutePattern,
  BuildCoreUiLabel,
} from '../../src/platform/docs/docsProductKnowledgeTypes';

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function findMatchingBrace(source: string, openBraceIndex: number): number {
  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index + 1;
      }
    }
  }
  return source.length;
}

function extractBlock(source: string, blockName: string): string | undefined {
  const marker = `${blockName}: {`;
  const start = source.indexOf(marker);
  if (start === -1) {
    return undefined;
  }
  const openBrace = start + blockName.length + 1;
  const end = findMatchingBrace(source, openBrace);
  return source.slice(start, end);
}

function extractSingleQuoted(source: string, property: string): string | undefined {
  const pattern = new RegExp(`${property}:\\s*'((?:\\\\'|[^'])*)'`, 'm');
  const match = source.match(pattern);
  return match?.[1];
}

function extractQuoted(source: string, property: string): string | undefined {
  return extractSingleQuoted(source, property);
}

function extractFieldsBlock(source: string, blockMarker: string): Record<string, string> {
  const block = extractBlock(source, blockMarker);
  if (block == null) {
    return {};
  }

  const fieldsStart = block.indexOf('fields: {');
  if (fieldsStart === -1) {
    return {};
  }

  const openBrace = fieldsStart + 'fields: '.length;
  const end = findMatchingBrace(block, openBrace);
  const fieldsBody = block.slice(fieldsStart, end);
  const fields: Record<string, string> = {};
  const fieldPattern = /(\w+):\s*'((?:\\'|[^'])*)'/g;
  let match: RegExpExecArray | null;
  while ((match = fieldPattern.exec(fieldsBody)) != null) {
    fields[match[1]] = match[2];
  }

  return fields;
}

function extractSidebarItems(navigationSource: string): BuildCoreNavigationItem[] {
  const sidebarBlock = extractBlock(navigationSource, 'sidebar');
  if (sidebarBlock == null) {
    return [];
  }

  const routesBlock = extractBlock(navigationSource, 'routes');
  const items: BuildCoreNavigationItem[] = [];
  const itemPattern =
    /\{\s*id:\s*'([^']+)'[^}]*label:\s*'((?:\\'|[^'])*)'[^}]*title:\s*'((?:\\'|[^'])*)'/g;

  let match: RegExpExecArray | null;
  while ((match = itemPattern.exec(sidebarBlock)) != null) {
    const id = match[1];
    const routeKey = id === 'projects' ? 'dashboard' : id === 'workflowStages' ? 'workflowStages' : id;
    const route = (routesBlock != null ? extractQuoted(routesBlock, routeKey) : undefined) ?? '/dashboard';

    items.push({
      id,
      label: match[2],
      title: match[3],
      route,
    });
  }

  return items;
}

function extractStaticRoutes(navigationSource: string): BuildCoreRoutePattern[] {
  const routesBlock = extractBlock(navigationSource, 'routes');
  if (routesBlock == null) {
    return [];
  }

  const routes: BuildCoreRoutePattern[] = [];
  const routePattern = /(\w+):\s*'(\/[^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = routePattern.exec(routesBlock)) != null) {
    routes.push({ id: match[1], pattern: match[2] });
  }

  return routes;
}

function extractPipelineStages(pipelineSource: string): BuildCorePipelineStage[] {
  const stages: BuildCorePipelineStage[] = [];
  const stagePattern =
    /\{\s*slug:\s*'([^']+)',\s*label:\s*'((?:\\'|[^'])*)',\s*sortOrder:\s*(\d+)\s*\}/g;

  let match: RegExpExecArray | null;
  while ((match = stagePattern.exec(pipelineSource)) != null) {
    stages.push({
      slug: match[1],
      label: match[2],
      sortOrder: Number.parseInt(match[3], 10),
    });
  }

  return stages;
}

function scanDashboardPages(buildCoreRoot: string): { path: string; source: string }[] {
  const dashboardRoot = path.join(buildCoreRoot, 'app', '(dashboard)');
  if (!fs.existsSync(dashboardRoot)) {
    return [];
  }

  const pages: { path: string; source: string }[] = [];

  function walk(dir: string, routePrefix: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const segment =
          entry.name.startsWith('[') && entry.name.endsWith(']')
            ? `{${entry.name.slice(1, -1)}}`
            : entry.name;
        walk(fullPath, `${routePrefix}/${segment}`);
      } else if (entry.name === 'page.tsx') {
        pages.push({
          path: routePrefix === '' ? '/' : routePrefix,
          source: path.relative(buildCoreRoot, fullPath).replace(/\\/g, '/'),
        });
      }
    }
  }

  walk(dashboardRoot, '');
  return pages.sort((left, right) => left.path.localeCompare(right.path));
}

function mapFieldsRecord(record: Record<string, string>): BuildCoreFormField[] {
  return Object.entries(record).map(([id, label]) => ({ id, label }));
}

export function resolveBuildCoreRoot(platformRoot: string): string {
  const fromEnv = process.env.BUILDCORE_APP_PATH?.trim();
  if (fromEnv != null && fromEnv !== '') {
    return path.resolve(fromEnv);
  }

  return path.resolve(platformRoot, '..', 'BuildCore');
}

export function extractBuildCoreDocsKnowledge(buildCoreRoot: string): BuildCoreDocsKnowledge {
  const runtimePath = path.join(buildCoreRoot, 'src/platform/appDefinitions/buildcore-app-runtime.json');
  const navigationPath = path.join(buildCoreRoot, 'src/platform/navigation/buildCoreDashboardNavigation.ts');
  const contentPath = path.join(buildCoreRoot, 'src/platform/content/buildCoreDashboardContent.ts');
  const pipelinePath = path.join(buildCoreRoot, 'src/domain/crm/pipelineStage.ts');

  if (!fs.existsSync(runtimePath) || !fs.existsSync(navigationPath) || !fs.existsSync(contentPath)) {
    throw new Error(
      `BuildCore sources not found under ${buildCoreRoot}. Set BUILDCORE_APP_PATH or run from the ZenformedCore monorepo layout.`,
    );
  }

  const runtime = JSON.parse(readUtf8(runtimePath)) as {
    appSlug: string;
    displayName: string;
    description: string;
    descriptionShort: string;
    dashboardRoute: string;
  };

  const navigationSource = readUtf8(navigationPath);
  const contentSource = readUtf8(contentPath);
  const pipelineSource = fs.existsSync(pipelinePath) ? readUtf8(pipelinePath) : '';

  const crmBlock = extractBlock(contentSource, 'crm') ?? '';
  const createBlock = extractBlock(crmBlock, 'create') ?? '';
  const panelBlock = extractBlock(crmBlock, 'panel') ?? '';
  const filtersBlock = extractBlock(crmBlock, 'filters') ?? '';
  const projectDetailBlock = extractBlock(contentSource, 'projectDetail') ?? '';
  const sectionsBlock = extractBlock(projectDetailBlock, 'sections') ?? '';
  const editBlock = extractBlock(projectDetailBlock, 'edit') ?? '';
  const subprojectsBlock = extractBlock(projectDetailBlock, 'subprojects') ?? '';
  const workflowSettingsBlock = extractBlock(contentSource, 'workflowSettings') ?? '';
  const workflowStagesBlock = extractBlock(contentSource, 'workflowStages') ?? '';
  const reportsBlock = extractBlock(contentSource, 'reports') ?? '';
  const demoBlock = extractBlock(contentSource, 'demo') ?? '';
  const headerBlock = extractBlock(navigationSource, 'header') ?? '';
  const newProjectBlock = extractBlock(headerBlock, 'newProject') ?? '';

  const staticRoutes = extractStaticRoutes(navigationSource);
  const sidebar = extractSidebarItems(navigationSource);

  const dashboardRoute: BuildCoreRoutePattern = {
    id: 'dashboard',
    pattern: runtime.dashboardRoute,
    description: 'Projects list (default landing)',
  };

  const mergedStaticRoutes = staticRoutes.some((route) => route.id === 'dashboard')
    ? staticRoutes
    : [dashboardRoute, ...staticRoutes];

  const headerLabels: BuildCoreUiLabel[] = [
    {
      id: 'appsLauncher',
      label: extractQuoted(extractBlock(headerBlock, 'appsLauncher') ?? '', 'triggerAriaLabel') ?? 'Open apps',
      context: 'header',
    },
    {
      id: 'searchProjects',
      label: extractQuoted(extractBlock(headerBlock, 'search') ?? '', 'placeholder') ?? 'Search projects…',
      context: 'header search',
    },
    {
      id: 'newProjectButton',
      label: extractQuoted(newProjectBlock, 'ariaLabel') ?? 'New project',
      context: 'projects list plus button',
    },
    {
      id: 'accountMenu',
      label: extractQuoted(extractBlock(headerBlock, 'account') ?? '', 'menuTriggerAriaLabel') ?? 'Account menu',
      context: 'header',
    },
    {
      id: 'signOut',
      label:
        extractQuoted(extractBlock(extractBlock(headerBlock, 'account') ?? '', 'signOutButton') ?? '', 'label') ??
        'Sign out',
      context: 'account menu',
    },
  ];

  const filterLabels: BuildCoreUiLabel[] = [
    { id: 'stage', label: extractQuoted(filtersBlock, 'stageLabel') ?? 'Stage' },
    { id: 'priority', label: extractQuoted(filtersBlock, 'priorityLabel') ?? 'Priority' },
    { id: 'status', label: extractQuoted(filtersBlock, 'statusLabel') ?? 'Status' },
    { id: 'filterMenu', label: extractQuoted(filtersBlock, 'openMenu') ?? 'Filter projects' },
  ];

  const projectSections: BuildCoreUiLabel[] = [
    { id: 'projectInformation', label: extractQuoted(sectionsBlock, 'projectInformation') ?? 'Project information' },
    { id: 'financials', label: extractQuoted(sectionsBlock, 'financials') ?? 'Payments' },
    { id: 'workflow', label: extractQuoted(sectionsBlock, 'workflow') ?? 'Workflow tasks' },
    { id: 'documents', label: extractQuoted(sectionsBlock, 'documents') ?? 'Documents' },
    { id: 'accountability', label: extractQuoted(sectionsBlock, 'accountability') ?? 'Accountability' },
  ];

  const projectDetailRoutes: BuildCoreRoutePattern[] = [
    { id: 'detail', pattern: '/projects/{slug}', description: 'Project detail' },
    { id: 'tasks', pattern: '/projects/{slug}/tasks', description: 'Workflow tasks' },
    { id: 'documents', pattern: '/projects/{slug}/documents', description: 'Documents' },
    { id: 'financials', pattern: '/projects/{slug}/financials', description: 'Payments / financials' },
    { id: 'accountability', pattern: '/projects/{slug}/accountability', description: 'Accountability' },
    { id: 'budget', pattern: '/projects/{slug}/budget', description: 'Budget' },
    { id: 'subproject', pattern: '/projects/{parentSlug}/{subSlug}', description: 'Subproject detail' },
  ];

  const authRoutes = mergedStaticRoutes.filter((route) =>
    ['login', 'forgotPassword', 'resetPassword', 'home'].includes(route.id),
  );
  const appRoutes = mergedStaticRoutes.filter((route) => !authRoutes.some((authRoute) => authRoute.id === route.id));

  const createFields = extractFieldsBlock(crmBlock, 'create');

  return {
    generatedAt: new Date().toISOString(),
    sourceRoot: buildCoreRoot,
    product: {
      slug: runtime.appSlug,
      name: runtime.displayName,
      description: runtime.description,
      descriptionShort: runtime.descriptionShort,
      dashboardRoute: runtime.dashboardRoute,
    },
    navigation: {
      sidebar,
      header: headerLabels,
    },
    routes: {
      static: appRoutes,
      projectDetail: projectDetailRoutes,
      auth: authRoutes,
    },
    pages: scanDashboardPages(buildCoreRoot),
    projectsList: {
      panelTitle: extractQuoted(panelBlock, 'title') ?? 'Projects',
      searchPlaceholder: extractQuoted(panelBlock, 'searchPlaceholder') ?? 'Search projects…',
      filterLabels,
      createProject: {
        modalTitle: extractQuoted(createBlock, 'title') ?? 'New project',
        submitButton: extractQuoted(createBlock, 'submit') ?? 'Create project',
        cancelButton: extractQuoted(createBlock, 'cancel') ?? 'Cancel',
        plusButtonAria: extractQuoted(newProjectBlock, 'ariaLabel') ?? 'New project',
        formFields: mapFieldsRecord(createFields),
      },
    },
    projectDetail: {
      backLabel: extractQuoted(projectDetailBlock, 'backToProjects') ?? 'All projects',
      sections: projectSections,
      editModalTitle: extractQuoted(editBlock, 'title') ?? 'Edit project',
    },
    subprojects: {
      sectionTitle: extractQuoted(subprojectsBlock, 'title') ?? 'Subprojects',
      modalTitle: extractQuoted(subprojectsBlock, 'newSubprojectTitle') ?? 'New subproject',
      plusButtonAria: extractQuoted(subprojectsBlock, 'newSubprojectAriaLabel') ?? 'New subproject',
      submitButton: extractQuoted(createBlock, 'submit') ?? 'Create project',
    },
    settingsPages: [
      {
        id: 'workflowSettings',
        title: extractQuoted(workflowSettingsBlock, 'title') ?? 'Workflow Settings',
        breadcrumb: extractQuoted(workflowSettingsBlock, 'breadcrumb'),
      },
      {
        id: 'workflowStages',
        title: extractQuoted(workflowStagesBlock, 'title') ?? 'Workflow Stages',
        breadcrumb: extractQuoted(workflowStagesBlock, 'breadcrumb'),
      },
    ],
    workflow: {
      defaultPipelineStages: extractPipelineStages(pipelineSource),
      workflowSettingsTabs: [
        {
          id: 'workflowStages',
          label: extractQuoted(extractBlock(workflowSettingsBlock, 'folderTabs') ?? '', 'workflowStages') ?? 'Workflow Stages',
        },
        {
          id: 'alerts',
          label: extractQuoted(extractBlock(workflowSettingsBlock, 'folderTabs') ?? '', 'alerts') ?? 'Customer Task Alerts',
        },
      ],
    },
    reports: {
      title: extractQuoted(reportsBlock, 'title') ?? 'Reports',
      breadcrumb: extractQuoted(reportsBlock, 'breadcrumb') ?? 'CRM / Reports',
    },
    featureFlags: [
      {
        id: 'interactiveDemo',
        description: extractQuoted(extractBlock(demoBlock, 'banner') ?? '', 'title') ?? 'Interactive Demo',
      },
      {
        id: 'demoProjectCreationDisabled',
        description: extractQuoted(createBlock, 'mockDisabledMessage') ?? 'Project creation disabled in demo',
      },
    ],
  };
}
