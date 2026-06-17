import { PlatformTableEntitlementReader as ZenformedPlatformTableEntitlementReader } from '@zenformed/core';
import { getPlatformEntitlementReaderSupabaseDeps } from '@/infrastructure/entitlements/platformEntitlementReaderSupabaseDeps';
import { queryPlatformAppMirrorResolutionDetail } from '@/infrastructure/entitlements/queryPlatformAppMirrorResolutionDetail';

/** Platform-default {@link ZenformedPlatformTableEntitlementReader}. */
export class PlatformTableEntitlementReader extends ZenformedPlatformTableEntitlementReader {
  constructor() {
    super(getPlatformEntitlementReaderSupabaseDeps(), queryPlatformAppMirrorResolutionDetail);
  }
}
