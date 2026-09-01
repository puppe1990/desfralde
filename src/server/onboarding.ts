import { createServerFn } from '@tanstack/react-start'

import { getDesfraldeStore } from '../db/client'
import type { RawOnboardingDraft } from '../domains/onboarding-draft'
import { validateOnboardingDraft } from '../domains/onboarding-draft'
import { requireSignedInUserId } from './require-signed-in-user'

export const getFamilyFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSignedInUserId()
    try {
      return await getDesfraldeStore().getFamily(userId)
    } catch {
      // Logged-in user without a family is a valid wizard state, not a 500.
      return null
    }
  },
)

export const completeOnboardingFn = createServerFn({ method: 'POST' })
  .validator((data: RawOnboardingDraft) => validateOnboardingDraft(data))
  .handler(async ({ data }) => {
    const userId = await requireSignedInUserId()
    return getDesfraldeStore().completeOnboarding(userId, data)
  })
