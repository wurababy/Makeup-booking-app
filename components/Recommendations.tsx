import Link from "next/link";
import Photo from "./Photo";
import { duration, naira } from "@/data/looks";
import type { RecCard } from "@/lib/recommend";

export default function Recommendations({ recs }: { recs: RecCard[] }) {
  return (
    <section id="recs" className="mt-10 border-t border-champagne pt-8">
      <h2 className="text-3xl lg:text-4xl">These Looks Might Be Perfect for You.</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {recs.map((r) => (
          <article key={r.slug} className="card flex flex-col gap-1.5 !p-2.5 !pb-5">
            <Photo src={r.photo ?? `/images/${r.slug}.jpg`} alt={`${r.name} makeup look`} className="aspect-[3/4]" />
            <h3 className="mt-2 px-2 text-2xl !text-brown">{r.name}</h3>
            <p className="px-2 text-sm text-muted">{r.description}</p>
            <p className="px-2 text-sm"><b className="text-rose">Why this look:</b> {r.why}</p>
            <p className="px-2 font-serif text-2xl font-semibold text-rose">{naira(r.price)} <span className="font-sans text-sm font-normal text-muted">· about {duration(r.minutes)}</span></p>
            <Link href={`/book?look=${r.slug}`} className="btn btn-primary mx-2 mt-2 self-start !px-5 !py-2.5 text-sm">Select This Look</Link>
          </article>))}
      </div>
    </section>
  );
}
