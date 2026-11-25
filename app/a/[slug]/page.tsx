import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/server/supabase";
import { PLATFORM } from "@/config/platform";

export const dynamic = "force-dynamic";
const load = async (slug: string) => {
  const sb = db();
  if (!sb || !/^[a-z0-9-]{2,48}$/.test(slug)) return null;
  /* Only public fields are selected, and only for active, set-up artists. */
  const { data } = await sb.from("artists").select("business_name,artist_name,description,logo_url,location,whatsapp,instagram,business_email").eq("slug", slug).eq("status", "active").eq("onboarding_completed", true).maybeSingle();
  return data;
};
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await load((await params).slug);
  return { title: a ? a.business_name : "Not found", robots: { index: false } };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await load((await params).slug);
  if (!a) notFound();
  return (
    <main className="px-6 py-14"><div className="mx-auto max-w-xl text-center">
      <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-baby font-serif text-4xl text-rose">{a.logo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.logo_url} alt={`${a.business_name} logo`} className="h-full w-full object-cover" /> : a.business_name.slice(0, 1)}</div>
      <h1 className="mt-5 text-4xl lg:text-5xl">{a.business_name}</h1>
      <p className="mt-1 text-muted">by {a.artist_name}{a.location ? ` · ${a.location}` : ""}</p>
      {a.description && <p className="mx-auto mt-5 max-w-md">{a.description}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {a.whatsapp && <a className="btn btn-primary" href={`https://wa.me/${a.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
        {a.instagram && <a className="btn btn-quiet" href={`https://instagram.com/${a.instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
        {a.business_email && <a className="btn btn-quiet" href={`mailto:${a.business_email}`}>Email</a>}</div>
      <p className="card mt-10 text-sm text-muted">Online booking opens here soon.</p>
      <p className="mt-8 text-xs text-muted">Powered by {PLATFORM.name}</p>
    </div></main>
  );
}
