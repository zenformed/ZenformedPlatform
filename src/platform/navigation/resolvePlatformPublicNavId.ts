import type { PlatformPublicNavId } from '@/platform/navigation/platformPublicNav';

export function shouldShowPlatformPublicNavMenu(pathname: string | null): boolean {
  if (pathname == null || pathname === '') {
    return false;
  }

  return pathname.startsWith('/products') || pathname.startsWith('/docs');
}

export function resolvePlatformPublicNavId(pathname: string | null): PlatformPublicNavId | null {
  if (pathname == null || pathname === '') {
    return null;
  }

  if (pathname.startsWith('/docs')) {
    return 'docs';
  }

  if (pathname === '/products') {
    return 'products';
  }

  if (pathname.startsWith('/products/')) {
    return 'pricing';
  }

  return null;
}
