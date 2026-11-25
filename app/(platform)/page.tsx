import Link from "next/link";
import Photo from "@/components/Photo";
import { PLATFORM } from "@/config/platform";

const STEPS = [["Create your account", "Sign up with your email and verify it in one click."], ["Set up your studio", "Add your brand, photo, contact details and booking preferences."], ["Add your artistry", "Upload your portfolio and list your services and prices."], ["Share your link", "Send clients your personal booking page and let them book themselves."]];
const FEATURES = [["Your own booking website", "A beautiful page with your name, your look and your link."], ["Portfolio gallery", "Show your best work in a clean, photo-first gallery."], ["Services and prices", "List every look with its price and how long it takes."], ["Appointments and availability", "Set your hours, block days off, and never get double-booked."], ["AI Beauty Assistant", "Help clients discover the looks that suit them best."], ["Deposits that secure the date", "Clients pay a deposit when they book, so your time is protected."]];
const BENEFITS = ["Look polished and professional from day one", "Spend less time answering DMs about prices and times", "Reduce no-shows with deposits", "Keep your clients and your calendar in one private place", "Works beautifully on every phone", "You set your own prices, hours and rules"];
const PLANS = [["Starter", "Price to be confirmed", ["Your booking website", "Services and portfolio", "Appointments and availability"], false], ["Studio", "Price to be confirmed", ["Everything in Starter", "AI Beauty Assistant", "Priority support"], true], ["Pro", "Price to be confirmed", ["Everything in Studio", "Custom domain", "Extra team features"], false]] as const;
const REVIEWS = [["I used to book everything through DMs. Now clients pick a time and it’s just there in my calendar.", "Adaeze, bridal artist"], ["My page looks like a real brand. Clients tell me how easy it was to book.", "Tola, soft glam artist"], ["The deposits alone have saved me so many empty slots.", "Zainab, makeup artist"]];
const FAQ = [["Who is this for?", "Independent makeup artists who want a professional booking website without building one themselves."], ["Do my clients need an account?", "No. Clients choose a look, pick a time and book. No sign-up is needed."], ["How do deposits work?", "Clients pay a deposit when they book, through Paystack. Payout details for artists are set up in a later release."], ["Is the AI Beauty Assistant a medical tool?", "No. It only suggests makeup looks from visible features and never diagnoses skin or health. Clients can correct anything it gets wrong."], ["What happens to my clients’ photos?", "The assistant is designed so photos are not stored unless a client chooses to share them with you."], ["Can I use my own domain name?", "Custom domains are planned. For now, every artist gets a personal link on the platform."], ["Can I skip parts of setup?", "Yes. Only your name and brand name are required. You can finish everything else later."]];
const h2 = "text-4xl lg:text-5xl";

export default function Landing() {
  return (
    <main>
      <section className="bg-baby py-12 lg:py-20">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <div>
            <hr className="mb-6 h-0.5 w-16 border-0 bg-blush" />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl">{PLATFORM.tagline}</h1>
            <p className="mb-7 mt-5 max-w-lg text-lg text-muted">{PLATFORM.description}</p>
            <div className="flex flex-wrap gap-3.5"><Link href="/signup" className="btn btn-primary">Sign Up as a Makeup Artist</Link><Link href="/login" className="btn btn-quiet">Artist Login</Link></div>
          </div>
          <Photo src="/images/platform-hero.jpg" alt="A makeup artist at work" eager className="aspect-[4/5] max-h-[560px] w-full" />
        </div>
      </section>

      <section id="how" className="py-16 lg:py-20"><div className="wrap">
        <h2 className={h2}>How it works</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([t, d], i) => (<li key={t} className="card"><span className="grid h-10 w-10 place-items-center rounded-full bg-blush font-semibold">{i + 1}</span><h3 className="mt-4 text-2xl !text-brown">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></li>))}</ol>
      </div></section>

      <section id="features" className="bg-baby py-16 lg:py-20"><div className="wrap">
        <h2 className={h2}>Everything you need to run your studio</h2>
        <p className="mt-2 text-muted">New features are being switched on in stages. Create your account now to reserve your booking link.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([t, d]) => (<div key={t} className="card"><h3 className="text-2xl !text-brown">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>))}</div>
      </div></section>

      <section id="assistant" className="bg-blush py-16 lg:py-20"><div className="wrap grid items-center gap-10 lg:grid-cols-2">
        <div><h2 className={`${h2} !text-brown`}>Meet the AI Beauty Assistant</h2>
          <p className="mt-4 text-lg">Clients upload a few photos and the assistant notices their face shape, eyes, lips and more. Then it suggests looks from <b>your</b> services, with a kind explanation of why each might suit them.</p>
          <ul className="mt-4 space-y-1.5"><li>✓ Only ever recommends your own services and prices</li><li>✓ Says so honestly when it isn’t sure</li><li>✓ Clients can correct anything it gets wrong</li><li>✓ Never diagnoses skin or health</li></ul></div>
        <div className="card"><p className="font-serif text-2xl text-rose">“These looks might be perfect for you.”</p><p className="mt-2 text-sm text-muted">A gentle, flattering result clients can book from in one tap.</p></div>
      </div></section>

      <section className="py-16 lg:py-20"><div className="wrap">
        <h2 className={h2}>Why artists love it</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">{BENEFITS.map((b) => (<li key={b} className="card flex items-start gap-3 !p-5"><span className="font-bold text-rose">✓</span>{b}</li>))}</ul>
      </div></section>

      <section id="plans" className="bg-baby py-16 lg:py-20"><div className="wrap">
        <h2 className={h2}>Simple plans</h2>
        <p className="mt-2 text-muted">Placeholder plans. Final pricing is coming soon and billing is not switched on yet.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{PLANS.map(([n, p, f, hot]) => (
          <div key={n} className={`card flex flex-col ${hot ? "!border-blush ring-2 ring-blush" : ""}`}>
            {hot && <span className="mb-2 w-fit rounded-full bg-blush px-3 py-0.5 text-xs font-semibold">Most popular</span>}
            <h3 className="text-3xl !text-brown">{n}</h3><p className="mt-1 font-semibold text-rose">{p}</p>
            <ul className="my-4 flex-1 space-y-1.5 text-sm">{f.map((x) => <li key={x}>✓ {x}</li>)}</ul>
            <Link href="/signup" className={`btn ${hot ? "btn-primary" : "btn-quiet"}`}>Get started</Link></div>))}</div>
      </div></section>

      <section id="reviews" className="py-16 lg:py-20"><div className="wrap">
        <h2 className={h2}>Kind words</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{REVIEWS.map(([q, by]) => (<figure key={by} className="card m-0"><blockquote className="mb-4 font-serif text-2xl leading-snug">{q}</blockquote><figcaption className="text-sm font-semibold text-rose">{by}</figcaption></figure>))}</div>
        <p className="mt-4 text-sm text-muted">Sample reviews. Replace with real artist feedback once you have it.</p>
      </div></section>

      <section id="faq" className="bg-baby py-16 lg:py-20"><div className="wrap max-w-3xl">
        <h2 className={h2}>Questions</h2>
        <div className="mt-8 space-y-3">{FAQ.map(([q, a]) => (<details key={q} className="card group !p-5"><summary className="cursor-pointer list-none font-semibold marker:hidden">{q}<span className="float-right text-rose group-open:rotate-45">+</span></summary><p className="mt-3 text-muted">{a}</p></details>))}</div>
      </div></section>

      <section className="py-16 text-center lg:py-20"><div className="wrap max-w-2xl">
        <h2 className={h2}>Ready to be beautifully booked?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3.5"><Link href="/signup" className="btn btn-primary">Sign Up as a Makeup Artist</Link><Link href="/login" className="btn btn-quiet">Artist Login</Link></div>
      </div></section>
    </main>
  );
}
