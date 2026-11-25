"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PLATFORM } from "@/config/platform";

const LINKS = [["How it works", "/#how"], ["Features", "/#features"], ["Plans", "/#plans"], ["FAQ", "/#faq"]];

export default function PlatformNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-champagne bg-ivory/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="wrap relative flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-semibold text-rose">{PLATFORM.name}</Link>
        <nav id="pmenu" aria-label="Main" className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-3 border-b border-champagne bg-ivory px-6 pb-6 pt-2 lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0`}>
          <ul className="flex flex-col lg:flex-row lg:gap-6">{LINKS.map(([l, h]) => (<li key={h} className="border-b border-champagne lg:border-0"><Link href={h} onClick={() => setOpen(false)} className="block py-4 font-medium hover:text-rose lg:py-0 lg:text-[0.95rem]">{l}</Link></li>))}</ul>
          <Link href="/login" onClick={() => setOpen(false)} className="btn btn-quiet lg:!px-5 lg:!py-2.5">Artist Login</Link>
          <Link href="/signup" onClick={() => setOpen(false)} className="btn btn-primary lg:!px-5 lg:!py-2.5">Sign Up</Link>
        </nav>
        <button type="button" aria-expanded={open} aria-controls="pmenu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full text-2xl text-rose lg:hidden">{open ? "×" : "☰"}</button>
      </div>
    </header>
  );
}
