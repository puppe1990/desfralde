import { describe, expect, it } from 'vitest'

import { pecsCardImageSrc } from './pecs-card'
import { defaultChildAvatar } from './child-avatar'

describe('pecsCardImageSrc', () => {
  it('points character cards at the tinted illustration for the chosen avatar', () => {
    expect(
      pecsCardImageSrc('xixi', '/pecs/xixi-pedido.jpg', {
        gender: 'menina',
        skinTone: 'espresso',
        hairType: 'puff',
        hairColor: 'black',
      }),
    ).toBe('/pecs/tinted/xixi/menina-espresso-black.jpg')
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
