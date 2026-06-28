'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { decodeDocsAdminArticleKey } from '@/platform/docs/docsAdminArticleKey';
import { docsAdminNavigation } from '@/platform/docs/docsAdminNavigation';
import { storeDocsAdminSelection } from '@/platform/docs/docsAdminSelectionStorage';

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
      const keyParts = decodeDocsAdminArticleKey(editorId);
      if (keyParts != null) {
        storeDocsAdminSelection({
          product: keyParts.product,
          category: keyParts.category,
          editorId,
        });
      }

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
