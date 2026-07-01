/** Client-side env helpers (browser). */
export function siteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
