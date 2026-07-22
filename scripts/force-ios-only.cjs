#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

module.exports = function forceIosOnly(context) {
  const projectRoot = context?.opts?.projectRoot

  if (!projectRoot) {
    throw new Error('[force-ios-only] Не найден projectRoot')
  }

  const projectFile = path.join(
    projectRoot,
    'platforms',
    'ios',
    'App.xcodeproj',
    'project.pbxproj',
  )

  if (!fs.existsSync(projectFile)) {
    console.log('[force-ios-only] iOS-проект отсутствует, пропуск')
    return
  }

  let source = fs.readFileSync(projectFile, 'utf8')

  const settings = {
    SUPPORTED_PLATFORMS: '"iphoneos iphonesimulator"',
    SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD: 'NO',
    SUPPORTS_MACCATALYST: 'NO',
    SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD: 'NO',
    SDKROOT: 'iphoneos',
    TARGETED_DEVICE_FAMILY: '"1,2"',
  }

  for (const [key, value] of Object.entries(settings)) {
    const searchPattern = `\\b${key}\\s*=\\s*[^;]+;`
    const exists = new RegExp(searchPattern).test(source)

    if (exists) {
      source = source.replace(
        new RegExp(searchPattern, 'g'),
        `${key} = ${value};`,
      )
    } else {
      source = source.replace(
        /buildSettings = \{/g,
        `buildSettings = {\n\t\t\t\t${key} = ${value};`,
      )
    }
  }

  fs.writeFileSync(projectFile, source)

  console.log('[force-ios-only] Проект ограничен платформами iOS/iPadOS')
}