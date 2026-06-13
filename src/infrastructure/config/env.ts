import {
  normalizePlatformPublicAppOrigin,
  resolvePlatformPublicAppUrl,
} from '@/infrastructure/config/platformPublicAppUrl';

export const env = {
  get supabaseUrl(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!value) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    return value;
  },
  get supabaseAnonKey(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    return value;
  },
  get isSaasMode(): boolean {
    return process.env.NEXT_PUBLIC_SAAS_MODE === 'true';
  },
  get appUrl(): string {
    if (typeof window !== 'undefined') {
      const configured = normalizePlatformPublicAppOrigin(
        process.env.NEXT_PUBLIC_PLATFORM_APP_URL
      );
      if (configured) return configured;
      return window.location.origin;
    }
    return resolvePlatformPublicAppUrl();
  },
} as const;
