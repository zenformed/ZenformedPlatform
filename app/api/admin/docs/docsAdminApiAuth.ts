import { NextRequest, NextResponse } from 'next/server';

export function requireAdminBearer(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ') || authHeader.slice('Bearer '.length).trim() === '') {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  return null;
}
