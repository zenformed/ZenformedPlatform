'use client';

import Link from 'next/link';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import { parsePublicPartnerProgramResponse, type PublicPartnerProgram } from '@/infrastructure/coreApi/publicPartnerProgramTypes';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import styles from './partnerProgram.module.css';

export function PublicPartnerProgramPage({ slug }: { slug: string }): ReactElement {
  const [program, setProgram] = useState<PublicPartnerProgram | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [identity, setIdentity] = useState({ email: '', firstName: '', lastName: '', companyName: '' });
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/partner-programs/${encodeURIComponent(slug)}`, { cache: 'no-store' });
        const parsed = response.ok ? parsePublicPartnerProgramResponse(await response.json()) : null;
        if (!cancelled) {
          if (parsed == null) setError('This program is not currently accepting applications.');
          else setProgram(parsed);
        }
      } catch { if (!cancelled) setError('This program could not be loaded.'); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (program == null || !consented) return;
    setSubmitting(true); setError(null);
    try {
      const response = await fetch(`/api/partner-programs/${encodeURIComponent(program.slug)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...identity, companyName: identity.companyName || null, answers, consentedTermsVersion: program.termsVersion }),
      });
      const json = await response.json() as { message?: string };
      if (!response.ok) throw new Error(json.message ?? 'Your application could not be submitted.');
      setAccepted(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Your application could not be submitted.'); }
    finally { setSubmitting(false); }
  }

  return <ProductsPublicShell backHref={nav.routes.home} backLabel="Zenformed home"><div className={styles.page}>
    {loading ? <p>Loading program…</p> : null}
    {!loading && program == null ? <div className={styles.card}><h1>Applications unavailable</h1><p>{error}</p></div> : null}
    {program != null && accepted ? <div className={styles.card}><h1>Application received</h1><p>Thank you. If your application is approved, we’ll email you with the next steps. You do not need an account to apply.</p></div> : null}
    {program != null && !accepted ? <><header className={styles.hero}><p className={styles.eyebrow}>Zenformed Partner Program</p><h1>{program.publicName}</h1><p>{program.publicDescription}</p><p className={styles.accountNote}>No Zenformed account is required to apply.</p></header>
      <form className={styles.card} onSubmit={(event) => void submit(event)}>
        <section><h2>Your details</h2><div className={styles.grid}>
          <label>First name *<input required maxLength={200} autoComplete="given-name" value={identity.firstName} onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })} /></label>
          <label>Last name *<input required maxLength={200} autoComplete="family-name" value={identity.lastName} onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })} /></label>
          <label>Email *<input required type="email" maxLength={320} autoComplete="email" value={identity.email} onChange={(e) => setIdentity({ ...identity, email: e.target.value })} /></label>
          <label>Company<input maxLength={300} autoComplete="organization" value={identity.companyName} onChange={(e) => setIdentity({ ...identity, companyName: e.target.value })} /></label>
        </div></section>
        {program.fields.length > 0 ? <section><h2>Application</h2><div className={styles.questions}>{program.fields.map((field) => <label key={field.key}>{field.label}{field.required ? ' *' : ''}
          {field.type === 'long_text' ? <textarea required={field.required} maxLength={10000} rows={5} value={typeof answers[field.key] === 'string' ? answers[field.key] as string : ''} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} /> : null}
          {field.type === 'short_text' ? <input required={field.required} maxLength={500} value={typeof answers[field.key] === 'string' ? answers[field.key] as string : ''} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })} /> : null}
          {field.type === 'select' ? <select required={field.required} value={typeof answers[field.key] === 'string' ? answers[field.key] as string : ''} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })}><option value="">Select one</option>{field.options?.map((option) => <option value={option} key={option}>{option}</option>)}</select> : null}
          {field.type === 'boolean' ? <select required={field.required} value={typeof answers[field.key] === 'boolean' ? String(answers[field.key]) : ''} onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value === '' ? undefined : e.target.value === 'true' })}><option value="">Select one</option><option value="true">Yes</option><option value="false">No</option></select> : null}
        </label>)}</div></section> : null}
        <label className={styles.consent}><input type="checkbox" required checked={consented} onChange={(e) => setConsented(e.target.checked)} /><span>I agree to this program’s terms (version {program.termsVersion}) and acknowledge the Zenformed <Link href={nav.routes.legalTerms}>Terms</Link> and <Link href={nav.routes.legalPrivacy}>Privacy Policy</Link>. *</span></label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.submit} disabled={submitting || !consented} type="submit">{submitting ? 'Submitting…' : 'Submit application'}</button>
      </form></> : null}
  </div></ProductsPublicShell>;
}
