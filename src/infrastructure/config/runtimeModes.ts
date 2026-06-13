import { env } from '@/infrastructure/config/env';

export const runtimeModes = {
  isSaasMode(): boolean {
    return env.isSaasMode;
  },
  useMockAuth(): boolean {
    return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
  },
} as const;
