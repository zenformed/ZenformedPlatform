import type { DocsAuthoringAiAction } from '@/platform/docs/docsAuthoringAiTypes';

export const DOCS_AUTHORING_AI_WRITING_ACTIONS = ['generate_draft'] as const satisfies readonly DocsAuthoringAiAction[];

export const platformDocsAuthoringAiContent = {
  panelTitle: 'Documentation AI',
  panelSubtitle: 'Staff authoring assistant',
  running: 'Running…',
  errorGeneric: 'Documentation AI request failed. Try again.',
  errorUnauthenticated: 'Sign in again to use Documentation AI.',
  writingSection: 'Writing',
  conversationSection: 'Conversation',
  conversationEmpty:
    'Ask me to refine the article — for example: "make this shorter", "rewrite this", "expand step 3", or "generate SEO title".',
  conversationSelectionHint: 'Selected text will be included automatically when you ask to rewrite or revise "this".',
  chatInputLabel: 'Message',
  chatInputPlaceholder: 'Ask the assistant to edit or explain…',
  chatSend: 'Send',
  chatThinking: 'Thinking…',
  generateDraft: 'Generate Draft',
  authorContext: {
    label: 'Author Context',
    helper: 'Add article-specific notes the AI should follow for this draft.',
    placeholder:
      'Example: Inside a project, open Workflow Tasks, find the task, click the paperclip in the documents column, upload the file, then save the task.',
  },
  roles: {
    user: 'You',
    assistant: 'Assistant',
  },
} as const;

export const DOCS_AUTHORING_AI_SELECTION_ACTIONS = [] as const;

export const DOCS_AUTHORING_AI_SEO_METADATA_ACTIONS = [] as const;

export const DOCS_AUTHORING_AI_DOCUMENT_ACTIONS = ['generate_draft', 'assistant_chat'] as const;
