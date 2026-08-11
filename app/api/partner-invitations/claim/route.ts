import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/infrastructure/config/env';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authorization = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authorization);
  if (!user || !authorization?.startsWith('Bearer ')) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (env.zenformedCoreApiBaseUrl == null) return NextResponse.json({ error: 'core_unconfigured' }, { status: 503 });
  const body = await request.text(); if (Buffer.byteLength(body) > 4096) return NextResponse.json({ error: 'invalid_invitation' }, { status: 400 });
  const response = await fetch(`${env.zenformedCoreApiBaseUrl.replace(/\/+$/, '')}/partner-invitations/claim`, { method: 'POST', cache: 'no-store', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authorization }, body });
  let json: unknown; try { json = await response.json(); } catch { return NextResponse.json({ error: 'invalid_upstream_payload' }, { status: 502 }); }
  return NextResponse.json(json, { status: response.status, headers: { 'Cache-Control': 'private, no-store' } });
}
