import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { getArtistContext } from "@/lib/artist";
import { PLATFORM } from "@/config/platform";

type Appt = { id: string; ref: string; service_name: string; client_name: string; start_at: string; status: string; price: number; deposit: number };

export default async function Overview() {
  const { sb, artist } = await getArtistContext(); /* every query below runs as the signed-in artist, so the database only returns THEIR rows */
  const a = artist!;
  const money = (n: number) => new Intl.NumberFormat("en", { style: "currency", currency: a.currency, maximumFractionDigits: 0 }).format(n);
  const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: a.timezone });
  const [total, upcoming, recent] = await Promise.all([
    sb.from("appointments").select("id", { count: "exact", head: true }).in("status", ["confirmed", "completed"]),
    sb.from("appointments").select("*").eq("status", "confirmed").gte("start_at", new Date().toISOString()).order("start_at").limit(5),
    sb.from("appointments").select("*").in("status", ["confirmed", "completed", "cancelled", "needs_refund"]).order("created_at", { ascending: false }).limit(5),
  ]);
  const up = (upcoming.data ?? []) as Appt[], rec = (recent.data ?? []) as Appt[];
  const link = `${PLATFORM.url}/a/${a.slug}`;
  const missing = [!a.logo_url && "a profile photo", !a.description && "a business description", !a.whatsapp && "your WhatsApp number", !a.instagram && "your Instagram"].filter(Boolean) as string[];
  const list = (rows: Appt[], empty: string) => rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : (<ul>{rows.map((r) => (
    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-champagne py-3 text-sm"><span><b>{r.client_name}</b> · {r.service_name}<br /><span className="text-muted">{when(r.start_at)}</span></span><span className="text-right"><span className="rounded-full bg-baby px-2.5 py-0.5 text-xs font-semibold text-rose">{r.status.replace("_", " ")}</span><br /><span className="text-muted">{money(r.deposit)} deposit</span></span></li>))}</ul>);
  return (
    <div className="space-y-6">
      <div><h1 className="text-4xl">Welcome, {a.artist_name.split(" ")[0]}</h1><p className="mt-1 text-muted">Here’s how {a.business_name} is doing.</p></div>
      {missing.length > 0 && <div className="card !border-blush bg-baby"><p className="font-semibold">Finish your profile</p><p className="text-sm text-muted">Add {missing.join(", ")} to make your page feel complete. <Link href="/dashboard/settings" className="text-rose underline">Open settings</Link></p></div>}
      <div className="grid gap-4 sm:grid-cols-3">{([["Total bookings", String(total.count ?? 0)], ["Upcoming", String(up.length)], ["Currency", a.currency]] as const).map(([k, v]) => (<div key={k} className="card"><span className="text-sm text-muted">{k}</span><div className="font-serif text-4xl font-semibold text-rose">{v}</div></div>))}</div>
      <div className="card"><h2 className="text-2xl">Your booking website</h2><p className="mt-1 break-all text-sm text-muted">{link}</p>
        <div className="mt-3 flex flex-wrap gap-3"><CopyButton text={link} /><Link href={`/a/${a.slug}`} className="btn btn-quiet !px-5 !py-2.5 text-sm">View page</Link></div></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card"><h2 className="text-2xl">Upcoming appointments</h2><div className="mt-2">{list(up, "No upcoming appointments yet. They’ll appear here once clients can book you.")}</div></div>
        <div className="card"><h2 className="text-2xl">Recent bookings</h2><div className="mt-2">{list(rec, "No bookings yet.")}</div></div>
      </div>
      <div><h2 className="mb-3 text-2xl">Quick actions</h2><div className="flex flex-wrap gap-3">
        <Link href="/dashboard/settings" className="btn btn-primary">Edit my profile</Link><Link href="/dashboard/settings" className="btn btn-quiet">Booking preferences</Link>
        <Link href="/dashboard/services" className="btn btn-quiet">Add services (soon)</Link><Link href="/dashboard/portfolio" className="btn btn-quiet">Upload portfolio (soon)</Link></div></div>
    </div>
  );
}
