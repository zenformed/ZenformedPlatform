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
  parseAdminAccountOwnersResponse,
  type AdminAccountOwnerListItem,
} from '@/infrastructure/coreApi/adminTypes';
import { ProductOwnershipList } from '@/presentation/components/Admin/ProductOwnershipList';
import {
  formatAdminDate,
  formatAdminStatus,
} from '@/platform/content/platformAdminContent';
import adminStyles from './admin.module.css';

export function AdminUsersPageContent(): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const list = useAdminListQuery<AdminAccountOwnerListItem>({
    apiPath: nav.api.accountOwners,
    getAccessToken,
    defaultSortBy: 'email',
    parseResponse: parseAdminAccountOwnersResponse,
  });

  const page = list.result?.page ?? list.query.page;
  const totalPages = list.result?.totalPages ?? 0;

  return (
    <>
      <h2 className={adminStyles.adminPageTitle}>{content.accountOwners.title}</h2>
      <p className={adminStyles.adminPageSubtitle}>{content.accountOwners.subtitle}</p>
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
            id: 'email',
            header: content.accountOwners.columns.email,
            sortable: true,
            render: (row) => (
              <Link href={nav.routes.accountOwnerDetail(row.id)} className={adminStyles.adminLink}>
                {row.email}
              </Link>
            ),
          },
          {
            id: 'ownerName',
            header: content.accountOwners.columns.ownerName,
            sortable: true,
            render: (row) => row.ownerName,
          },
          {
            id: 'organizationsOwned',
            header: content.accountOwners.columns.organizationsOwned,
            sortable: true,
            render: (row) => String(row.organizationsOwned),
          },
          {
            id: 'productsOwned',
            header: content.accountOwners.columns.productsOwned,
            render: (row) => <ProductOwnershipList items={row.productsOwned} />,
          },
          {
            id: 'subscriptionStatus',
            header: content.accountOwners.columns.subscriptionStatus,
            sortable: true,
            render: (row) => formatAdminStatus(row.subscriptionStatus),
          },
          {
            id: 'lastLoginAt',
            header: content.accountOwners.columns.lastLoginAt,
            sortable: true,
            render: (row) => formatAdminDate(row.lastLoginAt),
          },
          {
            id: 'createdAt',
            header: content.accountOwners.columns.createdAt,
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
