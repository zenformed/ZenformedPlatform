import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

export type PlatformPublicNavId = 'products' | 'docs' | 'pricing' | 'roadmap' | 'status';

export type PlatformPublicNavItem = {
  readonly id: PlatformPublicNavId;
  readonly label: string;
  readonly href: string;
};

export const PLATFORM_PUBLIC_NAV_ITEMS: readonly PlatformPublicNavItem[] = [
  { id: 'products', label: 'Products', href: nav.routes.products },
  { id: 'docs', label: 'Docs', href: nav.routes.docs },
  { id: 'pricing', label: 'Pricing', href: nav.routes.products },
  { id: 'roadmap', label: 'Roadmap', href: nav.routes.roadmap },
  { id: 'status', label: 'Status', href: nav.routes.status },
];
