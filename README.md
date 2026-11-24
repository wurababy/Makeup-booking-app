# Studio – Next.js build

**Phase 1 (this folder):** design system, navigation, homepage, makeup gallery and look pages.

## Run it
1. Install Node.js 20 or newer.
2. In this folder: `npm install`, then `npm run dev`, and open http://localhost:3000.
3. Add photos to `public/images/` named after each look (e.g. `soft-glam.jpg`), plus `hero.jpg` and `about.jpg`.
4. Edit looks and prices in `data/looks.ts` (they move to the database in Phase 6).

## Put it online
Push this folder to a GitHub repository and import it at vercel.com (free). GitHub Pages cannot run Next.js.

## Coming in later phases
Supabase (database, photo storage), AI analysis, bookings, Paystack, admin login. Secret keys will go in Vercel environment variables, never in the code or in chat.

## Phase 2: AI Beauty Assistant
- Add `ANTHROPIC_API_KEY` to `.env.local` (copy `.env.example`). Without it the page shows "isn’t switched on yet".
- Photos are shrunk in the browser (this also removes location data), sent to `/api/assess`, analysed once and discarded by default.
- Optional "keep my photos": needs Supabase. Run `supabase/schema.sql` in the Supabase SQL Editor and add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- The secret keys are only used on the server (`lib/server`). Never put them in a `NEXT_PUBLIC_` variable.

## Phases 4–6: booking, Paystack, admin
1. In Supabase SQL Editor run `supabase/schema.sql`, then `supabase/phase4-6.sql`.
2. In Supabase > Authentication: turn OFF "Allow new users to sign up", then add yourself under Users with a strong password.
3. Fill in `.env.local` (see `.env.example`).
4. In Paystack > Settings > API: set the **webhook URL** to `https://YOUR-SITE/api/paystack/webhook`.
5. Sign in at `/admin`, click **Import starter looks**, set prices, photos, hours and blocked dates.

How bookings stay safe: the database refuses overlapping appointments; a time is held for 15 minutes while paying; a booking is confirmed only after the server asks Paystack to verify the payment (also via webhook); unpaid or failed payments simply expire and never confirm.
