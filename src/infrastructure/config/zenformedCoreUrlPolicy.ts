let warnedInsecureZenformedCoreUrl = false;

const LOCAL_HTTP_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function isLocalHttpDevUrl(hostname: string): boolean {
  return LOCAL_HTTP_HOSTNAMES.has(hostname);
}

export function resolveZenformedCoreApiBaseUrl(raw: string | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  const normalized = v.replace(/\/+$/, '');

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return normalized;
  }

  if (parsed.protocol !== 'http:') {
    return normalized;
  }

  if (isLocalHttpDevUrl(parsed.hostname)) {
    return normalized;
  }

  if (process.env.NODE_ENV === 'production') {
    if (!warnedInsecureZenformedCoreUrl) {
      warnedInsecureZenformedCoreUrl = true;
      console.warn(
        '[ZenformedPlatform] ZENFORMED_CORE_API_URL ignored: in production, use https:// for remote ZenformedCore.'
      );
    }
    return null;
  }

  return normalized;
}
