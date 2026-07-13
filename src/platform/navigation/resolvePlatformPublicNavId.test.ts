import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolvePlatformPublicNavId,
  shouldShowPlatformPublicNavMenu,
} from '@/platform/navigation/resolvePlatformPublicNavId';

describe('resolvePlatformPublicNavId', () => {
  it('shows the public nav menu on the homepage', () => {
    assert.equal(shouldShowPlatformPublicNavMenu('/'), true);
    assert.equal(shouldShowPlatformPublicNavMenu('/products'), true);
    assert.equal(shouldShowPlatformPublicNavMenu('/docs'), true);
    assert.equal(shouldShowPlatformPublicNavMenu('/dashboard'), false);
  });

  it('does not highlight a nav item for the homepage', () => {
    assert.equal(resolvePlatformPublicNavId('/'), null);
    assert.equal(resolvePlatformPublicNavId('/products'), 'products');
    assert.equal(resolvePlatformPublicNavId('/products/buildcore'), 'products');
    assert.equal(resolvePlatformPublicNavId('/docs/buildcore'), 'docs');
  });
});
