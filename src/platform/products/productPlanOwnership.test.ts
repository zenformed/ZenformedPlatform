import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canContinuePlanChange,
  formatPlanDowngradeBlockedMessage,
  isOwnedProductAtHighestPlan,
  resolvePlanCardOwnershipAction,
  resolveProductListingCtaLabel,
} from './productPlanOwnership';

describe('productPlanOwnership', () => {
  it('resolves listing CTA for owned and non-owned products', () => {
    assert.equal(
      resolveProductListingCtaLabel({
        isLive: true,
        owned: false,
        currentPlanSlug: null,
        catalogPlanSlugs: ['starter', 'growth', 'pro'],
        viewPlansLabel: 'View Plans',
        previewPlansLabel: 'Preview plans',
      }),
      'View Plans'
    );
    assert.equal(
      resolveProductListingCtaLabel({
        isLive: true,
        owned: true,
        currentPlanSlug: 'growth',
        catalogPlanSlugs: ['starter', 'growth', 'pro'],
        viewPlansLabel: 'View Plans',
        previewPlansLabel: 'Preview plans',
      }),
      'Upgrade'
    );
    assert.equal(
      resolveProductListingCtaLabel({
        isLive: true,
        owned: true,
        currentPlanSlug: 'pro',
        catalogPlanSlugs: ['starter', 'growth', 'pro'],
        viewPlansLabel: 'View Plans',
        previewPlansLabel: 'Preview plans',
      }),
      'Change Plan'
    );
  });

  it('computes plan card ownership actions', () => {
    const targetPlan = {
      planSlug: 'pro' as const,
      displayName: 'Pro',
      ctaLabel: 'Choose Pro',
    };

    assert.deepEqual(
      resolvePlanCardOwnershipAction({
        productOwned: true,
        currentPlanSlug: 'growth',
        targetPlan,
      }),
      {
        kind: 'change',
        primaryLabel: 'Upgrade to Pro',
        changeType: 'upgrade',
        owned: false,
      }
    );

    assert.deepEqual(
      resolvePlanCardOwnershipAction({
        productOwned: true,
        currentPlanSlug: 'pro',
        targetPlan: { ...targetPlan, planSlug: 'growth', displayName: 'Growth' },
      }),
      {
        kind: 'change',
        primaryLabel: 'Switch to Growth',
        changeType: 'downgrade',
        owned: false,
      }
    );

    assert.deepEqual(
      resolvePlanCardOwnershipAction({
        productOwned: true,
        currentPlanSlug: 'pro',
        targetPlan,
      }),
      {
        kind: 'current',
        primaryLabel: 'Current Plan',
        owned: true,
        disabled: true,
      }
    );
  });

  it('blocks downgrade when active members exceed target seats', () => {
    assert.equal(
      canContinuePlanChange({
        changeType: 'downgrade',
        targetSeatsIncluded: 10,
        activeMemberCount: 23,
      }),
      false
    );
    assert.equal(
      canContinuePlanChange({
        changeType: 'upgrade',
        targetSeatsIncluded: 10,
        activeMemberCount: 23,
      }),
      true
    );
    assert.match(
      formatPlanDowngradeBlockedMessage({
        planName: 'Growth',
        targetSeats: 10,
        activeMemberCount: 23,
      }),
      /Remove seated team members before switching to Growth/
    );
  });

  it('detects highest owned plan', () => {
    assert.equal(isOwnedProductAtHighestPlan('pro', ['starter', 'growth', 'pro']), true);
    assert.equal(isOwnedProductAtHighestPlan('growth', ['starter', 'growth', 'pro']), false);
  });
});
