import type {
  DocsAuthoringAiAssistantOperation,
  DocsAuthoringAiEditorCommands,
  DocsAuthoringAiEditorSelection,
  DocsAuthoringAiResult,
} from '@/platform/docs/docsAuthoringAiTypes';

export type DocsAuthoringAiApplyHandlers = {
  readonly getContentMarkdown: () => string;
  readonly onMarkdownChange: (markdown: string) => void;
  readonly onTitleChange: (title: string) => void;
  readonly onSummaryChange: (summary: string) => void;
  readonly onTagsChange: (tags: readonly string[]) => void;
  readonly onAuthorContextChange?: (authorContext: string) => void;
  readonly editorCommands?: DocsAuthoringAiEditorCommands;
};

function appendMarkdown(current: string, addition: string): string {
  const base = current.trimEnd();
  const next = addition.trim();
  if (next === '') {
    return base;
  }
  if (base === '') {
    return `${next}\n`;
  }
  return `${base}\n\n${next}\n`;
}

export type DocsAuthoringAiEditorSnapshot = {
  readonly contentMarkdown: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly authorContext: string;
};

export function restoreDocsAuthoringAiEditorSnapshot(
  snapshot: DocsAuthoringAiEditorSnapshot,
  handlers: DocsAuthoringAiApplyHandlers,
): void {
  handlers.onMarkdownChange(snapshot.contentMarkdown);
  handlers.onTitleChange(snapshot.title);
  handlers.onSummaryChange(snapshot.summary);
  handlers.onTagsChange(snapshot.tags);
  handlers.onAuthorContextChange?.(snapshot.authorContext);
  handlers.editorCommands?.setMarkdown(snapshot.contentMarkdown);
}

export function applyDocsAuthoringAiResult(
  result: DocsAuthoringAiResult,
  selection: DocsAuthoringAiEditorSelection | null,
  handlers: DocsAuthoringAiApplyHandlers,
): boolean {
  if (result.status !== 'success' || result.payload == null) {
    return false;
  }

  const { payload } = result;

  switch (payload.kind) {
    case 'markdown': {
      const nextMarkdown =
        payload.mode === 'append'
          ? appendMarkdown(handlers.getContentMarkdown(), payload.markdown)
          : payload.markdown;

      if (handlers.editorCommands != null) {
        handlers.editorCommands.setMarkdown(nextMarkdown);
      } else {
        handlers.onMarkdownChange(nextMarkdown);
      }
      return true;
    }

    case 'text': {
      if (selection == null || handlers.editorCommands == null) {
        return false;
      }

      handlers.editorCommands.replaceSelection(payload.text);
      return true;
    }

    case 'tags':
      handlers.onTagsChange(payload.tags);
      return true;

    case 'metadata':
      if (payload.field === 'summary') {
        handlers.onSummaryChange(payload.value);
        return true;
      }
      if (payload.field === 'title') {
        handlers.onTitleChange(payload.value);
        return true;
      }
      return false;

    case 'related_articles':
      return false;

    case 'assistant':
      return applyDocsAuthoringAiAssistantOperations(payload.operations, selection, handlers);
  }
}

export function applyDocsAuthoringAiAssistantOperations(
  operations: readonly DocsAuthoringAiAssistantOperation[],
  selection: DocsAuthoringAiEditorSelection | null,
  handlers: DocsAuthoringAiApplyHandlers,
): boolean {
  if (operations.length === 0) {
    return false;
  }

  let applied = false;

  for (const operation of operations) {
    switch (operation.type) {
      case 'replace_document': {
        if (handlers.editorCommands != null) {
          handlers.editorCommands.setMarkdown(operation.markdown);
        } else {
          handlers.onMarkdownChange(operation.markdown);
        }
        applied = true;
        break;
      }
      case 'replace_selection': {
        if (selection == null || handlers.editorCommands == null) {
          break;
        }
        handlers.editorCommands.replaceSelection(operation.text);
        applied = true;
        break;
      }
      case 'append_markdown': {
        const nextMarkdown = appendMarkdown(handlers.getContentMarkdown(), operation.markdown);
        if (handlers.editorCommands != null) {
          handlers.editorCommands.setMarkdown(nextMarkdown);
        } else {
          handlers.onMarkdownChange(nextMarkdown);
        }
        applied = true;
        break;
      }
      case 'update_summary':
        handlers.onSummaryChange(operation.value);
        applied = true;
        break;
      case 'update_tags':
        handlers.onTagsChange(operation.tags);
        applied = true;
        break;
    }
  }

  return applied;
}
