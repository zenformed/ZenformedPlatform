'use client';

import { platformDocsAuthoringAiContent as content } from '@/platform/content/platformDocsAuthoringAiContent';
import type {
  DocsAuthoringAiClient,
  DocsAuthoringAiRequest,
  DocsAuthoringAiResult,
} from '@/platform/docs/docsAuthoringAiTypes';

export function createDocsAuthoringAiClient(
  getAccessToken: () => string | null,
): DocsAuthoringAiClient {
  return {
    async run(request: DocsAuthoringAiRequest): Promise<DocsAuthoringAiResult> {
      const token = getAccessToken();
      if (token == null) {
        return {
          status: 'error',
          action: request.action,
          message: content.errorUnauthenticated,
        };
      }

      try {
        const response = await fetch('/api/admin/docs/authoring-ai', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        });

        const json = (await response.json()) as DocsAuthoringAiResult & { error?: string };

        if (!response.ok) {
          return {
            status: 'error',
            action: request.action,
            message: json.message ?? content.errorGeneric,
            ...(json.validationFailures != null && json.validationFailures.length > 0
              ? { validationFailures: json.validationFailures }
              : {}),
          };
        }

        return json;
      } catch {
        return {
          status: 'error',
          action: request.action,
          message: content.errorGeneric,
        };
      }
    },
  };
}
