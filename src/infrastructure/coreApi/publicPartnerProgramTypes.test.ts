import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePublicPartnerProgramResponse } from './publicPartnerProgramTypes';

test('parses only the public Partner program contract', () => {
  const parsed = parsePublicPartnerProgramResponse({ program: { slug: 'founders', publicName: 'Founders', publicDescription: 'Apply.', termsVersion: '1', applicationSchemaVersion: '1', applicationSchema: { fields: [{ key: 'why', label: 'Why?', type: 'long_text', required: true }] } } });
  assert.equal(parsed?.publicName, 'Founders');
  assert.equal(parsed?.fields[0].key, 'why');
});

test('rejects malformed select fields', () => {
  assert.equal(parsePublicPartnerProgramResponse({ program: { slug: 'founders', publicName: 'Founders', publicDescription: '', termsVersion: '1', applicationSchemaVersion: '1', applicationSchema: { fields: [{ key: 'role', label: 'Role', type: 'select', required: true }] } } }), null);
});
