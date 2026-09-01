import { describe, expect, it } from 'vitest'

import { normalizeAccountEmail } from './account-email'

describe('normalizeAccountEmail', () => {
  it('trims and lowercases a valid email', () => {
    expect(normalizeAccountEmail('  Maria@Casa.COM ')).toBe('maria@casa.com')
  })

  it('rejects a missing or malformed email', () => {
    expect(() => normalizeAccountEmail('')).toThrow('E-mail inválido')
    expect(() => normalizeAccountEmail('maria')).toThrow('E-mail inválido')
  })
})
