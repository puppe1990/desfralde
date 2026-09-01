import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

type ManifestIcon = {
  src: string
  sizes: string
  type: string
  purpose?: string
}

type WebManifest = {
  name: string
  short_name: string
  start_url: string
  display: string
  lang: string
  theme_color: string
  background_color: string
  icons: Array<ManifestIcon>
}

describe('PWA manifest', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'),
  ) as WebManifest

  it('has the fields Chrome needs to offer install', () => {
    expect(manifest.name).toContain('Desfralde')
    expect(manifest.short_name).toBe('Desfralde')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.lang).toBe('pt-BR')
    expect(manifest.theme_color).toBe('#c45c3e')
    expect(manifest.background_color).toBe('#f3ead6')
  })

  it('ships 192, 512 and maskable icons on disk', () => {
    const sizes = manifest.icons.map((icon) => icon.sizes)
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(
      true,
    )

    for (const icon of manifest.icons) {
      expect(
        existsSync(resolve(root, 'public', icon.src.replace(/^\//, ''))),
      ).toBe(true)
    }

    expect(existsSync(resolve(root, 'public/favicon.svg'))).toBe(true)
    expect(existsSync(resolve(root, 'public/favicon.ico'))).toBe(true)
    expect(existsSync(resolve(root, 'public/apple-touch-icon.png'))).toBe(true)
    expect(existsSync(resolve(root, 'public/sw.js'))).toBe(true)
  })
})

describe('service worker', () => {
  const sw = readFileSync(resolve(root, 'public/sw.js'), 'utf8')

  it('drops the old static cache and does not pin the generic PECS kit', () => {
    expect(sw).toMatch(/desfralde-static-v2/)
    expect(sw).not.toContain('/pecs/xixi-pedido.jpg')
    expect(sw).toContain('networkFirst')
  })
})
