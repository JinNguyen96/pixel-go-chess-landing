import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadConfig, root } from './config.mjs'

const config = loadConfig()
const siteUrl = String(config.siteUrl || '').replace(/\/+$/, '')
if (!/^https:\/\/[^/]+$/.test(siteUrl)) {
  process.stderr.write(`seo: siteUrl must look like https://example.com (got "${config.siteUrl}")\n`)
  process.exit(1)
}

const index = readFileSync(join(root, 'index.html'), 'utf8')
const match = index.match(/<link rel="canonical" href="(https:\/\/[^/"]+)\//)
if (!match) {
  process.stderr.write('seo: canonical link not found in index.html\n')
  process.exit(1)
}
const previous = match[1]

for (const file of ['index.html', 'privacy.html', '404.html']) {
  const path = join(root, file)
  const text = readFileSync(path, 'utf8')
  const next = text.split(previous).join(siteUrl)
  if (next !== text) writeFileSync(path, next)
}

writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

const today = new Date().toISOString().slice(0, 10)
const langs = ['en', 'vi', 'ko', 'ja', 'zh-Hans']
const alternates = [
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/"/>`,
  ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}/?lang=${l}"/>`),
].join('\n')
writeFileSync(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
${alternates}
  </url>
  <url>
    <loc>${siteUrl}/privacy.html</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
)
process.stdout.write(`seo: ${previous} -> ${siteUrl} (html, robots.txt, sitemap.xml)\n`)
