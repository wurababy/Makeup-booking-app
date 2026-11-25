import { redirect } from "next/navigation";
import DashNav from "@/components/DashNav";
import { getArtistContext } from "@/lib/artist";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, artist } = await getArtistContext();
  if (!user) redirect("/login");
  if (!artist || !artist.onboarding_completed) redirect("/onboarding");
  if (artist.status === "suspended") return (<main className="px-6 py-20 text-center"><h1 className="text-3xl">Account paused</h1><p className="mt-3 text-muted">Please contact support.</p></main>);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <DashNav name={artist.business_name} logo={artist.logo_url} />
      <div className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</div>
    </div>
  );
}
