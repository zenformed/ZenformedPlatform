import { normalizeAppPublicOrigin } from '@/infrastructure/auth/appLaunchUrlDev';

const BUILDCORE_DEMO_DASHBOARD_PATH = '/demo/dashboard';
const BUILDCORE_DEMO_ORIGIN_PRODUCTION = 'https://demo.buildcore.zenformed.com';
const BUILDCORE_DEMO_ORIGIN_LOCAL = 'http://localhost:3020';

function isLocalDevHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

/** Public BuildCore interactive demo entry URL for marketing CTAs. */
export function resolveBuildCoreDemoUrl(): string {
  const configured = normalizeAppPublicOrigin(process.env.NEXT_PUBLIC_BUILDCORE_APP_URL);
  if (configured != null) {
    return `${configured}${BUILDCORE_DEMO_DASHBOARD_PATH}`;
  }

  if (typeof window !== 'undefined' && isLocalDevHostname(window.location.hostname)) {
    return `${BUILDCORE_DEMO_ORIGIN_LOCAL}${BUILDCORE_DEMO_DASHBOARD_PATH}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    return `${BUILDCORE_DEMO_ORIGIN_LOCAL}${BUILDCORE_DEMO_DASHBOARD_PATH}`;
  }

  return `${BUILDCORE_DEMO_ORIGIN_PRODUCTION}${BUILDCORE_DEMO_DASHBOARD_PATH}`;
}
