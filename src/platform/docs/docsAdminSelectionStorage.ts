import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

const STORAGE_KEY = 'zenformed.docsAdmin.lastSelection';

export type DocsAdminLastSelection = {
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly editorId?: string;
};

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function storeDocsAdminSelection(selection: DocsAdminLastSelection): void {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
}

export function readDocsAdminSelection(): DocsAdminLastSelection | undefined {
  if (!canUseSessionStorage()) {
    return undefined;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw == null || raw.trim() === '') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DocsAdminLastSelection>;
    if (
      typeof parsed.product !== 'string' ||
      typeof parsed.category !== 'string'
    ) {
      return undefined;
    }

    return {
      product: parsed.product as DocsProductSlug,
      category: parsed.category as DocsCategorySlug,
      ...(typeof parsed.editorId === 'string' ? { editorId: parsed.editorId } : {}),
    };
  } catch {
    return undefined;
  }
}
