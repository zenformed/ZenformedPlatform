import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE,
  mapCoreNotificationsUrlToPlatformBff,
} from './mapCoreNotificationsUrlToBff';
import { navigateNotificationDestination } from '../../presentation/features/notifications/navigateNotificationDestination';
import { shouldEnablePlatformNotifications } from '../../presentation/features/notifications/platformNotificationsConfigGate';

const notificationsApiRoot = join(process.cwd(), 'app', 'api', 'internal', 'notifications');

function collectRouteFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      collectRouteFiles(full, out);
    } else if (name === 'route.ts') {
      out.push(full);
    }
  }
  return out;
}

describe('mapCoreNotificationsUrlToPlatformBff', () => {
  it('maps latest, page, unread, mark-read, and mark-all routes', () => {
    const org = 'org-abc';
    assert.equal(
      mapCoreNotificationsUrlToPlatformBff(
        `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/${org}/notifications/latest?limit=10`
      ),
      '/api/internal/notifications/latest?limit=10'
    );
    assert.equal(
      mapCoreNotificationsUrlToPlatformBff(
        `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/${org}/notifications?limit=20&cursor=c1`
      ),
      '/api/internal/notifications?limit=20&cursor=c1'
    );
    assert.equal(
      mapCoreNotificationsUrlToPlatformBff(
        `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/${org}/notifications/unread-count`
      ),
      '/api/internal/notifications/unread-count'
    );
    assert.equal(
      mapCoreNotificationsUrlToPlatformBff(
        `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/${org}/notifications/n1/read`
      ),
      '/api/internal/notifications/n1/read'
    );
    assert.equal(
      mapCoreNotificationsUrlToPlatformBff(
        `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/${org}/notifications/read-all`
      ),
      '/api/internal/notifications/read-all'
    );
  });

  it('discards organization path segments (BFF resolves org from session)', () => {
    const a = mapCoreNotificationsUrlToPlatformBff(
      `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/org-1/notifications/latest`
    );
    const b = mapCoreNotificationsUrlToPlatformBff(
      `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/org-2/notifications/latest`
    );
    assert.equal(a, b);
    assert.equal(a, '/api/internal/notifications/latest');
  });
});

describe('navigateNotificationDestination', () => {
  it('uses router.push for relative Platform routes', () => {
    const pushes: string[] = [];
    navigateNotificationDestination('/notifications', {
      push: (href) => pushes.push(href),
      origin: 'https://core.example.com',
    });
    assert.deepEqual(pushes, ['/notifications']);
  });

  it('assigns cross-app https destinations', () => {
    const assigned: string[] = [];
    navigateNotificationDestination('https://build.example.com/projects/acme/tasks', {
      push: () => {
        throw new Error('should not push');
      },
      assign: (url) => assigned.push(url),
      origin: 'https://core.example.com',
    });
    assert.deepEqual(assigned, ['https://build.example.com/projects/acme/tasks']);
  });

  it('rejects javascript destinations', () => {
    const pushes: string[] = [];
    navigateNotificationDestination('javascript:alert(1)', {
      push: (href) => pushes.push(href),
    });
    assert.deepEqual(pushes, []);
  });
});

describe('Platform notifications host config', () => {
  it('skips notifications when auth/org are not ready', () => {
    assert.equal(
      shouldEnablePlatformNotifications({
        isSaasMode: true,
        useMockAuth: false,
        hasAccessToken: true,
        membershipContextStatus: 'ready',
        organizationId: 'org-1',
        hasActiveMembership: true,
      }),
      true
    );
    assert.equal(
      shouldEnablePlatformNotifications({
        isSaasMode: true,
        useMockAuth: false,
        hasAccessToken: false,
        membershipContextStatus: 'ready',
        organizationId: 'org-1',
        hasActiveMembership: true,
      }),
      false
    );
    assert.equal(
      shouldEnablePlatformNotifications({
        isSaasMode: false,
        useMockAuth: false,
        hasAccessToken: true,
        membershipContextStatus: 'ready',
        organizationId: 'org-1',
        hasActiveMembership: true,
      }),
      false
    );
  });

  it('maps unread-count for background polling separately from latest', () => {
    const unread = mapCoreNotificationsUrlToPlatformBff(
      `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/org-1/notifications/unread-count`
    );
    const latest = mapCoreNotificationsUrlToPlatformBff(
      `${PLATFORM_NOTIFICATIONS_CORE_STYLE_BASE}/organizations/org-1/notifications/latest?limit=10`
    );
    assert.equal(unread, '/api/internal/notifications/unread-count');
    assert.equal(latest, '/api/internal/notifications/latest?limit=10');
    assert.notEqual(unread, latest);
  });
});

describe('notifications BFF route surface', () => {
  it('exposes only the five consumer routes and no create route', () => {
    const routes = collectRouteFiles(notificationsApiRoot).map((p) =>
      p.replace(/\\/g, '/').split('/app/api/internal/notifications/')[1]
    );
    assert.deepEqual(routes.sort(), [
      '[notificationId]/read/route.ts',
      'latest/route.ts',
      'read-all/route.ts',
      'route.ts',
      'unread-count/route.ts',
    ]);
  });

  it('relay resolves organization from membership context, not browser body', () => {
    const relaySource = readFileSync(join(notificationsApiRoot, 'notificationsRelay.ts'), 'utf8');
    assert.match(relaySource, /fetchAuthoritativeMembershipContext/);
    assert.match(relaySource, /organizationId/);
    assert.doesNotMatch(relaySource, /recipientUserId/);
    assert.doesNotMatch(relaySource, /createPlatformNotification/);
  });

  it('mark-read uses path notification id only', () => {
    const markRead = readFileSync(
      join(notificationsApiRoot, '[notificationId]', 'read', 'route.ts'),
      'utf8'
    );
    assert.match(markRead, /postCoreNotificationMarkRead/);
    assert.match(markRead, /notificationId/);
  });
});
