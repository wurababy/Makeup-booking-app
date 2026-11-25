"use client";
import { useEffect, useState } from "react";
import { duration, naira } from "@/data/looks";
import { shrink } from "@/lib/shrink";

type L = { slug: string; name: string; price: number; minutes: number };
const pad = (n: number) => String(n).padStart(2, "0");
const label = (t: string) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "pm" : "am"}`; };
const input = "w-full rounded-[14px] border-[1.5px] border-champagne bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-4 focus:ring-baby";

export default function BookingFlow({ looks, deposit, initial }: { looks: L[]; deposit: number; initial: string }) {
  const now = new Date();
  const [slug, setSlug] = useState(looks.some((l) => l.slug === initial) ? initial : "");
  const [ym, setYm] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`);
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [date, setDate] = useState(""), [time, setTime] = useState("");
  const [step, setStep] = useState(1), [tick, setTick] = useState(0);
  const [f, setF] = useState({ name: "", phone: "", email: "", occasion: "", notes: "" });
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [insp, setInsp] = useState<File | null>(null), [agree, setAgree] = useState(false);
  const look = looks.find((l) => l.slug === slug);

  useEffect(() => {
    if (!slug) return;
    let live = true;
    fetch(`/api/availability?slug=${slug}&month=${ym}`).then((r) => r.json()).then((j) => live && setSlots(j.slots ?? {})).catch(() => live && setSlots({}));
    return () => { live = false; };
  }, [slug, ym, tick]);

  const [y, m] = ym.split("-").map(Number);
  const lead = new Date(y, m - 1, 1).getDay(), days = new Date(y, m, 0).getDate();
  const isCurrent = ym === `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const move = (n: number) => { const d = new Date(y, m - 1 + n, 1); setYm(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); setDate(""); setTime(""); };
  const dep = look ? Math.min(deposit, look.price) : deposit;

  async function pay() {
    setBusy(true); setErr("");
    try {
      const body = new FormData();
      (Object.entries({ slug, date, time, ...f }) as [string, string][]).forEach(([k, v]) => body.append(k, v));
      if (insp) body.append("inspiration", insp);
      const res = await fetch("/api/bookings", { method: "POST", body });
      const j = await res.json();
      if (j.ok) { window.location.href = j.url; return; }
      setErr(j.error || "Something went wrong."); if (res.status === 409) { setStep(1); setTime(""); setTick((t) => t + 1); }
    } catch { setErr("We couldn’t reach the server. Please try again."); }
    setBusy(false);
  }
  const valid = f.name.trim() && f.phone.trim() && /^\S+@\S+\.\S+$/.test(f.email) && f.occasion.trim();

  return (
    <div className="card !p-6 sm:!p-8">
      <ol className="mb-6 flex gap-2 text-center text-sm">
        {["Date & time", "Your details", "Deposit"].map((t, i) => (
          <li key={t} className={`flex-1 border-b-[3px] pb-2 ${step === i + 1 ? "border-rose font-semibold text-rose" : "border-champagne text-muted"}`}>{t}</li>))}
      </ol>
      {err && <p role="alert" className="mb-4 font-semibold text-rose">{err}</p>}

      {step === 1 && (
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="look">Makeup look</label>
          <select id="look" value={slug} onChange={(e) => { setSlug(e.target.value); setDate(""); setTime(""); }} className={input + " max-w-sm"}>
            <option value="">Choose a look</option>{looks.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}</select>
          {look && <p className="mt-2 text-muted"><b className="font-serif text-2xl text-rose">{naira(look.price)}</b> · about {duration(look.minutes)} · deposit {naira(dep)}</p>}
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="rounded-[18px] border border-champagne bg-ivory p-4">
              <div className="mb-2 flex items-center justify-between font-semibold">
                <button type="button" aria-label="Previous month" disabled={isCurrent} onClick={() => move(-1)} className="h-10 w-10 rounded-full border border-champagne bg-white text-xl text-rose disabled:opacity-40">‹</button>
                <span>{new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
                <button type="button" aria-label="Next month" onClick={() => move(1)} className="h-10 w-10 rounded-full border border-champagne bg-white text-xl text-rose">›</button></div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {"SMTWTFS".split("").map((d, i) => <span key={i} className="py-1 text-xs text-muted">{d}</span>)}
                {Array.from({ length: lead }, (_, i) => <div key={"b" + i} />)}
                {Array.from({ length: days }, (_, i) => { const d = `${ym}-${pad(i + 1)}`, ok = !!slots[d];
                  return <button key={d} type="button" disabled={!slug || !ok} onClick={() => { setDate(d); setTime(""); }} aria-pressed={date === d}
                    className={`aspect-square min-h-[38px] rounded-full text-sm font-medium ${date === d ? "bg-blush font-bold" : "hover:bg-baby"} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}>{i + 1}</button>; })}
              </div>
              {!slug && <p className="mt-3 text-sm text-muted">Choose a look to see available dates.</p>}
            </div>
            <div>
              <h3 className="mb-2 text-xl !text-brown">Choose a time</h3>
              <div className="flex flex-wrap gap-2.5">
                {(slots[date] ?? []).map((t) => <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)}
                  className={`rounded-full border-[1.5px] px-4 py-2.5 text-sm font-medium ${time === t ? "border-blush bg-blush font-semibold" : "border-champagne bg-white hover:border-blush"}`}>{label(t)}</button>)}
              </div>
              {!date && <p className="mt-2 text-sm text-muted">Choose a date to see times.</p>}
            </div>
          </div>
          <button type="button" disabled={!(look && date && time)} onClick={() => setStep(2)} className="btn btn-primary mt-6 disabled:cursor-not-allowed disabled:bg-champagne disabled:text-muted">Continue</button>
        </div>)}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
          <div className="grid gap-4 md:grid-cols-2">
            {([["name", "Full name", "name"], ["phone", "Phone number", "tel"], ["email", "Email address", "email"], ["occasion", "Occasion", "text"]] as const).map(([k, l, t]) => (
              <div key={k}><label className="mb-1 block text-sm font-semibold" htmlFor={k}>{l}</label>
                <input id={k} type={t === "name" ? "text" : t} required autoComplete={k === "occasion" ? "off" : k === "phone" ? "tel" : k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={input} /></div>))}
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-semibold" htmlFor="notes">Additional notes (optional)</label>
              <textarea id="notes" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className={input} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-semibold" htmlFor="insp">Inspiration photo (optional)</label>
              <input id="insp" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) { setInsp(null); return; } try { setInsp(await shrink(file, 1200)); } catch { setErr("That photo couldn’t be read."); } }} />
              {insp && <p className="mt-1 text-sm text-muted">Photo added. Your makeup artist will see it.</p>}</div>
          </div>
          <div className="mt-6 flex gap-3"><button type="button" onClick={() => setStep(1)} className="btn btn-quiet">Back</button><button disabled={!valid} className="btn btn-primary disabled:bg-champagne disabled:text-muted">Continue</button></div>
        </form>)}

      {step === 3 && look && (
        <div>
          <h3 className="text-2xl">Your booking summary</h3>
          <dl className="mt-3">
            {([["Look", look.name], ["Date", new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })], ["Time", label(time)], ["Name", f.name], ["Phone", f.phone], ["Email", f.email], ["Occasion", f.occasion], ["Total price", naira(look.price)], ["Deposit due now", naira(dep)], ["Balance on the day", naira(Math.max(look.price - dep, 0))]] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-champagne py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>))}
          </dl>
          <p className="mt-3 text-sm text-muted">You’ll pay securely on Paystack. Your time is held for 15 minutes, and your booking is only confirmed once the deposit is paid.</p>
          <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1.5" /><span>I’ve read the <a href="/policies" target="_blank" className="text-rose underline">booking policy</a> and <a href="/privacy" target="_blank" className="text-rose underline">privacy policy</a>.</span></label>
          <div className="mt-5 flex gap-3"><button type="button" onClick={() => setStep(2)} className="btn btn-quiet">Back</button>
            <button type="button" disabled={busy || !agree} onClick={pay} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">{busy ? "One moment…" : `Pay ${naira(dep)} deposit`}</button></div>
        </div>)}
    </div>
  );
}
