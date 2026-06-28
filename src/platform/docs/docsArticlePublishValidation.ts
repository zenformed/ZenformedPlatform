import { isDocsArticleStarterTemplateContent } from '@/platform/docs/docsArticleStarterTemplate';

export type DocsArticlePublishValidationErrorCode =
  | 'title_required'
  | 'summary_required'
  | 'category_required'
  | 'content_required'
  | 'starter_template_content';

export type DocsArticlePublishInput = {
  readonly title: string;
  readonly summary: string;
  readonly category: string;
  readonly content: string;
};

export type DocsArticlePublishValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: DocsArticlePublishValidationErrorCode };

export function validateDocsArticleForPublish(
  input: DocsArticlePublishInput,
): DocsArticlePublishValidationResult {
  if (input.title.trim() === '') {
    return { ok: false, code: 'title_required' };
  }

  if (input.summary.trim() === '') {
    return { ok: false, code: 'summary_required' };
  }

  if (input.category.trim() === '') {
    return { ok: false, code: 'category_required' };
  }

  if (input.content.trim() === '') {
    return { ok: false, code: 'content_required' };
  }

  if (isDocsArticleStarterTemplateContent(input.content, input.title.trim())) {
    return { ok: false, code: 'starter_template_content' };
  }

  return { ok: true };
}
