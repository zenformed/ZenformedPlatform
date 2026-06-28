export type DocsContentSource = 'database' | 'markdown';

export function resolveDocsContentSource(
  env: Record<string, string | undefined> = process.env,
): DocsContentSource {
  const configured = env.DOCS_CONTENT_SOURCE?.trim().toLowerCase();

  if (configured === 'database' || configured === 'markdown') {
    return configured;
  }

  return 'markdown';
}

export function isDocsDatabaseContentSource(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return resolveDocsContentSource(env) === 'database';
}
