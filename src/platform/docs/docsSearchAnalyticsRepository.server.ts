import 'server-only';

import { requireSupabaseServiceRoleClient } from '@/infrastructure/supabase/supabaseServiceRole.server';
import { buildDocsSearchEventRecord } from '@/platform/docs/docsSearchAnalytics';
import type { RecordDocsSearchEventInput } from '@/platform/docs/docsSearchAnalyticsTypes';
import { PLATFORM_DOCS_SEARCH_EVENTS_TABLE } from '@/platform/docs/docsDatabaseTypes';

export async function recordDocsSearchEvent(
  input: RecordDocsSearchEventInput,
): Promise<{ readonly searchEventId: string }> {
  const record = buildDocsSearchEventRecord(input);
  if (record == null) {
    throw new Error('Search query must not be empty.');
  }

  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_SEARCH_EVENTS_TABLE)
    .insert({
      query: record.query,
      normalized_query: record.normalizedQuery,
      product: record.product,
      results_count: record.resultsCount,
      session_id: record.sessionId,
      user_id: record.userId,
      organization_id: record.organizationId,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to record docs search event: ${error.message}`);
  }

  return { searchEventId: data.id as string };
}

export async function recordDocsSearchClick(
  searchEventId: string,
  clickedArticleId: string,
): Promise<void> {
  const trimmedEventId = searchEventId.trim();
  const trimmedArticleId = clickedArticleId.trim();

  if (trimmedEventId === '' || trimmedArticleId === '') {
    throw new Error('searchEventId and clickedArticleId are required.');
  }

  const supabase = requireSupabaseServiceRoleClient();
  const { error } = await supabase
    .from(PLATFORM_DOCS_SEARCH_EVENTS_TABLE)
    .update({ clicked_article_id: trimmedArticleId })
    .eq('id', trimmedEventId);

  if (error) {
    throw new Error(`Failed to record docs search click: ${error.message}`);
  }
}
