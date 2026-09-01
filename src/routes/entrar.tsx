import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'

import { getCurrentUserFn, loginFn } from '../server/auth'

export const Route = createFileRoute('/entrar')({
  loader: async () => {
    const user = await getCurrentUserFn()
    if (user?.familyId) throw redirect({ to: '/' })
    if (user) throw redirect({ to: '/comecar' })
    return null
  },
  component: EntrarPage,
})

function EntrarPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
          Vivências Azuis
        </p>
        <h1 className="font-serif mt-2 text-4xl">Entrar</h1>
        <form
          className="mt-8 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            setError(null)
            try {
              const user = await loginFn({
                data: {
                  email: String(form.get('email') ?? ''),
                  password: String(form.get('password') ?? ''),
                },
              })
              await router.navigate({ to: user.familyId ? '/' : '/comecar' })
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível entrar',
              )
            }
          }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Senha"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
          >
            Entrar
          </button>
        </form>
        {error ? <p className="mt-3 text-[#9a3d28]">{error}</p> : null}
        <p className="mt-6 text-[#5a4c3d]">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-bold text-[#9a3d28]">
            Cadastrar
          </Link>
        </p>
      </div>
    </main>
  )
}
