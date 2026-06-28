'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { docsAdminNavigation } from '@/platform/docs/docsAdminNavigation';

export function useDocsAdminNavigation(): {
  readonly openConsole: () => void;
  readonly openArticle: (editorId: string) => void;
  readonly openArticlePreview: (editorId: string) => void;
} {
  const router = useRouter();

  const openConsole = useCallback((): void => {
    router.push(docsAdminNavigation.routes.console);
    router.refresh();
  }, [router]);

  const openArticle = useCallback(
    (editorId: string): void => {
      router.push(docsAdminNavigation.routes.articleEditor(editorId));
      router.refresh();
    },
    [router],
  );

  const openArticlePreview = useCallback(
    (editorId: string): void => {
      router.push(docsAdminNavigation.routes.articlePreview(editorId));
      router.refresh();
    },
    [router],
  );

  return useMemo(
    () => ({
      openConsole,
      openArticle,
      openArticlePreview,
    }),
    [openArticle, openArticlePreview, openConsole],
  );
}
