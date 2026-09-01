import { describe, expect, it } from 'vitest'

import { resolveDatabaseUrl } from './database-url'

describe('resolveDatabaseUrl', () => {
  it('uses the configured Turso URL when provided', () => {
    expect(
      resolveDatabaseUrl({
        nodeEnv: 'production',
        databaseUrl: 'libsql://desfralde.turso.io',
      }),
    ).toBe('libsql://desfralde.turso.io')
  })

  it('falls back to a local libSQL file outside production', () => {
    expect(resolveDatabaseUrl({ nodeEnv: 'development' })).toBe('file:local.db')
  })

  it('fails in production when DATABASE_URL is missing', () => {
    expect(() => resolveDatabaseUrl({ nodeEnv: 'production' })).toThrow(
      'DATABASE_URL is required in production',
    )
  })

  it('fails in production when DATABASE_URL is a local file', () => {
    expect(() =>
      resolveDatabaseUrl({
        nodeEnv: 'production',
        databaseUrl: 'file:local.db',
      }),
    ).toThrow('DATABASE_URL must point to Turso/libSQL in production')
  })
})
