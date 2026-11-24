"use client";
import { useEffect, useRef, useState } from "react";
import { FEATURES, SKIN_FEEL, type Assessment, type FeatureKey } from "@/lib/features";

type Slot = "front" | "left" | "right";
const SLOTS: { key: Slot; title: string; hint: string; guide: string }[] = [
  { key: "front", title: "Front-facing", hint: "Look straight at the camera", guide: "M40 16a22 30 0 1 0 .01 0zM30 42h6M44 42h6M40 50v8M34 68q6 4 12 0" },
  { key: "left", title: "Left profile (optional)", hint: "Turn so your left side faces the camera", guide: "M52 16C34 16 30 34 32 48L24 58l8 3c0 14 8 22 20 20 12-3 14-36 0-65zM40 40h5" },
  { key: "right", title: "Right profile (optional)", hint: "Turn so your right side faces the camera", guide: "M28 16c18 0 22 18 20 32l8 10-8 3c0 14-8 22-20 20-12-3-14-36 0-65zM35 40h5" },
];
const LINES = ["Looking at your face shape…", "Noticing your eye shape…", "Finding what suits your cheekbones…"];

/* Shrinks the photo and removes hidden data such as location (redrawing on a canvas drops EXIF). */
async function shrink(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob = await new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no()), "image/jpeg", 0.82));
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export default function AssistantFlow() {
  const [files, setFiles] = useState<Partial<Record<Slot, File>>>({});
  const [consent, setConsent] = useState(false);
  const [keep, setKeep] = useState(false);
  const [phase, setPhase] = useState<"upload" | "loading" | "results">("upload");
  const [error, setError] = useState("");
  const [line, setLine] = useState(0);
  const [result, setResult] = useState<Assessment | null>(null);
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const [skinFeel, setSkinFeel] = useState("Not sure");
  const [saved, setSaved] = useState<{ id: string; token: string } | null>(null);
  const urls = useRef<Partial<Record<Slot, string>>>({});

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setInterval(() => setLine((n) => (n + 1) % LINES.length), 1400);
    return () => clearInterval(t);
  }, [phase]);

  async function pick(slot: Slot, f?: File) {
    if (!f) return;
    setError("");
    try {
      const small = await shrink(f);
      if (urls.current[slot]) URL.revokeObjectURL(urls.current[slot]!);
      urls.current[slot] = URL.createObjectURL(small);
      setFiles((p) => ({ ...p, [slot]: small }));
    } catch { setError("That file couldn’t be read. Please try a JPG or PNG photo."); }
  }
  function remove(slot: Slot) {
    if (urls.current[slot]) URL.revokeObjectURL(urls.current[slot]!);
    delete urls.current[slot];
    setFiles((p) => { const n = { ...p }; delete n[slot]; return n; });
  }
  function reset(message = "") {
    (Object.keys(files) as Slot[]).forEach(remove);
    setResult(null); setEdited({}); setSaved(null); setSkinFeel("Not sure"); setPhase("upload"); setError(message);
  }

  async function submit() {
    setError(""); setPhase("loading");
    const body = new FormData();
    (Object.keys(files) as Slot[]).forEach((k) => body.append(k, files[k]!));
    body.append("consent", "yes"); if (keep) body.append("keep", "yes");
    try {
      const res = await fetch("/api/assess", { method: "POST", body });
      const data = await res.json();
      if (!data.ok) { setPhase("upload"); setError(data.error || "Something went wrong. Please try again."); return; }
      setResult(data.assessment);
      setSaved(data.assessmentId ? { id: data.assessmentId, token: data.deleteToken } : null);
      if (!keep) (Object.keys(files) as Slot[]).forEach(remove); /* not kept: clear from this device too */
      setPhase("results");
    } catch { setPhase("upload"); setError("We couldn’t reach the server. Please check your connection and try again."); }
  }
  async function wipe() {
    if (saved) await fetch(`/api/assess/${saved.id}`, { method: "DELETE", headers: { "x-delete-token": saved.token } }).catch(() => {});
    reset("Your photos have been deleted.");
  }
  function change(key: FeatureKey, value: string) {
    setResult((r) => r && { ...r, features: { ...r.features, [key]: { ...r.features[key], value, confidence: "high", note: "" } } });
    setEdited((e) => ({ ...e, [key]: true }));
  }

  const ready = !!files.front && consent;
  return (
    <div className="card mt-8 !p-6 sm:!p-8">
      {error && <p role="alert" className="mb-4 font-semibold text-rose">{error}</p>}

      {phase === "upload" && (
        <div>
          <div className="rounded-[18px] bg-baby p-5">
            <h3 className="text-xl">For the best results</h3>
            <ul className="mt-2 grid gap-1 text-sm">
              {["Face the camera directly.", "Use natural or bright lighting.", "Avoid beauty filters.", "Keep hair away from your face.", "Avoid heavy makeup for the assessment."].map((t) => (
                <li key={t}><span className="mr-2 font-bold text-rose">✓</span>{t}</li>))}
            </ul>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {SLOTS.map((s) => (
              <div key={s.key} className="flex flex-col items-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-champagne p-3.5 text-center">
                <b className="font-semibold">{s.title}</b>
                <div className="grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-xl bg-ivory">
                  {urls.current[s.key] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urls.current[s.key]} alt={`Your ${s.key} photo`} className="h-full w-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 80 100" aria-hidden className="w-[55%] fill-none stroke-rose" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.guide} /></svg>)}
                </div>
                <p className="text-sm text-muted">{s.hint}</p>
                <label className="btn btn-quiet cursor-pointer !px-5 !py-2 text-sm focus-within:outline focus-within:outline-[3px] focus-within:outline-rose">
                  {files[s.key] ? "Replace" : "Add photo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { pick(s.key, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {files[s.key] && <button type="button" onClick={() => remove(s.key)} className="text-sm text-rose underline underline-offset-4">Remove</button>}
              </div>))}
          </div>
          <p className="mt-3 text-sm text-muted">A front photo is needed. Side profiles help me judge your jawline and cheekbones more reliably.</p>

          <div className="mt-6 rounded-[18px] border border-champagne bg-ivory p-5 text-sm">
            <h3 className="text-xl">Your privacy</h3>
            <p className="mt-2"><b>Why I ask for photos:</b> so I can notice your features and suggest makeup that suits you.</p>
            <p className="mt-2"><b>How they’re processed:</b> your photos are sent securely to an AI service provider, analysed once, and used only to create your suggestions. They are never sold or used to train models by us.</p>
            <p className="mt-2"><b>Storage:</b> by default your photos are <b>not stored</b>. They are discarded as soon as your results are ready.</p>
            <label className="mt-3 flex items-start gap-3"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="mt-1.5" />
              <span>Optional: keep my photos privately so my makeup artist can look at them before my appointment, until I ask for them to be deleted.</span></label>
            <p className="mt-3 text-muted">You can delete saved photos any time from your results, or by emailing <a className="text-rose underline" href="mailto:hello@yourstudio.com?subject=Please%20delete%20my%20photos">hello@yourstudio.com</a>.</p>
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5" />
            <span>I agree to my photos being analysed as described above.</span></label>
          <button type="button" disabled={!ready} onClick={submit} className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:bg-champagne disabled:text-muted">Discover My Look</button>
        </div>)}

      {phase === "loading" && (
        <div role="status" className="py-8 text-center">
          <div className="mx-auto mb-6 h-20 w-20 animate-spin rounded-full border-[3px] border-baby border-t-rose motion-reduce:animate-none" />
          <h3 className="text-2xl">Getting to Know Your Features…</h3>
          <p className="mt-2 text-muted">{LINES[line]}</p>
        </div>)}

      {phase === "results" && result && (
        <div>
          <h3 className="text-2xl">Here’s what I noticed</h3>
          <p className="mt-1 text-muted">These are estimates and may not be perfect. If something doesn’t look right, change it.</p>
          {result.photoNote && <p className="mt-2 text-sm text-muted">{result.photoNote}</p>}
          <div className="mt-3">
            {FEATURES.map((f) => {
              const r = result.features[f.key];
              const unsure = r.confidence === "low" && !edited[f.key];
              return (
                <div key={f.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-champagne py-3.5">
                  <div className="max-w-md"><b className="block font-semibold">{f.label}</b>
                    <span className={`block text-sm ${unsure ? "text-rose" : "text-muted"}`}>
                      {edited[f.key] ? "Updated by you. Thank you!" : unsure ? (r.note || "I’m not very sure about this one.") : r.confidence === "high" ? "Fairly sure." : "Moderately sure."}</span></div>
                  <select aria-label={f.label} value={r.value} onChange={(e) => change(f.key, e.target.value)} className="min-w-[170px] rounded-[14px] border-[1.5px] border-champagne bg-white px-3.5 py-2.5">
                    {r.value === "Unclear" && <option value="Unclear">Choose…</option>}
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>);
            })}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-champagne py-3.5">
              <div className="max-w-md"><b className="block font-semibold">How your skin feels</b>
                <span className="block text-sm text-muted">{result.skinObservations || "Lighting makes skin hard to judge from a photo."} I can’t tell your skin type from photos, so you know best.</span></div>
              <select aria-label="How your skin feels" value={skinFeel} onChange={(e) => setSkinFeel(e.target.value)} className="min-w-[170px] rounded-[14px] border-[1.5px] border-champagne bg-white px-3.5 py-2.5">
                {SKIN_FEEL.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => reset()} className="btn btn-quiet">Start over</button>
            {saved && <button type="button" onClick={wipe} className="px-2 py-3 text-rose underline underline-offset-4">Delete my saved photos</button>}
          </div>
          <p className="mt-4 text-sm text-muted">{saved ? "Your photos are saved privately for your makeup artist." : "Your photos were not stored."}</p>
        </div>)}
    </div>
  );
}
