import { describe, expect, it } from 'vitest'

import { validatePasswordChange } from './password-change'

describe('validatePasswordChange', () => {
  it('accepts a new password that is confirmed and different from the current one', () => {
    expect(
      validatePasswordChange({
        currentPassword: 'solzinho123',
        newPassword: 'novasol123',
        confirmPassword: 'novasol123',
      }),
    ).toEqual({
      currentPassword: 'solzinho123',
      newPassword: 'novasol123',
    })
  })

  it('tells the caregiver what is missing or mismatched', () => {
    expect(() =>
      validatePasswordChange({
        currentPassword: '',
        newPassword: 'novasol123',
        confirmPassword: 'novasol123',
      }),
    ).toThrow('Informe a senha atual para confirmar que é você')

    expect(() =>
      validatePasswordChange({
        currentPassword: 'solzinho123',
        newPassword: 'curta',
        confirmPassword: 'curta',
      }),
    ).toThrow('A nova senha precisa ter pelo menos 8 caracteres')

    expect(() =>
      validatePasswordChange({
        currentPassword: 'solzinho123',
        newPassword: 'novasol123',
        confirmPassword: 'outra',
      }),
    ).toThrow('A confirmação não é igual à nova senha')

    expect(() =>
      validatePasswordChange({
        currentPassword: 'solzinho123',
        newPassword: 'solzinho123',
        confirmPassword: 'solzinho123',
      }),
    ).toThrow('Escolha uma senha diferente da atual')
  })
})
