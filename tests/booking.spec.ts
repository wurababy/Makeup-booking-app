import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSlots, type SlotSettings } from "../lib/server/slots";
import { at } from "../lib/server/time";
import { validSignature } from "../lib/server/signature";
import { createHmac } from "node:crypto";

const S: SlotSettings = { open_time: "09:00", close_time: "18:00", step_minutes: 30, buffer_minutes: 30, work_days: [1, 2, 3, 4, 5, 6], lead_days: 1, max_days: 90 };
const run = (o: Partial<Parameters<typeof computeSlots>[0]> = {}) =>
  computeSlots({ minutes: 60, month: "2026-12", today: "2026-11-24", settings: S, blocked: new Set(), extra: new Set(), busy: [], ...o });
const ms = (d: string, mins: number) => at(d, mins).getTime();

test("Lagos time is UTC+1", () => assert.equal(at("2026-12-01", 540).toISOString(), "2026-12-01T08:00:00.000Z"));
test("a 60-minute look on a working day gets 17 start times, 09:00 to 17:00", () => {
  const d = run()["2026-12-01"]; assert.equal(d.length, 17); assert.equal(d[0], "09:00"); assert.equal(d[16], "17:00");
});
test("non-working days (Sunday) have no times", () => assert.equal(run()["2026-12-06"], undefined));
test("blocked dates have no times", () => assert.equal(run({ blocked: new Set(["2026-12-08"]) })["2026-12-08"], undefined));
test("extra available dates open a non-working day", () => assert.ok(run({ extra: new Set(["2026-12-06"]) })["2026-12-06"]?.length > 0));
test("an existing booking (including its buffer) removes every overlapping start time", () => {
  const d = run({ busy: [[ms("2026-12-01", 600), ms("2026-12-01", 690)]] })["2026-12-01"]; /* 10:00 to 11:30 */
  for (const t of ["09:00", "09:30", "10:00", "10:30", "11:00"]) assert.ok(!d.includes(t), `${t} should be taken`);
  assert.equal(d[0], "11:30");
});
test("the buffer protects the appointment before a booking too", () => {
  const d = run({ busy: [[ms("2026-12-01", 780), ms("2026-12-01", 870)]] })["2026-12-01"]; /* 13:00 to 14:30 */
  assert.ok(!d.includes("12:00") && !d.includes("12:30") && d.includes("11:30"));
});
test("a booking on one day does not affect another day", () => {
  const r = run({ busy: [[ms("2026-12-01", 600), ms("2026-12-01", 690)]] }); assert.equal(r["2026-12-02"].length, 17);
});
test("lead time hides today, shows tomorrow", () => {
  const r = run({ month: "2026-11" }); assert.equal(r["2026-11-24"], undefined); assert.ok(r["2026-11-25"]);
});
test("nothing is offered beyond the booking window", () => assert.deepEqual(run({ month: "2027-03" }), {}));
test("a look longer than opening hours is never offered", () => assert.deepEqual(run({ minutes: 600 }), {}));
test("longer looks lose late start times", () => { const d = run({ minutes: 150 })["2026-12-01"]; assert.equal(d[d.length - 1], "15:30"); });
test("15-minute steps give more start times", () => assert.ok(run({ settings: { ...S, step_minutes: 15 } })["2026-12-01"].length > 17));

test("webhook signature: valid accepted, tampered or empty rejected", () => {
  const raw = '{"event":"charge.success"}', key = "sk_test_x", sig = createHmac("sha512", key).update(raw).digest("hex");
  assert.ok(validSignature(raw, sig, key));
  assert.ok(!validSignature(raw + " ", sig, key)); assert.ok(!validSignature(raw, "", key)); assert.ok(!validSignature(raw, "abcd", key)); assert.ok(!validSignature(raw, sig, ""));
});
