import { NextRequest, NextResponse } from 'next/server';
import { requireAdminBearer } from '../../docsAdminApiAuth';
import { decodeDocsAdminArticleKey } from '@/platform/docs/docsAdminArticleKey';
import { invalidateDocsArticleCaches } from '@/platform/docs/docsAdminCatalog.server';
import {
  discardDocsAdminArticle,
  saveDocsAdminArticle,
} from '@/platform/docs/docsArticleWriteService.server';
import type { DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export const dynamic = 'force-dynamic';

type SaveDocsArticleRequest = {
  readonly title?: string;
  readonly slug?: string;
  readonly product?: string;
  readonly category?: string;
  readonly summary?: string;
  readonly visibility?: DocsArticleVisibility;
  readonly tags?: readonly string[];
  readonly estimatedReadTime?: string;
  readonly author?: string;
  readonly published?: boolean;
  readonly content?: string;
  readonly authorContext?: string;
};

type RouteContext = {
  readonly params: {
    readonly articleKey: string;
  };
};

export async function PUT(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const authError = requireAdminBearer(request);
  if (authError != null) {
    return authError;
  }

  const keyParts = decodeDocsAdminArticleKey(params.articleKey);
  if (keyParts == null) {
    return NextResponse.json({ error: 'invalid_article_key' }, { status: 400 });
  }

  let body: SaveDocsArticleRequest;
  try {
    body = (await request.json()) as SaveDocsArticleRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const title = body.title?.trim() ?? '';
  const summary = body.summary?.trim() ?? '';
  const content = body.content ?? '';
  const author = body.author?.trim() ?? '';
  const estimatedReadTime = body.estimatedReadTime?.trim() ?? '';
  const visibility = body.visibility ?? 'public';
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag) => typeof tag === 'string') : [];
  const requestedPublished = body.published === true;
  const authorContext = body.authorContext?.trim() ?? '';

  if (title === '') {
    return NextResponse.json({ error: 'title_required' }, { status: 400 });
  }

  if (requestedPublished) {
    return NextResponse.json({ error: 'publish_from_preview_only' }, { status: 400 });
  }

  const product = (body.product ?? keyParts.product) as DocsProductSlug;
  const category = (body.category ?? keyParts.category) as DocsCategorySlug;
  const slug = body.slug?.trim() ?? keyParts.slug;

  if (product !== keyParts.product || category !== keyParts.category || slug !== keyParts.slug) {
    return NextResponse.json({ error: 'immutable_article_identity' }, { status: 400 });
  }

  const result = await saveDocsAdminArticle(params.articleKey, {
    title,
    slug,
    product,
    category,
    summary,
    visibility,
    tags,
    estimatedReadTime,
    author,
    content,
    authorContext,
  });

  if (!result.ok) {
    if (result.error === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  invalidateDocsArticleCaches();

  return NextResponse.json({
    articleKey: params.articleKey,
    lastUpdated: result.lastUpdated,
    published: result.published,
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const authError = requireAdminBearer(_request);
  if (authError != null) {
    return authError;
  }

  const keyParts = decodeDocsAdminArticleKey(params.articleKey);
  if (keyParts == null) {
    return NextResponse.json({ error: 'invalid_article_key' }, { status: 400 });
  }

  const result = await discardDocsAdminArticle(params.articleKey);

  if (!result.ok) {
    if (result.error === 'published') {
      return NextResponse.json({ error: 'published_article' }, { status: 409 });
    }

    if (result.error === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }

  invalidateDocsArticleCaches();

  return NextResponse.json({ articleKey: params.articleKey, discarded: true });
}
