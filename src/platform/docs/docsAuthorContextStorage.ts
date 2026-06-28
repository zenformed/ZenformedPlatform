const PENDING_AUTHOR_CONTEXT_PREFIX = 'docs-admin-author-context:';

export function storePendingDocsAuthorContext(editorId: string, authorContext: string): void {
  const trimmed = authorContext.trim();
  if (trimmed === '' || typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(`${PENDING_AUTHOR_CONTEXT_PREFIX}${editorId}`, trimmed);
}

export function consumePendingDocsAuthorContext(editorId: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const key = `${PENDING_AUTHOR_CONTEXT_PREFIX}${editorId}`;
  const value = sessionStorage.getItem(key);
  if (value == null || value.trim() === '') {
    return undefined;
  }

  sessionStorage.removeItem(key);
  return value.trim();
}
