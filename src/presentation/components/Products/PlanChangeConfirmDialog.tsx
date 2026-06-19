'use client';

import { useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import type { PlanChangePreviewResponse } from '@/infrastructure/coreApi/subscriptionChangePlanPreviewClient';
import type { PlanChangeType } from '@/platform/cart/cartIntentTypes';
import {
  buildPlanChangeProrationNote,
  formatPlanChangeBillingDate,
  formatPlanChangeMoney,
  formatPlanChangeRenewalAmount,
  resolvePlanChangeConfirmLabel,
} from '@/platform/billing/planChangeFormatting';
import styles from '../../../../app/products/products.module.css';

export type PlanChangeConfirmDialogProps = {
  readonly open: boolean;
  readonly preview: PlanChangePreviewResponse | null;
  readonly changeType: PlanChangeType | null;
  readonly isConfirmLoading: boolean;
  readonly confirmError: string | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

function formatPlanPriceLine(plan: PlanChangePreviewResponse['currentPlan'], currency: string): string {
  return `${plan.displayLabel} — ${formatPlanChangeRenewalAmount(plan.amountCents, plan.billingCycle, currency)}`;
}

export function PlanChangeConfirmDialog({
  open,
  preview,
  changeType,
  isConfirmLoading,
  confirmError,
  onCancel,
  onConfirm,
}: PlanChangeConfirmDialogProps): ReactElement {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isConfirmLoading) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isConfirmLoading, onCancel, open]);

  if (!open || preview == null) return <></>;

  const dueToday =
    preview.estimatedAmountDueNow > 0
      ? formatPlanChangeMoney(preview.estimatedAmountDueNow, preview.currency)
      : preview.estimatedCreditIfAny > 0
        ? `${formatPlanChangeMoney(preview.estimatedCreditIfAny, preview.currency)} credit`
        : formatPlanChangeMoney(0, preview.currency);

  const content = (
    <div className={styles.planChangeDialogOverlay} role="presentation" onClick={isConfirmLoading ? undefined : onCancel}>
      <div
        className={styles.planChangeDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-change-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="plan-change-dialog-title" className={styles.planChangeDialogTitle}>
          Change {preview.productName} plan?
        </h2>

        <div className={styles.planChangeDialogSection}>
          <p className={styles.planChangeDialogLabel}>Current plan</p>
          <p className={styles.planChangeDialogValue}>{formatPlanPriceLine(preview.currentPlan, preview.currency)}</p>
        </div>

        <div className={styles.planChangeDialogSection}>
          <p className={styles.planChangeDialogLabel}>New plan</p>
          <p className={styles.planChangeDialogValue}>{formatPlanPriceLine(preview.newPlan, preview.currency)}</p>
        </div>

        <div className={styles.planChangeDialogSection}>
          <p className={styles.planChangeDialogLabel}>Estimated due today</p>
          <p className={styles.planChangeDialogAmount}>{dueToday}</p>
          <p className={styles.planChangeDialogHint}>{buildPlanChangeProrationNote(preview)}</p>
        </div>

        <div className={styles.planChangeDialogSection}>
          <p className={styles.planChangeDialogLabel}>Next renewal</p>
          <p className={styles.planChangeDialogValue}>
            {formatPlanChangeRenewalAmount(
              preview.nextRenewalAmount,
              preview.newPlan.billingCycle,
              preview.currency
            )}{' '}
            on {formatPlanChangeBillingDate(preview.nextBillingDate)}
          </p>
        </div>

        {confirmError != null ? (
          <p className={styles.planChangeDialogError} role="alert">
            {confirmError}
          </p>
        ) : null}

        <div className={styles.planChangeDialogActions}>
          <button
            type="button"
            className={styles.planChangeDialogCancelBtn}
            onClick={onCancel}
            disabled={isConfirmLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.planChangeDialogConfirmBtn}
            onClick={onConfirm}
            disabled={isConfirmLoading}
          >
            {isConfirmLoading ? 'Updating…' : resolvePlanChangeConfirmLabel(changeType)}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return <></>;
  return createPortal(content, document.body);
}
