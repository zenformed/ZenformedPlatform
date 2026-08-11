'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { parseAdminPartnerApplicationDetailResponse, type AdminPartnerApplicationDetail } from '@/infrastructure/coreApi/partnerAdminTypes';
import { formatAdminDate, formatAdminStatus } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import { useAdminAccessToken, usePlatformAdminGate } from './PlatformAdminGate';
import adminStyles from './admin.module.css';

function answerText(value: unknown): string { if (value === true) return 'Yes'; if (value === false) return 'No'; return typeof value === 'string' && value ? value : '—'; }

export function AdminPartnerApplicationDetailPage({ applicationId }: { applicationId: string }): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const gate = usePlatformAdminGate();
  const [application, setApplication] = useState<AdminPartnerApplicationDetail | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { let cancelled = false; void (async () => { const token = getAccessToken(); if (!token) return; try { const response = await fetch(nav.api.partnerApplicationDetail(applicationId), { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } }); const parsed = response.ok ? parseAdminPartnerApplicationDetailResponse(await response.json()) : null; if (!cancelled) { if (parsed == null) setError('Unable to load application.'); else { setApplication(parsed); setNotes(parsed.reviewNotes ?? ''); } } } catch { if (!cancelled) setError('Unable to load application.'); } finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, [applicationId, getAccessToken]);
  const canManage = gate.status === 'allowed' && (gate.role === 'platform_admin' || gate.role === 'platform_owner');
  const reviewable = application?.status === 'submitted' || application?.status === 'in_review';
  async function review(decision: 'in_review' | 'approved' | 'rejected'): Promise<void> {
    const token = getAccessToken(); if (!token) return; setSaving(true); setError(null); setNotice(null);
    try { const response = await fetch(nav.api.partnerApplicationReview(applicationId), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ decision, reviewNotes: notes }) }); const json = await response.json() as { message?: string; invitation?: { emailDeliveryStatus?: string } }; if (!response.ok) throw new Error(json.message ?? 'Unable to save review.'); setApplication((current) => current == null ? current : { ...current, status: decision, reviewNotes: notes || null, reviewedAt: decision === 'in_review' ? null : new Date().toISOString() }); if (decision === 'approved') setNotice(json.invitation?.emailDeliveryStatus === 'sent' ? 'Approved and invitation email sent.' : 'Approved and invitation created, but email delivery failed. A resend action will be added before launch.'); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save review.'); } finally { setSaving(false); }
  }
  if (loading) return <p>Loading application…</p>;
  if (application == null) return <p className={adminStyles.adminError}>{error ?? 'Application not found.'}</p>;
  return <>
    <Link className={adminStyles.adminBackLink} href={nav.routes.partnerProgramApplications(application.programId)}>Back to applications</Link>
    <div className={adminStyles.adminPageHeadingRow}><div><h2 className={adminStyles.adminPageTitle}>{application.firstName} {application.lastName}</h2><p className={adminStyles.adminPageSubtitle}>{application.email} · {formatAdminStatus(application.status)}</p></div></div>
    {error ? <p className={adminStyles.adminError}>{error}</p> : null}
    {notice ? <p>{notice}</p> : null}
    <section className={adminStyles.adminDetailSection}><h3 className={adminStyles.adminSectionTitle}>Applicant</h3><dl className={adminStyles.adminSummaryGrid}><div><dt>Email</dt><dd>{application.email}</dd></div><div><dt>Company</dt><dd>{application.companyName ?? '—'}</dd></div><div><dt>Submitted</dt><dd>{formatAdminDate(application.createdAt)}</dd></div><div><dt>Terms accepted</dt><dd>{application.consentedTermsVersion}</dd></div></dl></section>
    <section className={adminStyles.adminDetailSection}><h3 className={adminStyles.adminSectionTitle}>Answers</h3><dl className={adminStyles.partnerAnswerList}>{application.applicationSchema.fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{answerText(application.answers[field.key])}</dd></div>)}</dl></section>
    <section className={adminStyles.adminDetailSection}><h3 className={adminStyles.adminSectionTitle}>Review</h3><label className={adminStyles.partnerReviewNotes}>Internal notes<textarea rows={5} maxLength={5000} disabled={!canManage || !reviewable} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {canManage && reviewable ? <div className={adminStyles.partnerReviewActions}><button className={adminStyles.adminButton} disabled={saving} onClick={() => void review('in_review')}>Mark in review</button><button className={adminStyles.adminButton} disabled={saving} onClick={() => void review('rejected')}>Reject</button><button className={adminStyles.adminButton} disabled={saving} onClick={() => void review('approved')}>Approve</button></div> : <p className={adminStyles.adminMutedText}>{canManage ? 'This application is no longer reviewable.' : 'Your staff role is read-only.'}</p>}
    </section>
  </>;
}
