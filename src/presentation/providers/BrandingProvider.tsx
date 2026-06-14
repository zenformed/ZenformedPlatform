'use client';

import React, { type ReactElement } from 'react';
import { env } from '@/infrastructure/config/env';
import { usesCoreOrganizationBranding } from '@/infrastructure/branding/organizationBrandingAuthority';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { useSaaSProfile } from '@/presentation/providers/SaaSProfileProvider';
import {
  ZenformedOrganizationBrandingProvider,
  useZenformedOrganizationBrandingShell,
  type ZenformedOrganizationBrandingShellState,
} from '@zenformed/core/organization-branding';

export type BrandingState = ZenformedOrganizationBrandingShellState;

export function BrandingProvider({ children }: { children: React.ReactNode }): ReactElement {
  const { session } = useSaaSProfile();
  const accessToken = env.isSaasMode ? session?.access_token ?? null : null;

  return (
    <ZenformedOrganizationBrandingProvider
      defaultDisplayNameFallback={platformAppDefinition.displayName}
      getAccessToken={() => accessToken}
      sessionUserId={session?.user?.id ?? null}
      requireAuthForLogo={usesCoreOrganizationBranding()}
    >
      {children}
    </ZenformedOrganizationBrandingProvider>
  );
}

export function useBrandingContext(): BrandingState {
  return useZenformedOrganizationBrandingShell();
}
