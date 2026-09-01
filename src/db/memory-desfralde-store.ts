import { createClient } from '@libsql/client'

import { createDesfraldeStore } from './desfralde-store'

export function openMemoryDesfraldeStore() {
  const client = createClient({ url: ':memory:' })
  return { client, store: createDesfraldeStore(client) }
}
