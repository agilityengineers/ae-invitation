/** @type {import('next').NextConfig} */
const nextConfig = {
  // Host-agnostic deploy: produces a self-contained Node server that runs on
  // Replit / Render / Fly / a VM / Vercel without host-specific APIs.
  output: "standalone",
  reactStrictMode: true,
  // Ensure the boot-time schema file ships with the standalone server output.
  outputFileTracingIncludes: {
    "/**": ["./db/schema.sql"],
  },
  images: {
    // Per-variant hero/guide/proof images can be arbitrary admin-supplied URLs
    // (or S3-hosted). Allow remote images; tighten to known hosts if desired.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
