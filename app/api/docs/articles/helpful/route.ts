import { NextRequest, NextResponse } from 'next/server';
import {
  getPublishedPublicArticleDatabaseId,
  recordDocsArticleHelpfulVote,
} from '@/platform/docs/docsArticleRepository.server';
import { canUseDocsDatabaseSource } from '@/platform/docs/docsContentSource';
import type { DocsArticleHelpfulVote } from '@/platform/docs/docsDatabaseTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { isDocsCategorySlug } from '@/platform/docs/docsCatalog';

export const dynamic = 'force-dynamic';

type HelpfulVoteRequest = {
  readonly articleId?: string;
  readonly product?: string;
  readonly category?: string;
  readonly slug?: string;
  readonly vote?: string;
};

function isHelpfulVote(value: string | undefined): value is DocsArticleHelpfulVote {
  return value === 'yes' || value === 'no';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!canUseDocsDatabaseSource()) {
    return NextResponse.json(
      {
        error: 'database_unavailable',
        message: 'Article feedback is available when documentation is served from the database.',
      },
      { status: 503 },
    );
  }

  let body: HelpfulVoteRequest;
  try {
    body = (await request.json()) as HelpfulVoteRequest;
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const vote = body.vote?.trim().toLowerCase();
  if (!isHelpfulVote(vote)) {
    return NextResponse.json(
      { error: 'invalid_vote', message: 'Vote must be "yes" or "no".' },
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
    const metrics = await recordDocsArticleHelpfulVote(articleId, vote);
    return NextResponse.json({
      articleId,
      vote,
      helpfulYes: metrics.helpfulYes,
      helpfulNo: metrics.helpfulNo,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record helpful vote.';
    console.error('Docs helpful vote failed:', message);
    return NextResponse.json({ error: 'vote_failed', message }, { status: 500 });
  }
}
