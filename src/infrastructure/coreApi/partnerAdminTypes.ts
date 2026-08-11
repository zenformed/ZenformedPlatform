export type AdminPartnerProgramListItem = {
  id: string;
  slug: string;
  internalName: string;
  publicName: string;
  status: string;
  applicationsOpenAt: string | null;
  applicationsCloseAt: string | null;
  termsVersion: string;
  applicationSchemaVersion: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPartnerApp = {
  id: string;
  slug: string;
  displayName: string;
  status: string;
};

export type AdminPartnerBenefit = {
  appId: string;
  planSlug: 'starter' | 'growth' | 'pro';
  durationMonths: number;
};

export type AdminPartnerProgramDetail = AdminPartnerProgramListItem & {
  publicDescription: string;
  applicationSchemaJson: { fields: unknown[] };
  benefits: AdminPartnerBenefit[];
};

export type AdminPartnerApplicationListItem = {
  id: string; programId: string; email: string; firstName: string; lastName: string;
  companyName: string | null; status: string; reviewedBy: string | null; reviewedAt: string | null;
  createdAt: string; updatedAt: string;
};

export type AdminPartnerApplicationDetail = AdminPartnerApplicationListItem & {
  answers: Record<string, unknown>; consentedTermsVersion: string; applicationSchemaVersion: string;
  applicationSchema: { fields: Array<{ key: string; label: string; type: string; required: boolean; options?: string[] }> };
  reviewNotes: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function parseAdminPartnerProgramsResponse(json: unknown): AdminPartnerProgramListItem[] | null {
  if (!isRecord(json) || !Array.isArray(json.programs)) return null;
  const programs: AdminPartnerProgramListItem[] = [];
  for (const raw of json.programs) {
    if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.slug !== 'string' ||
        typeof raw.internal_name !== 'string' || typeof raw.public_name !== 'string' ||
        typeof raw.status !== 'string' || typeof raw.terms_version !== 'string' ||
        typeof raw.application_schema_version !== 'string' || typeof raw.created_at !== 'string' ||
        typeof raw.updated_at !== 'string') return null;
    programs.push({
      id: raw.id,
      slug: raw.slug,
      internalName: raw.internal_name,
      publicName: raw.public_name,
      status: raw.status,
      applicationsOpenAt: nullableString(raw.applications_open_at),
      applicationsCloseAt: nullableString(raw.applications_close_at),
      termsVersion: raw.terms_version,
      applicationSchemaVersion: raw.application_schema_version,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
  return programs;
}

export function parseAdminPartnerAppsResponse(json: unknown): AdminPartnerApp[] | null {
  if (!isRecord(json) || !Array.isArray(json.apps)) return null;
  const apps: AdminPartnerApp[] = [];
  for (const raw of json.apps) {
    if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.slug !== 'string' ||
        typeof raw.display_name !== 'string' || typeof raw.status !== 'string') return null;
    apps.push({ id: raw.id, slug: raw.slug, displayName: raw.display_name, status: raw.status });
  }
  return apps;
}

export function parseAdminPartnerProgramDetailResponse(json: unknown): AdminPartnerProgramDetail | null {
  if (!isRecord(json) || !isRecord(json.program)) return null;
  const raw = json.program;
  const list = parseAdminPartnerProgramsResponse({ programs: [raw] });
  if (list == null || !isRecord(raw.application_schema_json) || !Array.isArray(raw.application_schema_json.fields) ||
      !Array.isArray(raw.platform_partner_program_benefits)) return null;
  const benefits: AdminPartnerBenefit[] = [];
  for (const benefit of raw.platform_partner_program_benefits) {
    if (!isRecord(benefit) || typeof benefit.app_id !== 'string' ||
        (benefit.plan_slug !== 'starter' && benefit.plan_slug !== 'growth' && benefit.plan_slug !== 'pro') ||
        typeof benefit.duration_months !== 'number') return null;
    benefits.push({ appId: benefit.app_id, planSlug: benefit.plan_slug, durationMonths: benefit.duration_months });
  }
  return {
    ...list[0],
    publicDescription: typeof raw.public_description === 'string' ? raw.public_description : '',
    applicationSchemaJson: { fields: raw.application_schema_json.fields },
    benefits,
  };
}

function parseApplicationListItem(raw: unknown): AdminPartnerApplicationListItem | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.program_id !== 'string' || typeof raw.email !== 'string' ||
      typeof raw.first_name !== 'string' || typeof raw.last_name !== 'string' || typeof raw.status !== 'string' ||
      typeof raw.created_at !== 'string' || typeof raw.updated_at !== 'string') return null;
  return { id: raw.id, programId: raw.program_id, email: raw.email, firstName: raw.first_name, lastName: raw.last_name,
    companyName: nullableString(raw.company_name), status: raw.status, reviewedBy: nullableString(raw.reviewed_by),
    reviewedAt: nullableString(raw.reviewed_at), createdAt: raw.created_at, updatedAt: raw.updated_at };
}

export function parseAdminPartnerApplicationsResponse(json: unknown): AdminPartnerApplicationListItem[] | null {
  if (!isRecord(json) || !Array.isArray(json.applications)) return null;
  const items = json.applications.map(parseApplicationListItem);
  return items.some((item) => item == null) ? null : items as AdminPartnerApplicationListItem[];
}

export function parseAdminPartnerApplicationDetailResponse(json: unknown): AdminPartnerApplicationDetail | null {
  if (!isRecord(json) || !isRecord(json.application)) return null;
  const raw = json.application;
  const base = parseApplicationListItem(raw);
  if (base == null || !isRecord(raw.answers_json) || !isRecord(raw.application_schema_snapshot_json) ||
      !Array.isArray(raw.application_schema_snapshot_json.fields) || typeof raw.consented_terms_version !== 'string' ||
      typeof raw.application_schema_version !== 'string') return null;
  const fields: AdminPartnerApplicationDetail['applicationSchema']['fields'] = [];
  for (const field of raw.application_schema_snapshot_json.fields) {
    if (!isRecord(field) || typeof field.key !== 'string' || typeof field.label !== 'string' || typeof field.type !== 'string' || typeof field.required !== 'boolean') return null;
    fields.push({ key: field.key, label: field.label, type: field.type, required: field.required,
      ...(Array.isArray(field.options) && field.options.every((option) => typeof option === 'string') ? { options: field.options as string[] } : {}) });
  }
  return { ...base, answers: raw.answers_json, consentedTermsVersion: raw.consented_terms_version,
    applicationSchemaVersion: raw.application_schema_version, applicationSchema: { fields }, reviewNotes: nullableString(raw.review_notes) };
}
