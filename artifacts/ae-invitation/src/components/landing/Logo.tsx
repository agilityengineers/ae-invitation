/* eslint-disable @next/next/no-img-element */
import type { LogoTreatment } from "@/config/schema";

const MAIN_SITE = "https://agilityengineers.com/";

/**
 * Default rendered height (px) of the wordmark. The top-left header logo passes
 * `HEADER_LOGO_SIZE` for a larger, more legible mark; footer/hero keep this.
 */
const DEFAULT_LOGO_SIZE = 28;

/**
 * Height (px) of the logo in the top-left header across every page. Kept as a
 * shared constant so current and future pages render the corner logo at the
 * same, larger size — just pass `size={HEADER_LOGO_SIZE}` to <Logo />.
 */
export const HEADER_LOGO_SIZE = 40;

/** Brand wordmark with the admin-selected treatment (chip / white / hide). */
export function Logo({ treatment, size = DEFAULT_LOGO_SIZE }: { treatment: LogoTreatment; size?: number }) {
  if (treatment === "hide") return null;
  const isWhite = treatment === "white";
  return (
    <a href={MAIN_SITE} className="ae-logo" aria-label="Agility Engineers home" style={{ display: "inline-flex" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 12,
          background: isWhite ? "transparent" : "#ffffff",
          padding: isWhite ? 0 : "8px 16px",
          boxShadow: isWhite ? "none" : "0 4px 14px rgba(0,0,0,.18)",
        }}
      >
        <img
          src="/assets/agility-logo.png"
          alt="Agility Engineers"
          height={size}
          style={{
            height: size,
            width: "auto",
            display: "block",
            filter: isWhite ? "brightness(0) invert(1)" : "none",
            opacity: isWhite ? 0.92 : 1,
          }}
        />
      </span>
    </a>
  );
}
