import { redirect } from "next/navigation";
import ArtistForm from "@/components/ArtistForm";
import { getArtistContext, getPrefs, toProfile } from "@/lib/artist";
import { EMPTY_PROFILE } from "@/lib/profile";
import { PLATFORM } from "@/config/platform";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set up your studio", robots: { index: false } };

export default async function Onboarding() {
  const { user, artist } = await getArtistContext();
  if (!user) redirect("/login");
  if (artist?.onboarding_completed) redirect("/dashboard");
  const initial = artist ? toProfile(artist) : { ...EMPTY_PROFILE, artist_name: String(user.user_metadata?.full_name ?? "") };
  return (
    <main className="px-6 py-10 lg:py-14"><div className="mx-auto max-w-2xl">
      <p className="font-serif text-2xl font-semibold text-rose">{PLATFORM.name}</p>
      <h1 className="mt-4 text-4xl">Let’s set up your studio</h1>
      <p className="mb-6 mt-2 text-muted">Only your names are required. You can skip everything else and finish later.</p>
      <ArtistForm mode="onboarding" userId={user.id} initial={initial} prefs={await getPrefs(artist?.id)} />
    </div></main>
  );
}
