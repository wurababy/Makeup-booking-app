/* Simple best-effort limit (per server instance): 6 analyses per IP per hour. A shared limiter can replace this later. */
const hits = new Map<string, number[]>();
export function allowed(ip: string, max = 6, windowMs = 3_600_000) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(ip, recent); return false; }
  recent.push(now); hits.set(ip, recent); return true;
}
