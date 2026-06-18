'use client';

import React from 'react';
import { env } from '@/infrastructure/config/env';
import { PlatformAuthGate } from '@/presentation/components/PlatformAuthGate';
import { BrandingProvider } from '@/presentation/providers/BrandingProvider';
import { SaaSProfileProvider } from '@/presentation/providers/SaaSProfileProvider';
import { CartIntentProvider } from '@/presentation/providers/CartIntentProvider';

export interface PlatformRootGateProps {
  children: React.ReactNode;
}

export function PlatformRootGate({ children }: PlatformRootGateProps): React.ReactElement {
  if (!env.isSaasMode) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ marginTop: 0 }}>Zenformed Platform</h1>
        <p>
          Set <code>NEXT_PUBLIC_SAAS_MODE=true</code> with Supabase env vars (see{' '}
          <code>.env.example</code>).
        </p>
      </div>
    );
  }

  return (
    <SaaSProfileProvider>
      <CartIntentProvider>
        <BrandingProvider>
          <PlatformAuthGate>{children}</PlatformAuthGate>
        </BrandingProvider>
      </CartIntentProvider>
    </SaaSProfileProvider>
  );
}
