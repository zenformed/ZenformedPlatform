'use client';

import type { ReactElement, ReactNode } from 'react';
import {
  pickSettingsDrawerClassNames,
  ZenformedSettingsDrawer,
  type ZenformedSettingsDrawerSection,
} from '@zenformed/core/dashboard-shell';
import {
  platformDashboardNavigation as nav,
  platformDashboardSettingsTab,
  type PlatformSettingsSectionId,
} from '@/platform/navigation/platformDashboardNavigation';
import styles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';

const settingsClassNames = pickSettingsDrawerClassNames(styles);

const SETTINGS_SECTIONS: ZenformedSettingsDrawerSection[] = [
  {
    id: platformDashboardSettingsTab.about.id,
    label: platformDashboardSettingsTab.about.label,
  },
];

export type PlatformSettingsDrawerProps = {
  open: boolean;
  activeSection: PlatformSettingsSectionId;
  onSectionChange: (section: PlatformSettingsSectionId) => void;
  onClose: () => void;
  aboutSectionContent: ReactNode;
};

export function PlatformSettingsDrawer({
  open,
  activeSection,
  onSectionChange,
  onClose,
  aboutSectionContent,
}: PlatformSettingsDrawerProps): ReactElement | null {
  return (
    <ZenformedSettingsDrawer
      classNames={settingsClassNames}
      open={open}
      onClose={onClose}
      title={nav.settingsDrawer.title}
      closeAriaLabel={nav.settingsDrawer.closeAriaLabel}
      sections={SETTINGS_SECTIONS}
      activeSectionId={activeSection}
      onSectionChange={(id) => onSectionChange(id as PlatformSettingsSectionId)}
      renderSectionContent={(sectionId) =>
        sectionId === platformDashboardSettingsTab.about.id ? aboutSectionContent : null
      }
    />
  );
}
