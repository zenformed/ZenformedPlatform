import { NextRequest, NextResponse } from 'next/server';
import { recordDocsSearchEvent } from '@/platform/docs/docsSearchAnalyticsRepository.server';
import {
  isDocsSearchQueryLoggable,
  resolveDocsSearchEventProduct,
} from '@/platform/docs/docsSearchAnalytics';
import { canUseDocsDatabaseSource } from '@/platform/docs/docsContentSource';

export const dynamic = 'force-dynamic';

type SearchEventRequest = {
  readonly query?: string;
  readonly product?: string;
  readonly resultsCount?: number;
  readonly sessionId?: string;
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

  let body: SearchEventRequest;
  try {
    body = (await request.json()) as SearchEventRequest;
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const query = body.query?.trim() ?? '';
  if (!isDocsSearchQueryLoggable(query)) {
    return NextResponse.json(
      { error: 'query_required', message: 'Search query must not be empty.' },
      { status: 400 },
    );
  }

  const resultsCount = body.resultsCount;
  if (resultsCount == null || !Number.isInteger(resultsCount) || resultsCount < 0) {
    return NextResponse.json(
      { error: 'invalid_results_count', message: 'resultsCount must be a non-negative integer.' },
      { status: 400 },
    );
  }

  try {
    const { searchEventId } = await recordDocsSearchEvent({
      query,
      product: resolveDocsSearchEventProduct(body.product),
      resultsCount,
      sessionId: body.sessionId?.trim() || null,
    });

    return NextResponse.json({ searchEventId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record search event.';
    console.error('Docs search event failed:', message);
    return NextResponse.json({ error: 'search_event_failed', message }, { status: 500 });
  }
}
