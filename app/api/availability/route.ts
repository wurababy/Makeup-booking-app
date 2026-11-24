import { NextResponse } from "next/server";
import { db } from "@/lib/server/supabase";
import { freeSlots } from "@/lib/server/availability";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url), slug = u.searchParams.get("slug") ?? "", month = u.searchParams.get("month") ?? "";
  const sb = db();
  if (!sb || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ slots: {} }, { status: 400 });
  const { data: look } = await sb.from("looks").select("minutes").eq("slug", slug).eq("active", true).single();
  if (!look) return NextResponse.json({ slots: {} }, { status: 404 });
  const { slots } = await freeSlots(look.minutes, month);
  return NextResponse.json({ slots });
}
