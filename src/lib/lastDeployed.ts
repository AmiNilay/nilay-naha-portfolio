/** Time of the latest deploy (latest pushed commit), injected by next.config.js. */
export const LAST_DEPLOYED = process.env.NEXT_PUBLIC_LAST_DEPLOYED || "";

/** e.g. "22 Oct 2026, 10:30 IST" */
export function formatDeployTime(iso = LAST_DEPLOYED): string {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "";
  return (
    date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " IST"
  );
}

/** e.g. "3 hours ago" */
export function relativeDeployTime(iso = LAST_DEPLOYED, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (!iso || Number.isNaN(then)) return "";
  const s = Math.max(0, Math.round((now - then) / 1000));
  const units: [number, string][] = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [size, name] of units) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
