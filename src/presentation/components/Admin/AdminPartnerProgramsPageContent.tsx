'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminAccessToken } from './PlatformAdminGate';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import { formatAdminDate, formatAdminStatus } from '@/platform/content/platformAdminContent';
import { parseAdminPartnerProgramsResponse, type AdminPartnerProgramListItem } from '@/infrastructure/coreApi/partnerAdminTypes';
import adminStyles from './admin.module.css';

export function AdminPartnerProgramsPageContent(): ReactElement {
  const getAccessToken = useAdminAccessToken();
  const [programs, setPrograms] = useState<AdminPartnerProgramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = getAccessToken();
      if (!token) return;
      try {
        const response = await fetch(nav.api.partnerPrograms, { cache: 'no-store', headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
        const json: unknown = await response.json();
        const parsed = response.ok ? parseAdminPartnerProgramsResponse(json) : null;
        if (!cancelled) {
          if (parsed == null) setError('Unable to load promotions.');
          else setPrograms(parsed);
        }
      } catch {
        if (!cancelled) setError('Unable to load promotions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  return (
    <>
      <div className={adminStyles.adminPageHeadingRow}><div>
        <h2 className={adminStyles.adminPageTitle}>Promotions</h2>
        <p className={adminStyles.adminPageSubtitle}>Reusable application programs and time-limited app benefits.</p>
      </div><Link className={adminStyles.adminButtonLink} href={nav.routes.partnerProgramNew}>New promotion</Link></div>
      {loading ? <p>Loading promotions…</p> : null}
      {error ? <p className={adminStyles.adminError}>{error}</p> : null}
      {!loading && !error && programs.length === 0 ? <p className={adminStyles.adminEmpty}>No promotions have been configured.</p> : null}
      {!loading && !error && programs.length > 0 ? (
        <div className={adminStyles.adminTableWrap}>
          <table className={adminStyles.adminTable}>
            <thead><tr><th>Internal name</th><th>Public name</th><th>Status</th><th>Applications</th><th>Terms</th><th>Updated</th></tr></thead>
            <tbody>{programs.map((program) => (
              <tr key={program.id}>
                <td><Link className={adminStyles.adminLink} href={nav.routes.partnerProgramDetail(program.id)}>{program.internalName}</Link><div className={adminStyles.adminMutedText}>/{program.slug}</div></td>
                <td>{program.publicName}</td>
                <td>{formatAdminStatus(program.status)}</td>
                <td>{program.applicationsOpenAt == null && program.applicationsCloseAt == null ? 'No scheduled window' : `${formatAdminDate(program.applicationsOpenAt)} – ${formatAdminDate(program.applicationsCloseAt)}`}</td>
                <td>{program.termsVersion}</td>
                <td>{formatAdminDate(program.updatedAt)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
