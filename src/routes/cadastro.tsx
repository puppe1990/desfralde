import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'

import { getCurrentUserFn, registerFn } from '../server/auth'

export const Route = createFileRoute('/cadastro')({
  loader: async () => {
    const user = await getCurrentUserFn()
    if (user?.familyId) throw redirect({ to: '/' })
    if (user) throw redirect({ to: '/comecar' })
    return null
  },
  component: CadastroPage,
})

function CadastroPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
          Vivências Azuis
        </p>
        <h1 className="font-serif mt-2 text-4xl">Criar conta</h1>
        <p className="mt-3 text-[#5a4c3d]">
          Mãe ou pai começa aqui. Depois o wizard monta a família e os quadros.
        </p>
        <form
          className="mt-8 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            setError(null)
            try {
              await registerFn({
                data: {
                  name: String(form.get('name') ?? ''),
                  email: String(form.get('email') ?? ''),
                  password: String(form.get('password') ?? ''),
                },
              })
              await router.navigate({ to: '/comecar' })
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível cadastrar',
              )
            }
          }}
        >
          <input
            name="name"
            required
            placeholder="Seu nome"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
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
            minLength={8}
            placeholder="Senha (mín. 8)"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
          >
            Começar
          </button>
        </form>
        {error ? <p className="mt-3 text-[#9a3d28]">{error}</p> : null}
        <p className="mt-6 text-[#5a4c3d]">
          Já tem conta?{' '}
          <Link to="/entrar" className="font-bold text-[#9a3d28]">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
