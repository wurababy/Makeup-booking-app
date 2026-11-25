import CopyButton from "@/components/CopyButton";
import Link from "next/link";
import { getArtistContext } from "@/lib/artist";
import { PLATFORM } from "@/config/platform";

export default async function Website() {
  const { artist } = await getArtistContext();
  const link = `${PLATFORM.url}/a/${artist!.slug}`;
  return (
    <div><h1 className="text-4xl">My Booking Website</h1>
      <div className="card mt-6 max-w-2xl"><p className="text-sm text-muted">Your personal link</p><p className="mt-1 break-all font-semibold text-rose">{link}</p>
        <div className="mt-4 flex flex-wrap gap-3"><CopyButton text={link} /><Link href={`/a/${artist!.slug}`} className="btn btn-primary !px-5 !py-2.5 text-sm">View my page</Link></div>
        <p className="mt-4 text-sm text-muted">Your link is reserved and shows your business profile. Online booking, services and portfolio arrive on this page in the next stage of the build.</p></div></div>
  );
}
