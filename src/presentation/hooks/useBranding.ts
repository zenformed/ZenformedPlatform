'use client';

import { useBrandingContext } from '@/presentation/providers';

export interface UseBrandingState {
  shopName: string;
  logoUrl: string | null;
  hasLogo: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useBranding(): UseBrandingState {
  const ctx = useBrandingContext();
  return {
    shopName: ctx.shopName,
    logoUrl: ctx.logoUrl,
    hasLogo: ctx.hasLogo,
    isLoading: ctx.isLoading,
    refetch: ctx.refetch,
  };
}
