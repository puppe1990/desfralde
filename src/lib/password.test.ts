import { describe, expect, it } from 'vitest'

import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('accepts the original password and rejects another', async () => {
    const hash = await hashPassword('solzinho123')
    expect(await verifyPassword('solzinho123', hash)).toBe(true)
    expect(await verifyPassword('outra', hash)).toBe(false)
  })
})
