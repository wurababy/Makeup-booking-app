"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const input = "w-full rounded-[14px] border-[1.5px] border-champagne bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-4 focus:ring-baby";
function Shell({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (<main className="px-6 py-14"><div className="card mx-auto max-w-md !p-7">
    <h1 className="text-3xl">{title}</h1>{sub && <p className="mb-5 mt-2 text-muted">{sub}</p>}{children}</div></main>);
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (<label className="mt-4 block"><span className="mb-1 block text-sm font-semibold">{label}</span>{children}</label>);
const Err = ({ m }: { m: string }) => (m ? <p role="alert" className="mt-4 font-semibold text-rose">{m}</p> : null);
const friendly = (m: string) => /invalid login/i.test(m) ? "That email or password isn’t right." : /not confirmed/i.test(m) ? "Please verify your email first. Check your inbox for our message." : /rate limit|too many/i.test(m) ? "Too many attempts. Please wait a little and try again." : /password/i.test(m) ? m : "Something went wrong. Please try again.";
const origin = () => window.location.origin;

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [note, setNote] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (name.trim().length < 2) return setErr("Please enter your name.");
    if (password.length < 8) return setErr("Your password needs at least 8 characters.");
    setBusy(true);
    const { data, error } = await supabaseBrowser().auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${origin()}/auth/confirm?next=/onboarding` } });
    setBusy(false);
    if (error) return setErr(friendly(error.message));
    if (data.session) return router.push("/onboarding"); /* only when email confirmation is switched off in Supabase */
    setSent(true); /* same message whether or not the address already has an account (no account-guessing) */
  }
  async function resend() {
    const { error } = await supabaseBrowser().auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: `${origin()}/auth/confirm?next=/onboarding` } });
    setNote(error ? friendly(error.message) : "Sent again. Please check your inbox and spam folder.");
  }
  if (sent) return (<Shell title="Check your email" sub={`We’ve sent a verification link to ${email.trim()}. Open it to finish creating your account.`}>
    <button type="button" onClick={resend} className="btn btn-quiet">Send it again</button>{note && <p className="mt-3 text-sm text-muted" role="status">{note}</p>}
    <p className="mt-5 text-sm text-muted">Already verified? <Link href="/login" className="text-rose underline">Sign in</Link></p></Shell>);
  return (<Shell title="Create your account" sub="Start your beautiful booking website.">
    <form onSubmit={go}>
      <Field label="Your name"><input className={input} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Email address"><input className={input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password (8+ characters)"><input className={input} type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <Err m={err} /><button disabled={busy} className="btn btn-primary mt-5 w-full disabled:opacity-60">{busy ? "One moment…" : "Create my account"}</button>
    </form>
    <p className="mt-5 text-sm text-muted">Already have an account? <Link href="/login" className="text-rose underline">Sign in</Link></p></Shell>);
}

export function LoginForm() {
  const router = useRouter(), q = useSearchParams();
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [err, setErr] = useState(q.get("error") === "link" ? "That link has expired or was already used. Please sign in, or request a new link." : "");
  const [busy, setBusy] = useState(false), [unverified, setUnverified] = useState(false), [note, setNote] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setBusy(false); setUnverified(/not confirmed/i.test(error.message)); return setErr(friendly(error.message)); }
    router.push("/dashboard"); router.refresh();
  }
  async function resend() {
    const { error } = await supabaseBrowser().auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: `${origin()}/auth/confirm?next=/onboarding` } });
    setNote(error ? friendly(error.message) : "Verification email sent. Please check your inbox.");
  }
  return (<Shell title="Welcome back" sub="Sign in to your artist dashboard.">
    <form onSubmit={go}>
      <Field label="Email address"><input className={input} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input className={input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <Err m={err} />
      {unverified && <button type="button" onClick={resend} className="mt-2 text-sm text-rose underline">Resend verification email</button>}{note && <p className="mt-2 text-sm text-muted" role="status">{note}</p>}
      <button disabled={busy} className="btn btn-primary mt-5 w-full disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="mt-5 text-sm"><Link href="/forgot-password" className="text-rose underline">Forgot your password?</Link></p>
    <p className="mt-2 text-sm text-muted">New here? <Link href="/signup" className="text-rose underline">Create an account</Link></p></Shell>);
}

export function ForgotForm() {
  const [email, setEmail] = useState(""), [sent, setSent] = useState(false), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin()}/auth/confirm?next=/reset-password` });
    setBusy(false); setSent(true); /* same message whether or not the email has an account */
  }
  if (sent) return (<Shell title="Check your email" sub="If that address has an account, we’ve sent a link to choose a new password."><Link href="/login" className="btn btn-quiet">Back to sign in</Link></Shell>);
  return (<Shell title="Reset your password" sub="Enter your email and we’ll send you a reset link.">
    <form onSubmit={go}><Field label="Email address"><input className={input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <button disabled={busy} className="btn btn-primary mt-5 w-full disabled:opacity-60">{busy ? "Sending…" : "Send reset link"}</button></form>
    <p className="mt-5 text-sm"><Link href="/login" className="text-rose underline">Back to sign in</Link></p></Shell>);
}

export function ResetForm() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null), [pw, setPw] = useState(""), [pw2, setPw2] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { supabaseBrowser().auth.getUser().then(({ data }) => setReady(!!data.user)); }, []);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (pw.length < 8) return setErr("Your password needs at least 8 characters.");
    if (pw !== pw2) return setErr("The two passwords don’t match.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    if (error) { setBusy(false); return setErr(friendly(error.message)); }
    router.push("/dashboard"); router.refresh();
  }
  if (ready === false) return (<Shell title="Link expired" sub="This reset link has expired or was already used."><Link href="/forgot-password" className="btn btn-primary">Request a new link</Link></Shell>);
  return (<Shell title="Choose a new password">
    <form onSubmit={go}>
      <Field label="New password (8+ characters)"><input className={input} type="password" autoComplete="new-password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <Field label="Confirm new password"><input className={input} type="password" autoComplete="new-password" required value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
      <Err m={err} /><button disabled={busy || ready === null} className="btn btn-primary mt-5 w-full disabled:opacity-60">{busy ? "Saving…" : "Save password"}</button></form></Shell>);
}
