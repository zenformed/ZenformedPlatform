import { env } from '@/infrastructure/config/env';
import type { CoreApiResult } from '@/infrastructure/coreApi/types';
import type { DocsAuthoringAiRequest, DocsAuthoringAiResult } from '@/platform/docs/docsAuthoringAiTypes';

const DEFAULT_TIMEOUT_MS = 120_000;

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function parseDocsAuthoringAiResult(json: unknown): DocsAuthoringAiResult | null {
  if (json == null || typeof json !== 'object') {
    return null;
  }

  const record = json as DocsAuthoringAiResult;
  if (typeof record.status !== 'string' || typeof record.action !== 'string' || typeof record.message !== 'string') {
    return null;
  }

  return record;
}

export type DocsAuthoringAiCoreRequest = DocsAuthoringAiRequest & {
  readonly catalog?: readonly {
    readonly title: string;
    readonly slug: string;
    readonly product: string;
    readonly category: string;
  }[];
  readonly productContext?: string;
  readonly implementationVocabulary?: readonly string[];
  readonly featureWorkflow?: {
    readonly feature: string;
    readonly purpose: string;
    readonly primaryWorkflow: readonly string[];
    readonly alternateWorkflows: readonly string[];
    readonly prerequisites: readonly string[];
    readonly userTips: readonly string[];
    readonly commonMistakes: readonly string[];
    readonly source?: string;
  };
};

/** `POST /ai/docs/authoring` — staff documentation authoring AI via ZenformedCore gateway. */
export async function postDocsAuthoringAiToCore(
  accessToken: string,
  body: DocsAuthoringAiCoreRequest,
): Promise<CoreApiResult<DocsAuthoringAiResult>> {
  const base = env.zenformedCoreApiBaseUrl;
  if (base == null) {
    return { ok: false, error: { kind: 'unconfigured' } };
  }

  const url = `${normalizeBaseUrl(base)}/ai/docs/authoring`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { ok: false, error: { kind: 'invalid_payload' } };
    }

    if (!res.ok) {
      return { ok: false, error: { kind: 'http_error', status: res.status, body: json } };
    }

    const parsed = parseDocsAuthoringAiResult(json);
    if (parsed == null) {
      return { ok: false, error: { kind: 'invalid_payload' } };
    }

    return { ok: true, data: parsed };
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    if (aborted) {
      return { ok: false, error: { kind: 'timeout' } };
    }
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: { kind: 'network', message } };
  } finally {
    clearTimeout(timer);
  }
}
