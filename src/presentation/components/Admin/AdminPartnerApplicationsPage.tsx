'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { parseAdminPartnerApplicationsResponse, type AdminPartnerApplicationListItem } from '@/infrastructure/coreApi/partnerAdminTypes';
import { formatAdminDate, formatAdminStatus } from '@/platform/content/platformAdminContent';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import { useAdminAccessToken } from './PlatformAdminGate';
import adminStyles from './admin.module.css';

export function AdminPartnerApplicationsPage({ programId }: { programId: string }): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const [items, setItems] = useState<AdminPartnerApplicationListItem[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false; setLoading(true); setError(null);
    void (async () => {
      const token = getAccessToken(); if (!token) return;
      const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`;
      try {
        const response = await fetch(`${nav.api.partnerProgramApplications(programId)}${query}`, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } });
        const parsed = response.ok ? parseAdminPartnerApplicationsResponse(await response.json()) : null;
        if (!cancelled) parsed == null ? setError('Unable to load applications.') : setItems(parsed);
      } catch { if (!cancelled) setError('Unable to load applications.'); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [getAccessToken, programId, status]);
  return <>
    <Link className={adminStyles.adminBackLink} href={nav.routes.partnerProgramDetail(programId)}>Back to promotion</Link>
    <div className={adminStyles.adminPageHeadingRow}><div><h2 className={adminStyles.adminPageTitle}>Applications</h2><p className={adminStyles.adminPageSubtitle}>Review submissions for this promotion.</p></div><select className={adminStyles.adminFilterControl} value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="submitted">Submitted</option><option value="in_review">In review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="withdrawn">Withdrawn</option></select></div>
    {loading ? <p>Loading applications…</p> : null}{error ? <p className={adminStyles.adminError}>{error}</p> : null}
    {!loading && !error && items.length === 0 ? <p className={adminStyles.adminEmpty}>No applications found.</p> : null}
    {!loading && !error && items.length ? <div className={adminStyles.adminTableWrap}><table className={adminStyles.adminTable}><thead><tr><th>Applicant</th><th>Email</th><th>Company</th><th>Status</th><th>Submitted</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><Link className={adminStyles.adminLink} href={nav.routes.partnerApplicationDetail(item.id)}>{item.firstName} {item.lastName}</Link></td><td>{item.email}</td><td>{item.companyName ?? '—'}</td><td>{formatAdminStatus(item.status)}</td><td>{formatAdminDate(item.createdAt)}</td></tr>)}</tbody></table></div> : null}
  </>;
}
