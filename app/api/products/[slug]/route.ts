import { NextResponse } from 'next/server';
import { getProductCatalogProductFromCore } from '@/infrastructure/coreApi/productCatalogClient';

export const dynamic = 'force-dynamic';

type RouteContext = {
  readonly params: { slug: string };
};

/** Public BFF relay for ZenformedCore GET /products/:slug (display-safe pricing). */
export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const result = await getProductCatalogProductFromCore(context.params.slug);
  if (!result.ok) {
    if (result.error.kind === 'unconfigured') {
      return NextResponse.json(
        { relay: 'zenformed_core', error: 'core_unconfigured' },
        { status: 503 }
      );
    }
    if (result.error.kind === 'http_error' && result.error.status === 404) {
      return NextResponse.json({ relay: 'zenformed_core', error: 'not_found' }, { status: 404 });
    }
    if (result.error.kind === 'http_error') {
      return NextResponse.json(result.error.body ?? { error: 'upstream_error' }, {
        status: result.error.status,
      });
    }
    return NextResponse.json({ relay: 'zenformed_core', error: 'catalog_unavailable' }, { status: 502 });
  }
  return NextResponse.json({ relay: 'zenformed_core', ...result.data });
}
