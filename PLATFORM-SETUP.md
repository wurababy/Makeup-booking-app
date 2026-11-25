# Platform setup (Section 1)

## What changed
- `/` is now the **platform landing page** for makeup artists. Sign up, login, password reset, onboarding and `/dashboard` are new.
- Your original single-studio site is untouched and now lives at **/studio** (its booking, assistant and /admin pages keep working with their own tables).
- New multi-artist tables are separate (`artists`, `services`, `appointments`, ...), so nothing old is overwritten. Section 2 will bring booking to each artist's page (`/a/their-name`) and we can then retire or migrate the old tables.
- Brighter pink palette applied everywhere (edit in `tailwind.config.ts`).

## 1. Supabase (one-time)
1. SQL Editor: run `supabase/platform.sql`.
2. Authentication > Providers > Email: keep **Confirm email ON**.
3. Authentication > URL Configuration: **Site URL** = your site (e.g. https://yourdomain.com). Add **Redirect URLs**: `https://yourdomain.com/auth/confirm` and `http://localhost:3000/auth/confirm`.
4. Authentication > SMTP Settings: add custom SMTP (for example Resend SMTP). The built-in email sender allows only a handful of emails per hour and is for testing only. Without this, real artists will not receive verification emails.
5. Optional but recommended (more reliable when artists open the email on another device): Authentication > Email Templates, change the link in "Confirm signup" to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/onboarding` and in "Reset password" to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`.
6. Project Settings > API: copy the URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and the same values into the older `SUPABASE_URL` / `SUPABASE_ANON_KEY`).

## 2. Prove the privacy walls work
`npm install`, then: `node --env-file=.env.local scripts/rls-check.mjs`
It creates two test artists with real logins, tries ~20 ways for one to read or change the other's data, and deletes itself. **Every line must say PASS.** Run it again after any database change.

## 3. Try it
`npm run dev` > sign up > verify email > onboarding > dashboard. Then open `/a/your-link`.

## Not built yet (later sections)
Services, portfolio, appointments, availability pages (placeholders), the public booking site per artist, artist payouts, subscription billing, platform admin, and legal pages (Terms and Privacy Policy for artists) which you need before launch.
