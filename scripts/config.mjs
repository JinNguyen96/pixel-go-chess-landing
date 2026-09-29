import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function evalGlobal(file, name) {
  const sandbox = { globalThis: {} }
  sandbox.globalThis = sandbox
  vm.runInNewContext(readFileSync(join(root, file), 'utf8'), sandbox, { filename: file })
  return sandbox[name]
}

export function loadConfig() {
  return evalGlobal('site.config.js', 'SITE_CONFIG')
}

export function loadI18n() {
  return evalGlobal('i18n.js', 'I18N')
}

export function iosUrl(config) {
  const ios = config.ios ?? {}
  if (ios.url) return ios.url
  if (ios.appId) return `https://apps.apple.com/app/id${String(ios.appId).replace(/^id/, '')}`
  return ''
}
