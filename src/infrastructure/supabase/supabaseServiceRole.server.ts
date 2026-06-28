import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serviceRoleClient: SupabaseClient | null = null;

function getServiceRoleEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  const env = getServiceRoleEnv();
  if (env == null) {
    return null;
  }

  serviceRoleClient ??= createClient(env.url, env.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return serviceRoleClient;
}

export function requireSupabaseServiceRoleClient(): SupabaseClient {
  const client = getSupabaseServiceRoleClient();
  if (client == null) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required for database docs operations.');
  }

  return client;
}
