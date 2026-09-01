import { and, desc, eq } from 'drizzle-orm'

import { parsePottyKind } from '../domains/potty-log'
import type { PottyEvent, PottyKind } from '../domains/potty-log'
import type { ChildBoard } from './desfralde-records'
import { firstRow } from './first-row'
import type { ReadyDatabase } from './ready-database'
import { pottyEvents } from './schema'

export function createPottyEventQueries(
  readyDb: ReadyDatabase,
  getFamilyChildBoard: (userId: string, childId: string) => Promise<ChildBoard>,
) {
  return {
    async logPottyEvent(
      userId: string,
      childId: string,
      rawKind: string,
    ): Promise<PottyEvent> {
      const database = await readyDb()
      await getFamilyChildBoard(userId, childId)
      const kind = parsePottyKind(rawKind)
      const row = {
        id: crypto.randomUUID(),
        childId,
        kind,
        occurredAt: Date.now(),
      }
      await database.insert(pottyEvents).values(row)
      return { id: row.id, kind, occurredAt: row.occurredAt }
    },

    async listPottyEvents(
      userId: string,
      childId: string,
    ): Promise<Array<PottyEvent>> {
      const database = await readyDb()
      await getFamilyChildBoard(userId, childId)
      const rows = await database
        .select()
        .from(pottyEvents)
        .where(eq(pottyEvents.childId, childId))
        .orderBy(desc(pottyEvents.occurredAt), desc(pottyEvents.id))
      return rows.map((row) => ({
        id: row.id,
        kind: row.kind as PottyKind,
        occurredAt: row.occurredAt,
      }))
    },

    async deletePottyEvent(
      userId: string,
      childId: string,
      eventId: string,
    ): Promise<void> {
      const database = await readyDb()
      await getFamilyChildBoard(userId, childId)
      const event = firstRow(
        await database
          .select()
          .from(pottyEvents)
          .where(
            and(eq(pottyEvents.id, eventId), eq(pottyEvents.childId, childId)),
          )
          .limit(1),
      )
      if (!event) {
        throw new Error(`Anotação não encontrada: ${eventId}`)
      }
      await database.delete(pottyEvents).where(eq(pottyEvents.id, eventId))
    },
  }
}
