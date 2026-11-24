"use client";
import Link from "next/link";
import { useState } from "react";
import { naira, duration, type Look } from "@/data/looks";
import Photo from "./Photo";

export default function Gallery({ looks, categories }: { looks: Look[]; categories: string[] }) {
  const [cat, setCat] = useState<string>("All Looks");
  const shown = cat === "All Looks" ? looks : looks.filter((l) => l.category === cat);
  return (
    <div>
      <div role="group" aria-label="Filter looks" className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2 lg:flex-wrap">
        {["All Looks", ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}
            className={`shrink-0 whitespace-nowrap rounded-full border min-h-11 px-5 py-2.5 text-sm font-medium transition-colors ${cat === c ? "border-blush bg-blush font-semibold" : "border-champagne bg-white hover:border-blush"}`}>
            {c}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="mt-6 text-muted">No looks in this category yet.</p>}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((l) => (
          <article key={l.slug} className="card flex flex-col gap-1.5 !p-2.5 !pb-5">
            <Link href={`/looks/${l.slug}`} aria-label={`View ${l.name}`}>
              <Photo src={l.photo ?? `/images/${l.slug}.jpg`} alt={`${l.name} makeup look`} className="aspect-[3/4]" />
            </Link>
            <h3 className="mt-2 px-2 text-2xl !text-brown">{l.name}</h3>
            <p className="px-2 text-sm text-muted">{l.description}</p>
            <p className="px-2 font-serif text-2xl font-semibold text-rose">{naira(l.price)} <span className="font-sans text-sm font-normal text-muted">· {duration(l.minutes)}</span></p>
            <Link href={`/looks/${l.slug}`} className="btn btn-primary mx-2 mt-2 self-start !px-5 !py-2.5 text-sm">Choose This Look</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
