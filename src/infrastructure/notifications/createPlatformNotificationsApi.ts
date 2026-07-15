'use client';

import {
  createZenformedNotificationsApi,
  type ZenformedNotificationsApi,
} from '@zenformed/core/dashboard-shell';
import {
  PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE,
  mapCoreNotificationsUrlToPlatformBff,
} from '@/infrastructure/notifications/mapCoreNotificationsUrlToBff';

/**
 * Platform browser adapter for shared package notification APIs.
 * Calls flat `/api/internal/notifications*` BFF routes (Bearer required).
 * Active organization is resolved on the server from membership context.
 */
export function createPlatformNotificationsApi(
  getAccessToken: () => string | null | undefined
): ZenformedNotificationsApi {
  return createZenformedNotificationsApi({
    baseUrl: PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE,
    getAccessToken,
    fetchImpl: async (input, init) => {
      const rewritten = mapCoreNotificationsUrlToPlatformBff(String(input));
      return fetch(rewritten, init);
    },
  });
}
