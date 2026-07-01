import type { Booking } from "@/config/schema";

/**
 * Open a scheduler from a booking config. Shared by the qualifier's post-lead
 * booking step and the front page's standalone "book a meeting" CTA — one source
 * of truth for booking behavior.
 *
 * - embed mode → route to the in-app /book/:slug page (which re-executes the
 *   pasted embed scripts).
 * - link mode → open the scheduler URL in a new tab.
 * - no URL → tell the user it isn't configured yet.
 */
export function openBooking(booking: Pick<Booking, "mode" | "url">, slug: string): void {
  if (booking.mode === "embed") {
    window.location.href = `/book/${slug}`;
    return;
  }
  if (booking.url) {
    window.open(booking.url, "_blank", "noopener");
    return;
  }
  alert(
    "Scheduler not configured yet. An admin can add a Calendly or SmartScheduler link in the page admin.",
  );
}
