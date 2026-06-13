'use client';

import { useCallback, useState } from 'react';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';

type LaunchState = {
  launchingAppId: PlatformAppId | null;
  error: string | null;
};

function readErrorMessage(json: unknown, fallback: string): string {
  if (json != null && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
  }
  return fallback;
}

export function usePlatformAppLaunch(): {
  launchApp: (targetApp: PlatformAppId, returnPath?: string) => Promise<void>;
  launchingAppId: PlatformAppId | null;
  launchError: string | null;
  clearLaunchError: () => void;
} {
  const { session } = useSaaSProfile();
  const [state, setState] = useState<LaunchState>({ launchingAppId: null, error: null });

  const clearLaunchError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const launchApp = useCallback(
    async (targetApp: PlatformAppId, returnPath = '/dashboard'): Promise<void> => {
      const accessToken = session?.access_token?.trim();
      if (!accessToken) {
        setState({ launchingAppId: null, error: 'Sign in to open apps.' });
        return;
      }

      setState({ launchingAppId: targetApp, error: null });
      try {
        const res = await fetch('/api/internal/app-launch', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ targetApp, returnPath }),
        });
        const json: unknown = await res.json();
        if (!res.ok) {
          setState({
            launchingAppId: null,
            error: readErrorMessage(json, 'Could not open app.'),
          });
          return;
        }
        if (json != null && typeof json === 'object' && typeof (json as { launchUrl?: string }).launchUrl === 'string') {
          window.location.assign((json as { launchUrl: string }).launchUrl);
          return;
        }
        setState({ launchingAppId: null, error: 'Could not open app.' });
      } catch {
        setState({ launchingAppId: null, error: 'Could not open app.' });
      }
    },
    [session?.access_token]
  );

  return {
    launchApp,
    launchingAppId: state.launchingAppId,
    launchError: state.error,
    clearLaunchError,
  };
}
