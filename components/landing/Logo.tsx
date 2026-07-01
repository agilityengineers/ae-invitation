/* eslint-disable @next/next/no-img-element */
import type { LogoTreatment } from "@/config/schema";

const MAIN_SITE = "https://agilityengineers.com/";

/** Brand wordmark with the admin-selected treatment (chip / white / hide). */
export function Logo({ treatment }: { treatment: LogoTreatment }) {
  if (treatment === "hide") return null;
  const isWhite = treatment === "white";
  return (
    <a href={MAIN_SITE} className="ae-logo" aria-label="Agility Engineers home" style={{ display: "inline-flex" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 10,
          background: isWhite ? "transparent" : "#ffffff",
          padding: isWhite ? 0 : "9px 14px",
          boxShadow: isWhite ? "none" : "0 4px 14px rgba(0,0,0,.18)",
        }}
      >
        <img
          src="/assets/agility-logo.png"
          alt="Agility Engineers"
          height={28}
          style={{
            height: 28,
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
