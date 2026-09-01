import { createClient } from '@libsql/client'

import { createDesfraldeStore } from './desfralde-store'
import { resolveDatabaseUrl } from '../lib/database-url'

export function createLibsqlClient(
  env: NodeJS.ProcessEnv = process.env,
) {
  const url = resolveDatabaseUrl({
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL ?? env.TURSO_DATABASE_URL,
  })

  if (url.startsWith('file:') || url === ':memory:') {
    return createClient({ url })
  }

  return createClient({
    url,
    authToken: env.TURSO_AUTH_TOKEN,
  })
}

let store: ReturnType<typeof createDesfraldeStore> | undefined

export function getDesfraldeStore() {
  if (!store) {
    store = createDesfraldeStore(createLibsqlClient())
  }
  return store
}
