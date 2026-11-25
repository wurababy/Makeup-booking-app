"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const ITEMS = [["Overview", "/dashboard"], ["My Booking Website", "/dashboard/website"], ["Makeup Services", "/dashboard/services"], ["Portfolio", "/dashboard/portfolio"], ["Appointments", "/dashboard/appointments"], ["Availability", "/dashboard/availability"], ["AI Beauty Assistant", "/dashboard/assistant"], ["Settings", "/dashboard/settings"]];

export default function DashNav({ name, logo }: { name: string; logo: string | null }) {
  const path = usePathname(), router = useRouter(), [open, setOpen] = useState(false);
  async function out() { await supabaseBrowser().auth.signOut(); router.push("/"); router.refresh(); }
  return (
    <aside className="sticky top-0 z-40 border-b border-champagne bg-white pt-[env(safe-area-inset-top)] lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-baby text-sm text-rose">{logo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logo} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}</span>
          <span className="truncate font-serif text-xl font-semibold text-rose">{name}</span></div>
        <button type="button" aria-expanded={open} aria-controls="dnav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full text-2xl text-rose lg:hidden">{open ? "×" : "☰"}</button>
      </div>
      <nav id="dnav" aria-label="Dashboard" className={`${open ? "block" : "hidden"} px-3 pb-5 lg:block`}>
        <ul>{ITEMS.map(([l, h]) => { const on = h === "/dashboard" ? path === h : path.startsWith(h); return (
          <li key={h}><Link href={h} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} className={`block rounded-xl px-4 py-3 font-medium ${on ? "bg-baby text-rose" : "hover:bg-ivory"}`}>{l}</Link></li>); })}</ul>
        <button type="button" onClick={out} className="mt-3 w-full rounded-xl px-4 py-3 text-left font-medium text-muted hover:bg-ivory">Sign out</button>
      </nav>
    </aside>
  );
}
