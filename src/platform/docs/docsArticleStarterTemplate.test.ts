import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildDocsArticleBodyTemplate } from '@/platform/docs/docsArticleBodyTemplate';
import { composeDocsMarkdownFile, buildDocsArticleFrontmatter } from '@/platform/docs/docsFrontmatterGenerator';
import {
  isDocsArticleStarterTemplateContent,
  isDocsArticleStarterTemplateMarkdown,
  resolveReusableDocsArticleSlug,
} from '@/platform/docs/docsArticleStarterTemplate';

describe('docsArticleStarterTemplate', () => {
  it('detects starter template body content', () => {
    const title = 'Creating Budget Entries';
    const starter = buildDocsArticleBodyTemplate(title);
    const edited = `${starter}\n\nExtra AI section.`;

    assert.equal(isDocsArticleStarterTemplateContent(starter, title), true);
    assert.equal(isDocsArticleStarterTemplateContent(edited, title), false);
  });

  it('detects starter template markdown files', () => {
    const title = 'Creating Budget Entries';
    const markdown = composeDocsMarkdownFile(
      buildDocsArticleFrontmatter({
        title,
        slug: 'creating-budget-entries',
        product: 'buildcore',
        category: 'budget',
        published: false,
      }),
      buildDocsArticleBodyTemplate(title),
    );

    assert.equal(isDocsArticleStarterTemplateMarkdown(markdown, title), true);
  });

  it('reuses an existing empty draft slug instead of creating a duplicate suffix', () => {
    const title = 'Creating Budget Entries';
    const slug = 'creating-budget-entries';
    const markdown = composeDocsMarkdownFile(
      buildDocsArticleFrontmatter({
        title,
        slug,
        product: 'buildcore',
        category: 'budget',
        published: false,
      }),
      buildDocsArticleBodyTemplate(title),
    );

    const resolved = resolveReusableDocsArticleSlug({
      baseSlug: slug,
      title,
      existingSlugs: [slug],
      readMarkdownForSlug: (candidate) => (candidate === slug ? markdown : undefined),
    });

    assert.equal(resolved.slug, slug);
    assert.equal(resolved.reusedExistingDraft, true);
  });

  it('creates a unique slug when an existing article is no longer starter content', () => {
    const title = 'Creating Budget Entries';
    const slug = 'creating-budget-entries';
    const markdown = composeDocsMarkdownFile(
      buildDocsArticleFrontmatter({
        title,
        slug,
        product: 'buildcore',
        category: 'budget',
        published: false,
      }),
      `${buildDocsArticleBodyTemplate(title)}\n\nGenerated draft content.`,
    );

    const resolved = resolveReusableDocsArticleSlug({
      baseSlug: slug,
      title,
      existingSlugs: [slug],
      readMarkdownForSlug: (candidate) => (candidate === slug ? markdown : undefined),
    });

    assert.equal(resolved.slug, `${slug}-2`);
    assert.equal(resolved.reusedExistingDraft, false);
  });
});
