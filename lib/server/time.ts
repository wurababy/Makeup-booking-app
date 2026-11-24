export const TZ = "+01:00"; /* Lagos: no daylight saving */
const p = (n: number) => String(n).padStart(2, "0");
export const hm = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const fmtHM = (n: number) => `${p(Math.floor(n / 60))}:${p(n % 60)}`;
export const at = (day: string, mins: number) => new Date(`${day}T${fmtHM(mins)}:00${TZ}`);
export const lagosToday = () => new Date(Date.now() + 3_600_000).toISOString().slice(0, 10);
export const addDays = (day: string, n: number) => { const d = new Date(day + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const niceDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
export const niceTime = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });
