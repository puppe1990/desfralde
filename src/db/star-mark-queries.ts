import { and, eq } from 'drizzle-orm'

import type { StarKind, StarMark } from '../domains/star-chart'
import { firstRow } from './first-row'
import type { ReadyDatabase } from './ready-database'
import { stars } from './schema'

export function createStarMarkQueries(readyDb: ReadyDatabase) {
  async function listStars(childId: string): Promise<Array<StarMark>> {
    const database = await readyDb()
    const rows = await database
      .select()
      .from(stars)
      .where(eq(stars.childId, childId))

    return rows.map((row) => ({
      date: row.date,
      kind: row.kind as StarKind,
    }))
  }

  return {
    listStars,

    async toggleStar(
      childId: string,
      date: string,
      kind: StarKind,
    ): Promise<Array<StarMark>> {
      const database = await readyDb()
      const existing = firstRow(
        await database
          .select()
          .from(stars)
          .where(
            and(
              eq(stars.childId, childId),
              eq(stars.date, date),
              eq(stars.kind, kind),
            ),
          )
          .limit(1),
      )

      if (existing) {
        await database.delete(stars).where(eq(stars.id, existing.id))
      } else {
        await database.insert(stars).values({
          id: crypto.randomUUID(),
          childId,
          date,
          kind,
        })
      }

      return listStars(childId)
    },
  }
}
