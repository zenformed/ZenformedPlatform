import { NextRequest, NextResponse } from 'next/server';
import { requireAdminBearer } from '../../../docsAdminApiAuth';
import { decodeDocsAdminArticleKey } from '@/platform/docs/docsAdminArticleKey';
import { publishDocsAdminArticle } from '@/platform/docs/docsArticlePublish.server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  readonly params: {
    readonly articleKey: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const authError = requireAdminBearer(request);
  if (authError != null) {
    return authError;
  }

  const keyParts = decodeDocsAdminArticleKey(params.articleKey);
  if (keyParts == null) {
    return NextResponse.json({ error: 'invalid_article_key' }, { status: 400 });
  }

  const result = await publishDocsAdminArticle(params.articleKey);

  if (!result.ok) {
    if (result.error === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (result.error === 'already_published') {
      return NextResponse.json({ error: 'already_published' }, { status: 409 });
    }

    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    articleKey: params.articleKey,
    published: true,
    lastUpdated: result.lastUpdated,
  });
}
