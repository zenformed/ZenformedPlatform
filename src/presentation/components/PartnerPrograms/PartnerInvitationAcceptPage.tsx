'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ProductsPublicShell } from '../Products/ProductsPublicShell';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import styles from './partnerProgram.module.css';

type Invitation = { programName: string; firstName: string; emailHint: string; expiresAt: string };
export function PartnerInvitationAcceptPage(): ReactElement {
  const params = useSearchParams(); const token = params.get('token') ?? '';
  const { session, user, loading: authLoading } = useSaaSProfile();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true); const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null); const [accepted, setAccepted] = useState(false);
  useEffect(() => { let cancelled = false; void (async () => { if (!token) { setError('This invitation link is invalid.'); setLoading(false); return; } try { const response = await fetch('/api/partner-invitations/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); const json = await response.json() as { invitation?: Invitation }; if (!response.ok || json.invitation == null) throw new Error('This invitation is invalid, expired, or already used.'); if (!cancelled) setInvitation(json.invitation); } catch (caught) { if (!cancelled) setError(caught instanceof Error ? caught.message : 'Could not load invitation.'); } finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, [token]);
  async function claim(): Promise<void> {
    const accessToken = session?.access_token; if (!accessToken) return; setClaiming(true); setError(null);
    try {
      await fetch('/api/internal/users-me-ensure-default-organization', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
      const response = await fetch('/api/partner-invitations/claim', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ token }) });
      const json = await response.json() as { message?: string }; if (!response.ok) throw new Error(json.message ?? 'Could not accept invitation.'); setAccepted(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not accept invitation.'); } finally { setClaiming(false); }
  }
  const returnTo = `/partner-invitations/accept?token=${encodeURIComponent(token)}`;
  return <ProductsPublicShell backHref={nav.routes.home} backLabel="Zenformed home"><div className={styles.page}><div className={styles.card}>
    {loading || authLoading ? <p>Loading invitation…</p> : null}
    {!loading && error && invitation == null ? <><h1>Invitation unavailable</h1><p className={styles.error}>{error}</p></> : null}
    {invitation != null && accepted ? <><h1>Welcome to {invitation.programName}</h1><p>Your Partner access is active. Existing paid access was left unchanged.</p><Link className={styles.submitLink} href={nav.routes.dashboard}>Continue to dashboard</Link></> : null}
    {invitation != null && !accepted ? <><h1>Accept your {invitation.programName} invitation</h1><p>Hi {invitation.firstName || 'there'}. This invitation is for {invitation.emailHint}.</p>{user == null ? <><p>Sign in or create your Zenformed account using the email address that received this invitation.</p><div className={styles.authActions}><Link className={styles.submitLink} href={`${nav.routes.login}?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</Link><Link className={styles.secondaryLink} href={`${nav.routes.register}?returnTo=${encodeURIComponent(returnTo)}`}>Create account</Link></div></> : <><p>Signed in as {user.email}. Your verified email must match the invitation.</p>{error ? <p className={styles.error}>{error}</p> : null}<button className={styles.submit} disabled={claiming} onClick={() => void claim()}>{claiming ? 'Activating…' : 'Accept invitation'}</button></>}</> : null}
  </div></div></ProductsPublicShell>;
}
