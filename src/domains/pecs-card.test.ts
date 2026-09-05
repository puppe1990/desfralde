import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  GENDERS,
  HAIR_COLORS,
  HAIR_TYPES,
  SKIN_TONES,
  defaultChildAvatar,
} from './child-avatar'
import type { ChildAvatar } from './child-avatar'
import { PECS_CHARACTER_SLUGS, pecsCardImageSrc } from './pecs-card'

function tintedPublicPath(src: string): string {
  return resolve(process.cwd(), `public${src}`)
}

describe('pecsCardImageSrc', () => {
  it('points character cards at the tinted illustration for the chosen avatar', () => {
    expect(
      pecsCardImageSrc('xixi', '/pecs/xixi-pedido.jpg', {
        gender: 'menina',
        skinTone: 'espresso',
        hairType: 'puff',
        hairColor: 'black',
      }),
    ).toBe('/pecs/tinted/xixi/menina-espresso-puff-black.jpg')
  })

  it('keeps the chosen hair type instead of collapsing it to wavy or puff', () => {
    const avatar: ChildAvatar = {
      gender: 'menina',
      skinTone: 'espresso',
      hairType: 'curly',
      hairColor: 'black',
    }

    expect(pecsCardImageSrc('xixi', '/pecs/xixi-pedido.jpg', avatar)).toBe(
      '/pecs/tinted/xixi/menina-espresso-curly-black.jpg',
    )
    expect(
      pecsCardImageSrc('xixi', '/pecs/xixi-pedido.jpg', {
        ...avatar,
        hairType: 'bun',
      }),
    ).toBe('/pecs/tinted/xixi/menina-espresso-bun-black.jpg')
    expect(
      pecsCardImageSrc('xixi', '/pecs/xixi-pedido.jpg', defaultChildAvatar()),
    ).toBe('/pecs/tinted/xixi/menino-golden-wavy-brown.jpg')
  })

  it('has a tinted illustration for every avatar combination on character cards', () => {
    const missing: string[] = []
    for (const slug of PECS_CHARACTER_SLUGS) {
      for (const gender of GENDERS) {
        for (const skinTone of SKIN_TONES) {
          for (const hairType of HAIR_TYPES) {
            for (const hairColor of HAIR_COLORS) {
              const src = pecsCardImageSrc(slug, '/pecs/missing.jpg', {
                gender,
                skinTone,
                hairType,
                hairColor,
              })
              if (!existsSync(tintedPublicPath(src))) missing.push(src)
            }
          }
        }
      }
    }

    expect(missing, `${missing.length} tinted PECS files missing`).toEqual([])
  })

  it('keeps object cards on the generic illustration', () => {
    expect(
      pecsCardImageSrc('banheiro', '/pecs/banheiro.jpg', defaultChildAvatar()),
    ).toBe('/pecs/banheiro.jpg')
  })

  it('falls back when no avatar is chosen', () => {
    expect(pecsCardImageSrc('xixi', '/pecs/xixi-pedido.jpg')).toBe(
      '/pecs/xixi-pedido.jpg',
    )
  })
})
