export const MIN_PASSWORD_LENGTH = 8

export type PasswordChange = {
  currentPassword: string
  newPassword: string
}

export function assertPasswordLength(
  password: string,
  label = 'A senha',
): string {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `${label} precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
    )
  }
  return password
}

export function validatePasswordChange(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): PasswordChange {
  if (!input.currentPassword) {
    throw new Error('Informe a senha atual para confirmar que é você')
  }
  assertPasswordLength(input.newPassword, 'A nova senha')
  if (input.confirmPassword !== input.newPassword) {
    throw new Error('A confirmação não é igual à nova senha')
  }
  if (input.newPassword === input.currentPassword) {
    throw new Error('Escolha uma senha diferente da atual')
  }
  return {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  }
}
