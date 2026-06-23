'use client';

import type { ReactElement } from 'react';
import type { AdminOrganizationStorageBreakdown } from '@/infrastructure/coreApi/adminTypes';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { formatAdminStorageBytes } from '@/platform/content/platformAdminContent';
import adminStyles from './admin.module.css';

export type AdminStorageUsageSectionProps = {
  storage: AdminOrganizationStorageBreakdown;
  showLimitations?: boolean;
};

export function AdminStorageUsageSection({
  storage,
  showLimitations = true,
}: AdminStorageUsageSectionProps): ReactElement {
  const rows = content.organizations.detail.storageRows;

  return (
    <div className={adminStyles.adminStorageSection}>
      <dl className={adminStyles.adminStorageList}>
        <div className={adminStyles.adminStorageRow}>
          <dt>{rows.buildCoreDocuments}</dt>
          <dd>{formatAdminStorageBytes(storage.buildCoreDocumentsBytes)}</dd>
        </div>
        <div className={adminStyles.adminStorageRow}>
          <dt>{rows.buildCoreProjectPhotos}</dt>
          <dd>{formatAdminStorageBytes(storage.buildCoreProjectPhotosBytes)}</dd>
        </div>
        <div className={adminStyles.adminStorageRow}>
          <dt>{rows.organizationBranding}</dt>
          <dd>{formatAdminStorageBytes(storage.organizationBrandingBytes)}</dd>
        </div>
        <div className={adminStyles.adminStorageRow}>
          <dt>{rows.userAvatars}</dt>
          <dd>{formatAdminStorageBytes(storage.userAvatarsBytes)}</dd>
        </div>
        <div className={`${adminStyles.adminStorageRow} ${adminStyles.adminStorageRowTotal}`}>
          <dt>{rows.total}</dt>
          <dd>{formatAdminStorageBytes(storage.totalStorageBytes)}</dd>
        </div>
      </dl>
      {showLimitations && storage.limitations.length > 0 ? (
        <div className={adminStyles.adminStorageNotes}>
          <p className={adminStyles.adminStorageNotesTitle}>
            {content.organizations.detail.limitationsTitle}
          </p>
          <ul>
            {storage.limitations.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
