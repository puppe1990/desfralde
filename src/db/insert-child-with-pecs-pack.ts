import type { LibSQLDatabase } from 'drizzle-orm/libsql'

import type { ChildAvatar } from '../domains/child-avatar'
import { defaultDesfraldePack } from '../domains/default-desfralde-pack'
import { children, pecsCards } from './schema'

export async function insertChildWithPecsPack(
  database: LibSQLDatabase,
  input: {
    familyId: string | null
    name: string
    avatar: ChildAvatar
    createdAt: number
  },
): Promise<string> {
  const childId = crypto.randomUUID()
  await database.insert(children).values({
    id: childId,
    familyId: input.familyId,
    name: input.name,
    gender: input.avatar.gender,
    skinTone: input.avatar.skinTone,
    hairType: input.avatar.hairType,
    hairColor: input.avatar.hairColor,
    createdAt: input.createdAt,
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
  return childId
}
