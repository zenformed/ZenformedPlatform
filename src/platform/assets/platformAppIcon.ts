import {
  zenformedAppIconPublicSrc,
  zenformedAppIconSrc,
  type ZenformedEcosystemAppIconId,
} from '@zenformed/core/dashboard-shell';

/**
 * Launcher / branding icon for a Zenformed ecosystem app.
 * Prefer `public/zenformed-app-icons/{id}.png` so deploys pick up asset changes
 * without relying on webpack chunks from `@zenformed/core`.
 */
export function launcherAppIconSrc(id: ZenformedEcosystemAppIconId): string | undefined {
  return zenformedAppIconPublicSrc(id) ?? zenformedAppIconSrc(id);
}

/**
 * Zenformed Platform product icon for sidebar branding and auth shells.
 * Prefer `public/zenformed-app-icons/platform.png` so deploys pick up asset changes
 * without relying on a separate webpack chunk from `@zenformed/core`.
 */
export function platformAppIconSrc(): string | undefined {
  return launcherAppIconSrc('platform');
}
