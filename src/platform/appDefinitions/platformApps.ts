export type PlatformAppId = 'buildcore' | 'forgecore' | 'formcore';

export type PlatformAppStatus = 'live' | 'coming_soon';

export type PlatformAppEntry = {
  readonly id: PlatformAppId;
  readonly name: string;
  readonly description: string;
  /** When set, opens via one-time launch handoff instead of a direct href. */
  readonly launchTarget?: PlatformAppId;
  readonly href?: string;
  readonly status: PlatformAppStatus;
};

export const PLATFORM_APPS: readonly PlatformAppEntry[] = [
  {
    id: 'buildcore',
    name: 'BuildCore',
    description: 'Construction project management and CRM.',
    launchTarget: 'buildcore',
    status: 'live',
  },
  {
    id: 'forgecore',
    name: 'ForgeCore',
    description: 'Shop operations and work orders.',
    status: 'coming_soon',
  },
  {
    id: 'formcore',
    name: 'FormCore',
    description: 'Forms and workflow automation.',
    status: 'coming_soon',
  },
];
