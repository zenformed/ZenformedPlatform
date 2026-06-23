'use client';

import type { ReactElement } from 'react';
import {
  AdminDataTable,
  AdminFilterBar,
  AdminSelectFilter,
} from '@/presentation/components/Admin/AdminDataTable';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import { useAdminListQuery } from '@/presentation/hooks/useAdminListQuery';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import {
  parseAdminSubscriptionsResponse,
  type AdminSubscriptionListItem,
} from '@/infrastructure/coreApi/adminTypes';
import { ProductOwnershipList } from '@/presentation/components/Admin/ProductOwnershipList';
import { mapSubscriptionStatusToEntitlementStatus } from '@/presentation/components/Admin/productOwnershipDisplay';
import { formatAdminDate, formatAdminStatus } from '@/platform/content/platformAdminContent';
import adminStyles from './admin.module.css';

export function AdminSubscriptionsPageContent(): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const list = useAdminListQuery<AdminSubscriptionListItem>({
    apiPath: nav.api.subscriptions,
    getAccessToken,
    defaultSortBy: 'organizationName',
    parseResponse: parseAdminSubscriptionsResponse,
    debouncedSearch: false,
  });

  const page = list.result?.page ?? list.query.page;
  const totalPages = list.result?.totalPages ?? 0;

  return (
    <>
      <h2 className={adminStyles.adminPageTitle}>{content.subscriptions.title}</h2>
      <AdminFilterBar>
        <AdminSelectFilter
          value={list.query.product}
          options={content.products}
          onChange={list.setProduct}
        />
        <AdminSelectFilter
          value={list.query.plan}
          options={content.plans}
          onChange={list.setPlan}
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
            id: 'organizationName',
            header: content.subscriptions.columns.organizationName,
            sortable: true,
            render: (row) => row.organizationName,
          },
          {
            id: 'products',
            header: content.subscriptions.columns.products,
            render: (row) => (
              <ProductOwnershipList
                items={[
                  {
                    productSlug: row.productSlug,
                    planSlug: row.planSlug,
                    entitlementStatus: mapSubscriptionStatusToEntitlementStatus(row.status),
                  },
                ]}
              />
            ),
          },
          {
            id: 'status',
            header: content.subscriptions.columns.status,
            sortable: true,
            render: (row) => formatAdminStatus(row.status),
          },
          {
            id: 'billingCycle',
            header: content.subscriptions.columns.billingCycle,
            sortable: true,
            render: (row) => row.billingCycle,
          },
          {
            id: 'trialEnd',
            header: content.subscriptions.columns.trialEnd,
            sortable: true,
            render: (row) => formatAdminDate(row.trialEnd),
          },
          {
            id: 'renewalDate',
            header: content.subscriptions.columns.renewalDate,
            sortable: true,
            render: (row) => formatAdminDate(row.renewalDate),
          },
          {
            id: 'cancelAtPeriodEnd',
            header: content.subscriptions.columns.cancelAtPeriodEnd,
            render: (row) => (row.cancelAtPeriodEnd ? 'Yes' : 'No'),
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
