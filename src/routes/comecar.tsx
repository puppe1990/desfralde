import { createFileRoute, redirect } from '@tanstack/react-router'

import { OnboardingWizard } from '../components/onboarding-wizard'
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
  return <OnboardingWizard defaultParentName={user.name} />
}
