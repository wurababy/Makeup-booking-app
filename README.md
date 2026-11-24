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
