import { describe, expect, it } from 'vitest'

import { assertCanDeleteChild, normalizeChildName } from './child-name'

describe('normalizeChildName', () => {
  it('trims the caregiver-entered name', () => {
    expect(normalizeChildName('  Ana  ')).toBe('Ana')
  })

  it('rejects a blank name', () => {
    expect(() => normalizeChildName('   ')).toThrow(
      'Nome da criança é obrigatório',
    )
  })

  it('rejects names longer than 80 characters', () => {
    expect(() => normalizeChildName('A'.repeat(81))).toThrow(
      'Nome da criança deve ter no máximo 80 caracteres',
    )
  })
})

describe('assertCanDeleteChild', () => {
  it('blocks deleting the last child in the house', () => {
    expect(() => assertCanDeleteChild(1)).toThrow(
      'A família precisa de pelo menos uma criança no quadro',
    )
    expect(() => assertCanDeleteChild(2)).not.toThrow()
  })
})
