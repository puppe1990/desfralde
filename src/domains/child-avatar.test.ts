import { describe, expect, it } from 'vitest'

import {
  childAvatarSrc,
  defaultChildAvatar,
  normalizeChildAvatar,
} from './child-avatar'

describe('normalizeChildAvatar', () => {
  it('fills in the default look when the caregiver skips options', () => {
    expect(normalizeChildAvatar({})).toEqual(defaultChildAvatar())
    expect(defaultChildAvatar()).toEqual({
      gender: 'menino',
      skinTone: 'golden',
      hairType: 'wavy',
      hairColor: 'brown',
    })
  })

  it('accepts a custom skin, hair and gender', () => {
    expect(
      normalizeChildAvatar({
        gender: 'menina',
        skinTone: 'espresso',
        hairType: 'curly',
        hairColor: 'black',
      }),
    ).toEqual({
      gender: 'menina',
      skinTone: 'espresso',
      hairType: 'curly',
      hairColor: 'black',
    })
  })

  it('points the portrait to the illustrated combination', () => {
    expect(
      childAvatarSrc({
        gender: 'menina',
        skinTone: 'espresso',
        hairType: 'curly',
        hairColor: 'black',
      }),
    ).toBe('/avatars/full/menina-espresso-curly-black.jpg')
    expect(childAvatarSrc(defaultChildAvatar())).toBe(
      '/avatars/full/menino-golden-wavy-brown.jpg',
    )
  })

  it('rejects unknown avatar options', () => {
    expect(() =>
      normalizeChildAvatar({ gender: 'alien' }),
    ).toThrow('Gênero do avatar inválido')
    expect(() =>
      normalizeChildAvatar({ skinTone: 'blue' }),
    ).toThrow('Tom de pele inválido')
    expect(() =>
      normalizeChildAvatar({ hairType: 'mohawk' }),
    ).toThrow('Tipo de cabelo inválido')
    expect(() =>
      normalizeChildAvatar({ hairColor: 'green' }),
    ).toThrow('Cor de cabelo inválida')
  })
})
