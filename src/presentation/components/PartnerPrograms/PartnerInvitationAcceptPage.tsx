'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ProductsPublicShell } from '../Products/ProductsPublicShell';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import styles from './partnerProgram.module.css';

type Invitation = { programName: string; firstName: string; emailHint: string; expiresAt: string };

export function PartnerInvitationAcceptPage(): ReactElement {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const { user, loading: authLoading } = useSaaSProfile();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!token) { setError('This invitation link is invalid.'); setLoading(false); return; }
      try {
        const response = await fetch('/api/partner-invitations/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const json = await response.json() as { invitation?: Invitation };
        if (!response.ok || json.invitation == null) throw new Error('This invitation is invalid, expired, or already used.');
        if (!cancelled) setInvitation(json.invitation);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'Could not load invitation.');
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!authLoading && user != null) router.replace(nav.routes.dashboard);
  }, [authLoading, router, user]);

  if (!authLoading && user != null) return <div className={styles.loadingShell}><p>Loading…</p></div>;
  const returnTo = nav.routes.dashboard;
  return <ProductsPublicShell backHref={nav.routes.home} backLabel="Zenformed home"><div className={`${styles.page} ${styles.invitationPage}`}><div className={`${styles.card} ${styles.invitationCard}`}>
    {loading || authLoading ? <p>Loading invitation…</p> : null}
    {!loading && error && invitation == null ? <><h1>Invitation unavailable</h1><p className={styles.error}>{error}</p></> : null}
    {invitation != null ? <><h1 className={styles.invitationTitle}>Accept your {invitation.programName} invitation</h1><p>Hi {invitation.firstName || 'there'}. This invitation is for {invitation.emailHint}.</p><p>Sign in or create your Zenformed account using the email address that received this invitation.</p><div className={styles.authActions}><Link className={styles.submitLink} href={`${nav.routes.login}?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</Link><Link className={styles.secondaryLink} href={`${nav.routes.register}?returnTo=${encodeURIComponent(returnTo)}`}>Create account</Link></div></> : null}
  </div></div></ProductsPublicShell>;
}
