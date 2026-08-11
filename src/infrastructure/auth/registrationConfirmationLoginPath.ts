export function buildRegistrationConfirmationLoginPath(input: {
  loginPath: string;
  returnTo: string;
  app?: string | null;
  plan?: string | null;
}): string {
  const search = new URLSearchParams();
  if (input.app?.trim()) search.set('app', input.app.trim());
  if (input.plan?.trim()) search.set('plan', input.plan.trim());
  search.set('returnTo', input.returnTo);
  return `${input.loginPath}?${search.toString()}`;
}
