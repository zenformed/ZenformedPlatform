import type { EntitlementReaderSupabaseDeps } from '@zenformed/core';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/infrastructure/config/env';

/** Platform wiring for JWT-scoped reads against mirrored platform entitlement tables. */
export function getPlatformEntitlementReaderSupabaseDeps(): EntitlementReaderSupabaseDeps {
  return {
    connection: {
      getSupabaseUrl: () => env.supabaseUrl,
      getSupabaseAnonKey: () => env.supabaseAnonKey,
    },
    getBrowserSupabaseClient: () =>
      createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
  };
}
