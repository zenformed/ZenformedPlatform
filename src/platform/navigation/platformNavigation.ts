import { platformAppDefinition } from '@/platform/appDefinitions/platform';

export const platformNavigation = {
  routes: {
    home: '/',
    dashboard: platformAppDefinition.dashboardRoute ?? '/dashboard',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    products: '/products',
    docs: '/docs',
    roadmap: '#',
    status: '#',
    productPricing: (appSlug: string) => `/products/${appSlug}`,
    cart: '/cart',
    checkoutSuccess: '/checkout/success',
    legalTerms: '/legal/terms',
    legalPrivacy: '/legal/privacy',
  },
} as const;

export type PlatformNavigation = typeof platformNavigation;
