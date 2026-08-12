import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/infrastructure/config/env';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';
export const dynamic = 'force-dynamic';

async function relay(request: NextRequest, suffix: string, method: 'GET' | 'POST'): Promise<NextResponse> {
  const authorization = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authorization);
  if (!user || !authorization?.startsWith('Bearer ')) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (env.zenformedCoreApiBaseUrl == null) return NextResponse.json({ error: 'core_unconfigured' }, { status: 503 });
  const body = method === 'POST' ? await request.text() : undefined;
  const response = await fetch(`${env.zenformedCoreApiBaseUrl.replace(/\/+$/, '')}${suffix}`, {
    method, cache: 'no-store', headers: { Accept: 'application/json', ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), Authorization: authorization }, body,
  });
  let json: unknown; try { json = await response.json(); } catch { return NextResponse.json({ error: 'invalid_upstream_payload' }, { status: 502 }); }
  return NextResponse.json(json, { status: response.status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function GET(request: NextRequest): Promise<NextResponse> { return relay(request, '/partner-required-actions', 'GET'); }
export async function POST(request: NextRequest): Promise<NextResponse> { return relay(request, '/partner-required-actions/resolve', 'POST'); }
