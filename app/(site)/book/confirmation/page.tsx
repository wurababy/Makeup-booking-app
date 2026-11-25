import Link from "next/link";
import { confirmPayment } from "@/lib/server/payments";
import { niceDate, niceTime } from "@/lib/server/time";
import { naira } from "@/data/looks";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking", robots: { index: false } };

export default async function Confirmation({ searchParams }: { searchParams: Promise<{ ref?: string; reference?: string }> }) {
  const sp = await searchParams;
  const out = await confirmPayment(sp.ref ?? sp.reference ?? "");
  const b = out.booking;
  const wa = SITE.whatsapp;
  if (out.state === "confirmed" && b) {
    const rows: [string, string][] = [["Client", b.name], ["Makeup look", b.look_name], ["Date", niceDate(b.start_at)], ["Time", niceTime(b.start_at)], ["Amount paid", naira(b.deposit)], ["Remaining balance", naira(Math.max(b.price - b.deposit, 0))], ["Booking reference", b.ref]];
    const msg = encodeURIComponent(`Hi! I’ve just booked ${b.look_name} for ${niceDate(b.start_at)} at ${niceTime(b.start_at)}. Reference: ${b.ref}.`);
    return (
      <main className="py-14 text-center"><div className="wrap max-w-xl">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blush text-3xl">✓</div>
        <h1 className="text-4xl">You’re Booked, Beautiful!</h1>
        <dl className="mt-6 text-left">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-champagne py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>
        <p className="mt-4 text-muted">A confirmation has been emailed to you.</p>
        <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">Message me on WhatsApp</a>
      </div></main>);
  }
  const msg = out.state === "refund" ? "Your payment was received, but that time was taken before it completed. We’ll contact you shortly to refund it or find you another time."
    : out.state === "notfound" ? "We couldn’t find that booking." : "Your payment wasn’t completed, so no booking was made and no time is reserved.";
  return (
    <main className="py-20 text-center"><div className="wrap max-w-xl">
      <h1 className="text-4xl">{out.state === "refund" ? "We’re on it" : "Not booked yet"}</h1>
      <p className="mt-3 text-muted">{msg}</p>
      <Link href="/book" className="btn btn-primary mt-6">Try again</Link>
    </div></main>);
}
