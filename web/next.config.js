/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // Stop `next dev` from appending its agent-rules block to CLAUDE.md.
  agentRules: false,
};

module.exports = nextConfig;
