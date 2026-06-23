'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import { AdminDataTable } from '@/presentation/components/Admin/AdminDataTable';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import {
  parseAdminAccountOwnerDetail,
  type AdminAccountOwnerDetail,
} from '@/infrastructure/coreApi/adminTypes';
import { ProductOwnershipList } from '@/presentation/components/Admin/ProductOwnershipList';
import {
  formatAdminDate,
  formatAdminStatus,
  formatAdminStorageBytes,
} from '@/platform/content/platformAdminContent';
import adminStyles from './admin.module.css';

export function AdminAccountOwnerDetailPageContent({
  ownerUserId,
}: {
  ownerUserId: string;
}): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const [detail, setDetail] = useState<AdminAccountOwnerDetail | null>(null);
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
      const res = await fetch(nav.api.accountOwnerDetail(ownerUserId), {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 404) {
        setErrorMessage('Account owner not found.');
        setDetail(null);
        return;
      }
      if (!res.ok) {
        setErrorMessage(content.error);
        setDetail(null);
        return;
      }
      const json: unknown = await res.json();
      const parsed = parseAdminAccountOwnerDetail(json);
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
  }, [getAccessToken, ownerUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return <p>{content.loading}</p>;
  }

  if (errorMessage != null || detail == null) {
    return (
      <>
        <Link href={nav.routes.accountOwners} className={adminStyles.adminBackLink}>
          {content.accountOwnerDetail.backToList}
        </Link>
        <p className={adminStyles.adminError} role="alert">
          {errorMessage ?? content.error}
        </p>
      </>
    );
  }

  return (
    <>
      <Link href={nav.routes.accountOwners} className={adminStyles.adminBackLink}>
        {content.accountOwnerDetail.backToList}
      </Link>

      <section className={adminStyles.adminDetailSection}>
        <h2 className={adminStyles.adminPageTitle}>{content.accountOwnerDetail.summaryTitle}</h2>
        <dl className={adminStyles.adminSummaryGrid}>
          <div>
            <dt>{content.accountOwnerDetail.fields.email}</dt>
            <dd>{detail.email}</dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.name}</dt>
            <dd>{detail.displayName}</dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.createdAt}</dt>
            <dd>{formatAdminDate(detail.createdAt)}</dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.lastLoginAt}</dt>
            <dd>{formatAdminDate(detail.lastLoginAt)}</dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.organizationsOwned}</dt>
            <dd>{detail.organizationsOwned}</dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.productsOwned}</dt>
            <dd>
              <ProductOwnershipList items={detail.productsOwned} />
            </dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.subscriptionSummary}</dt>
            <dd>{formatAdminStatus(detail.subscriptionSummary)}</dd>
          </div>
          <div>
            <dt>{content.accountOwnerDetail.fields.totalStorageUsed}</dt>
            <dd>{formatAdminStorageBytes(detail.totalStorageUsedBytes)}</dd>
          </div>
        </dl>
      </section>

      {detail.organizations.length > 0 ? (
        <section className={adminStyles.adminDetailSection}>
          <h2 className={adminStyles.adminSectionTitle}>
            {content.accountOwnerDetail.fields.totalStorageUsed}
          </h2>
          <dl className={adminStyles.adminStorageList}>
            {detail.organizations.map((organization) => (
              <div key={organization.id} className={adminStyles.adminStorageRow}>
                <dt>
                  <Link
                    href={nav.routes.organizationDetail(organization.id)}
                    className={adminStyles.adminLink}
                  >
                    {organization.name}
                  </Link>
                </dt>
                <dd>{formatAdminStorageBytes(organization.storageUsedBytes)}</dd>
              </div>
            ))}
            <div className={`${adminStyles.adminStorageRow} ${adminStyles.adminStorageRowTotal}`}>
              <dt>Total</dt>
              <dd>{formatAdminStorageBytes(detail.totalStorageUsedBytes)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className={adminStyles.adminDetailSection}>
        <h2 className={adminStyles.adminSectionTitle}>{content.accountOwnerDetail.organizationsTitle}</h2>
        {detail.organizations.length === 0 ? (
          <p>{content.empty}</p>
        ) : (
          detail.organizations.map((organization) => (
            <article key={organization.id} className={adminStyles.adminOrgCard}>
              <div className={adminStyles.adminOrgHeader}>
                <h3 className={adminStyles.adminOrgTitle}>{organization.name}</h3>
                <dl className={adminStyles.adminOrgMetaGrid}>
                  <div>
                    <dt>{content.accountOwnerDetail.organizationColumns.createdAt}</dt>
                    <dd>{formatAdminDate(organization.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>{content.accountOwnerDetail.organizationColumns.subscriptionStatus}</dt>
                    <dd>{formatAdminStatus(organization.subscriptionStatus)}</dd>
                  </div>
                  <div>
                    <dt>{content.accountOwnerDetail.organizationColumns.products}</dt>
                    <dd>
                      <ProductOwnershipList items={organization.products} />
                    </dd>
                  </div>
                  <div>
                    <dt>{content.accountOwnerDetail.organizationColumns.memberCount}</dt>
                    <dd>{organization.memberCount}</dd>
                  </div>
                  <div>
                    <dt>{content.accountOwnerDetail.organizationColumns.storageUsed}</dt>
                    <dd>{formatAdminStorageBytes(organization.storageUsedBytes)}</dd>
                  </div>
                </dl>
              </div>

              <h4 className={adminStyles.adminMembersTitle}>{content.accountOwnerDetail.membersTitle}</h4>
              <AdminDataTable
                columns={[
                  {
                    id: 'email',
                    header: content.accountOwnerDetail.memberColumns.email,
                    render: (row) => row.email ?? '—',
                  },
                  {
                    id: 'name',
                    header: content.accountOwnerDetail.memberColumns.name,
                    render: (row) => row.displayName,
                  },
                  {
                    id: 'role',
                    header: content.accountOwnerDetail.memberColumns.role,
                    render: (row) => row.role,
                  },
                  {
                    id: 'membershipStatus',
                    header: content.accountOwnerDetail.memberColumns.membershipStatus,
                    render: (row) => row.membershipStatus,
                  },
                  {
                    id: 'joinedAt',
                    header: content.accountOwnerDetail.memberColumns.joinedAt,
                    render: (row) => formatAdminDate(row.joinedAt),
                  },
                  {
                    id: 'lastLoginAt',
                    header: content.accountOwnerDetail.memberColumns.lastLoginAt,
                    render: (row) => formatAdminDate(row.lastLoginAt),
                  },
                ]}
                rows={organization.members}
                rowKey={(row) => `${organization.id}:${row.userId}`}
                sortBy="email"
                sortDir="asc"
                onSort={() => undefined}
                page={1}
                totalPages={1}
                onPreviousPage={() => undefined}
                onNextPage={() => undefined}
                pageLabel=""
                previousLabel={content.pagination.previous}
                nextLabel={content.pagination.next}
                showPagination={false}
              />
            </article>
          ))
        )}
      </section>
    </>
  );
}
