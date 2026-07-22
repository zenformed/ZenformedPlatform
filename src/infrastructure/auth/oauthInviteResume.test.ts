import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  extractInviteTokenFromReturnPath,
  isInviteOAuthIntent,
  resolveAuthEntryParamsForOAuthResume,
  type OAuthInviteIntentFields,
} from './oauthInviteResume';

function intent(partial: Partial<OAuthInviteIntentFields>): OAuthInviteIntentFields {
  return {
    app: partial.app ?? null,
    plan: partial.plan ?? null,
    returnTo: partial.returnTo ?? null,
    redirect: partial.redirect ?? null,
    inviteToken: partial.inviteToken ?? null,
  };
}

describe('oauthInviteResume', () => {
  it('extracts invite token from returnTo', () => {
    assert.equal(
      extractInviteTokenFromReturnPath('/accept-invite?token=abc123'),
      'abc123'
    );
    assert.equal(extractInviteTokenFromReturnPath('/dashboard'), null);
    assert.equal(extractInviteTokenFromReturnPath('https://evil.example'), null);
  });

  it('detects invite OAuth intent', () => {
    assert.equal(isInviteOAuthIntent(intent({ inviteToken: 't1' })), true);
    assert.equal(
      isInviteOAuthIntent(intent({ returnTo: '/accept-invite?token=t2' })),
      true
    );
    assert.equal(isInviteOAuthIntent(intent({ returnTo: '/dashboard' })), false);
  });

  it('forces BuildCore accept-invite resume params for invite tokens', () => {
    const params = resolveAuthEntryParamsForOAuthResume(
      intent({ inviteToken: 'tok', app: null, returnTo: null })
    );
    assert.equal(params.app, 'buildcore');
    assert.equal(params.returnTo, '/accept-invite?token=tok');
  });
});
