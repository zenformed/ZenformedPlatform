import path from 'node:path';
import type { BuildCoreContentPathRef } from '../../src/platform/docs/docsImplementationKnowledgeTypes';
import { extractBlock, extractFieldsBlock, extractQuoted, readUtf8 } from './buildcoreSourceUtils';

const CONTENT_ROOT = 'buildCoreDashboardContent';

export type BuildCoreContentRegistry = ReadonlyMap<string, string>;

function extractDirectStringProperties(block: string): Record<string, string> {
  const properties: Record<string, string> = {};
  const pattern = /(\w+):\s*'((?:\\'|[^'])*)'/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(block)) != null) {
    properties[match[1]] = match[2];
  }
  return properties;
}

function addBlockStrings(
  registry: Map<string, string>,
  exportBlock: string,
  segments: readonly string[],
): void {
  let block = exportBlock;
  const pathParts = [CONTENT_ROOT];

  for (const segment of segments) {
    const next = extractBlock(block, segment);
    if (next == null) {
      return;
    }
    pathParts.push(segment);
    block = next;
  }

  const prefix = pathParts.join('.');
  for (const [key, value] of Object.entries(extractDirectStringProperties(block))) {
    registry.set(`${prefix}.${key}`, value);
  }

  const fieldsMatch = block.match(/fields:\s*\{/);
  if (fieldsMatch != null) {
    const parentSegment = segments[segments.length - 1];
    const parentBlock = segments.length === 1
      ? exportBlock
      : (() => {
          let parent = exportBlock;
          for (const segment of segments.slice(0, -1)) {
            const next = extractBlock(parent, segment);
            if (next == null) return null;
            parent = next;
          }
          return parent;
        })();
    if (parentBlock != null) {
      for (const [key, value] of Object.entries(extractFieldsBlock(parentBlock, parentSegment))) {
        registry.set(`${prefix}.fields.${key}`, value);
      }
    }
  }

  const columnsBlock = extractBlock(block, 'columns');
  if (columnsBlock != null) {
    for (const [key, value] of Object.entries(extractDirectStringProperties(columnsBlock))) {
      registry.set(`${prefix}.columns.${key}`, value);
    }
  }
}

const EXPLICIT_CONTENT_PATHS: readonly (readonly string[])[] = [
  ['crm', 'panel'],
  ['crm', 'filters'],
  ['crm', 'create'],
  ['crm', 'delete'],
  ['crm', 'table'],
  ['projectDetail'],
  ['projectDetail', 'sections'],
  ['projectDetail', 'edit'],
  ['projectDetail', 'subprojects'],
  ['projectDetail', 'workflow'],
  ['projectDetail', 'payments'],
  ['projectDetail', 'documents'],
  ['projectDetail', 'budget'],
  ['projectDetail', 'accountability'],
  ['teams'],
  ['teams', 'table'],
  ['teams', 'workflowTaskPermissions'],
  ['teams', 'paymentPermissions'],
  ['teams', 'budgetPermissions'],
  ['reports'],
  ['workflowSettings'],
  ['workflowStages'],
  ['leadCapture'],
  ['leadCapture', 'form'],
];

export function buildBuildCoreContentRegistry(buildCoreRoot: string): BuildCoreContentRegistry {
  const contentPath = path.join(buildCoreRoot, 'src/platform/content/buildCoreDashboardContent.ts');
  const source = readUtf8(contentPath);
  const exportMarker = `export const ${CONTENT_ROOT} = {`;
  const exportStart = source.indexOf(exportMarker);
  const registry = new Map<string, string>();

  if (exportStart === -1) {
    return registry;
  }

  const openBrace = exportStart + exportMarker.length - 1;
  let depth = 0;
  let end = openBrace;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }

  const exportBlock = source.slice(exportStart, end);

  for (const segments of EXPLICIT_CONTENT_PATHS) {
    addBlockStrings(registry, exportBlock, segments);
  }

  const crmBlock = extractBlock(exportBlock, 'crm') ?? '';
  registry.set(`${CONTENT_ROOT}.crm.create.title`, extractQuoted(extractBlock(crmBlock, 'create') ?? '', 'title') ?? 'New project');

  return registry;
}

export function resolveContentPath(registry: BuildCoreContentRegistry, path: string): string | undefined {
  const normalized = path.startsWith('content.') ? `${CONTENT_ROOT}.${path.slice('content.'.length)}` : path;
  return registry.get(normalized);
}

export function resolveContentPathSuffix(registry: BuildCoreContentRegistry, suffixPath: string): string | undefined {
  for (const [key, value] of registry.entries()) {
    if (key.endsWith(`.${suffixPath}`) || key === `${CONTENT_ROOT}.${suffixPath}`) {
      return value;
    }
  }
  return undefined;
}

export function searchContentRegistryPaths(
  registry: BuildCoreContentRegistry,
  pathIncludes: string,
): readonly BuildCoreContentPathRef[] {
  const refs: BuildCoreContentPathRef[] = [];
  for (const [contentPath, value] of registry.entries()) {
    if (contentPath.includes(pathIncludes)) {
      refs.push({ path: contentPath, value });
    }
  }
  return refs.sort((left, right) => left.path.localeCompare(right.path));
}
