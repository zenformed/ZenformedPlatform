import { NextRequest, NextResponse } from 'next/server';
import {
  getPublishedPublicArticleDatabaseId,
  recordDocsArticleView,
} from '@/platform/docs/docsArticleRepository.server';
import { canUseDocsDatabaseSource } from '@/platform/docs/docsContentSource';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { isDocsCategorySlug } from '@/platform/docs/docsCatalog';

export const dynamic = 'force-dynamic';

type ArticleViewRequest = {
  readonly articleId?: string;
  readonly product?: string;
  readonly category?: string;
  readonly slug?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!canUseDocsDatabaseSource()) {
    return NextResponse.json(
      {
        error: 'database_unavailable',
        message: 'Article view tracking is available when documentation is served from the database.',
      },
      { status: 503 },
    );
  }

  let body: ArticleViewRequest;
  try {
    body = (await request.json()) as ArticleViewRequest;
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  let articleId = body.articleId?.trim() ?? '';

  if (articleId === '') {
    const product = body.product?.trim() as DocsProductSlug | undefined;
    const category = body.category?.trim();
    const slug = body.slug?.trim() ?? '';

    if (product == null || category == null || slug === '' || !isDocsCategorySlug(product, category)) {
      return NextResponse.json(
        {
          error: 'article_required',
          message: 'Provide articleId or product, category, and slug.',
        },
        { status: 400 },
      );
    }

    const resolvedId = await getPublishedPublicArticleDatabaseId(
      product,
      category as DocsCategorySlug,
      slug,
    );

    if (resolvedId == null) {
      return NextResponse.json(
        { error: 'article_not_found', message: 'Published article not found.' },
        { status: 404 },
      );
    }

    articleId = resolvedId;
  }

  try {
    const metrics = await recordDocsArticleView(articleId);
    return NextResponse.json({
      articleId,
      views: metrics.views,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record article view.';
    console.error('Docs article view failed:', message);
    return NextResponse.json({ error: 'view_failed', message }, { status: 500 });
  }
}
