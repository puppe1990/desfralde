import { and, desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'

import type { Client } from '@libsql/client'

import { normalizeAccountEmail } from '../domains/account-email'
import {
  defaultChildAvatar,
  normalizeChildAvatar,
  type ChildAvatar,
  type ChildGender,
  type HairColor,
  type HairType,
  type SkinTone,
} from '../domains/child-avatar'
import { normalizeChildName, normalizePersonName } from '../domains/child-name'
import { defaultDesfraldePack } from '../domains/default-desfralde-pack'
import type { RawOnboardingDraft } from '../domains/onboarding-draft'
import { STAFF_ROLES, validateOnboardingDraft } from '../domains/onboarding-draft'
import { assertPasswordLength, validatePasswordChange } from '../domains/password-change'
import {
  parsePottyKind,
  type PottyEvent,
  type PottyKind,
} from '../domains/potty-log'
import type { CardKind, CardTone, PecsCardTemplate } from '../domains/pecs-card'
import type { StarKind, StarMark } from '../domains/star-chart'
import { hashPassword, verifyPassword } from '../lib/password'
import {
  children,
  families,
  familyAdults,
  pecsCards,
  pottyEvents,
  stars,
  users,
} from './schema'
import { ensureDesfraldeSchema } from './ensure-schema'

export type ChildRecord = {
  id: string
  familyId: string | null
  name: string
  avatar: ChildAvatar
  createdAt: number
}

export type UserRecord = {
  id: string
  name: string
  email: string
  familyId: string | null
}

export type FamilyAdultRecord = {
  id: string
  name: string
  role: string
}

export type FamilyRecord = {
  id: string
  adults: Array<FamilyAdultRecord>
  children: Array<ChildRecord>
}

export type StoredPecsCard = PecsCardTemplate & {
  id: string
  childId: string
}

export type ChildBoard = {
  child: ChildRecord
  pedidos: Array<StoredPecsCard>
  rotina: Array<StoredPecsCard>
}

function mapChild(row: typeof children.$inferSelect): ChildRecord {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    avatar: {
      gender: row.gender as ChildGender,
      skinTone: row.skinTone as SkinTone,
      hairType: row.hairType as HairType,
      hairColor: row.hairColor as HairColor,
    },
    createdAt: row.createdAt,
  }
}

function mapCard(row: typeof pecsCards.$inferSelect): StoredPecsCard {
  return {
    id: row.id,
    childId: row.childId,
    slug: row.slug,
    kind: row.kind as CardKind,
    label: row.label,
    speak: row.speak,
    imageSrc: row.imageSrc,
    tone: row.tone as CardTone,
    sortOrder: row.sortOrder,
  }
}

export function createDesfraldeStore(client: Client) {
  const db = drizzle(client)
  let ready: Promise<void> | null = null

  async function readyDb() {
    if (!ready) ready = ensureDesfraldeSchema(client)
    await ready
    return db
  }

  return {
    async createChild(name: string): Promise<ChildRecord> {
      const database = await readyDb()
      const avatar = defaultChildAvatar()
      const row = {
        id: crypto.randomUUID(),
        familyId: null,
        name: normalizeChildName(name),
        gender: avatar.gender,
        skinTone: avatar.skinTone,
        hairType: avatar.hairType,
        hairColor: avatar.hairColor,
        createdAt: Date.now(),
      }

      await database.insert(children).values(row)
      const child = mapChild(row)
      await database.insert(pecsCards).values(
        defaultDesfraldePack().map((template) => ({
          id: crypto.randomUUID(),
          childId: child.id,
          slug: template.slug,
          kind: template.kind,
          label: template.label,
          speak: template.speak,
          imageSrc: template.imageSrc,
          tone: template.tone,
          sortOrder: template.sortOrder,
        })),
      )

      return child
    },

    async listChildren(): Promise<Array<ChildRecord>> {
      const database = await readyDb()
      const rows = await database
        .select()
        .from(children)
        .orderBy(desc(children.createdAt), desc(children.id))
      return rows.map(mapChild)
    },

    async getChildBoard(childId: string): Promise<ChildBoard> {
      const database = await readyDb()
      const [child] = await database
        .select()
        .from(children)
        .where(eq(children.id, childId))
        .limit(1)

      if (!child) {
        throw new Error('Criança não encontrada')
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
    },

    async registerCaregiver(input: {
      name: string
      email: string
      password: string
    }): Promise<UserRecord> {
      const database = await readyDb()
      const email = normalizeAccountEmail(input.email)
      const name = normalizePersonName(input.name, 'Nome')
      if (input.password.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres')
      }

      const [existing] = await database
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      if (existing) {
        throw new Error('Já existe uma conta com este e-mail')
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: await hashPassword(input.password),
        familyId: null,
        createdAt: Date.now(),
      }
      await database.insert(users).values(user)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        familyId: user.familyId,
      }
    },

    async authenticate(email: string, password: string): Promise<UserRecord> {
      const database = await readyDb()
      const normalized = normalizeAccountEmail(email)
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.email, normalized))
        .limit(1)

      const dummy =
        '00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      const matches = await verifyPassword(password, user?.passwordHash ?? dummy)
      if (!user || !matches) {
        throw new Error('E-mail ou senha inválidos')
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        familyId: user.familyId,
      }
    },

    async changePassword(
      userId: string,
      raw: {
        currentPassword: string
        newPassword: string
        confirmPassword: string
      },
    ): Promise<void> {
      const database = await readyDb()
      const change = validatePasswordChange(raw)
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      if (!user) throw new Error('Conta não encontrada')

      const matches = await verifyPassword(change.currentPassword, user.passwordHash)
      if (!matches) {
        throw new Error('Senha atual incorreta. Use a senha com que você entra no Desfralde')
      }

      await database
        .update(users)
        .set({ passwordHash: await hashPassword(change.newPassword) })
        .where(eq(users.id, userId))
    },

    async updateFamilyTherapist(
      userId: string,
      name: string,
    ): Promise<FamilyAdultRecord> {
      return this.upsertFamilyStaff(userId, name, 'terapeuta', 'Nome da terapeuta')
    },

    async updateFamilyTeacher(
      userId: string,
      name: string,
    ): Promise<FamilyAdultRecord> {
      return this.upsertFamilyStaff(userId, name, 'professora', 'Nome da professora')
    },

    async upsertFamilyStaff(
      userId: string,
      name: string,
      role: 'terapeuta' | 'professora',
      label: string,
    ): Promise<FamilyAdultRecord> {
      const database = await readyDb()
      const family = await this.getFamily(userId)
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
      const family = await this.getFamily(userId)
      if (!(STAFF_ROLES as ReadonlyArray<string>).includes(input.role)) {
        throw new Error('Papel da equipe inválido')
      }
      const role = input.role as 'terapeuta' | 'professora'
      const label =
        role === 'professora' ? 'Nome da professora' : 'Nome da terapeuta'
      const name = normalizePersonName(input.name, label)
      const email = normalizeAccountEmail(input.email)
      assertPasswordLength(input.password, 'A senha')

      const [existing] = await database
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      if (existing) {
        throw new Error('Já existe uma conta com este e-mail')
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
      await this.upsertFamilyStaff(userId, name, role, label)
      return {
        id: invited.id,
        name: invited.name,
        email: invited.email,
        familyId: invited.familyId,
      }
    },

    async logPottyEvent(
      userId: string,
      childId: string,
      rawKind: string,
    ): Promise<PottyEvent> {
      const database = await readyDb()
      await this.getFamilyChildBoard(userId, childId)
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
      await this.getFamilyChildBoard(userId, childId)
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
      await this.getFamilyChildBoard(userId, childId)
      const [event] = await database
        .select()
        .from(pottyEvents)
        .where(and(eq(pottyEvents.id, eventId), eq(pottyEvents.childId, childId)))
        .limit(1)
      if (!event) throw new Error('Anotação não encontrada')
      await database.delete(pottyEvents).where(eq(pottyEvents.id, eventId))
    },

    async getUser(userId: string): Promise<UserRecord | null> {
      const database = await readyDb()
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      if (!user) return null
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        familyId: user.familyId,
      }
    },

    async completeOnboarding(
      userId: string,
      rawDraft: RawOnboardingDraft,
    ): Promise<FamilyRecord> {
      const database = await readyDb()
      const draft = validateOnboardingDraft(rawDraft)
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      if (!user) throw new Error('Conta não encontrada')
      if (user.familyId) throw new Error('Família já cadastrada')

      const familyId = crypto.randomUUID()
      await database.insert(families).values({
        id: familyId,
        createdByUserId: userId,
        createdAt: Date.now(),
      })
      await database
        .update(users)
        .set({ familyId })
        .where(eq(users.id, userId))

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
        const avatar = normalizeChildAvatar(childDraft.avatar)
        const childId = crypto.randomUUID()
        await database.insert(children).values({
          id: childId,
          familyId,
          name: childDraft.name,
          gender: avatar.gender,
          skinTone: avatar.skinTone,
          hairType: avatar.hairType,
          hairColor: avatar.hairColor,
          createdAt: Date.now() + index,
        })
        await database.insert(pecsCards).values(
          defaultDesfraldePack().map((template) => ({
            id: crypto.randomUUID(),
            childId,
            slug: template.slug,
            kind: template.kind,
            label: template.label,
            speak: template.speak,
            imageSrc: template.imageSrc,
            tone: template.tone,
            sortOrder: template.sortOrder,
          })),
        )
      }

      return this.getFamily(userId)
    },

    async getFamily(userId: string): Promise<FamilyRecord> {
      const database = await readyDb()
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      if (!user?.familyId) {
        throw new Error('Família ainda não cadastrada')
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
    },

    async getFamilyChildBoard(userId: string, childId: string) {
      const family = await this.getFamily(userId)
      const allowed = family.children.some((child) => child.id === childId)
      if (!allowed) throw new Error('Criança não encontrada')
      return this.getChildBoard(childId)
    },

    async addChildToFamily(
      userId: string,
      name: string,
      rawAvatar?: Partial<ChildAvatar>,
    ): Promise<ChildRecord> {
      const database = await readyDb()
      const family = await this.getFamily(userId)
      const avatar = normalizeChildAvatar(rawAvatar ?? defaultChildAvatar())
      const childId = crypto.randomUUID()
      await database.insert(children).values({
        id: childId,
        familyId: family.id,
        name: normalizeChildName(name),
        gender: avatar.gender,
        skinTone: avatar.skinTone,
        hairType: avatar.hairType,
        hairColor: avatar.hairColor,
        createdAt: Date.now(),
      })
      await database.insert(pecsCards).values(
        defaultDesfraldePack().map((template) => ({
          id: crypto.randomUUID(),
          childId,
          slug: template.slug,
          kind: template.kind,
          label: template.label,
          speak: template.speak,
          imageSrc: template.imageSrc,
          tone: template.tone,
          sortOrder: template.sortOrder,
        })),
      )
      const board = await this.getChildBoard(childId)
      return board.child
    },

    async updateChildAvatar(
      userId: string,
      childId: string,
      rawAvatar: Partial<ChildAvatar>,
    ): Promise<ChildRecord> {
      const database = await readyDb()
      await this.getFamilyChildBoard(userId, childId)
      const avatar = normalizeChildAvatar(rawAvatar)
      await database
        .update(children)
        .set({
          gender: avatar.gender,
          skinTone: avatar.skinTone,
          hairType: avatar.hairType,
          hairColor: avatar.hairColor,
        })
        .where(eq(children.id, childId))
      const board = await this.getChildBoard(childId)
      return board.child
    },

    async listStars(childId: string): Promise<Array<StarMark>> {
      const database = await readyDb()
      const rows = await database
        .select()
        .from(stars)
        .where(eq(stars.childId, childId))

      return rows.map((row) => ({
        date: row.date,
        kind: row.kind as StarKind,
      }))
    },

    async toggleStar(
      childId: string,
      date: string,
      kind: StarKind,
    ): Promise<Array<StarMark>> {
      const database = await readyDb()
      const [existing] = await database
        .select()
        .from(stars)
        .where(
          and(
            eq(stars.childId, childId),
            eq(stars.date, date),
            eq(stars.kind, kind),
          ),
        )
        .limit(1)

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

      return this.listStars(childId)
    },
  }
}

export type DesfraldeStore = ReturnType<typeof createDesfraldeStore>
