'use client';
import type { ReactNode, ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from './requiredActions.module.css';

type PartnerAction = { id: string; type: 'partner_invitation'; programName: string; programDescription: string; firstName: string; expiresAt: string };

export function PlatformRequiredActionsGate({ children }: { children: ReactNode }): ReactElement {
  const pathname = usePathname();
  const { session, user, loading: authLoading } = useSaaSProfile();
  const [actions, setActions] = useState<PartnerAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accessToken = session?.access_token ?? null;
  const skip = pathname?.startsWith('/partner-invitations/accept') === true;

  const load = useCallback(async () => {
    if (!accessToken || !user || skip) { setActions([]); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch('/api/required-actions', { cache: 'no-store', headers: { Authorization: `Bearer ${accessToken}` } });
      const json = await response.json() as { actions?: PartnerAction[] };
      if (!response.ok || !Array.isArray(json.actions)) throw new Error('Could not load required account actions.');
      setActions(json.actions);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load required account actions.'); }
    finally { setLoading(false); }
  }, [accessToken, user, skip]);

  useEffect(() => { void load(); }, [load]);

  async function resolve(decision: 'accept' | 'decline'): Promise<void> {
    const action = actions[0]; if (!action || !accessToken) return;
    setResolving(decision); setError(null);
    try {
      const response = await fetch('/api/required-actions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ invitationId: action.id, decision }) });
      if (!response.ok) throw new Error(decision === 'accept' ? 'Could not accept this invitation.' : 'Could not decline this invitation.');
      setActions((current) => current.filter((item) => item.id !== action.id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not complete this action.'); }
    finally { setResolving(null); }
  }

  const action = actions[0];
  return <>{children}{!authLoading && !skip && (loading || action != null || error != null) ? <div className={styles.backdrop} role="presentation"><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="required-action-title">
    {loading && action == null ? <><p className={styles.eyebrow}>ZENFORMED</p><h1 id="required-action-title">Checking your account</h1><p>Loading required actions…</p></> : null}
    {action ? <><p className={styles.eyebrow}>ACTION REQUIRED</p><h1 id="required-action-title">Join {action.programName}</h1>{action.firstName ? <p>Hi {action.firstName},</p> : null}<p>{action.programDescription || `You have been invited to ${action.programName}.`}</p><p className={styles.detail}>Accept to activate the configured Partner benefits for your Zenformed organization. Declining permanently closes this invitation.</p>{error ? <p className={styles.error}>{error}</p> : null}<div className={styles.actions}><button className={styles.decline} disabled={resolving != null} onClick={() => void resolve('decline')}>{resolving === 'decline' ? 'Declining…' : 'Decline invitation'}</button><button className={styles.accept} disabled={resolving != null} onClick={() => void resolve('accept')}>{resolving === 'accept' ? 'Activating…' : 'Accept invitation'}</button></div></> : null}
    {!loading && action == null && error ? <><p className={styles.eyebrow}>ZENFORMED</p><h1 id="required-action-title">We couldn’t check your account</h1><p className={styles.error}>{error}</p><button className={styles.accept} onClick={() => void load()}>Try again</button></> : null}
  </section></div> : null}</>;
}
