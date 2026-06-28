import { NextRequest, NextResponse } from 'next/server';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { env } from '@/infrastructure/config/env';
import { postDocsAuthoringAiToCore } from '@/infrastructure/coreApi/docsAuthoringAiCoreClient.server';
import { coreUpstreamHttpResponsePayload } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { buildDocsAuthoringCatalogForAi } from '@/platform/docs/buildDocsAuthoringCatalogForAi.server';
import { loadDocsAuthoringGroundingPayload } from '@/platform/docs/docsProductContext.server';
import { logDocsAuthoringAiValidationFailures } from '@/platform/docs/docsAuthoringAiValidationDiagnostics';
import type {
  DocsAuthoringAiAction,
  DocsAuthoringAiRequest,
  DocsAuthoringAiResult,
} from '@/platform/docs/docsAuthoringAiTypes';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = new Set<DocsAuthoringAiAction>([
  'generate_draft',
  'assistant_chat',
  'rewrite_selection',
  'shorten',
  'expand',
  'improve_grammar',
  'improve_clarity',
  'generate_summary',
  'suggest_tags',
  'generate_seo_title',
  'generate_meta_description',
  'generate_related_articles',
  'generate_next_steps',
]);

function isValidRequest(body: unknown): body is DocsAuthoringAiRequest {
  if (typeof body !== 'object' || body == null) {
    return false;
  }

  const record = body as DocsAuthoringAiRequest;
  if (typeof record.action !== 'string' || !VALID_ACTIONS.has(record.action)) {
    return false;
  }

  if (typeof record.context !== 'object' || record.context == null) {
    return false;
  }

  const context = record.context;
  if (
    typeof context.title !== 'string' ||
    typeof context.summary !== 'string' ||
    typeof context.product !== 'string' ||
    typeof context.category !== 'string' ||
    typeof context.categoryTitle !== 'string' ||
    typeof context.productName !== 'string' ||
    typeof context.contentMarkdown !== 'string' ||
    !Array.isArray(context.tags)
  ) {
    return false;
  }

  if (context.authorContext != null && typeof context.authorContext !== 'string') {
    return false;
  }

  if (record.selection != null) {
    if (typeof record.selection.selectedText !== 'string') {
      return false;
    }
  }

  if (record.action === 'assistant_chat') {
    if (typeof record.message !== 'string' || record.message.trim() === '') {
      return false;
    }

    if (record.history != null) {
      if (
        !Array.isArray(record.history) ||
        !record.history.every(
          (item) =>
            typeof item === 'object' &&
            item != null &&
            (item.role === 'user' || item.role === 'assistant') &&
            typeof item.content === 'string',
        )
      ) {
        return false;
      }
    }
  }

  return true;
}

function mapCoreErrorToResult(
  action: DocsAuthoringAiAction,
  status: number,
  body: unknown,
): DocsAuthoringAiResult {
  if (typeof body === 'object' && body != null) {
    const record = body as Partial<DocsAuthoringAiResult>;
    if (typeof record.message === 'string') {
      return {
        status: 'error',
        action: record.action ?? action,
        message: record.message,
      };
    }
  }

  if (status === 503) {
    return {
      status: 'error',
      action,
      message: 'Documentation AI is not configured on ZenformedCore. Set OPENAI_API_KEY on the server.',
    };
  }

  if (status === 403) {
    return {
      status: 'error',
      action,
      message: 'Platform staff access is required for documentation AI.',
    };
  }

  return {
    status: 'error',
    action,
    message: 'Documentation AI request failed. Try again.',
  };
}

async function attachAuthoringCatalog(body: DocsAuthoringAiRequest) {
  return {
    ...body,
    catalog: await buildDocsAuthoringCatalogForAi({
      product: body.context.product,
      category: body.context.category,
      title: body.context.title,
      summary: body.context.summary,
      tags: body.context.tags,
    }),
  };
}

function attachAuthoringGrounding(body: DocsAuthoringAiRequest) {
  const grounding = loadDocsAuthoringGroundingPayload({
    title: body.context.title,
    summary: body.context.summary,
    product: body.context.product,
    category: body.context.category,
    categoryTitle: body.context.categoryTitle,
    tags: body.context.tags,
    authorContext: body.context.authorContext,
  });
  if (grounding == null) {
    return body;
  }

  return {
    ...body,
    productContext: grounding.productContext,
    ...(grounding.implementationVocabulary != null && grounding.implementationVocabulary.length > 0
      ? { implementationVocabulary: grounding.implementationVocabulary }
      : {}),
    ...(grounding.featureWorkflow != null ? { featureWorkflow: grounding.featureWorkflow } : {}),
  };
}

async function buildCoreAuthoringRequest(body: DocsAuthoringAiRequest) {
  if (body.action === 'generate_related_articles' || body.action === 'assistant_chat') {
    return attachAuthoringCatalog(
      body.action === 'assistant_chat' ? attachAuthoringGrounding(body) : body,
    );
  }

  if (body.action === 'generate_draft') {
    return attachAuthoringGrounding(body);
  }

  return body;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return NextResponse.json(
      {
        error: 'bad_request',
        message: 'Documentation AI requires SaaS mode with real Supabase auth.',
      },
      { status: 400 },
    );
  }

  const authHeader = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authHeader);
  if (!user || !authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (env.zenformedCoreApiBaseUrl == null) {
    return NextResponse.json(
      {
        status: 'error',
        action: 'generate_draft',
        message: 'ZenformedCore is not configured. Set ZENFORMED_CORE_API_URL on Platform.',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValidRequest(body)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const coreRequest = await buildCoreAuthoringRequest(body);
  const result = await postDocsAuthoringAiToCore(accessToken, coreRequest);

  if (
    result.ok &&
    result.data.status === 'error' &&
    result.data.validationFailures != null &&
    result.data.validationFailures.length > 0
  ) {
    logDocsAuthoringAiValidationFailures({
      action: body.action,
      articleTitle: body.context.title,
      product: body.context.product,
      failures: result.data.validationFailures,
    });
  }

  if (!result.ok) {
    if (result.error.kind === 'http_error') {
      const st = result.error.status;
      if (st === 401) {
        return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
      }
      if (st === 403) {
        return NextResponse.json(mapCoreErrorToResult(body.action, st, result.error.body), { status: 403 });
      }
      const upstream = coreUpstreamHttpResponsePayload(result.error);
      if (upstream != null) {
        return NextResponse.json(upstream.json, { status: upstream.status });
      }
      const mapped = mapCoreErrorToResult(body.action, st, result.error.body);
      return NextResponse.json(mapped, { status: st === 422 ? 422 : 502 });
    }

    if (result.error.kind === 'timeout') {
      return NextResponse.json(
        {
          status: 'error',
          action: body.action,
          message: 'Documentation AI request timed out. Try again.',
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        relay: 'error',
        error: 'zenformed_core_unreachable',
        detail: result.error,
      },
      { status: 502 },
    );
  }

  const status = result.data.status === 'error' ? 422 : 200;
  return NextResponse.json(result.data, { status });
}
