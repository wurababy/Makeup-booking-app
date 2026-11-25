// Proves artists cannot reach each other's data, using REAL sign-ins (not shortcuts).
// Run AFTER supabase/platform.sql:  node --env-file=.env.local scripts/rls-check.mjs
// Uses your service key only to create two throwaway test users, which it deletes at the end.
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !svc) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, svc, opts), stamp = Date.now();
let pass = 0, fail = 0;
const check = (cond, msg) => { cond ? pass++ : fail++; console.log((cond ? "PASS  " : "FAIL  ") + msg); };
const ids = [];
async function user(tag) {
  const email = `rlscheck-${tag}-${stamp}@example.com`, password = "Rls-check-pass-123!";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true }); if (error) throw error;
  ids.push(data.user.id);
  const c = createClient(url, anon, opts); const r = await c.auth.signInWithPassword({ email, password }); if (r.error) throw r.error;
  const a = await c.from("artists").insert({ user_id: data.user.id, slug: `rls-${tag}-${stamp}`, business_name: `Studio ${tag}`, artist_name: `Artist ${tag}` }).select("id").single();
  if (a.error) throw a.error; return { c, id: a.data.id };
}
try {
  const A = await user("a"), B = await user("b");
  const catA = (await A.c.from("service_categories").insert({ artist_id: A.id, name: "Bridal" }).select("id").single()).data;
  const catB = (await B.c.from("service_categories").insert({ artist_id: B.id, name: "Bridal" }).select("id").single()).data;
  const svcA = (await A.c.from("services").insert({ artist_id: A.id, name: "A Glam", price: 50000, minutes: 60 }).select("id").single()).data;
  const cliA = (await A.c.from("clients").insert({ artist_id: A.id, name: "Client A", email: "ca@example.com" }).select("id").single()).data;
  await A.c.from("artist_blocked_dates").insert({ artist_id: A.id, day: "2030-01-01" });
  const apt = await admin.from("appointments").insert({ artist_id: A.id, ref: `BK${stamp}`, service_name: "A Glam", client_name: "Client A", client_email: "ca@example.com", client_phone: "0800", price: 50000, deposit: 10000, start_at: "2030-01-02T09:00:00Z", end_at: "2030-01-02T10:00:00Z", status: "confirmed" }).select("id").single();
  check(!apt.error, "setup: server creates an appointment for artist A");

  check((await B.c.from("services").select("id")).data?.length === 0, "B cannot read A's services");
  check((await B.c.from("clients").select("id")).data?.length === 0, "B cannot read A's clients");
  check((await B.c.from("appointments").select("id")).data?.length === 0, "B cannot read A's appointments");
  check((await B.c.from("artist_blocked_dates").select("day")).data?.length === 0, "B cannot read A's blocked dates");
  check((await B.c.from("availability_settings").select("artist_id")).data?.every((r) => r.artist_id === B.id), "B only sees their own settings");
  const seen = (await B.c.from("artists").select("id")).data; check(seen?.length === 1 && seen[0].id === B.id, "B can only see their own artist profile");

  check(!!(await B.c.from("services").insert({ artist_id: A.id, name: "Sneaky", price: 1, minutes: 30 })).error, "B cannot create a service under A");
  await B.c.from("services").update({ price: 1 }).eq("id", svcA.id);
  check((await admin.from("services").select("price").eq("id", svcA.id).single()).data.price === 50000, "B cannot change A's prices");
  await B.c.from("artists").update({ business_name: "Hacked" }).eq("id", A.id);
  check((await admin.from("artists").select("business_name").eq("id", A.id).single()).data.business_name === "Studio a", "B cannot edit A's business");
  await B.c.from("clients").delete().eq("id", cliA.id);
  check((await admin.from("clients").select("id").eq("id", cliA.id)).data.length === 1, "B cannot delete A's clients");
  await B.c.from("appointments").update({ status: "cancelled" }).eq("id", apt.data.id);
  check((await admin.from("appointments").select("status").eq("id", apt.data.id).single()).data.status === "confirmed", "B cannot cancel A's appointments");
  check(!!(await B.c.from("services").insert({ artist_id: B.id, name: "Cross-link", price: 1, minutes: 30, category_id: catA.id })).error, "B cannot attach their service to A's category");

  check(!!(await A.c.from("artists").update({ plan: "pro" }).eq("id", A.id)).error, "A cannot upgrade their own plan");
  check(!!(await A.c.from("artists").update({ status: "active" }).eq("id", A.id)).error, "A cannot change their own account status");
  check(!!(await A.c.from("appointments").update({ price: 1 }).eq("id", apt.data.id)).error, "A cannot change an appointment's price");
  check(!!(await A.c.from("appointments").insert({ artist_id: A.id, ref: "X" + stamp, service_name: "x", client_name: "x", client_email: "x@x.com", client_phone: "1", price: 1, deposit: 0, start_at: "2030-02-01T09:00:00Z", end_at: "2030-02-01T10:00:00Z" })).error, "A cannot create appointments directly (server only)");
  check(!(await A.c.from("appointments").update({ status: "completed" }).eq("id", apt.data.id)).error, "A CAN update their own appointment status");
  const dup = await admin.from("appointments").insert({ artist_id: A.id, ref: `BK2${stamp}`, service_name: "x", client_name: "x", client_email: "x@x.com", client_phone: "1", price: 1, deposit: 0, start_at: "2030-01-02T09:30:00Z", end_at: "2030-01-02T10:30:00Z", status: "confirmed" });
  check(!!dup.error, "database refuses overlapping appointments for the same artist");
  const other = await admin.from("appointments").insert({ artist_id: B.id, ref: `BK3${stamp}`, service_name: "x", client_name: "x", client_email: "x@x.com", client_phone: "1", price: 1, deposit: 0, start_at: "2030-01-02T09:30:00Z", end_at: "2030-01-02T10:30:00Z", status: "confirmed" });
  check(!other.error, "a different artist CAN book the same time");
  check(((await createClient(url, anon, opts).from("artists").select("id")).data ?? []).length === 0, "signed-out visitors cannot read artists");
  void catB;
} catch (e) { fail++; console.error("ERROR  ", e.message ?? e); }
finally { for (const id of ids) await admin.auth.admin.deleteUser(id); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
