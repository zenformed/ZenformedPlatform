'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanChangeType } from '@/platform/cart/cartIntentTypes';
import type { BillingPeriod } from '@/platform/products/productPricingCatalog';
import type { PlanChangePreviewResponse } from '@/infrastructure/coreApi/subscriptionChangePlanPreviewClient';
import {
  canContinuePlanChange,
  formatPlanDowngradeBlockedMessage,
} from '@/platform/products/productPlanOwnership';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { platformDashboardNavigation } from '@/platform/navigation/platformDashboardNavigation';

export type PendingPlanChangeRequest = {
  readonly productSlug: string;
  readonly planSlug: string;
  readonly billingCycle: BillingPeriod;
  readonly changeType: PlanChangeType;
  readonly targetPlanName: string;
};

function readApiErrorMessage(body: unknown, fallback: string): string {
  if (body != null && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim() !== '') {
      return record.message;
    }
  }
  return fallback;
}

async function readAccessToken(sessionToken: string | null | undefined): Promise<string> {
  const trimmed = sessionToken?.trim() ?? '';
  if (trimmed !== '') return trimmed;
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();
  return session?.access_token?.trim() ?? '';
}

export function useSubscriptionPlanChange(input: {
  readonly accessToken: string | null | undefined;
}): {
  readonly preview: PlanChangePreviewResponse | null;
  readonly pendingRequest: PendingPlanChangeRequest | null;
  readonly isPreviewLoading: boolean;
  readonly isConfirmLoading: boolean;
  readonly previewError: string | null;
  readonly confirmError: string | null;
  readonly isModalOpen: boolean;
  readonly requestPreview: (request: {
    readonly productSlug: string;
    readonly planSlug: string;
    readonly billingCycle: BillingPeriod;
    readonly changeType: PlanChangeType;
    readonly targetPlanName: string;
    readonly targetSeatsIncluded?: number | null;
    readonly activeMemberCount?: number | null;
  }) => Promise<{ readonly blockedMessage: string | null }>;
  readonly confirmPlanChange: () => Promise<{ readonly successMessage: string | null; readonly errorMessage: string | null }>;
  readonly cancelPlanChange: () => void;
} {
  const router = useRouter();
  const [preview, setPreview] = useState<PlanChangePreviewResponse | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingPlanChangeRequest | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cancelPlanChange = useCallback(() => {
    setIsModalOpen(false);
    setPreview(null);
    setPendingRequest(null);
    setPreviewError(null);
    setConfirmError(null);
    setIsPreviewLoading(false);
    setIsConfirmLoading(false);
  }, []);

  const requestPreview = useCallback(
    async (request: {
      readonly productSlug: string;
      readonly planSlug: string;
      readonly billingCycle: BillingPeriod;
      readonly changeType: PlanChangeType;
      readonly targetPlanName: string;
      readonly targetSeatsIncluded?: number | null;
      readonly activeMemberCount?: number | null;
    }) => {
      if (
        request.changeType === 'downgrade' &&
        request.targetSeatsIncluded != null &&
        request.activeMemberCount != null &&
        !canContinuePlanChange({
          changeType: request.changeType,
          targetSeatsIncluded: request.targetSeatsIncluded,
          activeMemberCount: request.activeMemberCount,
        })
      ) {
        return {
          blockedMessage: formatPlanDowngradeBlockedMessage({
            planName: request.targetPlanName,
            targetSeats: request.targetSeatsIncluded,
            activeMemberCount: request.activeMemberCount,
          }),
        };
      }

      cancelPlanChange();
      setIsPreviewLoading(true);

      const token = await readAccessToken(input.accessToken);
      if (token === '') {
        setIsPreviewLoading(false);
        router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(window.location.pathname)}`);
        return { blockedMessage: null };
      }

      try {
        const response = await fetch(platformDashboardNavigation.apis.previewAppSubscriptionPlanChange, {
          method: 'POST',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productSlug: request.productSlug,
            planSlug: request.planSlug,
            billingCycle: request.billingCycle,
          }),
        });

        let json: unknown = null;
        try {
          json = await response.json();
        } catch {
          json = null;
        }

        if (response.status === 401) {
          setIsPreviewLoading(false);
          router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(window.location.pathname)}`);
          return { blockedMessage: null };
        }

        if (!response.ok) {
          setPreviewError(readApiErrorMessage(json, 'Could not load plan change preview.'));
          setIsPreviewLoading(false);
          return {
            blockedMessage: readApiErrorMessage(json, 'Could not load plan change preview.'),
          };
        }

        const record = json as PlanChangePreviewResponse;
        setPreview(record);
        setPendingRequest({
          productSlug: request.productSlug,
          planSlug: request.planSlug,
          billingCycle: request.billingCycle,
          changeType: request.changeType,
          targetPlanName: request.targetPlanName,
        });
        setIsModalOpen(true);
        setIsPreviewLoading(false);
        return { blockedMessage: null };
      } catch {
        const message = 'Could not reach billing service. Please try again.';
        setPreviewError(message);
        setIsPreviewLoading(false);
        return { blockedMessage: message };
      }
    },
    [cancelPlanChange, input.accessToken, router]
  );

  const confirmPlanChange = useCallback(async () => {
    if (pendingRequest == null) {
      return { successMessage: null, errorMessage: 'No pending plan change.' };
    }

    setConfirmError(null);
    setIsConfirmLoading(true);

    const token = await readAccessToken(input.accessToken);
    if (token === '') {
      setIsConfirmLoading(false);
      router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return { successMessage: null, errorMessage: null };
    }

    try {
      const response = await fetch(platformDashboardNavigation.apis.changeAppSubscriptionPlan, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSlug: pendingRequest.productSlug,
          planSlug: pendingRequest.planSlug,
          billingCycle: pendingRequest.billingCycle,
        }),
      });

      let json: unknown = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (response.status === 401) {
        setIsConfirmLoading(false);
        router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(window.location.pathname)}`);
        return { successMessage: null, errorMessage: null };
      }

      if (!response.ok) {
        const message = readApiErrorMessage(json, 'Could not change subscription plan. Please try again.');
        setConfirmError(message);
        setIsConfirmLoading(false);
        return { successMessage: null, errorMessage: message };
      }

      const successMessage = `Your subscription is now on ${pendingRequest.targetPlanName}.`;
      cancelPlanChange();
      return { successMessage, errorMessage: null };
    } catch {
      const message = 'Could not reach billing service. Please try again.';
      setConfirmError(message);
      setIsConfirmLoading(false);
      return { successMessage: null, errorMessage: message };
    }
  }, [cancelPlanChange, input.accessToken, pendingRequest, router]);

  return {
    preview,
    pendingRequest,
    isPreviewLoading,
    isConfirmLoading,
    previewError,
    confirmError,
    isModalOpen,
    requestPreview,
    confirmPlanChange,
    cancelPlanChange,
  };
}
