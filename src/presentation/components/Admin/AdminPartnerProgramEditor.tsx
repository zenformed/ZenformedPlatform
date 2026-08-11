'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { parseAdminPartnerAppsResponse, parseAdminPartnerProgramDetailResponse, type AdminPartnerApp, type AdminPartnerBenefit } from '@/infrastructure/coreApi/partnerAdminTypes';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import { useAdminAccessToken } from './PlatformAdminGate';
import adminStyles from './admin.module.css';

type FieldDraft = { key: string; label: string; type: 'short_text' | 'long_text' | 'select' | 'boolean'; required: boolean; options: string };
const emptyField = (): FieldDraft => ({ key: '', label: '', type: 'short_text', required: false, options: '' });

export function AdminPartnerProgramEditor({ programId }: { programId: string | null }): ReactElement {
  const router = useRouter();
  const getAccessToken = useAdminAccessToken();
  const [apps, setApps] = useState<AdminPartnerApp[]>([]);
  const [benefits, setBenefits] = useState<AdminPartnerBenefit[]>([]);
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [values, setValues] = useState({ slug: '', internalName: '', publicName: '', publicDescription: '', status: 'draft', applicationsOpenAt: '', applicationsCloseAt: '', termsVersion: '1', applicationSchemaVersion: '1' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = getAccessToken();
      if (!token) return;
      try {
        const [appsResponse, programResponse] = await Promise.all([
          fetch(nav.api.partnerApps, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } }),
          programId == null ? Promise.resolve(null) : fetch(`${nav.api.partnerPrograms}/${encodeURIComponent(programId)}`, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const parsedApps = parseAdminPartnerAppsResponse(await appsResponse.json());
        if (!appsResponse.ok || parsedApps == null) throw new Error('Unable to load registered apps.');
        if (!cancelled) setApps(parsedApps);
        if (programResponse != null) {
          const detail = parseAdminPartnerProgramDetailResponse(await programResponse.json());
          if (!programResponse.ok || detail == null) throw new Error('Unable to load promotion.');
          if (!cancelled) {
            setValues({ slug: detail.slug, internalName: detail.internalName, publicName: detail.publicName, publicDescription: detail.publicDescription, status: detail.status, applicationsOpenAt: detail.applicationsOpenAt?.slice(0, 16) ?? '', applicationsCloseAt: detail.applicationsCloseAt?.slice(0, 16) ?? '', termsVersion: detail.termsVersion, applicationSchemaVersion: detail.applicationSchemaVersion });
            setBenefits(detail.benefits);
            setFields(detail.applicationSchemaJson.fields.map((raw) => {
              const field = raw as Record<string, unknown>;
              return { key: typeof field.key === 'string' ? field.key : '', label: typeof field.label === 'string' ? field.label : '', type: field.type === 'long_text' || field.type === 'select' || field.type === 'boolean' ? field.type : 'short_text', required: field.required === true, options: Array.isArray(field.options) ? field.options.filter((option): option is string => typeof option === 'string').join('\n') : '' };
            }));
          }
        }
      } catch (caught) { if (!cancelled) setError(caught instanceof Error ? caught.message : 'Unable to load promotion editor.'); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [getAccessToken, programId]);

  function toggleApp(appId: string): void {
    setBenefits((current) => current.some((benefit) => benefit.appId === appId) ? current.filter((benefit) => benefit.appId !== appId) : [...current, { appId, planSlug: 'growth', durationMonths: 6 }]);
  }

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault(); setSaving(true); setError(null);
    const token = getAccessToken();
    if (!token) { setError('Your admin session has expired.'); setSaving(false); return; }
    const applicationFields = fields.map((field) => ({ key: field.key.trim(), label: field.label.trim(), type: field.type, required: field.required, ...(field.type === 'select' ? { options: field.options.split('\n').map((value) => value.trim()).filter(Boolean) } : {}) }));
    const payload = { ...values, applicationsOpenAt: values.applicationsOpenAt || null, applicationsCloseAt: values.applicationsCloseAt || null, applicationSchemaJson: { fields: applicationFields }, benefits };
    try {
      const response = await fetch(programId == null ? nav.api.partnerPrograms : `${nav.api.partnerPrograms}/${encodeURIComponent(programId)}`, { method: programId == null ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const json = await response.json() as { programId?: string; message?: string };
      if (!response.ok || typeof json.programId !== 'string') throw new Error(json.message ?? 'Unable to save promotion.');
      router.replace(nav.routes.partnerPrograms); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save promotion.'); }
    finally { setSaving(false); }
  }

  if (loading) return <p>Loading promotion editor…</p>;
  return <form className={adminStyles.partnerForm} onSubmit={(event) => void submit(event)}>
    <div><Link className={adminStyles.adminBackLink} href={nav.routes.partnerPrograms}>Back to promotions</Link><div className={adminStyles.adminPageHeadingRow}><div><h2 className={adminStyles.adminPageTitle}>{programId == null ? 'New promotion' : 'Edit promotion'}</h2><p className={adminStyles.adminPageSubtitle}>New promotions start as drafts. Benefits are saved atomically.</p></div>{programId != null ? <Link className={adminStyles.adminButtonLink} href={nav.routes.partnerProgramApplications(programId)}>View applications</Link> : null}</div></div>
    {error ? <p className={adminStyles.adminError}>{error}</p> : null}
    <section className={adminStyles.partnerFormSection}><h3>Program</h3><div className={adminStyles.partnerFormGrid}>
      <label>Internal name<input required maxLength={200} value={values.internalName} onChange={(e) => setValues({ ...values, internalName: e.target.value })} /></label>
      <label>Public name<input required maxLength={200} value={values.publicName} onChange={(e) => setValues({ ...values, publicName: e.target.value })} /></label>
      <label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={values.slug} onChange={(e) => setValues({ ...values, slug: e.target.value })} /></label>
      <label>Status<select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value })}><option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option><option value="archived">Archived</option></select></label>
      <label>Terms version<input required value={values.termsVersion} onChange={(e) => setValues({ ...values, termsVersion: e.target.value })} /></label>
      <label>Form version<input required value={values.applicationSchemaVersion} onChange={(e) => setValues({ ...values, applicationSchemaVersion: e.target.value })} /></label>
      <label>Applications open<input type="datetime-local" value={values.applicationsOpenAt} onChange={(e) => setValues({ ...values, applicationsOpenAt: e.target.value })} /></label>
      <label>Applications close<input type="datetime-local" value={values.applicationsCloseAt} onChange={(e) => setValues({ ...values, applicationsCloseAt: e.target.value })} /></label>
      <label className={adminStyles.partnerFormWide}>Public description<textarea rows={4} value={values.publicDescription} onChange={(e) => setValues({ ...values, publicDescription: e.target.value })} /></label>
    </div></section>
    <section className={adminStyles.partnerFormSection}><h3>App benefits</h3><p>Select explicit active apps—future apps are never granted automatically.</p>{apps.map((app) => { const benefit = benefits.find((item) => item.appId === app.id); return <div className={adminStyles.partnerBenefitRow} key={app.id}><label><input type="checkbox" disabled={app.status !== 'active' && benefit == null} checked={benefit != null} onChange={() => toggleApp(app.id)} /> {app.displayName} <span className={adminStyles.adminMutedText}>({app.slug}, {app.status})</span></label>{benefit ? <><select value={benefit.planSlug} onChange={(e) => setBenefits((items) => items.map((item) => item.appId === app.id ? { ...item, planSlug: e.target.value as AdminPartnerBenefit['planSlug'] } : item))}><option value="starter">Starter</option><option value="growth">Growth</option><option value="pro">Pro</option></select><label>Months <input type="number" min={1} max={120} value={benefit.durationMonths} onChange={(e) => setBenefits((items) => items.map((item) => item.appId === app.id ? { ...item, durationMonths: Number(e.target.value) } : item))} /></label></> : null}</div>; })}</section>
    <section className={adminStyles.partnerFormSection}><div className={adminStyles.partnerSectionHeading}><h3>Application questions</h3><button className={adminStyles.adminButton} type="button" onClick={() => setFields((current) => [...current, emptyField()])}>Add question</button></div>{fields.map((field, index) => <div className={adminStyles.partnerQuestionRow} key={index}><input placeholder="field_key" value={field.key} onChange={(e) => setFields((items) => items.map((item, i) => i === index ? { ...item, key: e.target.value } : item))} /><input placeholder="Question label" value={field.label} onChange={(e) => setFields((items) => items.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} /><select value={field.type} onChange={(e) => setFields((items) => items.map((item, i) => i === index ? { ...item, type: e.target.value as FieldDraft['type'] } : item))}><option value="short_text">Short text</option><option value="long_text">Long text</option><option value="select">Select</option><option value="boolean">Yes/no</option></select><label><input type="checkbox" checked={field.required} onChange={(e) => setFields((items) => items.map((item, i) => i === index ? { ...item, required: e.target.checked } : item))} /> Required</label>{field.type === 'select' ? <textarea placeholder="One option per line" value={field.options} onChange={(e) => setFields((items) => items.map((item, i) => i === index ? { ...item, options: e.target.value } : item))} /> : null}<button type="button" className={adminStyles.adminButton} onClick={() => setFields((items) => items.filter((_, i) => i !== index))}>Remove</button></div>)}</section>
    <div><button className={adminStyles.adminButton} disabled={saving || benefits.length === 0} type="submit">{saving ? 'Saving…' : 'Save promotion'}</button></div>
  </form>;
}
