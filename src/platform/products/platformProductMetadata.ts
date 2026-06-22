import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import {
  formatPlatformAppDisplayName,
  resolveBillingAppIconSrc,
} from '@zenformed/core/organization-settings';

export type PlatformProductMetadata = {
  productSlug: string;
  displayName: string;
  iconSrc: string | undefined;
};

const PLATFORM_APP_ICON_OVERRIDES = Object.fromEntries(
  PLATFORM_APPS.map((app) => [app.id, app.iconSrc])
) as Record<string, string | undefined>;

/**
 * Single source of truth for admin/product UI: slug, display name, icon.
 */
export function getPlatformProductMetadata(productSlug: string): PlatformProductMetadata {
  const normalized = productSlug.trim().toLowerCase();
  const catalogEntry = PLATFORM_APPS.find((app) => app.id === normalized);
  return {
    productSlug: normalized,
    displayName: catalogEntry?.name ?? formatPlatformAppDisplayName(normalized),
    iconSrc:
      PLATFORM_APP_ICON_OVERRIDES[normalized] ?? resolveBillingAppIconSrc(normalized) ?? undefined,
  };
}
