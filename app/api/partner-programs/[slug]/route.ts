import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/infrastructure/config/env';

export const dynamic = 'force-dynamic';
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function relay(request: NextRequest, slug: string, method: 'GET' | 'POST'): Promise<NextResponse> {
  if (!SLUG_PATTERN.test(slug)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (env.zenformedCoreApiBaseUrl == null) return NextResponse.json({ error: 'core_unconfigured' }, { status: 503 });
  const upstreamPath = method === 'GET' ? `/partner-programs/${encodeURIComponent(slug)}` : `/partner-programs/${encodeURIComponent(slug)}/applications`;
  const body = method === 'POST' ? await request.text() : undefined;
  if (body != null && Buffer.byteLength(body) > 32_768) return NextResponse.json({ error: 'body_too_large', message: 'Application is too large.' }, { status: 413 });
  const forwardedFor = request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown';
  const response = await fetch(`${env.zenformedCoreApiBaseUrl.replace(/\/+$/, '')}${upstreamPath}`, {
    method,
    cache: 'no-store',
    headers: { Accept: 'application/json', ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), 'X-Forwarded-For': forwardedFor },
    body,
  });
  let json: unknown;
  try { json = await response.json(); }
  catch { return NextResponse.json({ error: 'invalid_upstream_payload' }, { status: 502 }); }
  return NextResponse.json(json, { status: response.status, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function GET(request: NextRequest, context: { params: { slug: string } }) {
  return relay(request, context.params.slug, 'GET');
}

export async function POST(request: NextRequest, context: { params: { slug: string } }) {
  return relay(request, context.params.slug, 'POST');
}
