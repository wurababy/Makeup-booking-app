# Testing guide (Phase 7)

## Automated (run `npm test`)
Checks the logic that matters most: available times, buffers, blocked and extra dates, booking window, double-booking overlap,
Paystack signature checking, and that recommendations only ever come from your own looks.

## Manual checklist (do this on a real phone AND a computer, using Paystack TEST keys)
**Homepage and gallery**
- [ ] Menu opens and closes; every link goes to the right place
- [ ] Filters work; View/Choose opens the look page; Book This Look pre-selects the look
- [ ] Nothing scrolls sideways; text is readable without zooming

**AI assistant**
- [ ] Front photo only works; adding/replacing/removing photos works
- [ ] Button stays disabled until a front photo and consent are given
- [ ] Results appear; changing a feature works; "See My Looks" shows 3–4 of YOUR looks with correct prices
- [ ] "Keep my photos" off: nothing appears in Supabase Storage > client-photos. On: it appears, and "Delete my saved photos" removes it

**Booking**
- [ ] Only free days are clickable; times shown are real
- [ ] Book a time → Paystack test card → confirmation page and emails
- [ ] Open the site in a second browser: that time is now gone
- [ ] Cancel at Paystack → "Not booked yet", and the time is free again after 15 minutes
- [ ] Two phones choosing the same time together: only one can pay
- [ ] Inspiration photo shows in admin

**Admin**
- [ ] /admin redirects to sign-in when signed out; wrong password is refused; a non-admin email is refused
- [ ] Block a date → disappears from booking. Add an extra date → appears
- [ ] Change a price → shows on the site and in booking within about a minute
- [ ] Change status / balance paid; totals update
