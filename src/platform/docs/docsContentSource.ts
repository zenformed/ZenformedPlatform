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

export function hasDocsDatabaseCredentials(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url != null && url !== '' && key != null && key !== '';
}

/** Database reads/writes are available only when configured and credentialed. */
export function canUseDocsDatabaseSource(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isDocsDatabaseContentSource(env) && hasDocsDatabaseCredentials(env);
}
