/**
 * The public origin, read at runtime (bracket access keeps Next from inlining a
 * build-time value). The app moved to icemap.pwa.pit.world on 2026-11-08.
 */
export function siteUrl(): string {
  const env = process.env['APP_URL'] || process.env['NEXT_PUBLIC_APP_URL'] || 'https://icemap.pwa.pit.world'
  return env.replace(/\/+$/, '')
}
