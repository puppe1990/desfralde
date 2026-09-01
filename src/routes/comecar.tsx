import { createFileRoute, redirect } from '@tanstack/react-router'

import { OnboardingWizard } from '../components/onboarding-wizard'
import { UserChip } from '../components/user-chip'
import { getCurrentUserFn } from '../server/auth'

export const Route = createFileRoute('/comecar')({
  loader: async () => {
    const user = await getCurrentUserFn()
    if (!user) throw redirect({ to: '/cadastro' })
    if (user.familyId) throw redirect({ to: '/' })
    return user
  },
  component: ComecarPage,
})

function ComecarPage() {
  const user = Route.useLoaderData()
  return (
    <div>
      <div className="mx-auto flex max-w-3xl justify-end px-4 pt-6">
        <UserChip name={user.name} />
      </div>
      <OnboardingWizard defaultParentName={user.name} />
    </div>
  )
}
