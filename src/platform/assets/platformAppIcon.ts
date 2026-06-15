import {
  zenformedAppIconPublicSrc,
  zenformedAppIconSrc,
} from '@zenformed/core/dashboard-shell';

/**
 * Zenformed Platform product icon for sidebar branding and auth shells.
 * Prefer `public/zenformed-app-icons/platform.png` so deploys pick up asset changes
 * without relying on a separate webpack chunk from `@zenformed/core`.
 */
export function platformAppIconSrc(): string | undefined {
  return zenformedAppIconPublicSrc('platform') ?? zenformedAppIconSrc('platform');
}
