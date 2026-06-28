import type { DocsEditorTextSelection } from '@/platform/docs/tiptap/docsTiptapEditorApi';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsAuthoringAiDocumentAction =
  | 'generate_draft'
  | 'generate_summary'
  | 'suggest_tags'
  | 'generate_seo_title'
  | 'generate_meta_description'
  | 'generate_related_articles'
  | 'generate_next_steps';

export type DocsAuthoringAiSelectionAction =
  | 'rewrite_selection'
  | 'shorten'
  | 'expand'
  | 'improve_grammar'
  | 'improve_clarity';

export type DocsAuthoringAiAssistantAction = 'assistant_chat';

export type DocsAuthoringAiAction =
  | DocsAuthoringAiDocumentAction
  | DocsAuthoringAiSelectionAction
  | DocsAuthoringAiAssistantAction;

export type DocsAuthoringAiChatRole = 'user' | 'assistant';

export type DocsAuthoringAiChatMessage = {
  readonly role: DocsAuthoringAiChatRole;
  readonly content: string;
};

export type DocsAuthoringAiEditorSelection = DocsEditorTextSelection;

export type DocsAuthoringAiArticleContext = {
  readonly title: string;
  readonly summary: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly categoryTitle: string;
  readonly productName: string;
  readonly tags: readonly string[];
  readonly contentMarkdown: string;
  readonly authorContext?: string;
};

export type DocsAuthoringAiCatalogArticle = {
  readonly title: string;
  readonly slug: string;
  readonly product: string;
  readonly category: string;
};

export type DocsAuthoringAiRequest = {
  readonly action: DocsAuthoringAiAction;
  readonly context: DocsAuthoringAiArticleContext;
  readonly selection?: DocsAuthoringAiEditorSelection;
  readonly message?: string;
  readonly history?: readonly DocsAuthoringAiChatMessage[];
};

export type DocsAuthoringAiAssistantOperation =
  | { readonly type: 'replace_document'; readonly markdown: string }
  | { readonly type: 'replace_selection'; readonly text: string }
  | { readonly type: 'append_markdown'; readonly markdown: string }
  | { readonly type: 'update_summary'; readonly value: string }
  | { readonly type: 'update_tags'; readonly tags: readonly string[] };

export type DocsAuthoringAiAssistantResult = {
  readonly kind: 'assistant';
  readonly reply: string;
  readonly operations: readonly DocsAuthoringAiAssistantOperation[];
};

export type DocsAuthoringAiResultStatus = 'success' | 'error';

export type DocsAuthoringAiValidationPhase = 'before_retry' | 'after_retry';

export type DocsAuthoringAiValidationFailure = {
  readonly type: string;
  readonly code: string;
  readonly rejectedValue: string;
  readonly reason: string;
  readonly source: string;
  readonly phase: DocsAuthoringAiValidationPhase;
};

export type DocsAuthoringAiMarkdownMode = 'replace' | 'append';

export type DocsAuthoringAiMarkdownResult = {
  readonly kind: 'markdown';
  readonly markdown: string;
  readonly mode?: DocsAuthoringAiMarkdownMode;
};

export type DocsAuthoringAiTextResult = {
  readonly kind: 'text';
  readonly text: string;
};

export type DocsAuthoringAiTagsResult = {
  readonly kind: 'tags';
  readonly tags: readonly string[];
};

export type DocsAuthoringAiMetadataResult = {
  readonly kind: 'metadata';
  readonly field: 'title' | 'summary' | 'metaDescription' | 'seoTitle';
  readonly value: string;
};

export type DocsAuthoringAiRelatedArticlesResult = {
  readonly kind: 'related_articles';
  readonly suggestions: readonly { readonly title: string; readonly slug: string }[];
};

export type DocsAuthoringAiResultPayload =
  | DocsAuthoringAiMarkdownResult
  | DocsAuthoringAiTextResult
  | DocsAuthoringAiTagsResult
  | DocsAuthoringAiMetadataResult
  | DocsAuthoringAiRelatedArticlesResult
  | DocsAuthoringAiAssistantResult;

export type DocsAuthoringAiResult = {
  readonly status: DocsAuthoringAiResultStatus;
  readonly action: DocsAuthoringAiAction;
  readonly message: string;
  readonly validationFailures?: readonly DocsAuthoringAiValidationFailure[];
  readonly payload?: DocsAuthoringAiResultPayload;
};

export type DocsAuthoringAiClient = {
  run(request: DocsAuthoringAiRequest): Promise<DocsAuthoringAiResult>;
};

export type DocsAuthoringAiEditorCommands = {
  readonly setMarkdown: (markdown: string) => void;
  readonly replaceSelection: (text: string) => void;
};
