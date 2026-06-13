import { getOrCreateBrowserSupabaseAuthClient } from '@zenformed/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/infrastructure/config/env';

export function getSupabaseClient(): SupabaseClient {
  return getOrCreateBrowserSupabaseAuthClient({
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
    storageKey: 'zenformed-platform-auth',
  }) as unknown as SupabaseClient;
}

export type { SupabaseClient };
