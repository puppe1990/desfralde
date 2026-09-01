import type { Client } from '@libsql/client'

import { createChildBoardQueries } from './child-board-queries'
import { createFamilyQueries } from './family-queries'
import { createPottyEventQueries } from './potty-event-queries'
import { createReadyDatabase } from './ready-database'
import { createStarMarkQueries } from './star-mark-queries'
import { createUserAccountQueries } from './user-account-queries'

export type {
  ChildBoard,
  ChildRecord,
  FamilyAdultRecord,
  FamilyRecord,
  StoredPecsCard,
  UserRecord,
} from './desfralde-records'

export function createDesfraldeStore(client: Client) {
  const readyDb = createReadyDatabase(client)
  const family = createFamilyQueries(readyDb)
  const childBoard = createChildBoardQueries(readyDb, family.getFamily)
  const potty = createPottyEventQueries(readyDb, childBoard.getFamilyChildBoard)
  const stars = createStarMarkQueries(readyDb)
  const accounts = createUserAccountQueries(readyDb)

  return {
    ...accounts,
    ...family,
    ...childBoard,
    ...potty,
    ...stars,
  }
}

export type DesfraldeStore = ReturnType<typeof createDesfraldeStore>
