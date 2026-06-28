import { NextRequest, NextResponse } from 'next/server';
import { recordDocsSearchClick } from '@/platform/docs/docsSearchAnalyticsRepository.server';
import { canUseDocsDatabaseSource } from '@/platform/docs/docsContentSource';

export const dynamic = 'force-dynamic';

type SearchClickRequest = {
  readonly searchEventId?: string;
  readonly articleId?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!canUseDocsDatabaseSource()) {
    return NextResponse.json(
      {
        error: 'database_unavailable',
        message: 'Search analytics are available when documentation is served from the database.',
      },
      { status: 503 },
    );
  }

  let body: SearchClickRequest;
  try {
    body = (await request.json()) as SearchClickRequest;
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const searchEventId = body.searchEventId?.trim() ?? '';
  const articleId = body.articleId?.trim() ?? '';

  if (searchEventId === '' || articleId === '') {
    return NextResponse.json(
      { error: 'fields_required', message: 'searchEventId and articleId are required.' },
      { status: 400 },
    );
  }

  try {
    await recordDocsSearchClick(searchEventId, articleId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record search click.';
    console.error('Docs search click failed:', message);
    return NextResponse.json({ error: 'search_click_failed', message }, { status: 500 });
  }
}
