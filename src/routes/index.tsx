import { createFileRoute, redirect } from '@tanstack/react-router'

import { ChildQuadros } from '../components/child-quadros'
import { LandingPage } from '../components/landing-page'
import { UserChip } from '../components/user-chip'
import { getCurrentUserFn } from '../server/auth'
import { getFamilyFn } from '../server/onboarding'

export const Route = createFileRoute('/')({
  loader: async () => {
    const user = await getCurrentUserFn()
    if (!user) return { user: null, family: null }
    if (!user.familyId) throw redirect({ to: '/comecar' })
    const family = await getFamilyFn()
    return { user, family }
  },
  component: Home,
})

function Home() {
  const { user, family } = Route.useLoaderData()

  if (!user) {
    return <LandingPage />
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
            Olá, {user.name}
          </p>
          <h1 className="font-serif mt-2 text-5xl leading-none">Quadros</h1>
        </div>
        <UserChip name={user.name} />
      </div>

      {family ? <ChildQuadros kids={family.children} /> : null}
    </main>
  )
}
