'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import { AdminStorageUsageSection } from '@/presentation/components/Admin/AdminStorageUsageSection';
import { ProductOwnershipList } from '@/presentation/components/Admin/ProductOwnershipList';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import {
  parseAdminOrganizationDetail,
  type AdminOrganizationDetail,
} from '@/infrastructure/coreApi/adminTypes';
import {
  formatAdminDate,
  formatAdminStatus,
  formatAdminStorageBytes,
} from '@/platform/content/platformAdminContent';
import adminStyles from './admin.module.css';

export function AdminOrganizationDetailPageContent({
  organizationId,
}: {
  organizationId: string;
}): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const [detail, setDetail] = useState<AdminOrganizationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage(content.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(nav.api.organizationDetail(organizationId), {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 404) {
        setErrorMessage('Organization not found.');
        setDetail(null);
        return;
      }
      if (!res.ok) {
        setErrorMessage(content.error);
        setDetail(null);
        return;
      }
      const json: unknown = await res.json();
      const parsed = parseAdminOrganizationDetail(json);
      if (parsed == null) {
        setErrorMessage(content.error);
        setDetail(null);
        return;
      }
      setDetail(parsed);
    } catch {
      setErrorMessage(content.error);
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return <p>{content.loading}</p>;
  }

  if (errorMessage != null || detail == null) {
    return (
      <>
        <Link href={nav.routes.organizations} className={adminStyles.adminBackLink}>
          {content.organizations.detail.backToList}
        </Link>
        <p className={adminStyles.adminError} role="alert">
          {errorMessage ?? content.error}
        </p>
      </>
    );
  }

  const fields = content.organizations.detail.fields;

  return (
    <>
      <Link href={nav.routes.organizations} className={adminStyles.adminBackLink}>
        {content.organizations.detail.backToList}
      </Link>

      <section className={adminStyles.adminDetailSection}>
        <h2 className={adminStyles.adminPageTitle}>{content.organizations.detail.summaryTitle}</h2>
        <dl className={adminStyles.adminSummaryGrid}>
          <div>
            <dt>{fields.name}</dt>
            <dd>{detail.name}</dd>
          </div>
          <div>
            <dt>{fields.ownerEmail}</dt>
            <dd>
              {detail.ownerUserId != null && detail.ownerEmail != null ? (
                <Link href={nav.routes.accountOwnerDetail(detail.ownerUserId)} className={adminStyles.adminLink}>
                  {detail.ownerEmail}
                </Link>
              ) : (
                detail.ownerEmail ?? '—'
              )}
            </dd>
          </div>
          <div>
            <dt>{fields.memberCount}</dt>
            <dd>{detail.memberCount}</dd>
          </div>
          <div>
            <dt>{fields.products}</dt>
            <dd>
              <ProductOwnershipList items={detail.products} />
            </dd>
          </div>
          <div>
            <dt>{fields.subscriptionStatus}</dt>
            <dd>{formatAdminStatus(detail.subscriptionStatus)}</dd>
          </div>
          <div>
            <dt>{fields.createdAt}</dt>
            <dd>{formatAdminDate(detail.createdAt)}</dd>
          </div>
          <div>
            <dt>{fields.storageUsed}</dt>
            <dd>{formatAdminStorageBytes(detail.storageUsedBytes)}</dd>
          </div>
        </dl>
      </section>

      <section className={adminStyles.adminDetailSection}>
        <h2 className={adminStyles.adminSectionTitle}>{content.organizations.detail.storageTitle}</h2>
        <AdminStorageUsageSection storage={detail.storage} />
      </section>
    </>
  );
}
