import { createServerFn } from '@tanstack/react-start'

import { getDesfraldeStore } from '../db/client'
import { normalizeAccountEmail } from '../domains/account-email'
import { normalizePersonName } from '../domains/child-name'
import { STAFF_ROLES } from '../domains/onboarding-draft'
import {
  assertPasswordLength,
  validatePasswordChange,
} from '../domains/password-change'
import { requireSignedInUserId } from './require-signed-in-user'

export const changePasswordFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }) => validatePasswordChange(data),
  )
  .handler(async ({ data }) => {
    const userId = await requireSignedInUserId()
    await getDesfraldeStore().changePassword(userId, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.newPassword,
    })
    return { ok: true as const }
  })

export const updateTherapistFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string }) => ({
    name: normalizePersonName(data.name, 'Nome da terapeuta'),
  }))
  .handler(async ({ data }) => {
    const userId = await requireSignedInUserId()
    return getDesfraldeStore().updateFamilyTherapist(userId, data.name)
  })

export const updateTeacherFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string }) => ({
    name: normalizePersonName(data.name, 'Nome da professora'),
  }))
  .handler(async ({ data }) => {
    const userId = await requireSignedInUserId()
    return getDesfraldeStore().updateFamilyTeacher(userId, data.name)
  })

export const inviteToFamilyFn = createServerFn({ method: 'POST' })
  .validator(
    (data: { name: string; email: string; password: string; role: string }) => {
      if (!(STAFF_ROLES as ReadonlyArray<string>).includes(data.role)) {
        throw new Error(`Papel da equipe inválido: ${data.role}`)
      }
      const role = data.role as (typeof STAFF_ROLES)[number]
      const label =
        role === 'professora' ? 'Nome da professora' : 'Nome da terapeuta'
      return {
        name: normalizePersonName(data.name, label),
        email: normalizeAccountEmail(data.email),
        password: assertPasswordLength(data.password, 'A senha'),
        role,
      }
    },
  )
  .handler(async ({ data }) => {
    const userId = await requireSignedInUserId()
    return getDesfraldeStore().inviteToFamily(userId, data)
  })
