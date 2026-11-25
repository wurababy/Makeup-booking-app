import Link from "next/link";
import { notFound } from "next/navigation";
import Photo from "@/components/Photo";
import { naira, duration } from "@/data/looks";
import { getCatalog } from "@/lib/server/looks";

export const revalidate = 60;

export default async function LookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { looks } = await getCatalog();
  const look = looks.find((l) => l.slug === slug);
  if (!look) notFound();
  return (
    <main className="py-10 lg:py-16">
      <div className="wrap">
        <Link href="/studio#looks" className="text-rose underline underline-offset-4">← Back to all looks</Link>
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
          <Photo src={look.photo ?? `/images/${look.slug}.jpg`} alt={`${look.name} makeup look`} className="aspect-[4/5] w-full" />
          <div>
            <p className="text-sm text-muted">{look.category}</p>
            <h1 className="text-4xl lg:text-5xl">{look.name}</h1>
            <p className="mt-4">{look.description}</p>
            <p className="mt-2 text-muted">Includes skin prep, full makeup application, lashes and a finishing setting spray.</p>
            <p className="mt-4 font-serif text-4xl font-semibold text-rose">{naira(look.price)}</p>
            <p className="text-sm text-muted">About {duration(look.minutes)}</p>
            <Link href={`/book?look=${look.slug}`} className="btn btn-primary mt-6">Book This Look</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
