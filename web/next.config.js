/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // Stop `next dev` from appending its agent-rules block to CLAUDE.md.
  agentRules: false,
  // The GLBs never change under the same URL: lib/models3d.ts appends ?v=MODEL_VERSION, which is
  // bumped whenever they are regenerated, so browsers and the CDN can keep them for a year.
  async headers() {
    return [
      {
        source: '/models3d/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
