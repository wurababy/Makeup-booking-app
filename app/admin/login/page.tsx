"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json().catch(() => ({}));
    if (j.ok) window.location.href = "/admin"; else { setErr(j.error || "Couldn’t sign in."); setBusy(false); }
  }
  const input = "w-full rounded-[14px] border-[1.5px] border-champagne bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-4 focus:ring-baby";
  return (
    <main className="py-16"><form onSubmit={go} className="card mx-auto max-w-sm">
      <h1 className="text-3xl">Welcome back</h1>
      <label className="mb-1 mt-4 block text-sm font-semibold" htmlFor="e">Email</label><input id="e" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      <label className="mb-1 mt-4 block text-sm font-semibold" htmlFor="p">Password</label><input id="p" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
      {err && <p role="alert" className="mt-3 font-semibold text-rose">{err}</p>}
      <button disabled={busy} className="btn btn-primary mt-5 w-full disabled:opacity-60">Sign in</button>
    </form></main>
  );
}
