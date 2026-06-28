'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { SupportRequestModal } from '@/presentation/components/Support/SupportRequestModal';
import { SupportRequestSuccessToast } from '@/presentation/components/Support/SupportRequestSuccessToast';
import styles from '../../../../app/docs/docs.module.css';

export function DocsSupportCta(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useSaaSProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const accessToken = session?.access_token?.trim() ?? '';
  const isAuthenticated = accessToken !== '';

  const handleContactSupport = (): void => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      const returnTo = pathname?.startsWith('/') ? pathname : nav.routes.docs;
      router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setModalOpen(true);
  };

  return (
    <>
      <section className={styles.docsCtaBar} aria-label="Documentation support">
        <p className={styles.docsCtaText}>
          Can&apos;t find what you&apos;re looking for? Contact support and we&apos;ll help.
        </p>
        <div className={styles.docsCtaActions}>
          <button
            type="button"
            className={styles.docsCtaButton}
            onClick={handleContactSupport}
            disabled={loading}
          >
            Contact Support
          </button>
        </div>
      </section>

      {isAuthenticated ? (
        <SupportRequestModal
          open={modalOpen}
          accessToken={accessToken}
          source="docs"
          onClose={() => setModalOpen(false)}
          onSuccess={() => setSuccessMessage('Support request sent.')}
        />
      ) : null}

      <SupportRequestSuccessToast
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />
    </>
  );
}
