'use client';

import type { ReactElement } from 'react';
import type { ZenformedSidebarNavItem, ZenformedSidebarSection } from '@zenformed/core/dashboard-shell';
import { HomeIcon } from '@/platform/icons/platformDashboardShellIcons';
import type { PlatformSidebarNavId } from '@/platform/navigation/platformDashboardNavigation';

export type BuildPlatformSidebarSectionsInput = {
  readonly activeId: PlatformSidebarNavId;
  readonly onSelect: (id: PlatformSidebarNavId) => void;
  readonly teamContent?: ReactElement | null;
};

export function buildPlatformSidebarSections(
  input: BuildPlatformSidebarSectionsInput
): readonly ZenformedSidebarSection[] {
  const homeItem: ZenformedSidebarNavItem = {
    id: 'home',
    label: 'Home',
    title: 'Home',
    icon: <HomeIcon />,
    active: input.activeId === 'home',
    onSelect: () => input.onSelect('home'),
  };

  const sections: ZenformedSidebarSection[] = [
    {
      kind: 'nav',
      id: 'menu',
      label: 'Menu',
      collapsedLabel: 'MENU',
      items: [homeItem],
    },
  ];

  if (input.teamContent != null) {
    sections.push({
      kind: 'custom',
      id: 'team',
      label: 'Team',
      collapsedLabel: 'TEAM',
      collapsible: true,
      defaultOpen: true,
      content: input.teamContent,
    });
  }

  return sections;
}
