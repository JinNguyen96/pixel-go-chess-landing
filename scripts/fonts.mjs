import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import subsetFont from 'subset-font'
import { loadI18n, root } from './config.mjs'

const SRC = resolve(root, process.env.PIXEL_GO_FONTS ?? '../pixel-go/assets-src/fonts')
const OUT = join(root, 'assets/fonts')

const TARGETS = {
  en: { file: 'pg-latin.woff2', source: 'fusion-pixel/fusion-pixel-12px-proportional-latin.ttf.woff2' },
  vi: { file: 'pg-vi.woff2', source: 'vt323/VT323-Regular.ttf' },
  ko: { file: 'pg-ko.woff2', source: 'fusion-pixel/fusion-pixel-12px-proportional-ko.ttf.woff2' },
  ja: { file: 'pg-ja.woff2', source: 'fusion-pixel/fusion-pixel-12px-proportional-ja.ttf.woff2' },
  'zh-Hans': { file: 'pg-zh-hans.woff2', source: 'fusion-pixel/fusion-pixel-12px-proportional-zh_hans.ttf.woff2' },
}

const LICENSES = [
  ['Fusion Pixel Font', 'fusion-pixel/OFL.txt', 'OFL-fusion-pixel.txt'],
  ['Ark Pixel Font (part of Fusion Pixel)', 'fusion-pixel/LICENSES/ark-pixel/OFL.txt', 'OFL-ark-pixel.txt'],
  ['Cubic 11 (part of Fusion Pixel)', 'fusion-pixel/LICENSES/cubic-11/OFL.txt', 'OFL-cubic-11.txt'],
  ['Galmuri (part of Fusion Pixel)', 'fusion-pixel/LICENSES/galmuri/LICENSE.txt', 'LICENSE-galmuri.txt'],
  ['VT323', 'vt323/OFL.txt', 'OFL-vt323.txt'],
]

const ASCII = Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCharCode(0x20 + i)).join('')
const EXTRA = '·…–—‘’“”«»←→×©°№★☆'

function strings(value, out) {
  if (typeof value === 'string') out.push(value)
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out))
  return out
}

function htmlText(file) {
  const html = readFileSync(join(root, file), 'utf8')
  const attrs = [...html.matchAll(/(?:content|alt|aria-label)="([^"]*)"/g)].map((m) => m[1])
  const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
  return attrs.join(' ') + body
}

if (!existsSync(SRC)) {
  process.stderr.write(`fonts: source folder not found: ${SRC}\nSet PIXEL_GO_FONTS to the app's assets-src/fonts folder.\n`)
  process.exit(1)
}

const dict = loadI18n()
const pages = ['index.html', 'privacy.html', '404.html'].map(htmlText).join(' ')
mkdirSync(OUT, { recursive: true })

for (const [locale, target] of Object.entries(TARGETS)) {
  const text = ASCII + EXTRA + strings(dict[locale], []).join('') + pages
  const chars = [...new Set([...text.normalize('NFC')])].filter((c) => c === ' ' || !/\s/.test(c)).join('')
  const source = readFileSync(join(SRC, target.source))
  const out = await subsetFont(source, chars, { targetFormat: 'woff2' })
  writeFileSync(join(OUT, target.file), out)
  process.stdout.write(`fonts: ${target.file} ${(out.length / 1024).toFixed(1)} KB\n`)
}

mkdirSync(join(OUT, 'licenses'), { recursive: true })
let combined = 'Fonts used on this site are subsets of the following fonts, each under the SIL Open Font License 1.1.\n'
combined += 'Fusion Pixel 12px Proportional: https://github.com/TakWolf/fusion-pixel-font\nVT323: https://fonts.google.com/specimen/VT323\n'
for (const [name, from, to] of LICENSES) {
  const path = join(SRC, from)
  if (!existsSync(path)) continue
  copyFileSync(path, join(OUT, 'licenses', to))
  combined += `\n\n==================== ${name} ====================\n\n` + readFileSync(path, 'utf8')
}
writeFileSync(join(OUT, 'LICENSES.txt'), combined)
process.stdout.write('fonts: licenses copied\n')
