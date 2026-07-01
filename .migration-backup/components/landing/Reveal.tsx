import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Pure CSS (animation-timeline: view()) via the .ae-reveal
 * classes in globals.css — no JS — and it degrades to fully visible when
 * scroll-driven animations or reduced-motion apply.
 */
export function Reveal({
  children,
  delay,
  axis = "y",
  as: Tag = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: 1 | 2 | 3;
  axis?: "y" | "x";
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const base = axis === "x" ? "ae-reveal-x" : "ae-reveal";
  const d = delay ? ` ae-d${delay}` : "";
  return (
    <Tag className={`${base}${d} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
