import type { Editor } from '@tiptap/react';
import { normalizeDocsAuthoringMarkdown, preprocessDocsAuthoringMarkdown } from '@/platform/docs/tiptap/docsAuthoringMarkdown';

type MarkdownStorage = {
  getMarkdown?: () => string;
};

export type DocsEditorTextSelection = {
  readonly selectedText: string;
};

export function setDocsEditorMarkdown(editor: Editor, markdown: string): void {
  const prepared = preprocessDocsAuthoringMarkdown(normalizeDocsAuthoringMarkdown(markdown).trimEnd());
  editor.commands.setContent(prepared, { emitUpdate: false });
}

export function getDocsEditorMarkdown(editor: Editor): string {
  const storage = editor.storage as { markdown?: MarkdownStorage };
  const markdown = storage.markdown?.getMarkdown?.() ?? editor.getText();
  return normalizeDocsAuthoringMarkdown(markdown);
}

export function getDocsEditorTextSelection(editor: Editor): DocsEditorTextSelection | null {
  const { from, to, empty } = editor.state.selection;
  if (empty || from === to) {
    return null;
  }

  const selectedText = editor.state.doc.textBetween(from, to, '\n');
  if (selectedText.trim() === '') {
    return null;
  }

  return { selectedText };
}

export function replaceDocsEditorSelection(editor: Editor, text: string): void {
  editor.chain().focus().deleteSelection().insertContent(text).run();
}
