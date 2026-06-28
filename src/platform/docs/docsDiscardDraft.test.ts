import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import {
  BUILDCORE_DOCS_CONTENT_PLAN,
  resolveDocsContentPlanItem,
} from '@/platform/docs/docsContentPlan';
import { shouldShowDocsDiscardDraftButton } from '@/platform/docs/docsDiscardDraft';
import {
  deleteDocsMarkdownFile,
  docsMarkdownFileExists,
} from '@/platform/docs/docsMarkdownFileOps';

const ORIGINAL_CWD = process.cwd();
const tempDirectories: string[] = [];

afterEach(() => {
  process.chdir(ORIGINAL_CWD);

  for (const directory of tempDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function createTempDocsWorkspace(): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-discard-'));
  tempDirectories.push(root);

  const contentRoot = path.join(root, 'docs', 'content', 'buildcore', 'getting-started');
  fs.mkdirSync(contentRoot, { recursive: true });

  process.chdir(root);
}

describe('shouldShowDocsDiscardDraftButton', () => {
  it('shows Discard Draft only for markdown draft articles', () => {
    const draftArticle: Pick<DocsAdminArticle, 'status' | 'source'> = {
      source: 'markdown',
      status: 'draft',
    };
    const publishedArticle: Pick<DocsAdminArticle, 'status' | 'source'> = {
      source: 'markdown',
      status: 'published',
    };
    const placeholderArticle: Pick<DocsAdminArticle, 'status' | 'source'> = {
      source: 'placeholder',
      status: 'draft',
    };

    const databaseDraftArticle: Pick<DocsAdminArticle, 'status' | 'source'> = {
      source: 'database',
      status: 'draft',
    };

    assert.equal(shouldShowDocsDiscardDraftButton(draftArticle), true);
    assert.equal(shouldShowDocsDiscardDraftButton(databaseDraftArticle), true);
    assert.equal(shouldShowDocsDiscardDraftButton(publishedArticle), false);
    assert.equal(shouldShowDocsDiscardDraftButton(placeholderArticle), false);
  });
});

describe('deleteDocsMarkdownFile', () => {
  it('permanently deletes the markdown file for a draft article', () => {
    createTempDocsWorkspace();

    const filePath = path.join(
      process.cwd(),
      'docs',
      'content',
      'buildcore',
      'getting-started',
      'welcome.md',
    );
    fs.writeFileSync(filePath, '---\ntitle: Welcome\n---\n\nBody', 'utf8');
    assert.equal(docsMarkdownFileExists('buildcore', 'getting-started', 'welcome'), true);

    const deleted = deleteDocsMarkdownFile('buildcore', 'getting-started', 'welcome');

    assert.equal(deleted, true);
    assert.equal(fs.existsSync(filePath), false);
    assert.equal(docsMarkdownFileExists('buildcore', 'getting-started', 'welcome'), false);
  });
});

describe('resolveDocsContentPlanItem after discard', () => {
  it('returns Not Started when the article is absent from the admin catalog', () => {
    const planGroup = BUILDCORE_DOCS_CONTENT_PLAN[0];
    const planItem = planGroup?.items[0];
    assert.ok(planGroup != null && planItem != null);

    const draftArticle: DocsAdminArticle = {
      id: 'buildcore-getting-started-welcome',
      editorId: 'buildcore--getting-started--welcome',
      articleKey: 'buildcore--getting-started--welcome',
      contentPath: 'docs/content/buildcore/getting-started/welcome.md',
      source: 'markdown',
      slug: planItem.slug,
      title: planItem.title,
      summary: planItem.summary,
      product: 'buildcore',
      category: planItem.categorySlug,
      visibility: 'public',
      status: 'draft',
      tags: [],
      estimatedReadTime: '2 min read',
      lastUpdated: '2026-06-27',
      author: 'Zenformed',
      authorContext: '',
      relatedArticles: [],
      content: 'Body',
    };

    const draftStatus = resolveDocsContentPlanItem([draftArticle], planGroup, planItem);
    assert.equal(draftStatus.status, 'draft');

    const notStartedStatus = resolveDocsContentPlanItem([], planGroup, planItem);
    assert.equal(notStartedStatus.status, 'not_started');
  });
});
