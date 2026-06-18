import { NextResponse } from 'next/server';
import { getProductCatalogListFromCore } from '@/infrastructure/coreApi/productCatalogClient';

export const dynamic = 'force-dynamic';

/** Public BFF relay for ZenformedCore GET /products (display-safe catalog index). */
export async function GET(): Promise<NextResponse> {
  const result = await getProductCatalogListFromCore();
  if (!result.ok) {
    if (result.error.kind === 'unconfigured') {
      return NextResponse.json(
        { relay: 'zenformed_core', error: 'core_unconfigured' },
        { status: 503 }
      );
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
