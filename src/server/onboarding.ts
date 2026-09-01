import { createServerFn } from '@tanstack/react-start'

import { getDesfraldeStore } from '../db/client'
import type { RawOnboardingDraft } from '../domains/onboarding-draft'
import { validateOnboardingDraft } from '../domains/onboarding-draft'
import { readSessionUserId } from './session'

async function requireUserId() {
  const userId = await readSessionUserId()
  if (!userId) throw new Error('Faça login para continuar')
  return userId
}

export const getFamilyFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireUserId()
    try {
      return await getDesfraldeStore().getFamily(userId)
    } catch {
      return null
    }
  },
)

export const completeOnboardingFn = createServerFn({ method: 'POST' })
  .validator((data: RawOnboardingDraft) => validateOnboardingDraft(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    return getDesfraldeStore().completeOnboarding(userId, data)
  })
