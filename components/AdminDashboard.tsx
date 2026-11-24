"use client";
import { useCallback, useEffect, useState } from "react";
import { shrink } from "@/lib/shrink";

type Booking = { id: string; ref: string; look_name: string; price: number; deposit: number; start_at: string; status: string; name: string; phone: string; email: string; occasion: string; notes: string | null; balance_paid: boolean };
type LookRow = { id: string; name: string; category: string; description: string; price: number; minutes: number; photo_url: string | null; active: boolean };
type Settings = { open_time: string; close_time: string; step_minutes: number; buffer_minutes: number; work_days: number[]; deposit: number };
type Data = { bookings: Booking[]; looks: LookRow[]; categories: string[]; settings: Settings; blocked: string[]; extra: string[] };

const naira = (n: number) => "₦" + (n || 0).toLocaleString("en-NG");
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });
const nice = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const inp = "w-full rounded-[14px] border-[1.5px] border-champagne bg-white px-3.5 py-2.5";
const small = "btn btn-quiet !px-5 !py-2 text-sm";

export default function AdminDashboard({ email }: { email: string }) {
  const [d, setD] = useState<Data | null>(null);
  const [tab, setTab] = useState<"b" | "t" | "l">("b");
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const r = await fetch("/api/admin/data"); if (r.status === 401) { window.location.href = "/admin/login"; return; }
    const j = await r.json(); if (j.ok) setD(j); else setMsg(j.error || "Couldn’t load.");
  }, []);
  useEffect(() => { load(); }, [load]);
  async function act(body: object) {
    const r = await fetch("/api/admin/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({ ok: false }));
    if (r.status === 401) { window.location.href = "/admin/login"; return false; }
    setMsg(j.ok ? "Saved." : j.error || "Couldn’t save."); if (j.ok) await load(); return !!j.ok;
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin/login"; }
  if (!d) return <main className="wrap py-16">{msg || "Loading…"}</main>;

  const paid = d.bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const deposits = paid.reduce((a, b) => a + b.deposit, 0);
  const outstanding = paid.filter((b) => !b.balance_paid).reduce((a, b) => a + Math.max(b.price - b.deposit, 0), 0);
  const tabBtn = (k: "b" | "t" | "l", t: string) => <button type="button" aria-pressed={tab === k} onClick={() => setTab(k)}
    className={`rounded-full border px-5 py-2.5 text-sm font-medium ${tab === k ? "border-blush bg-blush font-semibold" : "border-champagne bg-white"}`}>{t}</button>;

  return (
    <main className="wrap pb-20 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-baby px-5 py-4">
        <span className="text-sm text-muted" role="status">{msg || `Signed in as ${email}`}</span>
        <button type="button" onClick={logout} className={small}>Sign out</button></div>
      <div className="my-5 flex flex-wrap gap-2.5">{tabBtn("b", "Appointments")}{tabBtn("t", "Dates & times")}{tabBtn("l", "Looks & prices")}</div>

      {tab === "b" && (<div>
        <div className="grid gap-3.5 sm:grid-cols-3">
          {([["Deposits received", naira(deposits)], ["Outstanding balances", naira(outstanding)], ["Confirmed bookings", String(paid.length)]] as const).map(([k, v]) => (
            <div key={k} className="card"><span className="text-sm text-muted">{k}</span><div className="font-serif text-3xl font-semibold text-rose">{v}</div></div>))}</div>
        <div className="mt-5 space-y-3">
          {d.bookings.filter((b) => b.status !== "pending" && b.status !== "expired").length === 0 && <p className="text-muted">No bookings yet. Paid bookings appear here.</p>}
          {d.bookings.filter((b) => b.status !== "pending" && b.status !== "expired").map((b) => {
            const wa = b.phone.replace(/\D/g, "").replace(/^0/, "234");
            return (<details key={b.id} className={`card ${b.status === "cancelled" ? "opacity-60" : ""}`}>
              <summary className="cursor-pointer"><b>{when(b.start_at)}</b> · {b.name}, {b.look_name} <span className="ml-1 rounded-full bg-baby px-2.5 py-0.5 text-xs font-semibold text-rose">{b.status.replace("_", " ")}</span></summary>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <p className="text-sm leading-7"><b>Phone:</b> <a className="text-rose underline" href={`tel:${b.phone}`}>{b.phone}</a> · <a className="text-rose underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${wa}`}>WhatsApp</a><br />
                  <b>Email:</b> <a className="text-rose underline" href={`mailto:${b.email}`}>{b.email}</a><br /><b>Occasion:</b> {b.occasion}<br /><b>Notes:</b> {b.notes || "None"}<br /><b>Reference:</b> {b.ref}</p>
                <div className="text-sm"><p className="leading-7"><b>Total:</b> {naira(b.price)} · <b>Deposit paid:</b> {naira(b.deposit)}<br /><b>Balance:</b> {b.balance_paid ? "Paid" : `${naira(Math.max(b.price - b.deposit, 0))} due`}</p>
                  <label className="mb-1 mt-3 block font-semibold" htmlFor={`s${b.id}`}>Status</label>
                  <select id={`s${b.id}`} value={b.status === "needs_refund" ? "cancelled" : b.status} onChange={(e) => act({ type: "booking", id: b.id, status: e.target.value })} className={inp}>
                    <option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                  {b.status === "needs_refund" && <p className="mt-2 font-semibold text-rose">Payment received but the time was taken. Please refund this client in Paystack.</p>}
                  <label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={b.balance_paid} onChange={(e) => act({ type: "booking", id: b.id, balance_paid: e.target.checked })} />Balance paid</label></div>
              </div></details>); })}
        </div></div>)}

      {tab === "t" && <TimesTab d={d} act={act} />}
      {tab === "l" && <LooksTab d={d} act={act} setMsg={setMsg} reload={load} />}
    </main>
  );
}

function TimesTab({ d, act }: { d: Data; act: (b: object) => Promise<boolean> }) {
  const [s, setS] = useState(d.settings), [blk, setBlk] = useState(""), [ex, setEx] = useState("");
  const list = (kind: "blocked" | "extra", items: string[], val: string, set: (v: string) => void, title: string, help: string, btn: string) => (
    <div className="card"><h3 className="text-xl !text-brown">{title}</h3><p className="text-sm text-muted">{help}</p>
      <div className="mt-2 flex gap-2"><input type="date" value={val} onChange={(e) => set(e.target.value)} className={inp + " !w-auto"} />
        <button type="button" className={small} disabled={!val} onClick={async () => { if (await act({ type: "date", kind, op: "add", day: val })) set(""); }}>{btn}</button></div>
      <ul className="mt-3">{items.length === 0 && <li className="text-sm text-muted">None</li>}{items.map((x) => <li key={x} className="flex items-center justify-between border-b border-champagne py-1.5 text-sm">{nice(x)}
        <button type="button" className="text-rose underline" onClick={() => act({ type: "date", kind, op: "remove", day: x })}>Remove</button></li>)}</ul></div>);
  return (<div className="space-y-5">
    <div className="card"><h3 className="text-xl !text-brown">Appointment times</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div><label className="text-sm font-semibold" htmlFor="o">Opens</label><input id="o" type="time" value={s.open_time} onChange={(e) => setS({ ...s, open_time: e.target.value })} className={inp} /></div>
        <div><label className="text-sm font-semibold" htmlFor="c">Closes</label><input id="c" type="time" value={s.close_time} onChange={(e) => setS({ ...s, close_time: e.target.value })} className={inp} /></div>
        <div><label className="text-sm font-semibold" htmlFor="st">Start times every</label><select id="st" value={s.step_minutes} onChange={(e) => setS({ ...s, step_minutes: +e.target.value })} className={inp}><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>60 min</option></select></div>
        <div><label className="text-sm font-semibold" htmlFor="bf">Buffer between clients (min)</label><input id="bf" type="number" min={0} step={5} value={s.buffer_minutes} onChange={(e) => setS({ ...s, buffer_minutes: +e.target.value })} className={inp} /></div>
        <div><label className="text-sm font-semibold" htmlFor="dp">Deposit (₦)</label><input id="dp" type="number" min={0} step={1000} value={s.deposit} onChange={(e) => setS({ ...s, deposit: +e.target.value })} className={inp} /></div></div>
      <p className="mb-2 mt-4 text-sm font-semibold">Days you work</p>
      <div className="flex flex-wrap gap-4">{DAYS.map((n, i) => <label key={n} className="flex items-center gap-2"><input type="checkbox" checked={s.work_days.includes(i)} onChange={(e) => setS({ ...s, work_days: e.target.checked ? [...s.work_days, i].sort() : s.work_days.filter((x) => x !== i) })} />{n}</label>)}</div>
      <button type="button" className="btn btn-primary mt-5" onClick={() => act({ type: "settings", ...s })}>Save times</button></div>
    <div className="grid gap-5 md:grid-cols-2">
      {list("blocked", d.blocked, blk, setBlk, "Block dates", "Clients can’t book these days.", "Block")}
      {list("extra", d.extra, ex, setEx, "Add available dates", "Open a day you don’t normally work.", "Add")}</div></div>);
}

function LooksTab({ d, act, setMsg, reload }: { d: Data; act: (b: object) => Promise<boolean>; setMsg: (m: string) => void; reload: () => Promise<void> }) {
  const [cat, setCat] = useState("");
  return (<div>
    <div className="card"><h3 className="text-xl !text-brown">Categories</h3>
      <div className="mt-3 flex flex-wrap gap-2">{d.categories.map((c) => <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-champagne bg-white py-1.5 pl-3.5 pr-2 text-sm">{c}
        <button type="button" aria-label={`Remove ${c}`} className="text-lg text-rose" onClick={() => act({ type: "category", op: "remove", name: c })}>×</button></span>)}</div>
      <div className="mt-3 flex gap-2"><input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="New category" className={inp + " !w-auto"} />
        <button type="button" className={small} disabled={!cat.trim()} onClick={async () => { if (await act({ type: "category", op: "add", name: cat })) setCat(""); }}>Add category</button></div></div>
    {d.looks.length === 0 && <div className="card mt-5"><p>No looks yet. Import the starter looks to begin, then edit them, or add your own.</p>
      <button type="button" className="btn btn-primary mt-3" onClick={() => act({ type: "seed" })}>Import starter looks</button></div>}
    <div className="mt-5 space-y-4">{d.looks.map((l) => <LookEditor key={l.id} l={l} cats={d.categories} act={act} setMsg={setMsg} reload={reload} />)}</div>
    {d.categories.length > 0 && <button type="button" className="btn btn-primary mt-5" onClick={() => act({ type: "look", name: "New look", category: d.categories[0], description: "", price: 0, minutes: 60, active: false })}>Add a look</button>}
  </div>);
}

function LookEditor({ l, cats, act, setMsg, reload }: { l: LookRow; cats: string[]; act: (b: object) => Promise<boolean>; setMsg: (m: string) => void; reload: () => Promise<void> }) {
  const [v, setV] = useState(l);
  async function photo(f?: File) {
    if (!f) return;
    try {
      const body = new FormData(); body.append("id", l.id); body.append("file", await shrink(f));
      const r = await fetch("/api/admin/photo", { method: "POST", body }); const j = await r.json();
      setMsg(j.ok ? "Photo saved." : j.error || "Upload failed."); if (j.ok) await reload();
    } catch { setMsg("That photo couldn’t be read."); }
  }
  return (<div className="card grid gap-4 sm:grid-cols-[120px_1fr]">
    <div className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-xl bg-baby text-xs text-muted">{l.photo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : "No photo"}</div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label className="text-sm font-semibold">Name</label><input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inp} /></div>
      <div><label className="text-sm font-semibold">Category</label><select value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} className={inp}>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label className="text-sm font-semibold">Price (₦)</label><input type="number" min={0} step={1000} value={v.price} onChange={(e) => setV({ ...v, price: +e.target.value })} className={inp} /></div>
      <div><label className="text-sm font-semibold">Duration (minutes)</label><input type="number" min={15} step={15} value={v.minutes} onChange={(e) => setV({ ...v, minutes: +e.target.value })} className={inp} /></div>
      <div className="sm:col-span-2"><label className="text-sm font-semibold">Description</label><input value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} className={inp} /></div>
      <div><label className="text-sm font-semibold">Photo</label><input type="file" accept="image/*" onChange={(e) => photo(e.target.files?.[0])} className="text-sm" /></div>
      <label className="flex items-center gap-2 self-end"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} />Show on website</label>
      <div className="flex gap-3 sm:col-span-2"><button type="button" className="btn btn-primary !py-2.5 text-sm" onClick={() => act({ type: "look", id: l.id, name: v.name, category: v.category, description: v.description, price: v.price, minutes: v.minutes, active: v.active })}>Save</button>
        <button type="button" className="text-rose underline" onClick={() => confirm(`Remove ${l.name}?`) && act({ type: "lookDelete", id: l.id })}>Remove this look</button></div>
    </div></div>);
}
