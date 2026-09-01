import { drizzle } from 'drizzle-orm/libsql'

import type { Client } from '@libsql/client'

import { ensureDesfraldeSchema } from './ensure-schema'

export function createReadyDatabase(client: Client) {
  const database = drizzle(client)
  let ready: Promise<void> | null = null

  return async function readyDb() {
    if (!ready) ready = ensureDesfraldeSchema(client)
    await ready
    return database
  }
}

export type ReadyDatabase = ReturnType<typeof createReadyDatabase>
