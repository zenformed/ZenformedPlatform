import type { ZenformedCoreOrganizationBranding } from '@/infrastructure/coreApi/types';

/** Wire shape returned by Platform `/api/branding` (`shopName` = public display label). */
export type PlatformBrandingApiDto = {
  legalName: string;
  displayName: string | null;
  publicDisplayName: string;
  shopName: string;
  hasLogo: boolean;
  canEditOrganizationProfile: boolean;
  industry: string | null;
  timezone: string | null;
  organizationId?: string;
};

export function mapCoreBrandingToPlatformApi(
  branding: ZenformedCoreOrganizationBranding
): PlatformBrandingApiDto {
  return {
    legalName: branding.legalName,
    displayName: branding.displayName,
    publicDisplayName: branding.publicDisplayName,
    shopName: branding.publicDisplayName,
    hasLogo: branding.hasLogo,
    canEditOrganizationProfile: branding.canEditOrganizationProfile,
    industry: branding.industry,
    timezone: branding.timezone,
    organizationId: branding.organizationId,
  };
}

/** @deprecated Use mapCoreBrandingToPlatformApi */
export function mapCoreBrandingToAppApi(branding: ZenformedCoreOrganizationBranding): {
  shopName: string;
  hasLogo: boolean;
  organizationId?: string;
} {
  const mapped = mapCoreBrandingToPlatformApi(branding);
  return {
    shopName: mapped.shopName,
    hasLogo: mapped.hasLogo,
    organizationId: mapped.organizationId,
  };
}
