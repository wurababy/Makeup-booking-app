# Your Studio Name – Makeup Artistry Website

A simple one-page website. No build step. Files: `index.html`, `css/styles.css`, `js/main.js`, `images/`.

## Put it online with GitHub Pages
1. Create a free account at github.com and click **New repository** (name it e.g. `makeup-studio`, set it to Public).
2. Click **uploading an existing file**, drag in ALL the files and folders from this project, then **Commit changes**.
3. Go to **Settings → Pages**. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/makeup-studio/`.

## Make it yours
- Replace "Your Studio Name", prices and copy in `index.html`.
- Add photos to `images/` and set them on the portfolio tiles (see the comment in `index.html`).
- Deposit amount and times: top of `js/main.js`.

## Still to connect later
- Payments: add your Paystack public key in `js/main.js` (until then bookings run in demo mode).
- Real availability, confirmation emails and AI photo analysis need a small backend service.

## Availability and blocking dates
Edit `data/availability.json` on GitHub: working days (0 = Sunday), opening/closing time, `buffer` minutes between clients, and `blocked` dates (format `"2026-12-25"`).

## Before real bookings
Bookings are only remembered in each visitor's own browser in this version. Real double-booking protection, payment verification and confirmation emails need a small server (see notes in `js/main.js`).
