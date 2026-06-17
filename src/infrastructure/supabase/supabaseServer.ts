/**
 * Server-only Supabase helpers for API routes.
 * Use to verify Supabase JWT and get user; do not import from client code.
 */

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const AUTH_CACHE_TTL_MS = 60_000;
const AUTH_FAILURE_CACHE_TTL_MS = 5_000;

type AuthCacheEntry = {
  user: User | null;
  expiresAt: number;
};

let supabaseClient: SupabaseClient | null = null;
const authCache = new Map<string, AuthCacheEntry>();
const authInFlight = new Map<string, Promise<User | null>>();

function getEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function getSupabaseClient(): SupabaseClient | null {
  const env = getEnv();
  if (!env) return null;
  if (supabaseClient == null) {
    supabaseClient = createClient(env.url, env.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClient;
}

function readAuthCache(token: string): User | null | undefined {
  const entry = authCache.get(token);
  if (entry == null) return undefined;
  if (Date.now() >= entry.expiresAt) {
    authCache.delete(token);
    return undefined;
  }
  return entry.user;
}

function writeAuthCache(token: string, user: User | null, ttlMs: number): void {
  authCache.set(token, { user, expiresAt: Date.now() + ttlMs });
}

async function resolveSupabaseUserFromToken(token: string): Promise<User | null> {
  const cached = readAuthCache(token);
  if (cached !== undefined) return cached;

  const inFlight = authInFlight.get(token);
  if (inFlight) return inFlight;

  const promise = (async (): Promise<User | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      const resolved = error || !user ? null : user;
      writeAuthCache(
        token,
        resolved,
        resolved != null ? AUTH_CACHE_TTL_MS : AUTH_FAILURE_CACHE_TTL_MS
      );
      return resolved;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[supabaseServer] getUser failed: ${message}`);
      }
      writeAuthCache(token, null, AUTH_FAILURE_CACHE_TTL_MS);
      return null;
    } finally {
      authInFlight.delete(token);
    }
  })();

  authInFlight.set(token, promise);
  return promise;
}

/**
 * Get Supabase user from a Bearer token (e.g. Authorization: Bearer <access_token>).
 * Returns null if env is missing, token is invalid, user cannot be resolved, or Supabase is unreachable.
 */
export async function getSupabaseUserFromToken(bearerToken: string | null): Promise<User | null> {
  if (!bearerToken?.startsWith('Bearer ')) return null;
  const token = bearerToken.slice(7).trim();
  if (!token) return null;
  return resolveSupabaseUserFromToken(token);
}
