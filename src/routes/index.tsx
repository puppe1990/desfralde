import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'

import { ChildAvatar } from '../components/child-avatar'
import { getCurrentUserFn, logoutFn } from '../server/auth'
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
  const router = useRouter()

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
          Vivências Azuis
        </p>
        <h1 className="font-serif mt-3 text-6xl leading-[0.9]">Desfralde</h1>
        <p className="mt-5 max-w-prose text-lg text-[#5a4c3d]">
          PECS para o vaso, feito para famílias autistas. A mãe ou o pai cria a
          conta, cadastra a casa e monta o avatar da criança.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/cadastro"
            className="rounded-2xl bg-[#c45c3e] px-6 py-3 font-bold text-white no-underline"
          >
            Criar conta
          </Link>
          <Link
            to="/entrar"
            className="rounded-2xl border-2 border-[#2a2118] px-6 py-3 font-bold text-[#2a2118] no-underline"
          >
            Entrar
          </Link>
        </div>
      </main>
    )
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
        <div className="flex flex-wrap gap-2">
          <Link
            to="/configuracao"
            className="rounded-full border-2 border-[#2a2118] px-4 py-2 text-sm font-bold text-[#2a2118] no-underline"
          >
            Configuração
          </Link>
          <button
            type="button"
            className="rounded-full border-2 border-[#2a2118] px-4 py-2 text-sm font-bold"
            onClick={async () => {
              await logoutFn()
              await router.navigate({ to: '/' })
              await router.invalidate()
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <ul className="mt-10 grid gap-3">
        {family?.children.map((child) => (
          <li key={child.id}>
            <Link
              to="/criancas/$childId"
              params={{ childId: child.id }}
              className="flex items-center gap-4 rounded-2xl bg-[#fff8ec] px-4 py-3 text-[#2a2118] no-underline shadow-[0_18px_40px_rgba(42,33,24,0.08)]"
            >
              <span className="size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#b87a1c] bg-[#f7f0e4]">
                <ChildAvatar name={child.name} avatar={child.avatar} />
              </span>
              <span className="font-display text-2xl">{child.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
