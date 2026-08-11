import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRegistrationConfirmationLoginPath } from './registrationConfirmationLoginPath';

test('registration confirmation preserves a Partner invitation return path', () => {
  const url = new URL(buildRegistrationConfirmationLoginPath({
    loginPath: '/login',
    returnTo: '/partner-invitations/accept?token=partner-token',
  }), 'https://core.zenformed.com');
  assert.equal(url.pathname, '/login');
  assert.equal(url.searchParams.get('returnTo'), '/partner-invitations/accept?token=partner-token');
});

test('registration confirmation safely encodes nested invitation query parameters', () => {
  const path = buildRegistrationConfirmationLoginPath({
    loginPath: '/login',
    returnTo: '/partner-invitations/accept?token=a_b-c',
  });
  assert.equal(path, '/login?returnTo=%2Fpartner-invitations%2Faccept%3Ftoken%3Da_b-c');
});
