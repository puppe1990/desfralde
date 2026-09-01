import { describe, expect, it } from 'vitest'

import { validateOnboardingDraft } from './onboarding-draft'

describe('validateOnboardingDraft', () => {
  it('requires at least one parent and one child', () => {
    expect(() =>
      validateOnboardingDraft({
        parents: [],
        children: [{ name: 'Ana' }],
        staff: [],
      }),
    ).toThrow('Cadastre pelo menos um responsável (mãe ou pai)')

    expect(() =>
      validateOnboardingDraft({
        parents: [{ name: 'Maria', role: 'mae' }],
        children: [],
        staff: [],
      }),
    ).toThrow('Cadastre pelo menos uma criança')
  })

  it('normalizes names, avatars and optional therapists', () => {
    const draft = validateOnboardingDraft({
      parents: [{ name: '  Maria ', role: 'mae' }, { name: 'João', role: 'pai' }],
      children: [
        {
          name: ' Ana ',
          avatar: {
            gender: 'menina',
            skinTone: 'peach',
            hairType: 'long',
            hairColor: 'blonde',
          },
        },
      ],
      staff: [{ name: 'Carla', role: 'terapeuta' }],
    })

    expect(draft.parents.map((adult) => adult.role)).toEqual(['mae', 'pai'])
    expect(draft.children[0]).toMatchObject({
      name: 'Ana',
      avatar: {
        gender: 'menina',
        skinTone: 'peach',
        hairType: 'long',
        hairColor: 'blonde',
      },
    })
    expect(draft.staff[0]).toEqual({ name: 'Carla', role: 'terapeuta' })
  })

  it('rejects an invalid adult role', () => {
    expect(() =>
      validateOnboardingDraft({
        parents: [{ name: 'Maria', role: 'tia' }],
        children: [{ name: 'Ana' }],
        staff: [],
      }),
    ).toThrow('Papel do responsável inválido')
  })
})
