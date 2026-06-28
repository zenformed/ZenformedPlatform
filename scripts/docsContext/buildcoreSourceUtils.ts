import fs from 'node:fs';
import path from 'node:path';

export function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function findMatchingBrace(source: string, openBraceIndex: number): number {
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

export function extractBlock(source: string, blockName: string): string | undefined {
  const marker = `${blockName}: {`;
  const start = source.indexOf(marker);
  if (start === -1) {
    return undefined;
  }
  const openBrace = start + blockName.length + 1;
  const end = findMatchingBrace(source, openBrace);
  return source.slice(start, end);
}

export function extractSingleQuoted(source: string, property: string): string | undefined {
  const pattern = new RegExp(`${property}:\\s*'((?:\\\\'|[^'])*)'`, 'm');
  const match = source.match(pattern);
  return match?.[1];
}

export function extractQuoted(source: string, property: string): string | undefined {
  return extractSingleQuoted(source, property);
}

export function extractFieldsBlock(source: string, blockMarker: string): Record<string, string> {
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

export function mapFieldsRecord(record: Record<string, string>): { readonly id: string; readonly label: string }[] {
  return Object.entries(record).map(([id, label]) => ({ id, label }));
}

export function extractStringLiterals(source: string, property: string): string[] {
  const blockPattern = new RegExp(`${property}:\\s*\\[([^\\]]*)\\]`, 's');
  const blockMatch = source.match(blockPattern);
  if (blockMatch == null) {
    return [];
  }

  const values: string[] = [];
  const literalPattern = /'((?:\\'|[^'])*)'/g;
  let match: RegExpExecArray | null;
  while ((match = literalPattern.exec(blockMatch[1])) != null) {
    values.push(match[1]);
  }
  return values;
}

export function extractConstArray(source: string, exportName: string): string[] {
  const pattern = new RegExp(
    `export const ${exportName}[^=]*=\\s*\\[([^\\]]+)\\]\\s*as const`,
    's',
  );
  const match = source.match(pattern);
  if (match == null) {
    return [];
  }

  const values: string[] = [];
  const literalPattern = /'([^']+)'/g;
  let literalMatch: RegExpExecArray | null;
  while ((literalMatch = literalPattern.exec(match[1])) != null) {
    values.push(literalMatch[1]);
  }
  return values;
}

export function extractConstRecordLabels(
  source: string,
  exportName: string,
): { readonly id: string; readonly label: string }[] {
  const pattern = new RegExp(`export const ${exportName}[^=]*=\\s*\\{([^}]+)\\}`, 's');
  const match = source.match(pattern);
  if (match == null) {
    return [];
  }

  const entries: { readonly id: string; readonly label: string }[] = [];
  const entryPattern = /(\w+):\s*'((?:\\'|[^'])*)'/g;
  let entryMatch: RegExpExecArray | null;
  while ((entryMatch = entryPattern.exec(match[1])) != null) {
    entries.push({ id: entryMatch[1], label: entryMatch[2] });
  }
  return entries;
}

export function listFilesRecursive(rootDir: string, filter: (filePath: string) => boolean): string[] {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const results: string[] = [];

  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (filter(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return results.sort((left, right) => left.localeCompare(right));
}

export function toRepoRelativePath(buildCoreRoot: string, absolutePath: string): string {
  return path.relative(buildCoreRoot, absolutePath).replace(/\\/g, '/');
}

export function listApiRoutes(buildCoreRoot: string): string[] {
  const apiRoot = path.join(buildCoreRoot, 'app', 'api');
  const routeFiles = listFilesRecursive(apiRoot, (filePath) => filePath.endsWith(`${path.sep}route.ts`));
  return routeFiles.map((filePath) => {
    const relative = toRepoRelativePath(buildCoreRoot, filePath);
    const routeSegment = relative.replace(/^app\/api\//, '').replace(/\/route\.ts$/, '');
    return `/api/${routeSegment}`;
  });
}

export function filterApiRoutes(routes: readonly string[], patterns: readonly RegExp[]): string[] {
  return routes.filter((route) => patterns.some((pattern) => pattern.test(route)));
}

export function listComponentFiles(buildCoreRoot: string, directoryNames: readonly string[]): string[] {
  const componentsRoot = path.join(buildCoreRoot, 'src', 'presentation', 'components');
  const files: string[] = [];

  for (const directoryName of directoryNames) {
    const directoryPath = path.join(componentsRoot, directoryName);
    files.push(
      ...listFilesRecursive(directoryPath, (filePath) => filePath.endsWith('.tsx')).map((filePath) =>
        toRepoRelativePath(buildCoreRoot, filePath),
      ),
    );
  }

  return [...new Set(files)].sort((left, right) => left.localeCompare(right));
}

export function listDomainServiceFiles(buildCoreRoot: string, fileNamePatterns: readonly RegExp[]): string[] {
  const serverRoot = path.join(buildCoreRoot, 'src', 'infrastructure');
  const files = listFilesRecursive(serverRoot, (filePath) => filePath.endsWith('.ts') && !filePath.endsWith('.test.ts'));
  return files
    .filter((filePath) => fileNamePatterns.some((pattern) => pattern.test(path.basename(filePath))))
    .map((filePath) => toRepoRelativePath(buildCoreRoot, filePath))
    .sort((left, right) => left.localeCompare(right));
}

export function extractSupabaseTablesFromFiles(buildCoreRoot: string, relativeFilePaths: readonly string[]): string[] {
  const tablePattern = /\.from\(\s*['"]([a-z0-9_]+)['"]\s*\)/g;
  const tables = new Set<string>();

  for (const relativePath of relativeFilePaths) {
    const absolutePath = path.join(buildCoreRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const source = readUtf8(absolutePath);
    let match: RegExpExecArray | null;
    while ((match = tablePattern.exec(source)) != null) {
      tables.add(match[1]);
    }
  }

  return [...tables].sort((left, right) => left.localeCompare(right));
}

export function collectLimitationStrings(source: string): string[] {
  const limitations = new Set<string>();
  const patterns = [
    /['"]([^'"]*(?:coming soon|not available|view-only|future release|later phase|temporarily unavailable)[^'"]*)['"]/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) != null) {
      const value = match[1].trim();
      if (value.length > 0 && value.length < 240) {
        limitations.add(value);
      }
    }
  }

  return [...limitations].sort((left, right) => left.localeCompare(right));
}

export function buildFlowSteps(steps: readonly { readonly order: number; readonly description: string; readonly uiLabels?: readonly string[] }[]) {
  return steps;
}
