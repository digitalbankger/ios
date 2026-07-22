import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = process.cwd()
const sourceRoot = join(root, 'src')
const allowedExtensions = new Set(['.js', '.vue', '.ts', '.mjs'])

async function walk(dir) {
  const result = []
  for (const name of await readdir(dir)) {
    const full = join(dir, name)
    const info = await stat(full)
    if (info.isDirectory()) result.push(...await walk(full))
    else result.push(full)
  }
  return result
}

const files = (await walk(sourceRoot)).filter((file) => {
  const dot = file.lastIndexOf('.')
  return dot >= 0 && allowedExtensions.has(file.slice(dot))
})

const contentByFile = new Map()
let allSource = ''
for (const file of files) {
  const content = await readFile(file, 'utf8')
  contentByFile.set(file, content)
  allSource += `\n/* ${relative(root, file)} */\n${content}`
}

const forbidden = [
  { pattern: /https:\/\/tg\.daigo\.ru/i, label: 'старый домен tg.daigo.ru' },
  { pattern: /\/v1\/auth\/refresh-token/i, label: 'старый endpoint refresh-token' },
  { pattern: /\/v1\/auth\/bilain\/auth/i, label: 'старый endpoint bilain/auth' },
]

const required = [
  '/v1/auth/send-code',
  '/v1/auth/send-fc',
  '/v1/auth/verify-code',
  '/v1/auth/refresh',
  '/v1/shop/products',
  '/v1/shop/promotion',
  '/v1/shop/cart/',
  '/v1/shop/guest-cart/',
]

const errors = []
for (const { pattern, label } of forbidden) {
  for (const [file, content] of contentByFile) {
    if (pattern.test(content)) errors.push(`${label}: ${relative(root, file)}`)
  }
}
for (const endpoint of required) {
  if (!allSource.includes(endpoint)) errors.push(`не найден обязательный endpoint: ${endpoint}`)
}

const apiFile = await readFile(join(sourceRoot, 'services', 'api.js'), 'utf8')
if (!apiFile.includes('https://api.daigo.ru')) {
  errors.push('основной API_BASE_URL не содержит https://api.daigo.ru')
}

const promoFile = await readFile(join(sourceRoot, 'services', 'promoService.js'), 'utf8')
if (!promoFile.includes('session_id') || !promoFile.includes('daigo_id')) {
  errors.push('акции должны отправлять session_id для гостя или daigo_id для пользователя')
}

if (errors.length) {
  console.error('API contract check failed:')
  for (const error of errors) console.error(` - ${error}`)
  process.exit(1)
}

console.log('API contract check passed: api.daigo.ru и актуальные endpoint-ы используются корректно.')
