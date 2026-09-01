import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { inviteToFamilyFn, updateTeacherFn } from '../server/account'
import { pecsTextFieldClass, SettingsFormStatus } from './settings-form-chrome'

export function TeacherAccessForm({ teacherName }: { teacherName: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  return (
    <section className="rounded-[22px] border-4 border-[#9a3d28] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
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
          const fields = new FormData(event.currentTarget)
          setError(null)
          setDone(null)
          try {
            await updateTeacherFn({
              data: { name: String(fields.get('name') ?? '') },
            })
            setDone('Nome da professora salvo.')
            await router.invalidate()
          } catch (cause) {
            setError(
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
          className={pecsTextFieldClass}
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
          const fields = new FormData(form)
          setError(null)
          setDone(null)
          try {
            const invited = await inviteToFamilyFn({
              data: {
                name: String(fields.get('name') ?? teacherName),
                email: String(fields.get('email') ?? ''),
                password: String(fields.get('password') ?? ''),
                role: 'professora',
              },
            })
            form.reset()
            setDone(`${invited.name} já pode entrar com ${invited.email}.`)
            await router.invalidate()
          } catch (cause) {
            setError(
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
          className={pecsTextFieldClass}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="E-mail da professora"
          className={pecsTextFieldClass}
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Senha (mín. 8)"
          className={pecsTextFieldClass}
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#9a3d28] px-5 py-3 font-bold text-white"
        >
          Dar acesso
        </button>
      </form>
      <SettingsFormStatus error={error} done={done} />
    </section>
  )
}
