'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  applyDocsAuthoringAiAssistantOperations,
  applyDocsAuthoringAiResult,
  restoreDocsAuthoringAiEditorSnapshot,
} from '@/platform/docs/docsAuthoringAiApply';
import { resolveDocsAuthoringAiStatusMessage } from '@/platform/docs/docsAuthoringAiValidationDiagnostics';
import type {
  DocsAuthoringAiArticleContext,
  DocsAuthoringAiChatMessage,
  DocsAuthoringAiClient,
  DocsAuthoringAiEditorCommands,
  DocsAuthoringAiEditorSelection,
} from '@/platform/docs/docsAuthoringAiTypes';
import type { DocsEditorTextSelection } from '@/platform/docs/tiptap/docsTiptapEditorApi';
import { platformDocsAuthoringAiContent as content } from '@/platform/content/platformDocsAuthoringAiContent';

export type UseDocsAuthoringAiOptions = {
  readonly title: string;
  readonly summary: string;
  readonly product: DocsAuthoringAiArticleContext['product'];
  readonly productName: string;
  readonly category: DocsAuthoringAiArticleContext['category'];
  readonly categoryTitle: string;
  readonly tags: readonly string[];
  readonly authorContext: string;
  readonly contentMarkdown: string;
  readonly onMarkdownChange: (markdown: string) => void;
  readonly onTitleChange: (title: string) => void;
  readonly onSummaryChange: (summary: string) => void;
  readonly onTagsChange: (tags: readonly string[]) => void;
  readonly onAuthorContextChange?: (authorContext: string) => void;
  readonly editorCommands?: DocsAuthoringAiEditorCommands;
  readonly client: DocsAuthoringAiClient;
  readonly enabled?: boolean;
};

export type UseDocsAuthoringAiResult = {
  readonly selection: DocsAuthoringAiEditorSelection | null;
  readonly setSelection: (selection: DocsEditorTextSelection | null) => void;
  readonly clearSelection: () => void;
  readonly isRunning: boolean;
  readonly isGeneratingDraft: boolean;
  readonly statusMessage: string | null;
  readonly statusKind: 'idle' | 'running' | 'success' | 'error';
  readonly context: DocsAuthoringAiArticleContext;
  readonly conversation: readonly DocsAuthoringAiChatMessage[];
  readonly runGenerateDraft: () => Promise<void>;
  readonly sendMessage: (message: string) => Promise<void>;
};

export function useDocsAuthoringAi({
  title,
  summary,
  product,
  productName,
  category,
  categoryTitle,
  tags,
  authorContext,
  contentMarkdown,
  onMarkdownChange,
  onTitleChange,
  onSummaryChange,
  onTagsChange,
  onAuthorContextChange,
  editorCommands,
  client,
  enabled = true,
}: UseDocsAuthoringAiOptions): UseDocsAuthoringAiResult {
  const [selection, setSelection] = useState<DocsAuthoringAiEditorSelection | null>(null);
  const [conversation, setConversation] = useState<readonly DocsAuthoringAiChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeMode, setActiveMode] = useState<'generate_draft' | 'assistant_chat' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusKind, setStatusKind] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  const context = useMemo<DocsAuthoringAiArticleContext>(
    () => ({
      title,
      summary,
      product,
      category,
      categoryTitle,
      productName,
      tags,
      authorContext: authorContext.trim() !== '' ? authorContext : undefined,
      contentMarkdown,
    }),
    [authorContext, category, categoryTitle, contentMarkdown, product, productName, summary, tags, title],
  );

  const applyHandlers = useMemo(
    () => ({
      getContentMarkdown: () => contentMarkdown,
      onMarkdownChange,
      onTitleChange,
      onSummaryChange,
      onTagsChange,
      onAuthorContextChange,
      editorCommands,
    }),
    [
      contentMarkdown,
      editorCommands,
      onAuthorContextChange,
      onMarkdownChange,
      onSummaryChange,
      onTagsChange,
      onTitleChange,
    ],
  );

  const clearSelection = useCallback((): void => {
    setSelection(null);
  }, []);

  const runGenerateDraft = useCallback(async (): Promise<void> => {
    if (!enabled || isRunning) {
      return;
    }

    setIsRunning(true);
    setActiveMode('generate_draft');
    setStatusMessage(null);
    setStatusKind('running');

    const snapshot = {
      contentMarkdown,
      title,
      summary,
      tags: [...tags],
      authorContext,
    };

    try {
      const result = await client.run({
        action: 'generate_draft',
        context,
        selection: selection ?? undefined,
      });

      setStatusMessage(resolveDocsAuthoringAiStatusMessage(result));
      setStatusKind(result.status === 'success' ? 'success' : 'error');

      if (result.status !== 'success') {
        restoreDocsAuthoringAiEditorSnapshot(snapshot, applyHandlers);
        return;
      }

      applyDocsAuthoringAiResult(result, selection, applyHandlers);
    } catch {
      setStatusMessage(content.errorGeneric);
      setStatusKind('error');
    } finally {
      setIsRunning(false);
      setActiveMode(null);
    }
  }, [
    applyHandlers,
    authorContext,
    client,
    contentMarkdown,
    context,
    enabled,
    isRunning,
    selection,
    summary,
    tags,
    title,
  ]);

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      const trimmed = message.trim();
      if (!enabled || isRunning || trimmed === '') {
        return;
      }

      const previousHistory = conversationRef.current;
      const userMessage: DocsAuthoringAiChatMessage = { role: 'user', content: trimmed };
      const nextHistory = [...previousHistory, userMessage];

      setConversation(nextHistory);
      setIsRunning(true);
      setActiveMode('assistant_chat');
      setStatusMessage(null);
      setStatusKind('running');

      try {
        const result = await client.run({
          action: 'assistant_chat',
          context,
          selection: selection ?? undefined,
          message: trimmed,
          history: conversationRef.current,
        });

        if (result.status !== 'success') {
          setStatusMessage(resolveDocsAuthoringAiStatusMessage(result));
          setStatusKind('error');
          setConversation(previousHistory);
          return;
        }

        const reply =
          result.payload?.kind === 'assistant' ? result.payload.reply : result.message;

        setConversation([...nextHistory, { role: 'assistant', content: reply }]);
        setStatusKind('success');
        setStatusMessage(null);

        if (result.payload?.kind === 'assistant') {
          const applied = applyDocsAuthoringAiAssistantOperations(
            result.payload.operations,
            selection,
            applyHandlers,
          );

          if (applied && selection != null && result.payload.operations.some((op) => op.type === 'replace_selection')) {
            clearSelection();
          }
        }
      } catch {
        setStatusMessage(content.errorGeneric);
        setStatusKind('error');
        setConversation(previousHistory);
      } finally {
        setIsRunning(false);
        setActiveMode(null);
      }
    },
    [
      applyHandlers,
      authorContext,
      clearSelection,
      client,
      contentMarkdown,
      context,
      enabled,
      isRunning,
      selection,
      summary,
      tags,
      title,
    ],
  );

  return {
    selection,
    setSelection,
    clearSelection,
    isRunning,
    isGeneratingDraft: isRunning && activeMode === 'generate_draft',
    statusMessage,
    statusKind,
    context,
    conversation,
    runGenerateDraft,
    sendMessage,
  };
}
