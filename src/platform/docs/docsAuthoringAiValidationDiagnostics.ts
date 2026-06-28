import type { DocsAuthoringAiResult, DocsAuthoringAiValidationFailure } from '@/platform/docs/docsAuthoringAiTypes';

export function formatDocsAuthoringAiValidationFailuresForAdmin(
  failures: readonly DocsAuthoringAiValidationFailure[],
): string {
  if (failures.length === 0) {
    return 'Draft blocked: validation failed, but no details were recorded.';
  }

  const lines = failures.map((failure) => {
    const phaseSuffix =
      failures.some((item) => item.phase !== failure.phase) ? ` (${failure.phase.replace('_', ' ')})` : '';
    return `- ${failure.type}: ${formatRejectedValue(failure.rejectedValue)}${phaseSuffix}`;
  });

  return `Draft blocked:\n${lines.join('\n')}`;
}

function formatRejectedValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') {
    return '(empty)';
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/docs/')) {
    return trimmed;
  }
  return `"${trimmed}"`;
}

export function resolveDocsAuthoringAiStatusMessage(result: DocsAuthoringAiResult): string {
  if (result.status === 'error' && result.validationFailures != null && result.validationFailures.length > 0) {
    const afterRetryFailures = result.validationFailures.filter((failure) => failure.phase === 'after_retry');
    return formatDocsAuthoringAiValidationFailuresForAdmin(
      afterRetryFailures.length > 0 ? afterRetryFailures : result.validationFailures,
    );
  }

  return result.message;
}

export function logDocsAuthoringAiValidationFailures(details: {
  readonly action: string;
  readonly articleTitle: string;
  readonly product: string;
  readonly failures: readonly DocsAuthoringAiValidationFailure[];
}): void {
  console.error(
    '[docs-authoring-ai] validation blocked',
    JSON.stringify(
      {
        action: details.action,
        articleTitle: details.articleTitle,
        product: details.product,
        failures: details.failures,
      },
      null,
      2,
    ),
  );
}
