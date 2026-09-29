import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import QRCode from 'qrcode'
import { iosUrl, loadConfig, root } from './config.mjs'

const INK = '#5b4331'
const PAPER = '#f6f0e2'
const QUIET = 4
const MODULE_PX = 4

export function qrSvg(url, title) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const data = qr.modules.data
  const size = n + QUIET * 2
  let d = ''
  for (let y = 0; y < n; y++) {
    let x = 0
    while (x < n) {
      if (!data[y * n + x]) {
        x++
        continue
      }
      let run = 1
      while (x + run < n && data[y * n + x + run]) run++
      d += `M${x + QUIET} ${y + QUIET}h${run}v1h-${run}z`
      x += run
    }
  }
  const px = size * MODULE_PX
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" shape-rendering="crispEdges" role="img" aria-label="${safeTitle}"><title>${safeTitle}</title><rect width="${size}" height="${size}" fill="${PAPER}"/><path fill="${INK}" d="${d}"/></svg>\n`
}

const config = loadConfig()
const targets = [
  { name: 'android', url: config.android?.url ?? '', available: !!config.android?.available, store: 'Google Play' },
  { name: 'ios', url: iosUrl(config), available: !!config.ios?.available, store: 'App Store' },
]
let failed = false
for (const target of targets) {
  const file = join(root, 'assets', `qr-${target.name}.svg`)
  if (!target.url) {
    if (existsSync(file)) rmSync(file)
    if (target.available) {
      process.stderr.write(`qr: ${target.name} is available but has no URL in site.config.js\n`)
      failed = true
    } else {
      process.stdout.write(`qr: ${target.name} skipped (no URL yet)\n`)
    }
    continue
  }
  writeFileSync(file, qrSvg(target.url, `QR code: Pixel Go Chess on ${target.store}`))
  process.stdout.write(`qr: wrote assets/qr-${target.name}.svg -> ${target.url}\n`)
}
if (failed) process.exit(1)
