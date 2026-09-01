import type {
  ChildAvatar,
  ChildGender,
  HairColor,
  HairType,
  SkinTone,
} from '../domains/child-avatar'
import type { CardKind, CardTone, PecsCardTemplate } from '../domains/pecs-card'
import type { children, pecsCards } from './schema'

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

export function mapChild(row: typeof children.$inferSelect): ChildRecord {
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

export function mapCard(row: typeof pecsCards.$inferSelect): StoredPecsCard {
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

export function toUserRecord(user: {
  id: string
  name: string
  email: string
  familyId: string | null
}): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    familyId: user.familyId,
  }
}
