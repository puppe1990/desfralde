import { createServerFn } from '@tanstack/react-start'

import { getDesfraldeStore } from '../db/client'
import type { ChildAvatar } from '../domains/child-avatar'
import { normalizeChildAvatar } from '../domains/child-avatar'
import { normalizeChildName } from '../domains/child-name'
import type { StarKind } from '../domains/star-chart'
import { readSessionUserId } from './session'

async function requireUserId() {
  const userId = await readSessionUserId()
  if (!userId) throw new Error('Faça login para continuar')
  return userId
}

export const listChildrenFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireUserId()
    const family = await getDesfraldeStore().getFamily(userId)
    return family.children
  },
)

export const createChildFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string; avatar?: Partial<ChildAvatar> }) => ({
    name: normalizeChildName(data.name),
    avatar: data.avatar ? normalizeChildAvatar(data.avatar) : undefined,
  }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    return getDesfraldeStore().addChildToFamily(userId, data.name, data.avatar)
  })

export const getChildBoardFn = createServerFn({ method: 'GET' })
  .validator((data: { childId: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    return getDesfraldeStore().getFamilyChildBoard(userId, data.childId)
  })

export const listStarsFn = createServerFn({ method: 'GET' })
  .validator((data: { childId: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    await getDesfraldeStore().getFamilyChildBoard(userId, data.childId)
    return getDesfraldeStore().listStars(data.childId)
  })

export const toggleStarFn = createServerFn({ method: 'POST' })
  .validator((data: { childId: string; date: string; kind: StarKind }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    await getDesfraldeStore().getFamilyChildBoard(userId, data.childId)
    return getDesfraldeStore().toggleStar(data.childId, data.date, data.kind)
  })

export const listPottyEventsFn = createServerFn({ method: 'GET' })
  .validator((data: { childId: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    return getDesfraldeStore().listPottyEvents(userId, data.childId)
  })

export const logPottyEventFn = createServerFn({ method: 'POST' })
  .validator((data: { childId: string; kind: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    return getDesfraldeStore().logPottyEvent(userId, data.childId, data.kind)
  })

export const deletePottyEventFn = createServerFn({ method: 'POST' })
  .validator((data: { childId: string; eventId: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    await getDesfraldeStore().deletePottyEvent(
      userId,
      data.childId,
      data.eventId,
    )
    return { ok: true as const }
  })

export const updateChildAvatarFn = createServerFn({ method: 'POST' })
  .validator((data: { childId: string; avatar: Partial<ChildAvatar> }) => ({
    childId: data.childId,
    avatar: normalizeChildAvatar(data.avatar),
  }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    return getDesfraldeStore().updateChildAvatar(
      userId,
      data.childId,
      data.avatar,
    )
  })
