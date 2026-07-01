/** Animated "network" SVG (flowing dashes + twinkling nodes) for hero/CTA bands. */
export function NetworkBackdrop() {
  return (
    <svg
      viewBox="0 0 1440 600"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.22 }}
      aria-hidden="true"
    >
      <g stroke="#9fe6f5" strokeWidth={1} fill="none">
        <path
          className="ae-flow"
          d="M120 80 L360 200 L300 420 L560 360 L780 480 L1040 300 L1320 420"
          strokeDasharray="6 10"
        />
        <path
          className="ae-flow-fast"
          d="M200 520 L420 380 L660 200 L900 320 L1180 160 L1360 260"
          strokeDasharray="4 12"
        />
      </g>
      <g className="ae-twinkle" fill="#bff0fa">
        <circle cx={360} cy={200} r={4} />
        <circle cx={300} cy={420} r={4} />
        <circle cx={560} cy={360} r={4} />
        <circle cx={780} cy={480} r={4} />
        <circle cx={1040} cy={300} r={4} />
        <circle cx={660} cy={200} r={4} />
        <circle cx={900} cy={320} r={4} />
        <circle cx={1180} cy={160} r={4} />
      </g>
    </svg>
  );
}
