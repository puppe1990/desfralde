import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { getCurrentUserFn } from '../server/auth'
import {
  changePasswordFn,
  inviteToFamilyFn,
  updateTeacherFn,
  updateTherapistFn,
} from '../server/account'
import { getFamilyFn } from '../server/onboarding'

export const Route = createFileRoute('/configuracao')({
  loader: async () => {
    const user = await getCurrentUserFn()
    if (!user) throw redirect({ to: '/entrar' })
    if (!user.familyId) throw redirect({ to: '/comecar' })
    const family = await getFamilyFn()
    return {
      user,
      therapistName:
        family?.adults.find((adult) => adult.role === 'terapeuta')?.name ?? '',
      teacherName:
        family?.adults.find((adult) => adult.role === 'professora')?.name ?? '',
    }
  },
  component: ConfiguracaoPage,
})

function ConfiguracaoPage() {
  const { user, therapistName, teacherName } = Route.useLoaderData()
  const router = useRouter()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordDone, setPasswordDone] = useState(false)
  const [therapistError, setTherapistError] = useState<string | null>(null)
  const [therapistDone, setTherapistDone] = useState(false)
  const [teacherError, setTeacherError] = useState<string | null>(null)
  const [teacherDone, setTeacherDone] = useState<string | null>(null)

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
        Olá, {user.name}
      </p>
      <h1 className="font-serif mt-2 text-5xl leading-none">Configuração</h1>
      <p className="mt-4 text-[#5a4c3d]">
        Senha da conta, terapeuta e acesso da professora da creche.
      </p>

      <section className="mt-10 rounded-[22px] border-4 border-[#b87a1c] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
        <h2 className="font-display text-2xl">Senha</h2>
        <p className="mt-1 text-sm text-[#5a4c3d]">
          Use a senha atual para confirmar que é você.
        </p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = event.currentTarget
            const data = new FormData(form)
            setPasswordError(null)
            setPasswordDone(false)
            try {
              await changePasswordFn({
                data: {
                  currentPassword: String(data.get('currentPassword') ?? ''),
                  newPassword: String(data.get('newPassword') ?? ''),
                  confirmPassword: String(data.get('confirmPassword') ?? ''),
                },
              })
              form.reset()
              setPasswordDone(true)
            } catch (cause) {
              setPasswordError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível trocar a senha',
              )
            }
          }}
        >
          <input
            type="email"
            autoComplete="username"
            value={user.email}
            readOnly
            tabIndex={-1}
            aria-hidden
            className="sr-only"
          />
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Senha atual"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Nova senha (mín. 8)"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Confirmar nova senha"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
          >
            Salvar senha
          </button>
        </form>
        {passwordError ? (
          <p className="mt-3 text-[#9a3d28]">{passwordError}</p>
        ) : null}
        {passwordDone ? (
          <p className="mt-3 text-[#335648]">Senha atualizada. Entre com a nova da próxima vez.</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-[22px] border-4 border-[#335648] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
        <h2 className="font-display text-2xl">Terapeuta</h2>
        <p className="mt-1 text-sm text-[#5a4c3d]">
          {therapistName
            ? `Hoje a terapeuta da casa é ${therapistName}.`
            : 'Ainda não há terapeuta nesta casa.'}
        </p>
        <form
          key={therapistName}
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = event.currentTarget
            const data = new FormData(form)
            setTherapistError(null)
            setTherapistDone(false)
            try {
              await updateTherapistFn({
                data: { name: String(data.get('name') ?? '') },
              })
              setTherapistDone(true)
              await router.invalidate()
            } catch (cause) {
              setTherapistError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível salvar a terapeuta',
              )
            }
          }}
        >
          <input
            name="name"
            required
            defaultValue={therapistName}
            placeholder="Nome da terapeuta"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#335648] px-5 py-3 font-bold text-white"
          >
            Salvar terapeuta
          </button>
        </form>
        {therapistError ? (
          <p className="mt-3 text-[#9a3d28]">{therapistError}</p>
        ) : null}
        {therapistDone ? (
          <p className="mt-3 text-[#335648]">Terapeuta atualizada.</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-[22px] border-4 border-[#9a3d28] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
        <h2 className="font-display text-2xl">Professora</h2>
        <p className="mt-1 text-sm text-[#5a4c3d]">
          {teacherName
            ? `Hoje a professora da casa é ${teacherName}. Crie um acesso para ela entrar e anotar os horários.`
            : 'Ainda não há professora nesta casa.'}
        </p>
        <form
          key={`name-${teacherName}`}
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setTeacherError(null)
            setTeacherDone(null)
            try {
              await updateTeacherFn({
                data: { name: String(data.get('name') ?? '') },
              })
              setTeacherDone('Nome da professora salvo.')
              await router.invalidate()
            } catch (cause) {
              setTeacherError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível salvar a professora',
              )
            }
          }}
        >
          <input
            name="name"
            required
            defaultValue={teacherName}
            placeholder="Nome da professora"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-2xl border-2 border-[#2a2118] px-5 py-3 font-bold"
          >
            Salvar nome
          </button>
        </form>
        <form
          className="mt-5 grid gap-3 border-t-2 border-[#2a2118]/10 pt-5"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = event.currentTarget
            const data = new FormData(form)
            setTeacherError(null)
            setTeacherDone(null)
            try {
              const invited = await inviteToFamilyFn({
                data: {
                  name: String(data.get('name') ?? teacherName),
                  email: String(data.get('email') ?? ''),
                  password: String(data.get('password') ?? ''),
                  role: 'professora',
                },
              })
              form.reset()
              setTeacherDone(
                `${invited.name} já pode entrar com ${invited.email}.`,
              )
              await router.invalidate()
            } catch (cause) {
              setTeacherError(
                cause instanceof Error
                  ? cause.message
                  : 'Não foi possível criar o acesso',
              )
            }
          }}
        >
          <p className="text-sm font-bold">Criar acesso para ela entrar</p>
          <input
            name="name"
            required
            defaultValue={teacherName}
            placeholder="Nome"
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail da professora"
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
            className="rounded-2xl bg-[#9a3d28] px-5 py-3 font-bold text-white"
          >
            Dar acesso
          </button>
        </form>
        {teacherError ? (
          <p className="mt-3 text-[#9a3d28]">{teacherError}</p>
        ) : null}
        {teacherDone ? (
          <p className="mt-3 text-[#335648]">{teacherDone}</p>
        ) : null}
      </section>

      <p className="mt-8">
        <Link to="/" className="font-bold text-[#9a3d28]">
          Voltar aos quadros
        </Link>
      </p>
    </main>
  )
}
