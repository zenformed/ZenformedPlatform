# ZenformedPlatform

Platform shell for [core.zenformed.com](https://core.zenformed.com) — shared auth entry point for Zenformed apps.

## Local development

1. Copy `.env.example` to `.env.local` and set Supabase credentials.
2. `npm install`
3. `npm run dev` — app runs at [http://localhost:3030](http://localhost:3030)

Add these URLs to your Supabase project's redirect URL allowlist:

- `http://localhost:3030/reset-password`
- `http://localhost:3030/login`
- `https://core.zenformed.com/login` (production)

Enable **Confirm email** under Authentication → Providers → Email so direct `/register` sends a verification email before sign-in.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirects to `/login` or `/dashboard` |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password (email link target) |
| `/dashboard` | Authenticated placeholder home |

## Scripts

- `npm run dev` — development server (port 3030)
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
