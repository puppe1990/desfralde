import { desc, eq } from 'drizzle-orm'

import {
  defaultChildAvatar,
  normalizeChildAvatar,
} from '../domains/child-avatar'
import type { ChildAvatar } from '../domains/child-avatar'
import { assertCanDeleteChild, normalizeChildName } from '../domains/child-name'
import type { ChildBoard, ChildRecord, FamilyRecord } from './desfralde-records'
import { mapCard, mapChild } from './desfralde-records'
import { firstRow } from './first-row'
import { insertChildWithPecsPack } from './insert-child-with-pecs-pack'
import type { ReadyDatabase } from './ready-database'
import { children, pecsCards, pottyEvents, stars } from './schema'

export function createChildBoardQueries(
  readyDb: ReadyDatabase,
  getFamily: (userId: string) => Promise<FamilyRecord>,
) {
  async function getChildBoard(childId: string): Promise<ChildBoard> {
    const database = await readyDb()
    const child = firstRow(
      await database
        .select()
        .from(children)
        .where(eq(children.id, childId))
        .limit(1),
    )

    if (!child) {
      throw new Error(`Criança não encontrada: ${childId}`)
    }

    const cards = (
      await database
        .select()
        .from(pecsCards)
        .where(eq(pecsCards.childId, childId))
    )
      .map(mapCard)
      .sort((left, right) => left.sortOrder - right.sortOrder)

    return {
      child: mapChild(child),
      pedidos: cards.filter((card) => card.kind === 'pedido'),
      rotina: cards.filter((card) => card.kind === 'rotina'),
    }
  }

  async function getFamilyChildBoard(userId: string, childId: string) {
    const family = await getFamily(userId)
    const allowed = family.children.some((child) => child.id === childId)
    if (!allowed) {
      throw new Error(`Criança não encontrada: ${childId}`)
    }
    return getChildBoard(childId)
  }

  return {
    getChildBoard,
    getFamilyChildBoard,

    async createChild(name: string): Promise<ChildRecord> {
      const database = await readyDb()
      const childId = await insertChildWithPecsPack(database, {
        familyId: null,
        name: normalizeChildName(name),
        avatar: defaultChildAvatar(),
        createdAt: Date.now(),
      })
      const board = await getChildBoard(childId)
      return board.child
    },

    async listChildren(): Promise<Array<ChildRecord>> {
      const database = await readyDb()
      const rows = await database
        .select()
        .from(children)
        .orderBy(desc(children.createdAt), desc(children.id))
      return rows.map(mapChild)
    },

    async addChildToFamily(
      userId: string,
      name: string,
      rawAvatar?: Partial<ChildAvatar>,
    ): Promise<ChildRecord> {
      const database = await readyDb()
      const family = await getFamily(userId)
      const childId = await insertChildWithPecsPack(database, {
        familyId: family.id,
        name: normalizeChildName(name),
        avatar: normalizeChildAvatar(rawAvatar ?? defaultChildAvatar()),
        createdAt: Date.now(),
      })
      const board = await getChildBoard(childId)
      return board.child
    },

    async updateChildAvatar(
      userId: string,
      childId: string,
      rawAvatar: Partial<ChildAvatar>,
    ): Promise<ChildRecord> {
      return updateChild(userId, childId, { avatar: rawAvatar })
    },

    async updateChild(
      userId: string,
      childId: string,
      patch: { name?: string; avatar?: Partial<ChildAvatar> },
    ): Promise<ChildRecord> {
      return updateChild(userId, childId, patch)
    },

    async deleteChild(userId: string, childId: string): Promise<void> {
      const database = await readyDb()
      const family = await getFamily(userId)
      const allowed = family.children.some((child) => child.id === childId)
      if (!allowed) {
        throw new Error(`Criança não encontrada: ${childId}`)
      }
      assertCanDeleteChild(family.children.length)
      await database.delete(pecsCards).where(eq(pecsCards.childId, childId))
      await database.delete(pottyEvents).where(eq(pottyEvents.childId, childId))
      await database.delete(stars).where(eq(stars.childId, childId))
      await database.delete(children).where(eq(children.id, childId))
    },
  }

  async function updateChild(
    userId: string,
    childId: string,
    patch: { name?: string; avatar?: Partial<ChildAvatar> },
  ): Promise<ChildRecord> {
    const database = await readyDb()
    await getFamilyChildBoard(userId, childId)
    const avatar = patch.avatar ? normalizeChildAvatar(patch.avatar) : undefined
    await database
      .update(children)
      .set({
        ...(patch.name !== undefined
          ? { name: normalizeChildName(patch.name) }
          : {}),
        ...(avatar
          ? {
              gender: avatar.gender,
              skinTone: avatar.skinTone,
              hairType: avatar.hairType,
              hairColor: avatar.hairColor,
            }
          : {}),
      })
      .where(eq(children.id, childId))
    const board = await getChildBoard(childId)
    return board.child
  }
}
