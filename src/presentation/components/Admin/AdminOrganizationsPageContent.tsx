'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import {
  AdminDataTable,
  AdminFilterBar,
  AdminSearchInput,
  AdminSelectFilter,
} from '@/presentation/components/Admin/AdminDataTable';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import { useAdminListQuery } from '@/presentation/hooks/useAdminListQuery';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import {
  parseAdminOrganizationsResponse,
  type AdminOrganizationListItem,
} from '@/infrastructure/coreApi/adminTypes';
import { ProductOwnershipList } from '@/presentation/components/Admin/ProductOwnershipList';
import {
  formatAdminDate,
  formatAdminStatus,
  formatAdminStorageBytes,
} from '@/platform/content/platformAdminContent';
import adminStyles from './admin.module.css';

export function AdminOrganizationsPageContent(): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const list = useAdminListQuery<AdminOrganizationListItem>({
    apiPath: nav.api.organizations,
    getAccessToken,
    defaultSortBy: 'subscriptionStatus',
    parseResponse: parseAdminOrganizationsResponse,
  });

  const page = list.result?.page ?? list.query.page;
  const totalPages = list.result?.totalPages ?? 0;

  return (
    <>
      <h2 className={adminStyles.adminPageTitle}>{content.organizations.title}</h2>
      <AdminFilterBar>
        <AdminSearchInput
          value={list.searchInput}
          placeholder={content.filters.searchPlaceholder}
          onChange={list.setSearchInput}
        />
        <AdminSelectFilter
          value={list.query.product}
          options={content.products}
          onChange={list.setProduct}
        />
        <AdminSelectFilter
          value={list.query.status}
          options={content.subscriptionStatuses}
          onChange={list.setStatus}
        />
      </AdminFilterBar>
      <AdminDataTable
        columns={[
          {
            id: 'name',
            header: content.organizations.columns.name,
            sortable: true,
            render: (row) => (
              <Link href={nav.routes.organizationDetail(row.id)} className={adminStyles.adminLink}>
                {row.name}
              </Link>
            ),
          },
          {
            id: 'ownerEmail',
            header: content.organizations.columns.ownerEmail,
            sortable: true,
            render: (row) => row.ownerEmail ?? '—',
          },
          {
            id: 'memberCount',
            header: content.organizations.columns.memberCount,
            sortable: true,
            render: (row) => String(row.memberCount),
          },
          {
            id: 'products',
            header: content.organizations.columns.products,
            render: (row) => <ProductOwnershipList items={row.products} />,
          },
          {
            id: 'subscriptionStatus',
            header: content.organizations.columns.subscriptionStatus,
            sortable: true,
            render: (row) => formatAdminStatus(row.subscriptionStatus),
          },
          {
            id: 'storageUsedBytes',
            header: content.organizations.columns.storageUsed,
            sortable: true,
            render: (row) => formatAdminStorageBytes(row.storageUsedBytes ?? 0),
          },
          {
            id: 'createdAt',
            header: content.organizations.columns.createdAt,
            sortable: true,
            render: (row) => formatAdminDate(row.createdAt),
          },
        ]}
        rows={list.result?.items ?? []}
        rowKey={(row) => row.id}
        sortBy={list.query.sortBy}
        sortDir={list.query.sortDir}
        onSort={list.toggleSort}
        isLoading={list.isLoading}
        emptyMessage={content.empty}
        errorMessage={list.errorMessage}
        page={page}
        totalPages={totalPages}
        onPreviousPage={list.goToPreviousPage}
        onNextPage={list.goToNextPage}
        pageLabel={content.pagination.pageLabel(page, totalPages)}
        previousLabel={content.pagination.previous}
        nextLabel={content.pagination.next}
      />
    </>
  );
}
