import ArtistForm from "@/components/ArtistForm";
import { getArtistContext, getPrefs, toProfile } from "@/lib/artist";

export default async function Settings() {
  const { user, artist } = await getArtistContext();
  return (
    <div><h1 className="text-4xl">Settings</h1><p className="mb-6 mt-1 text-muted">Signed in as {user!.email}. Your booking link stays the same when you change your business name.</p>
      <div className="max-w-2xl"><ArtistForm mode="settings" userId={user!.id} initial={toProfile(artist!)} prefs={await getPrefs(artist!.id)} /></div></div>
  );
}
