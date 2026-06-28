'use client';

import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import {
  SUPPORT_REQUEST_MESSAGE_MAX_LENGTH,
  SUPPORT_REQUEST_PRODUCT_OPTIONS,
  SUPPORT_REQUEST_SUBJECT_MAX_LENGTH,
  type SupportRequestSource,
} from '@/platform/support/supportRequestTypes';
import styles from './SupportRequestModal.module.css';

export type SupportRequestModalProps = {
  readonly open: boolean;
  readonly accessToken: string;
  readonly source?: SupportRequestSource;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
};

type FieldErrors = {
  readonly subject?: string;
  readonly message?: string;
  readonly product?: string;
};

export function SupportRequestModal({
  open,
  accessToken,
  source = 'docs',
  onClose,
  onSuccess,
}: SupportRequestModalProps): ReactElement {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [product, setProduct] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubject('');
    setMessage('');
    setProduct('');
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isSubmitting, onClose, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/requests', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          subject,
          message,
          product: product === '' ? null : product,
          source,
        }),
      });

      let payload: {
        error?: string;
        message?: string;
        fieldErrors?: FieldErrors;
      } = {};

      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        if (payload.fieldErrors != null) {
          setFieldErrors(payload.fieldErrors);
        }

        setFormError(
          payload.message ??
            (response.status === 401
              ? 'Sign in to contact support.'
              : 'We could not send your support request. Please try again.'),
        );
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setFormError('We could not send your support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return <></>;
  }

  const content = (
    <div
      className={styles.supportRequestModalOverlay}
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className={styles.supportRequestModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-request-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="support-request-modal-title" className={styles.supportRequestModalTitle}>
          Contact support
        </h2>
        <p className={styles.supportRequestModalIntro}>
          Tell us what you were looking for and we&apos;ll follow up as soon as we can.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className={styles.supportRequestField}>
            <label className={styles.supportRequestLabel} htmlFor="support-request-subject">
              Subject
            </label>
            <input
              id="support-request-subject"
              className={styles.supportRequestInput}
              type="text"
              value={subject}
              maxLength={SUPPORT_REQUEST_SUBJECT_MAX_LENGTH}
              onChange={(event) => setSubject(event.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.subject != null ? (
              <p className={styles.supportRequestFieldError} role="alert">
                {fieldErrors.subject}
              </p>
            ) : null}
          </div>

          <div className={styles.supportRequestField}>
            <label className={styles.supportRequestLabel} htmlFor="support-request-product">
              Related product <span className={styles.supportRequestOptional}>(optional)</span>
            </label>
            <select
              id="support-request-product"
              className={styles.supportRequestSelect}
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select a product</option>
              {SUPPORT_REQUEST_PRODUCT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.product != null ? (
              <p className={styles.supportRequestFieldError} role="alert">
                {fieldErrors.product}
              </p>
            ) : null}
          </div>

          <div className={styles.supportRequestField}>
            <label className={styles.supportRequestLabel} htmlFor="support-request-message">
              Message
            </label>
            <textarea
              id="support-request-message"
              className={styles.supportRequestTextarea}
              value={message}
              maxLength={SUPPORT_REQUEST_MESSAGE_MAX_LENGTH}
              onChange={(event) => setMessage(event.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.message != null ? (
              <p className={styles.supportRequestFieldError} role="alert">
                {fieldErrors.message}
              </p>
            ) : null}
          </div>

          {formError != null ? (
            <p className={styles.supportRequestFormError} role="alert">
              {formError}
            </p>
          ) : null}

          <div className={styles.supportRequestModalActions}>
            <button
              type="button"
              className={styles.supportRequestCancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.supportRequestSubmitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return <></>;
  }

  return createPortal(content, document.body);
}
