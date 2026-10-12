/**
 * Public base URL of the site, without a trailing slash. Used for metadataBase, robots and sitemap.
 * Order: NEXT_PUBLIC_SITE_URL (explicit) → Vercel production domain → local dev server.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;
  return 'http://localhost:3000';
}
