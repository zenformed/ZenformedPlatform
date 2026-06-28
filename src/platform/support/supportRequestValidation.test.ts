import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCreateSupportRequestInput,
  parseSupportRequestProduct,
  validateSupportRequestSubmission,
} from '@/platform/support/supportRequestValidation';
import { SUPPORT_REQUEST_MESSAGE_MAX_LENGTH } from '@/platform/support/supportRequestTypes';

describe('supportRequestValidation', () => {
  it('requires subject and message', () => {
    const result = validateSupportRequestSubmission({
      subject: '   ',
      message: '',
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.errors.subject, 'Subject is required.');
    assert.equal(result.errors.message, 'Message is required.');
  });

  it('enforces max lengths', () => {
    const result = validateSupportRequestSubmission({
      subject: 'x'.repeat(201),
      message: 'y'.repeat(SUPPORT_REQUEST_MESSAGE_MAX_LENGTH + 1),
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.errors.subject ?? '', /200 characters/);
    assert.match(result.errors.message ?? '', /5000 characters/);
  });

  it('accepts optional product and trims fields', () => {
    const result = validateSupportRequestSubmission({
      subject: '  Missing article  ',
      message: '  Need help finding workflow docs.  ',
      product: 'buildcore',
      source: 'docs',
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.subject, 'Missing article');
    assert.equal(result.value.message, 'Need help finding workflow docs.');
    assert.equal(result.value.product, 'buildcore');
    assert.equal(result.value.source, 'docs');
  });

  it('rejects invalid product values', () => {
    const result = validateSupportRequestSubmission({
      subject: 'Help',
      message: 'Need assistance',
      product: 'invalid-product',
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.errors.product, 'Select a valid product.');
  });

  it('builds repository input with organization context', () => {
    const validation = validateSupportRequestSubmission({
      subject: 'Help',
      message: 'Need assistance',
      product: 'other',
    });

    assert.equal(validation.ok, true);
    if (!validation.ok) return;

    const record = buildCreateSupportRequestInput(validation.value, {
      userId: 'user-123',
      organizationId: 'org-456',
    });

    assert.equal(record.userId, 'user-123');
    assert.equal(record.organizationId, 'org-456');
    assert.equal(record.product, 'other');
    assert.equal(record.subject, 'Help');
    assert.equal(record.message, 'Need assistance');
    assert.equal(record.source, 'docs');
  });

  it('parses supported product slugs', () => {
    assert.equal(parseSupportRequestProduct(' BuildCore '), 'buildcore');
    assert.equal(parseSupportRequestProduct(''), null);
    assert.equal(parseSupportRequestProduct(undefined), null);
    assert.equal(parseSupportRequestProduct('unknown'), null);
  });
});
