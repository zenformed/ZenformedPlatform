import { NextRequest, NextResponse } from 'next/server';
import { requireAdminBearer } from '../docsAdminApiAuth';
import { encodeDocsAdminArticleKey, docsMarkdownRelativePath } from '@/platform/docs/docsAdminArticleKey';
import { invalidateDocsArticleCaches } from '@/platform/docs/docsAdminCatalog.server';
import { resolveReusableDocsArticleSlug } from '@/platform/docs/docsArticleStarterTemplate';
import { getDocsCategory, getDocsProduct } from '@/platform/docs/docsCatalog';
import { buildNewDocsMarkdownFile } from '@/platform/docs/docsFrontmatterGenerator';
import {
  docsMarkdownFileExists,
  listDocsMarkdownSlugs,
  readDocsMarkdownFile,
  writeDocsMarkdownFile,
} from '@/platform/docs/docsMarkdownWriter.server';
import { writeDocsMarkdownAuthorContext } from '@/platform/docs/docsMarkdownAuthorContext.server';
import { generateDocsSlug, isValidDocsSlug } from '@/platform/docs/docsSlug';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export const dynamic = 'force-dynamic';

type CreateDocsArticleRequest = {
  readonly title?: string;
  readonly product?: string;
  readonly category?: string;
  readonly slug?: string;
  readonly authorContext?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authError = requireAdminBearer(request);
  if (authError != null) {
    return authError;
  }

  let body: CreateDocsArticleRequest;
  try {
    body = (await request.json()) as CreateDocsArticleRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const title = body.title?.trim() ?? '';
  const product = body.product as DocsProductSlug | undefined;
  const category = body.category as DocsCategorySlug | undefined;

  if (title === '') {
    return NextResponse.json({ error: 'title_required' }, { status: 400 });
  }

  if (product == null || getDocsProduct(product) == null) {
    return NextResponse.json({ error: 'invalid_product' }, { status: 400 });
  }

  if (category == null || getDocsCategory(product, category) == null) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 });
  }

  const requestedSlug = body.slug?.trim() ?? '';
  const baseSlug = requestedSlug !== '' ? requestedSlug : generateDocsSlug(title);
  if (!isValidDocsSlug(baseSlug)) {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 });
  }

  const existingSlugs = listDocsMarkdownSlugs(product, category);
  const { slug, reusedExistingDraft } = resolveReusableDocsArticleSlug({
    baseSlug,
    title,
    existingSlugs,
    readMarkdownForSlug: (candidate) => readDocsMarkdownFile(product, category, candidate),
  });

  const trimmedAuthorContext = body.authorContext?.trim() ?? '';

  if (reusedExistingDraft) {
    if (trimmedAuthorContext !== '') {
      writeDocsMarkdownAuthorContext(product, category, slug, trimmedAuthorContext);
    }
    invalidateDocsArticleCaches();
    const articleKey = encodeDocsAdminArticleKey(product, category, slug);

    return NextResponse.json({
      articleKey,
      editorId: articleKey,
      slug,
      product,
      category,
      contentPath: docsMarkdownRelativePath(product, category, slug),
      reusedExistingDraft: true,
    });
  }

  const { markdown } = buildNewDocsMarkdownFile({
    title,
    slug,
    product,
    category,
    published: false,
    ...(trimmedAuthorContext !== '' ? { authorContext: trimmedAuthorContext } : {}),
  });

  if (docsMarkdownFileExists(product, category, slug)) {
    return NextResponse.json({ error: 'article_exists' }, { status: 409 });
  }

  writeDocsMarkdownFile(product, category, slug, markdown);
  invalidateDocsArticleCaches();

  const articleKey = encodeDocsAdminArticleKey(product, category, slug);

  return NextResponse.json({
    articleKey,
    editorId: articleKey,
    slug,
    product,
    category,
    contentPath: docsMarkdownRelativePath(product, category, slug),
    reusedExistingDraft: false,
  });
}
