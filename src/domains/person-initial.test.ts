import { describe, expect, it } from 'vitest'

import { personInitial } from './person-initial'

describe('personInitial', () => {
  it('uses the first letter of the first name', () => {
    expect(personInitial('Matheus Puppe')).toBe('M')
    expect(personInitial('taize')).toBe('T')
    expect(personInitial('  Ícaro  ')).toBe('Í')
  })

  it('falls back when the name is blank', () => {
    expect(personInitial('   ')).toBe('?')
  })
})
