import { platformAppDefinition } from '@/platform/appDefinitions/platform';

export const platformNavigation = {
  routes: {
    home: '/',
    dashboard: platformAppDefinition.dashboardRoute ?? '/dashboard',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
} as const;

export type PlatformNavigation = typeof platformNavigation;
