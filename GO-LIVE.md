# Go-live guide

## 1. Accounts to create (in this order)
1. **GitHub** (free): store the code. Upload the `studio-next` folder as a new private repository.
2. **Supabase**: database, photo storage and admin login. Create a project, then run `supabase/schema.sql`, `supabase/phase4-6.sql` and `supabase/phase7.sql` in its SQL Editor. In Authentication, switch OFF public sign-ups and add yourself as a user.
3. **Anthropic** (AI): create an API key and set a monthly spend limit in its console.
4. **Paystack**: sign up and use TEST keys first. To take real money you must complete their verification (see section 3).
5. **Resend** (emails): add your domain and verify it. Without a verified domain, confirmation emails will not reach clients.
6. **Vercel**: import the GitHub repository. Use the **Pro** plan for a business site.
7. **A domain name** (for example yourname.com or .ng): connect it in Vercel.

## 2. Environment variables (Vercel > Project > Settings > Environment Variables)
Copy every name from `.env.example`. Then set Paystack's webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`.

## 3. Before real clients
- [ ] Fill in `config/site.ts` (name, WhatsApp, Instagram, email)
- [ ] Add photos: hero, about, and one per look (upload looks' photos in /admin)
- [ ] Sign in at /admin, click **Import starter looks**, set real prices, durations, hours, deposit and blocked dates
- [ ] Edit `/policies` and `/privacy` to match how you work; have a professional review the privacy text
- [ ] Replace the sample testimonials in `app/page.tsx` with real ones
- [ ] Work through `TESTING.md` using Paystack TEST keys
- [ ] Switch Paystack to LIVE keys and make one real small test booking, then cancel and refund it
