"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, saveProfile } from "@/app/onboarding/actions";
import { CURRENCIES, TIMEZONES, validatePrefs, validateProfile, type BookingPrefs, type ProfileInput } from "@/lib/profile";
import { shrink } from "@/lib/shrink";
import { supabaseBrowser } from "@/lib/supabase/browser";

const input = "w-full rounded-[14px] border-[1.5px] border-champagne bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-4 focus:ring-baby";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STEPS = ["Your business", "Contact details", "Booking preferences"];

function F({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (<label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span>{children}
    {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}{error && <span role="alert" className="mt-1 block text-sm font-semibold text-rose">{error}</span>}</label>);
}

export default function ArtistForm({ mode, userId, initial, prefs }: { mode: "onboarding" | "settings"; userId: string; initial: ProfileInput; prefs: BookingPrefs }) {
  const router = useRouter();
  const [p, setP] = useState(initial), [b, setB] = useState(prefs), [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({}), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const show = (i: number) => mode === "settings" || step === i;
  const set = (k: keyof ProfileInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setP({ ...p, [k]: e.target.value });

  async function logo(file?: File) {
    if (!file) return;
    setMsg("");
    try {
      const small = await shrink(file, 512), sb = supabaseBrowser(), path = `${userId}/logo-${Date.now()}.jpg`;
      const up = await sb.storage.from("artist-assets").upload(path, small, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      setP((x) => ({ ...x, logo_url: sb.storage.from("artist-assets").getPublicUrl(path).data.publicUrl }));
    } catch { setMsg("We couldn’t upload that photo. Please try a JPG or PNG under 3 MB."); }
  }
  async function save(o: { withPrefs?: boolean; complete?: boolean }) {
    setMsg(""); const v = validateProfile(p);
    if (!v.ok) { setErrors(v.errors); setMsg("Please check the highlighted fields."); return false; }
    if (o.withPrefs) { const vp = validatePrefs(b); if (!vp.ok) { setErrors(vp.errors); setMsg("Please check the highlighted fields."); return false; } }
    setErrors({}); setBusy(true);
    const r = await saveProfile({ profile: p, prefs: o.withPrefs ? b : undefined, complete: o.complete });
    setBusy(false);
    if (!r.ok) { setErrors(r.errors ?? {}); setMsg(r.error ?? "Please check the highlighted fields."); return false; }
    return true;
  }
  async function next() { if (await save({})) setStep(step + 1); }
  async function finish() { if (await save({ withPrefs: true, complete: true })) { router.push("/dashboard"); router.refresh(); } }
  async function skipAll() { setBusy(true); const r = await completeOnboarding(); setBusy(false); if (r.ok) { router.push("/dashboard"); router.refresh(); } else setMsg(r.error ?? "Couldn’t continue."); }
  async function saveSettings() { if (await save({ withPrefs: true })) { setMsg("Saved."); router.refresh(); } }

  return (
    <div className="card !p-6 sm:!p-8">
      {mode === "onboarding" && (<ol className="mb-6 flex gap-2 text-center text-sm">{STEPS.map((t, i) => (<li key={t} className={`flex-1 border-b-[3px] pb-2 ${step === i ? "border-rose font-semibold text-rose" : i < step ? "border-blush text-brown" : "border-champagne text-muted"}`}>{t}</li>))}</ol>)}
      <div className="space-y-5">
        {show(0) && (<>
          {mode === "settings" && <h2 className="text-2xl">Your business</h2>}
          <F label="Business or makeup brand name *" error={errors.business_name}><input className={input} value={p.business_name} onChange={set("business_name")} autoComplete="organization" /></F>
          <F label="Your name *" error={errors.artist_name}><input className={input} value={p.artist_name} onChange={set("artist_name")} autoComplete="name" /></F>
          <F label="About your business (optional)" error={errors.description} hint="A short, welcoming introduction for clients."><textarea className={input} rows={4} maxLength={500} value={p.description} onChange={set("description")} /></F>
          <div><span className="mb-1 block text-sm font-semibold">Profile photo or logo (optional)</span>
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-baby text-xs text-muted">{p.logo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.logo_url} alt="Your logo" className="h-full w-full object-cover" /> : "No photo"}</div>
              <div><input type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" onChange={(e) => logo(e.target.files?.[0])} />
                {p.logo_url && <button type="button" onClick={() => setP({ ...p, logo_url: "" })} className="mt-1 block text-sm text-rose underline">Remove</button>}</div></div></div>
          <F label="Business location (optional)" error={errors.location} hint="For example: Lekki, Lagos"><input className={input} value={p.location} onChange={set("location")} /></F>
        </>)}
        {show(1) && (<>
          {mode === "settings" && <h2 className="mt-4 text-2xl">Contact details</h2>}
          <p className="text-sm text-muted">All optional. You can add these later.</p>
          <F label="Phone number" error={errors.phone}><input className={input} type="tel" autoComplete="tel" value={p.phone} onChange={set("phone")} /></F>
          <F label="WhatsApp number" error={errors.whatsapp} hint="International format, for example +234 801 234 5678"><input className={input} type="tel" value={p.whatsapp} onChange={set("whatsapp")} /></F>
          <F label="Instagram username" error={errors.instagram}><input className={input} value={p.instagram} onChange={set("instagram")} placeholder="@yourhandle" /></F>
          <F label="Business email" error={errors.business_email} hint="Shown to clients and used for booking notices."><input className={input} type="email" value={p.business_email} onChange={set("business_email")} /></F>
        </>)}
        {show(2) && (<>
          {mode === "settings" && <h2 className="mt-4 text-2xl">Booking preferences</h2>}
          <p className="text-sm text-muted">Sensible defaults are filled in. You can change these any time.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Currency" error={errors.currency}><select className={input} value={p.currency} onChange={set("currency")}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></F>
            <F label="Time zone" error={errors.timezone}><select className={input} value={p.timezone} onChange={set("timezone")}>{TIMEZONES.map((c) => <option key={c}>{c}</option>)}</select></F>
            <F label="Opening time" error={errors.open_time}><input className={input} type="time" value={b.open_time} onChange={(e) => setB({ ...b, open_time: e.target.value })} /></F>
            <F label="Closing time"><input className={input} type="time" value={b.close_time} onChange={(e) => setB({ ...b, close_time: e.target.value })} /></F>
            <F label="Start times every" error={errors.step_minutes}><select className={input} value={b.step_minutes} onChange={(e) => setB({ ...b, step_minutes: +e.target.value })}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>60 minutes</option></select></F>
            <F label="Buffer between clients (minutes)" error={errors.buffer_minutes}><input className={input} type="number" min={0} max={240} step={5} value={b.buffer_minutes} onChange={(e) => setB({ ...b, buffer_minutes: Math.floor(+e.target.value || 0) })} /></F>
            <F label={`Booking deposit (${p.currency})`} error={errors.deposit} hint="0 means no deposit."><input className={input} type="number" min={0} step={500} value={b.deposit} onChange={(e) => setB({ ...b, deposit: Math.floor(+e.target.value || 0) })} /></F>
          </div>
          <fieldset><legend className="mb-1 text-sm font-semibold">Days you work</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">{DAYS.map((d, i) => (<label key={d} className="flex items-center gap-2"><input type="checkbox" checked={b.work_days.includes(i)} onChange={(e) => setB({ ...b, work_days: e.target.checked ? [...b.work_days, i].sort() : b.work_days.filter((x) => x !== i) })} />{d}</label>))}</div>
            {errors.work_days && <span role="alert" className="mt-1 block text-sm font-semibold text-rose">{errors.work_days}</span>}</fieldset>
        </>)}
      </div>
      {msg && <p role="status" className={`mt-5 font-semibold ${msg === "Saved." ? "text-brown" : "text-rose"}`}>{msg}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {mode === "settings" ? <button type="button" onClick={saveSettings} disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button> : (<>
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} disabled={busy} className="btn btn-quiet">Back</button>}
          {step < 2 && <button type="button" onClick={next} disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? "Saving…" : "Continue"}</button>}
          {step === 2 && <button type="button" onClick={finish} disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? "Saving…" : "Finish setup"}</button>}
          {step === 1 && <button type="button" onClick={() => setStep(2)} className="px-2 py-3 text-rose underline underline-offset-4">Skip for now</button>}
          {step === 2 && <button type="button" onClick={skipAll} disabled={busy} className="px-2 py-3 text-rose underline underline-offset-4">Skip for now</button>}</>)}
      </div>
    </div>
  );
}
