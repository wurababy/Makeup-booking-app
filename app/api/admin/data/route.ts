import { NextResponse } from "next/server";
import { adminUser } from "@/lib/server/admin";
import { db } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await adminUser())) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = db();
  if (!sb) return NextResponse.json({ ok: false, error: "Database isn’t connected." }, { status: 503 });
  const [bookings, looks, cats, settings, blocked, extra] = await Promise.all([
    sb.from("bookings").select("*").order("start_at", { ascending: false }).limit(500),
    sb.from("looks").select("*").order("created_at"), sb.from("categories").select("name").order("sort").order("name"),
    sb.from("settings").select("*").eq("id", 1).single(), sb.from("blocked_dates").select("day").order("day"), sb.from("extra_dates").select("day").order("day"),
  ]);
  const list = bookings.data ?? [];
  const paths = list.filter((b) => b.inspiration_path).map((b) => b.inspiration_path as string);
  const signed = paths.length ? (await sb.storage.from("inspiration").createSignedUrls(paths, 3600)).data ?? [] : [];
  const urlFor = new Map(signed.map((s) => [s.path, s.signedUrl]));
  const withPhotos = list.map((b) => ({ ...b, inspiration_url: b.inspiration_path ? urlFor.get(b.inspiration_path) ?? null : null }));
  return NextResponse.json({ ok: true, bookings: withPhotos, looks: looks.data ?? [], categories: (cats.data ?? []).map((c) => c.name), settings: settings.data,
    blocked: (blocked.data ?? []).map((d) => d.day), extra: (extra.data ?? []).map((d) => d.day) });
}
