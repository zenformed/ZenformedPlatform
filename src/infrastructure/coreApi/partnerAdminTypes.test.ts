import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAdminPartnerApplicationDetailResponse, parseAdminPartnerApplicationsResponse, parseAdminPartnerAppsResponse, parseAdminPartnerProgramDetailResponse, parseAdminPartnerProgramsResponse } from './partnerAdminTypes';

test('parses Core Partner program list rows without leaking snake_case into UI code', () => {
  const result = parseAdminPartnerProgramsResponse({
    relay: 'zenformed_core',
    programs: [{
      id: 'program-1', slug: 'founders', internal_name: 'Founders 2026', public_name: 'Founders',
      status: 'draft', applications_open_at: null, applications_close_at: null,
      terms_version: '1', application_schema_version: '1',
      created_at: '2026-08-11T00:00:00.000Z', updated_at: '2026-08-11T00:00:00.000Z',
    }],
  });
  assert.equal(result?.[0].internalName, 'Founders 2026');
  assert.equal(result?.[0].applicationsOpenAt, null);
});

test('fails closed when a required Partner program field is malformed', () => {
  assert.equal(parseAdminPartnerProgramsResponse({ programs: [{ id: 'program-1' }] }), null);
});

test('parses the explicit registered-app catalog for benefit selection', () => {
  assert.deepEqual(parseAdminPartnerAppsResponse({ apps: [{ id: 'app-1', slug: 'buildcore', display_name: 'BuildCore', status: 'active' }] }), [
    { id: 'app-1', slug: 'buildcore', displayName: 'BuildCore', status: 'active' },
  ]);
  assert.equal(parseAdminPartnerAppsResponse({ apps: [{ id: 'app-1', slug: 'buildcore' }] }), null);
});

test('parses editable program detail and explicit benefits', () => {
  const detail = parseAdminPartnerProgramDetailResponse({ program: {
    id: 'program-1', slug: 'founders', internal_name: 'Founders', public_name: 'Founders', public_description: 'Apply.', status: 'draft',
    applications_open_at: null, applications_close_at: null, terms_version: '1', application_schema_version: '1', application_schema_json: { fields: [] },
    created_at: '2026-08-11T00:00:00.000Z', updated_at: '2026-08-11T00:00:00.000Z',
    platform_partner_program_benefits: [{ app_id: 'app-1', plan_slug: 'growth', duration_months: 6 }],
  } });
  assert.equal(detail?.publicDescription, 'Apply.');
  assert.deepEqual(detail?.benefits, [{ appId: 'app-1', planSlug: 'growth', durationMonths: 6 }]);
});

test('parses application queue and schema-snapshot detail', () => {
  const row = { id: 'application-1', program_id: 'program-1', email: 'person@example.com', first_name: 'Ada', last_name: 'Lovelace', company_name: null, status: 'submitted', reviewed_by: null, reviewed_at: null, created_at: '2026-08-11T00:00:00Z', updated_at: '2026-08-11T00:00:00Z' };
  assert.equal(parseAdminPartnerApplicationsResponse({ applications: [row] })?.[0].email, 'person@example.com');
  const detail = parseAdminPartnerApplicationDetailResponse({ application: { ...row, answers_json: { why: 'Build.' }, consented_terms_version: '1', application_schema_version: '1', application_schema_snapshot_json: { fields: [{ key: 'why', label: 'Why?', type: 'long_text', required: true }] }, review_notes: null } });
  assert.equal(detail?.applicationSchema.fields[0].label, 'Why?');
  assert.equal(detail?.answers.why, 'Build.');
});
