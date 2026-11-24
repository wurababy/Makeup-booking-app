"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#looks", label: "Makeup Looks" },
  { href: "/assistant", label: "AI Beauty Assistant" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-champagne bg-ivory/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="wrap relative flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-semibold text-rose">Your Studio Name</Link>
        <nav id="menu" aria-label="Main"
          className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-4 border-b border-champagne bg-ivory px-6 pb-6 pt-2 lg:static lg:flex lg:flex-row lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0`}>
          <ul className="flex flex-col lg:flex-row lg:gap-6">
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-champagne lg:border-0">
                <Link href={l.href} onClick={() => setOpen(false)} className="block py-4 font-medium hover:text-rose lg:py-0 lg:text-[0.95rem]">{l.label}</Link>
              </li>
            ))}
          </ul>
          <Link href="/book" onClick={() => setOpen(false)} className="btn btn-primary lg:px-6 lg:py-2.5">Book Appointment</Link>
        </nav>
        <button type="button" aria-expanded={open} aria-controls="menu" aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full text-2xl text-rose lg:hidden">
          {open ? "×" : "☰"}
        </button>
      </div>
    </header>
  );
}
