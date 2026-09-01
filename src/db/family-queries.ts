import { eq } from 'drizzle-orm'

import { normalizeAccountEmail } from '../domains/account-email'
import { normalizePersonName } from '../domains/child-name'
import type { RawOnboardingDraft, StaffRole } from '../domains/onboarding-draft'
import {
  STAFF_ROLES,
  validateOnboardingDraft,
} from '../domains/onboarding-draft'
import { assertPasswordLength } from '../domains/password-change'
import { hashPassword } from '../lib/password'
import { mapChild, toUserRecord } from './desfralde-records'
import type {
  FamilyAdultRecord,
  FamilyRecord,
  UserRecord,
} from './desfralde-records'
import { firstRow } from './first-row'
import { insertChildWithPecsPack } from './insert-child-with-pecs-pack'
import type { ReadyDatabase } from './ready-database'
import { children, families, familyAdults, users } from './schema'

export function createFamilyQueries(readyDb: ReadyDatabase) {
  async function getFamily(userId: string): Promise<FamilyRecord> {
    const database = await readyDb()
    const user = firstRow(
      await database.select().from(users).where(eq(users.id, userId)).limit(1),
    )
    if (!user?.familyId) {
      throw new Error(`Família ainda não cadastrada: ${userId}`)
    }

    const adultRows = await database
      .select()
      .from(familyAdults)
      .where(eq(familyAdults.familyId, user.familyId))
    const childRows = await database
      .select()
      .from(children)
      .where(eq(children.familyId, user.familyId))
      .orderBy(children.createdAt)

    return {
      id: user.familyId,
      adults: adultRows.map((adult) => ({
        id: adult.id,
        name: adult.name,
        role: adult.role,
      })),
      children: childRows.map(mapChild),
    }
  }

  async function upsertFamilyStaff(
    userId: string,
    name: string,
    role: StaffRole,
    label: string,
  ): Promise<FamilyAdultRecord> {
    const database = await readyDb()
    const family = await getFamily(userId)
    const normalized = normalizePersonName(name, label)
    const existing = family.adults.find((adult) => adult.role === role)
    if (existing) {
      await database
        .update(familyAdults)
        .set({ name: normalized })
        .where(eq(familyAdults.id, existing.id))
      return { id: existing.id, name: normalized, role }
    }

    const row = {
      id: crypto.randomUUID(),
      familyId: family.id,
      name: normalized,
      role,
    }
    await database.insert(familyAdults).values(row)
    return { id: row.id, name: row.name, role: row.role }
  }

  return {
    getFamily,

    updateFamilyTherapist(
      userId: string,
      name: string,
    ): Promise<FamilyAdultRecord> {
      return upsertFamilyStaff(userId, name, 'terapeuta', 'Nome da terapeuta')
    },

    updateFamilyTeacher(
      userId: string,
      name: string,
    ): Promise<FamilyAdultRecord> {
      return upsertFamilyStaff(userId, name, 'professora', 'Nome da professora')
    },

    async inviteToFamily(
      userId: string,
      input: {
        name: string
        email: string
        password: string
        role: string
      },
    ): Promise<UserRecord> {
      const database = await readyDb()
      const family = await getFamily(userId)
      if (!(STAFF_ROLES as ReadonlyArray<string>).includes(input.role)) {
        throw new Error(`Papel da equipe inválido: ${input.role}`)
      }
      const role = input.role as StaffRole
      const label =
        role === 'professora' ? 'Nome da professora' : 'Nome da terapeuta'
      const name = normalizePersonName(input.name, label)
      const email = normalizeAccountEmail(input.email)
      assertPasswordLength(input.password, 'A senha')

      const existing = firstRow(
        await database
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1),
      )
      if (existing) {
        throw new Error(`Já existe uma conta com este e-mail: ${email}`)
      }

      const invited = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: await hashPassword(input.password),
        familyId: family.id,
        createdAt: Date.now(),
      }
      await database.insert(users).values(invited)
      await upsertFamilyStaff(userId, name, role, label)
      return toUserRecord(invited)
    },

    async completeOnboarding(
      userId: string,
      rawDraft: RawOnboardingDraft,
    ): Promise<FamilyRecord> {
      const database = await readyDb()
      const draft = validateOnboardingDraft(rawDraft)
      const user = firstRow(
        await database
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
      )
      if (!user) throw new Error(`Conta não encontrada: ${userId}`)
      if (user.familyId) {
        throw new Error(`Família já cadastrada: ${user.familyId}`)
      }

      const familyId = crypto.randomUUID()
      await database.insert(families).values({
        id: familyId,
        createdByUserId: userId,
        createdAt: Date.now(),
      })
      await database.update(users).set({ familyId }).where(eq(users.id, userId))

      const adults = [...draft.parents, ...draft.staff]
      await database.insert(familyAdults).values(
        adults.map((adult) => ({
          id: crypto.randomUUID(),
          familyId,
          name: adult.name,
          role: adult.role,
        })),
      )

      for (const [index, childDraft] of draft.children.entries()) {
        await insertChildWithPecsPack(database, {
          familyId,
          name: childDraft.name,
          avatar: childDraft.avatar,
          createdAt: Date.now() + index,
        })
      }

      return getFamily(userId)
    },
  }
}
