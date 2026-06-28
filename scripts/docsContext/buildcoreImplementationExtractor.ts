import type { BuildCoreContentPathRef } from '../../src/platform/docs/docsImplementationKnowledgeTypes';
import path from 'node:path';
import fs from 'node:fs';
import type { BuildCoreFeatureKnowledge } from '../../src/platform/docs/docsFeatureKnowledgeTypes';
import type {
  BuildCoreFeatureImplementationKnowledge,
  BuildCoreImplementationKnowledgeIndex,
} from '../../src/platform/docs/docsImplementationKnowledgeTypes';
import {
  buildBuildCoreContentRegistry,
  resolveContentPath,
  resolveContentPathSuffix,
  type BuildCoreContentRegistry,
} from './buildcoreContentRegistry';
import { readUtf8 } from './buildcoreSourceUtils';

const CONTENT_PATH_PATTERN = /(?:content|copy|wf|crm|dash|fields|cols|labels|text|messages|strings|t)\.([a-zA-Z0-9_.]+)/g;
const CONTENT_ALIAS_PATTERN = /const\s+(\w+)\s*=\s*content\.([a-zA-Z0-9_.]+)/g;
const HTTP_METHOD_PATTERN = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g;
const PERMISSION_MESSAGE_PATTERN = /['"](You do not have permission[^'"]+)['"]/g;
const VALIDATION_MESSAGE_PATTERN = /message:\s*['"]([^'"]+)['"]/g;

const FEATURE_CONTENT_PATH_FILTERS: Readonly<Record<string, readonly string[]>> = {
  projects: ['buildCoreDashboardContent.crm', 'buildCoreDashboardContent.projectDetail'],
  'workflow-tasks': ['buildCoreDashboardContent.projectDetail.workflow'],
  payments: ['buildCoreDashboardContent.projectDetail.payments', 'buildCoreDashboardContent.projectDetail.workflow'],
  budget: ['buildCoreDashboardContent.projectDetail.budget'],
  documents: ['buildCoreDashboardContent.projectDetail.documents', 'buildCoreDashboardContent.projectDetail.workflow'],
  customers: ['buildCoreDashboardContent.crm.create', 'buildCoreDashboardContent.leadCapture', 'buildCoreDashboardContent.projectDetail.edit'],
  'workflow-settings': ['buildCoreDashboardContent.workflowSettings', 'buildCoreDashboardContent.workflowStages'],
  reports: ['buildCoreDashboardContent.reports'],
  permissions: ['buildCoreDashboardContent.teams.workflowTaskPermissions', 'buildCoreDashboardContent.teams.paymentPermissions', 'buildCoreDashboardContent.teams.budgetPermissions'],
  'team-members': ['buildCoreDashboardContent.teams'],
};

function uniqueSorted(values: Iterable<string>): string[] {
  const set = new Set<string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed.length >= 2 && !trimmed.includes('${') && !trimmed.includes('=>')) {
      set.add(trimmed);
    }
  }
  return [...set].sort((left, right) => left.localeCompare(right));
}

function resolvePathsFromSource(source: string, registry: BuildCoreContentRegistry): BuildCoreContentPathRef[] {
  const refs = new Map<string, string>();
  const aliases = new Map<string, string>();

  let aliasMatch: RegExpExecArray | null;
  const aliasPattern = new RegExp(CONTENT_ALIAS_PATTERN.source, 'g');
  while ((aliasMatch = aliasPattern.exec(source)) != null) {
    aliases.set(aliasMatch[1], aliasMatch[2]);
  }

  const fullMatchPattern = /\b(content|wf|copy|crm|dash|fields|cols|labels|text|messages|strings|t)\.([a-zA-Z0-9_.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = fullMatchPattern.exec(source)) != null) {
    const prefix = match[1];
    const suffix = match[2];
    const resolvedPath =
      prefix === 'content'
        ? suffix
        : aliases.has(prefix)
          ? `${aliases.get(prefix)}.${suffix}`
          : suffix;

    const fullPath = `buildCoreDashboardContent.${resolvedPath}`;
    const value = resolveContentPath(registry, fullPath) ?? resolveContentPathSuffix(registry, resolvedPath);
    if (value != null) {
      refs.set(fullPath, value);
    }
  }

  return [...refs.entries()]
    .map(([contentPath, value]) => ({ path: contentPath, value }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function extractApiOperations(
  buildCoreRoot: string,
  apiRoutePaths: readonly string[],
): BuildCoreFeatureImplementationKnowledge['apiOperations'] {
  const operations: Array<BuildCoreFeatureImplementationKnowledge['apiOperations'][number]> = [];

  for (const routePath of apiRoutePaths) {
    const filePath = path.join(buildCoreRoot, 'app', 'api', routePath.replace(/^\/api\//, ''), 'route.ts');
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const source = readUtf8(filePath);
    const descriptionMatch = source.match(/\/\*\*\s*\n([^*]*\*[^/]*)\*\//);
    const description = descriptionMatch?.[1]
      ?.split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trim())
      .filter((line) => line.length > 0 && !line.startsWith('GET') && !line.startsWith('POST'))
      .join(' ')
      .trim();

    let methodMatch: RegExpExecArray | null;
    const methodPattern = new RegExp(HTTP_METHOD_PATTERN.source, 'g');
    while ((methodMatch = methodPattern.exec(source)) != null) {
      operations.push({
        route: routePath,
        method: methodMatch[1],
        description: description === '' ? undefined : description,
      });
    }
  }

  return operations;
}

function extractDomainKnowledge(buildCoreRoot: string, domainFiles: readonly string[]): {
  readonly validation: string[];
  readonly permissions: string[];
  readonly statusValues: string[];
} {
  const validation = new Set<string>();
  const permissions = new Set<string>();
  const statusValues = new Set<string>();

  for (const relativePath of domainFiles) {
    const absolutePath = path.join(buildCoreRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const source = readUtf8(absolutePath);

    let validationMatch: RegExpExecArray | null;
    const validationPattern = new RegExp(VALIDATION_MESSAGE_PATTERN.source, 'g');
    while ((validationMatch = validationPattern.exec(source)) != null) {
      validation.add(validationMatch[1]);
    }

    let permissionMatch: RegExpExecArray | null;
    const permissionPattern = new RegExp(PERMISSION_MESSAGE_PATTERN.source, 'g');
    while ((permissionMatch = permissionPattern.exec(source)) != null) {
      permissions.add(permissionMatch[1]);
    }

    const statusArrayMatch = source.match(/WORKFLOW_TASK_STATUS_LABELS[^=]*=\s*\{([\s\S]*?)\}/);
    if (statusArrayMatch != null) {
      const labelPattern = /:\s*'((?:\\'|[^'])*)'/g;
      let labelMatch: RegExpExecArray | null;
      while ((labelMatch = labelPattern.exec(statusArrayMatch[1])) != null) {
        statusValues.add(labelMatch[1]);
      }
    }
  }

  return {
    validation: uniqueSorted(validation),
    permissions: uniqueSorted(permissions),
    statusValues: uniqueSorted(statusValues),
  };
}

function collectRegistryRefsForFeature(
  registry: BuildCoreContentRegistry,
  featureId: string,
): BuildCoreContentPathRef[] {
  const filters = FEATURE_CONTENT_PATH_FILTERS[featureId] ?? [];
  const refs: BuildCoreContentPathRef[] = [];

  for (const [contentPath, value] of registry.entries()) {
    if (filters.some((filter) => contentPath.startsWith(filter))) {
      refs.push({ path: contentPath, value });
    }
  }

  return refs.sort((left, right) => left.path.localeCompare(right.path));
}

function categorizeLabels(refs: readonly BuildCoreContentPathRef[]): {
  readonly buttons: string[];
  readonly modalTitles: string[];
  readonly fieldLabels: string[];
  readonly columnLabels: string[];
  readonly menuItems: string[];
  readonly emptyStates: string[];
  readonly confirmationDialogs: string[];
} {
  const buttons: string[] = [];
  const modalTitles: string[] = [];
  const fieldLabels: string[] = [];
  const columnLabels: string[] = [];
  const menuItems: string[] = [];
  const emptyStates: string[] = [];
  const confirmationDialogs: string[] = [];

  for (const ref of refs) {
    const key = ref.path.split('.').pop() ?? '';
    const lowerKey = key.toLowerCase();
    const value = ref.value;

    if (/(?:empty|no[A-Z]|none)/.test(key) || /no .* yet/i.test(value)) {
      emptyStates.push(value);
    } else if (/(?:confirm|Confirm)/.test(key) || /\?$/.test(value)) {
      confirmationDialogs.push(value);
    } else if (/(?:title|Title|Drawer|Modal)/.test(key) && !/(?:Failed|Success|Error)/.test(key)) {
      modalTitles.push(value);
    } else if (/(?:columns?|Column)/.test(ref.path) || lowerKey.endsWith('label')) {
      if (ref.path.includes('.columns.') || ref.path.includes('.fields.')) {
        if (ref.path.includes('.columns.')) {
          columnLabels.push(value);
        } else {
          fieldLabels.push(value);
        }
      } else {
        fieldLabels.push(value);
      }
    } else if (
      /(?:submit|cancel|add|save|delete|edit|upload|download|notify|mark|create|remove|archive|send|expand|collapse|view|filter|search|pick|choose|taskSubmit|viewAll|addTask|editTask|deleteTask|archiveTask)/i.test(
        key,
      )
    ) {
      buttons.push(value);
    } else if (/(?:action|menu|Menu)/.test(key)) {
      menuItems.push(value);
    } else if (ref.path.includes('.fields.')) {
      fieldLabels.push(value);
    }
  }

  return {
    buttons: uniqueSorted(buttons),
    modalTitles: uniqueSorted(modalTitles),
    fieldLabels: uniqueSorted(fieldLabels),
    columnLabels: uniqueSorted(columnLabels),
    menuItems: uniqueSorted(menuItems),
    emptyStates: uniqueSorted(emptyStates),
    confirmationDialogs: uniqueSorted(confirmationDialogs),
  };
}

function buildWorkflowFromImplementation(
  feature: BuildCoreFeatureKnowledge,
  refs: readonly BuildCoreContentPathRef[],
): BuildCoreFeatureImplementationKnowledge['workflow'] {
  const refValues = new Set(refs.map((ref) => ref.value));
  const steps: Array<BuildCoreFeatureImplementationKnowledge['workflow'][number]> = [];

  const flows = [
    feature.creationFlow,
    feature.editFlow,
    feature.deleteFlow,
  ].filter((flow) => flow != null);

  let order = 1;
  for (const flow of flows) {
    if (flow == null) continue;
    for (const step of flow.steps ?? []) {
      const confirmedLabels = (step.uiLabels ?? []).filter((label) => refValues.has(label));
      steps.push({
        order,
        description: step.description,
        uiLabels: confirmedLabels.length > 0 ? confirmedLabels : step.uiLabels,
      });
      order += 1;
    }
  }

  return steps;
}

function discoverRelatedPresentationFiles(
  buildCoreRoot: string,
  componentFiles: readonly string[],
): string[] {
  const related = new Set<string>();
  const importPattern = /from\s+['"]@\/presentation\/([^'"]+)['"]/g;

  for (const relativePath of componentFiles) {
    const source = readUtf8(path.join(buildCoreRoot, relativePath));
    let match: RegExpExecArray | null;
    while ((match = importPattern.exec(source)) != null) {
      const importPath = match[1];
      if (importPath.includes('crmProjectDetail') || importPath.includes('crmCreate') || importPath.includes('crmAssignment')) {
        related.add(`src/presentation/${importPath.replace(/\.tsx?$/, '')}.ts`);
        related.add(`src/presentation/${importPath.replace(/\.tsx?$/, '')}.tsx`);
      }
    }
  }

  return uniqueSorted(related).filter((filePath) => fs.existsSync(path.join(buildCoreRoot, filePath)));
}

function buildFeatureImplementation(
  buildCoreRoot: string,
  feature: BuildCoreFeatureKnowledge,
  registry: BuildCoreContentRegistry,
): BuildCoreFeatureImplementationKnowledge {
  const componentFiles = feature.reactComponents;
  const domainFiles = [
    ...feature.domainServices,
    ...discoverRelatedPresentationFiles(buildCoreRoot, componentFiles),
  ];

  const scannedRefs: BuildCoreContentPathRef[] = [];
  for (const relativePath of componentFiles) {
    const source = readUtf8(path.join(buildCoreRoot, relativePath));
    for (const ref of resolvePathsFromSource(source, registry)) {
      scannedRefs.push({ ...ref, sourceFile: relativePath });
    }
  }

  const registryRefs = collectRegistryRefsForFeature(registry, feature.id);
  const contentPathRefMap = new Map<string, BuildCoreContentPathRef>();
  for (const ref of [...scannedRefs, ...registryRefs]) {
    contentPathRefMap.set(`${ref.path}::${ref.value}`, ref);
  }
  const contentPathRefs = [...contentPathRefMap.values()].sort((left, right) => left.path.localeCompare(right.path));

  const categorized = categorizeLabels(contentPathRefs);
  const domainKnowledge = extractDomainKnowledge(buildCoreRoot, domainFiles);
  const apiOperations = extractApiOperations(buildCoreRoot, feature.apiEndpoints);

  const snippets: Array<BuildCoreFeatureImplementationKnowledge['snippets'][number]> = [];
  for (const ref of contentPathRefs) {
    if (ref.sourceFile != null && /(?:addTask|taskSubmit|taskDrawer|archiveTask|deleteTask|create\.submit|create\.title)/.test(ref.path)) {
      snippets.push({
        file: ref.sourceFile,
        label: ref.path,
        code: ref.value,
      });
    }
    if (snippets.length >= 12) break;
  }

  return {
    featureId: feature.id,
    componentFiles,
    domainFiles,
    apiRoutes: apiOperations,
    buttons: uniqueSorted([...categorized.buttons, ...feature.buttons.map((button) => button.label)]),
    modalTitles: uniqueSorted([...categorized.modalTitles, ...feature.modals.map((modal) => modal.title)]),
    fieldLabels: uniqueSorted([...categorized.fieldLabels, ...feature.formFields.map((field) => field.label)]),
    columnLabels: categorized.columnLabels,
    menuItems: uniqueSorted([...categorized.menuItems, ...feature.buttons.map((button) => button.label)]),
    emptyStates: categorized.emptyStates,
    confirmationDialogs: categorized.confirmationDialogs,
    statusValues: uniqueSorted([...domainKnowledge.statusValues, ...feature.statusValues]),
    validation: uniqueSorted([...domainKnowledge.validation, ...feature.validation]),
    permissions: uniqueSorted([...domainKnowledge.permissions]),
    workflow: buildWorkflowFromImplementation(feature, contentPathRefs),
    apiOperations,
    relatedComponents: uniqueSorted(componentFiles.map((file) => path.basename(file, path.extname(file)))),
    contentPathRefs,
    snippets,
  };
}

export function extractBuildCoreImplementationKnowledge(
  buildCoreRoot: string,
  features: readonly BuildCoreFeatureKnowledge[],
): BuildCoreImplementationKnowledgeIndex {
  const registry = buildBuildCoreContentRegistry(buildCoreRoot);

  return {
    generatedAt: new Date().toISOString(),
    sourceRoot: buildCoreRoot,
    features: features.map((feature) => buildFeatureImplementation(buildCoreRoot, feature, registry)),
  };
}
