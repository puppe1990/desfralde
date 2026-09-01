import { createServerFn } from '@tanstack/react-start'

import { getDesfraldeStore } from '../db/client'
import { normalizeAccountEmail } from '../domains/account-email'
import { normalizePersonName } from '../domains/child-name'
import {
  clearSessionUser,
  readSessionUserId,
  writeSessionUserId,
} from './session'

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await readSessionUserId()
    if (!userId) return null
    return getDesfraldeStore().getUser(userId)
  },
)

export const registerFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string; email: string; password: string }) => ({
    name: normalizePersonName(data.name, 'Nome'),
    email: normalizeAccountEmail(data.email),
    password: data.password,
  }))
  .handler(async ({ data }) => {
    const user = await getDesfraldeStore().registerCaregiver(data)
    await writeSessionUserId(user.id)
    return user
  })

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: { email: string; password: string }) => ({
    email: data.email,
    password: data.password,
  }))
  .handler(async ({ data }) => {
    const user = await getDesfraldeStore().authenticate(data.email, data.password)
    await writeSessionUserId(user.id)
    return user
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  await clearSessionUser()
  return { ok: true }
})
